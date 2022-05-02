import * as core from "./core.js"

export default function optimize(node) {
    //console.log(node.constructor.name)
    return optimizers[node.constructor.name](node)
}
const optimizers = {
    Program(p) {
        p.statements = optimize(p.statements)
        return p
    },
    Assignment(s) {
        s.source = optimize(s.source)
        s.target = optimize(s.target)
        if (s.source === s.target) {
            return []
        }
        return s
    },
    VariableDeclaration(d) {
        d.variable = optimize(d.variable)
        d.initializer = optimize(d.initializer)
        return d
    },
    PrintStatement(p) {
        p.argument = optimize(p.argument)
        return p
    },
    Token(t) {
        // All tokens get optimized away and basically replace with either their
        // value (obtained by the analyzer for literals and ids) or simply with
        // lexeme (if a plain symbol like an operator)
        // ?? t.source
        return t.value ?? t.lexeme
    },
    MapExpression(e) {
        e.elements = optimize(e.elements)
        return e
    },
    MapEntry(e) {
        e.key = optimize(e.key)
        e.value = optimize(e.value)
        return e
    },
    Array(a) {
        // Flatmap since each element can be an array
        return a.flatMap(optimize)
    },
    ArrayExpression(e) {
        e.elements = optimize(e.elements)
        return e
    },
    ArrayType(e) {
        e.baseType = optimize(e.baseType)
        return e
    },
    EmptyArray(e) {
        return e
    },
    MapType(e) {
        e.keyType = optimize(e.keyType)
        e.valueType = optimize(e.valueType)
        return e
    },
    IfStatement(s) {
        s.test = optimize(s.test)
        s.consequent = optimize(s.consequent)
        s.alternate = optimize(s.alternate)
        for (let i = 0; i < s.test.length; i++) {
            if (s.test[i].constructor === Boolean && s.test[i]) {
                // Ask Dr. Toal what to do if we have lots of else-ifs because we can't rely on recursion.
                return s.consequent[i]
            }
            if (
                i === s.test.length - 1 &&
                s.test[i].constructor === Boolean &&
                !s.test[i]
            ) {
                return s.alternate
            }
        }
        return s
    },
    Conditional(e) {
        e.test = optimize(e.test)
        e.consequent = optimize(e.consequent)
        e.alternate = optimize(e.alternate)
        if (e.test.constructor === Boolean) {
            return e.test ? e.consequent : e.alternate
        }
        return e
    },
    ForEachLoop(s) {
        s.variable = optimize(s.variable)
        s.expression = optimize(s.expression)
        s.body = optimize(s.body)
        if (s.expression.constructor === core.EmptyArray) {
            return []
        } // TODO !!!
        return s
    },
    WhileLoop(s) {
        s.test = optimize(s.test)
        if (s.test === false) {
            // while false is a no-op
            return []
        }
        s.body = optimize(s.body)
        return s
    },
    ForLoop(s) {
        s.variable = optimize(s.variable)
        s.start = optimize(s.start)
        s.end = optimize(s.end)
        s.body = optimize(s.body)

        if (s.start.constructor === Number) {
            if (s.end.constructor === Number) {
                if (s.start > s.end) {
                    return []
                }
            }
        }
        return s
    },
    ReturnStatement(s) {
        s.expression = optimize(s.expression)
        return s
    },
    ShortReturnStatement(s) {
        return s
    },
    BreakStatement(s) {
        return s
    },
    Call(c) {
        c.callee = optimize(c.callee)
        c.args = optimize(c.args)
        return c
    },
    BinaryExpression(e) {
        e.op = optimize(e.op)
        e.left = optimize(e.left)
        e.right = optimize(e.right)
        if (e.op === "and") {
            // Optimize boolean constants in && and ||
            if (e.left === true) return e.right
            else if (e.right === true) return e.left
        } else if (e.op === "or") {
            if (e.left === false) return e.right
            else if (e.right === false) return e.left
        } else if ([Number, BigInt].includes(e.left.constructor)) {
            // Numeric constant folding when left operand is constant
            if ([Number, BigInt].includes(e.right.constructor)) {
                if (e.op === "+") return e.left + e.right
                else if (e.op === "-") return e.left - e.right
                else if (e.op === "*") return e.left * e.right
                else if (e.op === "/") return e.left / e.right
                else if (e.op === "**") return e.left ** e.right
                else if (e.op === "%") return e.left % e.right
                else if (e.op === "<") return e.left < e.right
                else if (e.op === "<=") return e.left <= e.right
                else if (e.op === "==") return e.left === e.right
                else if (e.op === "!=") return e.left !== e.right
                else if (e.op === ">=") return e.left >= e.right
                else if (e.op === ">") return e.left > e.right
            } else if (e.left === 0 && e.op === "+") return e.right
            else if (e.left === 1 && e.op === "*") return e.right
            else if (e.left === 0 && e.op === "-")
                return new core.UnaryExpression("-", e.right)
            else if (e.left === 1 && e.op === "**") return 1
            else if (e.left === 0 && ["*", "/"].includes(e.op)) return 0
        } else if (e.right.constructor === Number) {
            // Numeric constant folding when right operand is constant
            if (["+", "-"].includes(e.op) && e.right === 0) return e.left
            else if (["*", "/"].includes(e.op) && e.right === 1) return e.left
            else if (e.op === "*" && e.right === 0) return 0
            else if (e.op === "**" && e.right === 0) return 1 // TODO: What to do about %
        }
        return e
    },
    UnaryExpression(e) {
        e.op = optimize(e.op)
        e.operand = optimize(e.operand)
        if (e.operand.constructor === Number) {
            if (e.op === "-") {
                return -e.operand
            }
        }
        return e
    },
    SubscriptExpression(e) {
        e.array = optimize(e.array)
        e.index = optimize(e.index)
        return e
    },
    ClassDeclaration(e) {
        // TODO: How to optimize class declarations
        e.id = optimize(e.id)
        e.constructorDec = optimize(e.constructorDec)
        e.methods = optimize(e.methods)
        return e
    },
    ConstructorDeclaration(e) {
        // TODO: How to optimize class declarations
        e.parameters = optimize(e.parameters)
        e.body = optimize(e.body)
        return e
    },
    Field(f) {
        // TODO: should we optimize this for our language?
        //f.variable = optimize(f.variable)
        f.variable = f.variable.source
        return f
    },
    MethodDeclaration(d) {
        // TODO: How to do this?
        d.name = optimize(d.name)
        d.returnType = optimize(d.returnType)
        d.params = optimize(d.params)
        if (d.body) d.body = optimize(d.body)
        return d
    },
    DotExpression(e) {
        // TODO: How to do this?
        e.object = optimize(e.object)
        return e
    },
    ThisExpression(e) {
        // TODO: How to do this?
        return e
    },
    ObjectDec(e) {
        // TODO: How to do this?
        e.identifier = optimize(e.identifier)
        e.args = optimize(e.args)
        return e
    },
    DotCall(e) {
        // TODO: How to do this?
        e.object = optimize(e.object)
        e.member = optimize(e.member)
        return e
    },
    FunctionDeclaration(d) {
        d.fun = optimize(d.fun)
        d.params = optimize(d.params)
        if (d.body) d.body = optimize(d.body)
        return d
    },
    Type(d) {
        // TODO: ask dr. toal how to handle types in optimization this seems sus
        d.type = d.description
        return d
    },
    Parameter(p) {
        p.id = optimize(p.id)
        return p
    },
    Variable(v) {
        return v
    },
    Function(f) {
        return f
    },
    Boolean(e) {
        return e
    },
    String(e) {
        return e
    },
    Number(e) {
        return e
    },
    BigInt(e) {
        return e
    },
}
