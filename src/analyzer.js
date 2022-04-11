import {
    Variable,
    Type,
    Function,
    Token,
    error,
    ArrayType,
    FunctionType,
    MapType,
    ClassType,
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
            target.constructor === ArrayType &&
            this.baseType.isEquivalentTo(target.baseType)
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

function checkNumericOrString(e) {
    checkType(e, [Type.INT, Type.FLOAT, Type.STRING], "a number or string")
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
    if (
        expressions.length > 0 &&
        expressions[0].constructor.name === "MapEntry"
    ) {
        check(
            expressions
                .slice(1)
                .every((e) =>
                    e.keyType.isEquivalentTo(expressions[0].key.type)
                ),
            "Not all the keys of the map elements have the same type"
        )
        check(
            expressions
                .slice(1)
                .every((e) =>
                    e.valueType.isEquivalentTo(expressions[0].value.type)
                ),
            "Not all the keys of the map elements have the same type"
        )
    } else {
        check(
            expressions
                .slice(1)
                .every((e) => e.type.isEquivalentTo(expressions[0].type)),
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
    check(
        e1.type.isEquivalentTo(e2.type),
        `${e2.type} BE DIFFERENT FROM ${e2.type}, YE BLIND LANDLUBBER.`
    )
    // check(e1.category === e2.category, `${e2.category} BE DIFFERENT FROM ${e2.category}, YE BLIND LANDLUBBER.`)
}

function checkInFunction(context) {
    check(context.function, "YE BILGERAT! A RETURN CAN ONLY BE IN A FUNCTION.")
}
function checkReturnable({ expression: e, from: f }) {
    checkAssignable(e, { toType: f.type.returnType })
}
function checkCallable(e) {
    check(e.type.constructor == FunctionType, "Call of non-function")
}

function checkReturnsNothing(f) {
    check(
        f.type.returnType === Type.NONE,
        "MATEY ARE YE THREE SHEETS TO THE WIND OR DID YOU FORGET TO RETURN SOMETHING?"
    )
}

function checkReturnsSomething(f) {
    check(
        f.type.returnType !== Type.NONE,
        "OI, RAPSCALLION. YE PROMISED NOT TO RETURN ANYTHING FROM YER FUNCTION."
    )
}

function checkAssignable(e, { toType: type }) {
    check(
        type === Type.ANY || e.type.isAssignableTo(type),
        `Scrub the deck. Cannot assign a ${e.type.description} to a ${type.description}`
    )
}

function checkForVargh(isVargh, m) {
    if (
        m.initializer.constructor.name === "MapExpression" ||
        m.initializer.constructor.name === "ArrayExpression"
    ) {
        check(
            !isVargh || m.initializer.elements.length !== 0,
            `Hey! What's the type of that - Using vargh with an empty map or array confuses me.`
        )
    }
}

/*******************************************
 *  YER ANALYSIS TAKES PLACE IN A CONTEXT  *
 *******************************************/

class Context {
    constructor({
        parent = null,
        locals = new Map(),
        inLoop = false,
        inClass = null,
        function: f = null,
    }) {
        Object.assign(this, { parent, locals, inLoop, inClass, function: f })
    }
    // sees(name) {
    //     // Search "outward" through enclosing scopes
    //     return this.locals.has(name) || this.parent?.sees(name)
    // }

    add(name, entity) {
        // Shadowing is allowed hehe
        if (this.locals.has(name))
            error(`OI! Identifier ${name} be already declared. Scrub the deck!`)
        this.locals.set(name, entity)
    }
    lookup(name) {
        const entity = this.locals.get(name)

        if (entity) {
            return entity
        } else if (this.parent) {
            return this.parent.lookup(name)
        }
        error(
            `HEY! You didn't declare identifier ${name} before you tried to use it. Declare it first, ye scurvy dog!`
        )
    }
    newChildContext(props) {
        return new Context({
            ...this,
            parent: this,
            locals: new Map(),
            ...props,
        })
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
        console.log("in var dec")
        checkForVargh(d.type === "vargh", d)
        this.analyze(d.initializer)
        d.variable.value = new Variable(d.variable.lexeme)
        d.variable.value.type = d.initializer.type
        this.add(d.variable.lexeme, d.variable.value)
    }
    Token(t) {
        // For ids being used, not defined
        console.log("IN TOKEN")
        if (t.category === "Id" || t.category === "Sym") {
            console.log("IN SYM")
            console.log(t.lexeme)
            t.value = this.lookup(t.lexeme)
            t.type = t.value.type
        }
        if (t.category === "Int") [t.value, t.type] = [t.lexeme, Type.INT]
        if (t.category === "Double") [t.value, t.type] = [t.lexeme, Type.DOUBLE]
        if (t.category === "Str") [t.value, t.type] = [t.lexeme, Type.STRING]
        if (t.category === "Bool")
            [t.value, t.type] = [t.lexeme === "aye", Type.BOOLEAN]
    }
    MapExpression(m) {
        this.analyze(m.elements)
        checkAllHaveSameType(m.elements)
        if (m.elements.length > 0) {
            m.type = new MapType(m.elements[0].keyType, m.elements[0].valueType)
        } else {
            m.type = new MapType(Type.ANY, Type.ANY)
        }
    }
    MapEntry(e) {
        this.analyze(e.key)
        this.analyze(e.value)
        if (e.key.value.name !== undefined) {
            let x = this.lookup(e.key.value.name)
            e.key.type = x.type
        }
        e.keyType = e.key.type
        e.valueType = e.value.type
        console.log("1234567890asdfghjklsdfghjkl")
        console.log(e)
    }
    Array(a) {
        // check for empty array
        a.forEach((item) => this.analyze(item))
    }
    ArrayExpression(a) {
        this.analyze(a.elements)
        checkAllHaveSameType(a.elements)
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
    ForLoop(s) {
        this.analyze(s.start)
        checkInteger(s.start)
        this.analyze(s.end)
        checkInteger(s.end)
        s.variable = new Variable(s.variable.lexeme, true)
        s.variable.type = Type.INT
        const bodyContext = this.newChildContext({ inLoop: true })
        bodyContext.add(s.variable.name, s.variable)
        bodyContext.analyze(s.body)
    }
    WhileLoop(s) {
        this.analyze(s.test)
        checkBoolean(s.test)
        this.newChildContext({ inLoop: true }).analyze(s.body)
    }
    ForEachLoop(s) {
        this.analyze(s.expression)
        checkArray(s.expression)
        s.variable = new Variable(s.variable.lexeme, true)
        s.variable.type = s.expression.type.baseType
        const bodyContext = this.newChildContext({ inLoop: true })
        bodyContext.add(s.variable.name, s.variable)
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
        console.log("in call")
        console.log(c)
        this.analyze(c.callee)
        const callee = c.callee?.value ?? c.callee
        checkCallable(callee)
        this.analyze(c.args)
        checkFunctionCallArguments(c.args, callee.type)
        c.type = callee.type.returnType
        console.log("end of call")

        // TODO: Class methods and constructors
    }
    FunctionDeclaration(d) {
        if (d.returnType) this.analyze(d.returnType)
        d.fun.value = new Function(
            d.fun.lexeme,
            d.params,
            d.returnType?.value ?? d.returnType ?? Type.NONE
        )
        checkIsAType(d.fun.value.returnType)
        // When entering a function body, we must reset the inLoop setting,
        // because it is possible to declare a function inside a loop!
        const childContext = this.newChildContext({
            inLoop: false,
            function: d.fun.value,
        })
        if (d.fun.value.parameters) {
            childContext.analyze(d.fun.value.parameters)
        }
        d.fun.value.type = new FunctionType(
            d.fun.value.parameters.map((p) => p.type),
            d.fun.value.returnType
        )
        //d.fun.value.parameters.map(p => this.add(p.))
        // Add before analyzing the body to allow recursion
        this.add(d.fun.lexeme, d.fun.value)
        childContext.analyze(d.body)
    }
    Parameter(p) {
        this.analyze(p.type)
        if (p.type instanceof Token) p.type = p.type.value
        checkIsAType(p.type)
        this.add(p.id.lexeme, p)
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
        } else if (["-", "*", "/", "**", "%"].includes(e.op)) {
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
        this.analyze(e.operand)
        if (e.op === "-") {
            checkNumeric(e.operand)
            e.type = e.operand.type
        } else if (e.op === "not") {
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
    ClassDeclaration(c) {
        // if (this.inLoop) {
        //   throw new Error(`Foolish Spirit! You cannot create a class within a Loop!`)
        // }

        // this is not right
        // create a new class type every time we see a class
        console.log("IN CONTEXT")
        console.log(this)
        const newClassType = new ClassType(c.id, c.constructorDec, c.methods)
        // create a new context for the type
        const typeContext = this.newChildContext({ inClass: newClassType })
        // add that class to local
        // this.locals.set(c.id, newClassType)
        // c.type = new ClassType(c.id, c.constructorDec, c.methods)
        // const constructorContext = typeContext.newChildContext({ parent: typeContext })
        // handle constructor dec
        c.constructorDec = typeContext.analyze(c.constructorDec)
        c.methods = typeContext.analyze(c.methods)
        // handle methods
        this.add(c.id, newClassType)
        console.log("CONTEXT AFTER")
        console.log(this)
    }
    ConstructorDeclaration(d) {
        // this is not finished
        d.returnType = Type.NONE
        d.lexeme = "build"
        d.value = new Function(d.lexeme, d.parameters, d.returnType)
        // When entering a function body, we must reset the inLoop setting,
        // because it is possible to declare a function inside a loop!
        const constructorContext = this.newChildContext({
            inLoop: false,
            function: d.value,
        })
        if (d.value.parameters) {
            constructorContext.analyze(d.value.parameters)
        }
        d.value.type = new FunctionType(
            d.value.parameters.map((p) => p.type),
            Type.NONE
        )
        // Add before analyzing the body to allow recursion
        this.add(d.lexeme, d.value)
        constructorContext.analyze(d.body)
    }
    Field(f) {
        this.analyze(f.type)
        if (f.type instanceof Token) f.type = f.type.value
        checkIsAType(f.type)
        this.analyze(f.initializer)
        f.variable.value = new Variable(f.variable.lexeme)
        f.variable.value.type = f.initializer.type
        this.add(f.variable.lexeme, f.variable.value)
    }
    MethodDeclaration(d) {
        if (d.returnType) this.analyze(d.returnType)
        console.log(d)
        d.name.value = new Function(
            d.name.lexeme,
            d.params,
            d.returnType?.value ?? d.returnType ?? Type.NONE
        )
        checkIsAType(d.name.value.returnType)
        // When entering a function body, we must reset the inLoop setting,
        // because it is possible to declare a function inside a loop!
        const childContext = this.newChildContext({
            inLoop: false,
            function: d.name.value,
        })
        if (d.name.value.parameters) {
            childContext.analyze(d.name.value.parameters)
        }
        d.name.value.type = new FunctionType(
            d.name.value.parameters.map((p) => p.type),
            d.name.value.returnType
        )
        //d.fun.value.parameters.map(p => this.add(p.))
        // Add before analyzing the body to allow recursion
        this.add(d.name.lexeme, d.name.value)
        childContext.analyze(d.body)
    }
    DotExpression(e) {
        // check that the member is in
        console.log("FINALLY IN DOTEXP")
        console.log(e)
        this.analyze(e.object)
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
