function check(condition, message, entity) {
    if (!condition) error(message, entity)
}

/***************************************
 *  ANALYSIS TAKES PLACE IN A CONTEXT  *
 **************************************/

 class Context {
    constructor({ parent = null, locals = new Map(), inLoop = false, function: f = null }) {
      Object.assign(this, { parent, locals, inLoop, function: f })
    }
    sees(name) {
      // Search "outward" through enclosing scopes
      return this.locals.has(name) || this.parent?.sees(name)
    }

    add(name, entity) {
      // Shadowing is allowed hehe
      if (this.locals.has(name)) error(`OI! Identifier ${name} be already declared. Scrub the deck!`)
      this.locals.set(name, entity)
    }
    lookup(name) {
      const entity = this.locals.get(name)
      if (entity) {
        return entity
      } else if (this.parent) {
        return this.parent.lookup(name)
      }
      error(`EY! You didn't declare identifier ${name} before you tried to use it. Declare it first, you scurvy dog!`)
    }
    newChildContext(props) {
      return new Context({ ...this, parent: this, locals: new Map(), ...props })
    }
    analyze(node) {
      return this[node.constructor.name](node)
    }
    Program(p) {
      this.analyze(p.statements)
    }
    VariableDeclaration(d) {
      this.analyze(d.initializer)
      d.variable.value = new Variable(d.variable.lexeme, d.modifier.lexeme === "const")
      d.variable.value.type = d.initializer.type
      this.add(d.variable.lexeme, d.variable.value)
    }
    TypeDeclaration(d) {
      // Add early to allow recursion
      this.add(d.type.description, d.type)
      this.analyze(d.type.fields)
      checkFieldsAllDistinct(d.type.fields)
      checkNotRecursive(d.type)
    }
    Field(f) {
      this.analyze(f.type)
      if (f.type instanceof Token) f.type = f.type.value
      checkIsAType(f.type)
    }
    FunctionDeclaration(d) {
      if (d.returnType) this.analyze(d.returnType)
      d.fun.value = new Function(
        d.fun.lexeme,
        d.parameters,
        d.returnType?.value ?? d.returnType ?? Type.VOID
      )
      checkIsAType(d.fun.value.returnType)
      // When entering a function body, we must reset the inLoop setting,
      // because it is possible to declare a function inside a loop!
      const childContext = this.newChildContext({ inLoop: false, function: d.fun.value })
      childContext.analyze(d.fun.value.parameters)
      d.fun.value.type = new FunctionType(
        d.fun.value.parameters.map(p => p.type),
        d.fun.value.returnType
      )
      // Add before analyzing the body to allow recursion
      this.add(d.fun.lexeme, d.fun.value)
      childContext.analyze(d.body)
    }
    Parameter(p) {
      this.analyze(p.type)
      if (p.type instanceof Token) p.type = p.type.value
      checkIsAType(p.type)
      this.add(p.name.lexeme, p)
    }
    ArrayType(t) {
      this.analyze(t.baseType)
      if (t.baseType instanceof Token) t.baseType = t.baseType.value
    }
    FunctionType(t) {
      this.analyze(t.paramTypes)
      t.paramTypes = t.paramTypes.map(p => (p instanceof Token ? p.value : p))
      this.analyze(t.returnType)
      if (t.returnType instanceof Token) t.returnType = t.returnType.value
    }
    OptionalType(t) {
      this.analyze(t.baseType)
      if (t.baseType instanceof Token) t.baseType = t.baseType.value
    }
    Increment(s) {
      this.analyze(s.variable)
      checkInteger(s.variable)
    }
    Decrement(s) {
      this.analyze(s.variable)
      checkInteger(s.variable)
    }
    Assignment(s) {
      this.analyze(s.source)
      this.analyze(s.target)
      checkAssignable(s.source, { toType: s.target.type })
      checkNotReadOnly(s.target)
    }
    BreakStatement(s) {
      checkInLoop(this)
    }
    ReturnStatement(s) {
      checkInFunction(this)
      checkReturnsSomething(this.function)
      this.analyze(s.expression)
      checkReturnable({ expression: s.expression, from: this.function })
    }
    ShortReturnStatement(s) {
      checkInFunction(this)
      checkReturnsNothing(this.function)
    }
    IfStatement(s) {
      this.analyze(s.test)
      checkBoolean(s.test)
      this.newChildContext().analyze(s.consequent)
      if (s.alternate.constructor === Array) {
        // It's a block of statements, make a new context
        this.newChildContext().analyze(s.alternate)
      } else if (s.alternate) {
        // It's a trailing if-statement, so same context
        this.analyze(s.alternate)
      }
    }
    ShortIfStatement(s) {
      this.analyze(s.test)
      checkBoolean(s.test)
      this.newChildContext().analyze(s.consequent)
    }
    WhileStatement(s) {
      this.analyze(s.test)
      checkBoolean(s.test)
      this.newChildContext({ inLoop: true }).analyze(s.body)
    }
}

export default function analyze(node) {
    const initialContext = new Context({})
    for (const [name, type] of Object.entries(stdlib.contents)) {
      initialContext.add(name, type)
    }
    initialContext.analyze(node)
    return node
}
