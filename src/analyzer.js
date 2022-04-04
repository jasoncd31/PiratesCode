import {
  Variable,
  Type,
  Function,
  Token,
  error,
  ArrayType,
  FunctionType,
  MapType
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

// Object.assign(FunctionType.prototype, {
//   isEquivalentTo(target) {
//     return (
//       target.constructor === FunctionType &&
//       this.returnType.isEquivalentTo(target.returnType) &&
//       this.paramTypes.length === target.paramTypes.length &&
//       this.paramTypes.every((t, i) => target.paramTypes[i].isEquivalentTo(t))
//     )
//   },
//   isAssignableTo(target) {
//     // Functions are covariant on return types, contravariant on parameters.
//     return (
//       target.constructor === FunctionType &&
//       this.returnType.isAssignableTo(target.returnType) &&
//       this.paramTypes.length === target.paramTypes.length &&
//       this.paramTypes.every((t, i) => target.paramTypes[i].isAssignableTo(t))
//     )
//   },
// })


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
  if (expressions.length > 0 && expressions[0].constructor.name === "MapEntry") {
    check(
      expressions.slice(1).every(e => e.keyType.isEquivalentTo(expressions[0].key.type)),
      "Not all the keys of the map elements have the same type"
    )
    check(
      expressions.slice(1).every(e => e.valueType.isEquivalentTo(expressions[0].value.type)),
      "Not all the keys of the map elements have the same type"
    )
  } else {
    check(
      expressions.slice(1).every(e => e.type.isEquivalentTo(expressions[0].type)),
      "Not all elements have the same type"
    )
  }
}
function checkArgumentsMatch(args, targetTypes) {
  check(
    targetTypes.length === args.length,
    `${targetTypes.length} argument(s) required but ${args.length} passed`
  )
  targetTypes.forEach((type, i) => checkAssignable(args[i], { toType: type }))
}
function checkFunctionCallArguments(args, calleeType) {
  checkArgumentsMatch(args, calleeType.paramTypes)
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
function checkCallable(e) {
  check(
    e.type.constructor == FunctionType,
    "Call of non-function"
  )
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

function checkForVargh(isVargh, m) {
  console.log(isVargh)
  if (m.initializer.constructor.name === 'MapExpression' || m.initializer.constructor.name === 'ArrayExpression') {
    check(
      !isVargh || m.initializer.elements.length !== 0,
      `Hey? What's the type of that?? Using vargh with an empty map or array confuses me.`
    )
  }
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
    Assignment(s) {
      this.analyze(s.source)
      this.analyze(s.target)
      checkAssignable(s.source, { toType: s.target.type })
      // checkNotReadOnly(s.target)
    }
    VariableDeclaration(d) {
      checkForVargh(d.modifier === 'vargh', d)
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
    MapExpression(m) {
      this.analyze(m.elements)
      checkAllHaveSameType(m.elements)
      console.log("BYEE ")
      if (m.elements.length > 0) { 
        m.type = new MapType(m.elements[0].keyType, m.elements[0].valueType)
      } else {
        m.type = new MapType(Type.ANY, Type.ANY)
      }
    }
    MapEntry(e) { 
      this.analyze(e.key)
      this.analyze(e.value)
      e.keyType = e.key.type
      e.valueType = e.value.type
      if (e.key.name !== undefined) {
        let x = this.lookup(e.key.name)
        e.key.type = x.type
      }
    }
    Array(a) {
      // check for empty array
      a.forEach(item => this.analyze(item))
    }
    ArrayExpression(a) {
      this.analyze(a.elements)
      checkAllHaveSameType(a.elements)
      console.log(a.elements)
      if (a.elements.length === 0) {
        a.type = new ArrayType(Type.ANY)
      } else {
        a.type = new ArrayType(a.elements[0].type)
      }
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
    ForEachLoop(s) {
      this.analyze(s.collection)
      checkArray(s.collection)
      s.iterator = new Variable(s.iterator.lexeme, true)
      s.iterator.type = s.collection.type.baseType
      const bodyContext = this.newChildContext({ inLoop: true })
      bodyContext.add(s.iterator.name, s.iterator)
      bodyContext.analyze(s.body)
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
    Call(c) {
      this.analyze(c.callee)
      const callee = c.callee?.value ?? c.callee
      checkCallable(callee)
      this.analyze(c.args)
      checkFunctionCallArguments(c.args, callee.type)
      c.type = callee.type.returnType
      // TODO: Class methodss and constructors
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
        checkNumeric(e.left)
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
    UnaryExpression(e) {
      console.log(e)
      this.analyze(e.operand)
      if (e.op.lexeme === "-") {
        checkNumeric(e.operand)
        e.type = e.operand.type
      } else if (e.op.lexeme === "not") {
        checkBoolean(e.operand)
        e.type = Type.BOOLEAN
      }
    }
    SubscriptExpression(e) {
      this.analyze(e.array)
      e.type = e.array.type.baseType
      this.analyze(e.index)
      checkInteger(e.index)
    }
}

export default function analyze(node) {
    const initialContext = new Context({})
    for (const [name, type] of Object.entries(stdlib.types)) {
      initialContext.add(name, type)
    }
    initialContext.analyze(node)
    return node
}
