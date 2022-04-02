import {
  Variable,
  Type,
  Function,
  Token,
  error,
  ArrayType,
  FunctionType
} from "./core.js"
import * as stdlib from "./stdlib.js"

/**********************************************
 *  TYPE EQUIVALENCE AND COMPATIBILITY RULES  *
 *********************************************/

Object.assign(Type.prototype, {
  // Equivalence: when are two types the same
  isEquivalentTo(target) {
    return this == target
  },
  // T1 assignable to T2 is when x:T1 can be assigned to y:T2. By default
  // this is only when two types are equivalent; however, for other kinds
  // of types there may be special rules. For example, in a language with
  // supertypes and subtypes, an object of a subtype would be assignable
  // to a variable constrained to a supertype.
  isAssignableTo(target) {
    return this.isEquivalentTo(target)
  },
})

Object.assign(ArrayType.prototype, {
  isEquivalentTo(target) {
    // [T] equivalent to [U] only when T is equivalent to U.
    return (
      target.constructor === ArrayType && this.baseType.isEquivalentTo(target.baseType)
    )
  },
  isAssignableTo(target) {
    // Arrays are INVARIANT in Carlos!
    return this.isEquivalentTo(target)
  },
})

/***************************************
 *  CHECK YE SCURVY TYPES  *
 **************************************/

function check(condition, message, entity) {
    if (!condition) error(message, entity)
}

function checkType(e, types, expectation) {
  check(types.includes(e.type), `Expected ${expectation}`)
}

function checkNumeric(e) {
  checkType(e, [Type.INT, Type.DOUBLE], "a number")
}

function checkBoolean(e) {
  checkType(e, [Type.BOOLEAN], "a boolean")
}

function checkInteger(e) {
  checkType(e, [Type.INT], "an integer")
}

function checkIsAType(e) {
  check(e instanceof Type, "Type expected", e)
}
function checkArray(e) {
  check(e.type.constructor === ArrayType, "Array expected", e)
}
function checkAllHaveSameType(expressions) {
  check(
    expressions.slice(1).every(e => e.type.isEquivalentTo(expressions[0].type)),
    "Not all elements have the same type"
  )
}
function checkInLoop(context) {
  check(context.inLoop, "Break can only appear in a loop")
}
function checkHaveSameType(e1, e2) {
  check(e1.type.isEquivalentTo(e2.type), `${e2.type} BE DIFFERENT FROM ${e2.type}, YE BLIND LANDLUBBER.`)
}

function checkInFunction(context) {
  check(context.function, "YE BILGERAT! A RETURN CAN ONLY BE IN A FUNCTION.")
}
function checkReturnable({ expression: e, from: f }) {
  checkAssignable(e, { toType: f.type.returnType })
}

function checkReturnsNothing(f) {
  check(f.type.returnType === Type.NONE, "MATEY ARE YE THREE SHEETS TO THE WIND OR DID YOU FORGET TO RETURN SOMETHING?")
}

function checkReturnsSomething(f) {
  check(f.type.returnType !== Type.NONE, "OI, RAPSCALLION. YE PROMISED NOT TO RETURN ANYTHING FROM YER FUNCTION.")
}

function checkAssignable(e, { toType: type }) {
  check(
    type === Type.ANY || e.type.isAssignableTo(type),
    `Scrub the deck. Cannot assign a ${e.type.description} to a ${type.description}`
  )
}

/*******************************************
 *  YER ANALYSIS TAKES PLACE IN A CONTEXT  *
 *******************************************/

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
      error(`HEY! You didn't declare identifier ${name} before you tried to use it. Declare it first, ye scurvy dog!`)
    }
    newChildContext(props) {
      return new Context({ ...this, parent: this, locals: new Map(), ...props })
    }
    analyze(node) {
      console.log(node.constructor.name)
      return this[node.constructor.name](node)
    }
    Program(p) {
      this.analyze(p.statements)
    }
    VariableDeclaration(d) {
      this.analyze(d.initializer)
      d.variable.value = new Variable(d.variable.lexeme)
      d.variable.value.type = d.initializer.type
      this.add(d.variable.lexeme, d.variable.value)
    }
    Token(t) {
      // For ids being used, not defined
      if (t.category === "Id" || t.category === "Sym") {
        t.value = this.lookup(t.lexeme)
        t.type = t.value.type
      }
      if (t.category === "Int") [t.value, t.type] = [t.lexeme, Type.INT]
      if (t.category === "Double") [t.value, t.type] = [t.lexeme, Type.DOUBLE]
      if (t.category === "Str") [t.value, t.type] = [t.lexeme, Type.STRING]
      if (t.category === "Bool") [t.value, t.type] = [t.lexeme === "aye", Type.BOOLEAN]
    }
    Array(a) {
      // check for empty array
      if (a.lenght > 1) a.forEach(item => this.analyze(item))
    }
    ArrayExpression(a) {
      this.analyze(a.elements)
      checkAllHaveSameType(a.elements)
      a.type = new ArrayType(a.elements[0].type)
    }
    ArrayType(t) {
      this.analyze(t.baseType)
      if (t.baseType instanceof Token) t.baseType = t.baseType.value
    }
    IfStatement(s) {
      this.analyze(s.test)
      for (let i = 0; i < s.test.length; i++) {
        checkBoolean(s.test[i])
        this.newChildContext().analyze(s.consequent[i])
      }
      if (s.alternate.constructor === Array) {
        // It's a block of statements, make a new context
        this.newChildContext().analyze(s.alternate)
      } else if (s.alternate) {
        // It's a trailing if-statement, so same context
        this.analyze(s.alternate)
      }
    }
    Conditional(e) {
      this.analyze(e.test)
      checkBoolean(e.test)
      this.analyze(e.consequent)
      this.analyze(e.alternate)
      checkHaveSameType(e.consequent, e.alternate)
      e.type = e.consequent.type
    }
    WhileLoop(s) {
      this.analyze(s.test)
      checkBoolean(s.test)
      this.newChildContext({ inLoop: true }).analyze(s.body)
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
    BreakStatement(s) {
      checkInLoop(this)
    }
    FunctionDeclaration(d) {
      if (d.returnType) this.analyze(d.returnType)
      d.fun.value = new Function(
        d.fun.lexeme,
        d.parameters,
        d.returnType?.value ?? d.returnType ?? Type.NONE
      )
      checkIsAType(d.fun.value.returnType)
      // When entering a function body, we must reset the inLoop setting,
      // because it is possible to declare a function inside a loop!
      const childContext = this.newChildContext({ inLoop: false, function: d.fun.value })
      if (d.fun.value.parameters) { 
        childContext.analyze(d.fun.value.parameters) 
      } else {
        d.fun.value.parameters = []
      }
      d.fun.value.type = new FunctionType(
        d.fun.value.parameters.map(p => p.type),
        d.fun.value.returnType
      )
 
      // Add before analyzing the body to allow recursion
      this.add(d.fun.lexeme, d.fun.value)
      childContext.analyze(d.body)
    }
    PrintStatement(s) {
      s.argument = this.analyze(s.argument)
    }
    BinaryExpression(e) {
      this.analyze(e.left)
      this.analyze(e.right)
      if (["+"].includes(e.op)) {
        checkNumericOrString(e.left)
        checkHaveSameType(e.left, e.right)
        e.type = e.left.type
      } else if (["-", "*", "/", "**"].includes(e.op)) {
        checkNumeric(e.left)
        checkHaveSameType(e.left, e.right)
        e.type = e.left.type
      } else if (["<", "<=", ">", ">="].includes(e.op)) {
        checkNumeric(e.left)
        checkHaveSameType(e.left, e.right)
        e.type = Type.BOOLEAN
      } else if (["==", "!="].includes(e.op)) {
        checkHaveSameType(e.left, e.right)
        e.type = Type.BOOLEAN
      } else if (["and", "or"].includes(e.op)) {
        checkBoolean(e.left)
        checkBoolean(e.right)
        e.type = Type.BOOLEAN
      }
    }
    // SubscriptExpression(e) {
    //   this.analyze(e.array)
    //   e.type = e.array.type.baseType
    //   this.analyze(e.index)
    //   checkInteger(e.index)
    // }
}

export default function analyze(node) {
    const initialContext = new Context({})
    for (const [name, type] of Object.entries(stdlib.types)) {
      initialContext.add(name, type)
    }
    initialContext.analyze(node)
    return node
}
