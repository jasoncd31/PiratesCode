import util from "util"

export class Program {
    constructor(statements) {
        this.statements = statements
    }
}

export class Type {
    // Type of all basic type int, double, string, etc. and superclass of others
    static BOOLEAN = new Type("booty")
    static INT = new Type("int")
    static DOUBLE = new Type("doubloon")
    static STRING = new Type("shanty")
    static NONE = new Type("none")
    static ANY = new Type("any")
    constructor(description) {
        Object.assign(this, { description })
    }
}

export class Function {
    constructor(name, parameters, returnType) {
        Object.assign(this, { name, parameters, returnType })
    }
}

export class FunctionType extends Type {
    // Example: (boolean,[string]?)->float
    constructor(paramTypes, returnType) {
        super(
            `(${paramTypes.map((t) => t.description).join(",")})->${
                returnType.description
            }`
        )
        Object.assign(this, { paramTypes, returnType })
    }
}

export class ArrayType extends Type {
    constructor(baseType) {
        super(`[${baseType.description}]`)
        this.baseType = baseType
    }
}

export class MapType extends Type {
    constructor(baseKeyType, baseValueType) {
        super(`{${baseKeyType.description} : ${baseValueType.description}}`)
        this.baseKeyType = baseKeyType
        this.baseValueType = baseValueType
    }
}

export class ClassType extends Type {
    constructor(name, constructor, methods) {
        super(name)
        this.constructor = constructor
        this.methods = methods
    }
}

// export class SetType extends Type {
//     constructor(baseType) {
//       super(`Set(${baseType.description})`)
//     }
// }

export class Variable {
    constructor(name) {
        this.name = name
    }
}

export class VariableDeclaration {
    constructor(type, variable, initializer) {
        Object.assign(this, { type, variable, initializer })
    }
}

export class FunctionDeclaration {
    constructor(fun, params, body, returnType) {
        Object.assign(this, { fun, params, body, returnType })
    }
}

export class Assignment {
    constructor(target, source) {
        Object.assign(this, { target, source })
    }
}

export class DotExpression {
    constructor(object, member) {
        Object.assign(this, { object, member })
    }
}

export class DotCall {
    constructor(object, member) {
        Object.assign(this, { object, member })
    }
}

export class Field {
    constructor(type, variable, initializer) {
        Object.assign(this, { type, variable, initializer })
    }
}

export class WhileLoop {
    constructor(test, body) {
        Object.assign(this, { test, body })
    }
}

export class ForLoop {
    constructor(variable, start, end, body) {
        Object.assign(this, { variable, start, end, body })
    }
}

export class ForEachLoop {
    constructor(variable, expression, body) {
        Object.assign(this, { variable, expression, body })
    }
}

export class PrintStatement {
    constructor(argument) {
        Object.assign(this, { argument })
    }
}

export class ClassDeclaration {
    constructor(id, constructorDec, methods) {
        Object.assign(this, { id, constructorDec, methods })
    }
}

export class Call {
    constructor(callee, args) {
        Object.assign(this, { callee, args })
    }
}

export class Conditional {
    constructor(test, consequent, alternate) {
        Object.assign(this, { test, consequent, alternate })
    }
}

export class IfStatement {
    constructor(test, consequent, alternate) {
        Object.assign(this, { test, consequent, alternate })
    }
}

export class BreakStatement {
    // Intentionally empty
}

export class BinaryExpression {
    constructor(op, left, right) {
        Object.assign(this, { op, left, right })
    }
}

export class UnaryExpression {
    constructor(op, operand) {
        Object.assign(this, { op, operand })
    }
}

export class ArrayExpression {
    constructor(elements) {
        this.elements = elements
    }
}

export class MapExpression {
    constructor(elements) {
        this.elements = elements
    }
}

export class MapEntry {
    constructor(key, value) {
        this.key = key
        this.value = value
    }
}

export class ObjectDec {
    constructor(identifier, args) {
        Object.assign(this, { identifier, args })
    }
}

export class ConstructorDeclaration {
    constructor(parameters, body) {
        Object.assign(this, { parameters, body })
    }
}

export class Parameter {
    constructor(type, id) {
        Object.assign(this, { type, id })
    }
}

export class MethodDeclaration {
    constructor(name, params, body, returnType) {
        Object.assign(this, { name, params, body, returnType })
    }
}

// Token objects are wrappers around the Nodes produced by Ohm. We use
// them here just for simple things like numbers and identifiers. The
// Ohm node will go in the "source" property.
export class Token {
    constructor(category, source) {
        Object.assign(this, { category, source })
    }
    get lexeme() {
        // Ohm holds this for us, nice
        return this.source.contents
    }

    get description() {
        return this.source.contents
    }
}

export class SubscriptExpression {
    // Example: a[20]
    constructor(array, index) {
        Object.assign(this, { array, index })
    }
}

export class ReturnStatement {
    constructor(expression) {
        this.expression = expression
    }
}

export class ShortReturnStatement {
    // Intentionally empty
}

// Throw an error message that takes advantage of Ohm's messaging
export function error(message, token) {
    if (token?.source) {
        throw new Error(`${token.source.getLineAndColumnMessage()}${message}`)
    }
    throw new Error(message)
}

// Return a compact and pretty string representation of the node graph,
// taking care of cycles. Written here from scratch because the built-in
// inspect function, while nice, isn't nice enough. Defined properly in
// the root class prototype so that it automatically runs on console.log.
Program.prototype[util.inspect.custom] = function () {
    const tags = new Map()

    // Attach a unique integer tag to every node
    function tag(node) {
        if (tags.has(node) || typeof node !== "object" || node === null) return
        if (node.constructor === Token) {
            // Tokens are not tagged themselves, but their values might be
            tag(node?.value)
        } else {
            // Non-tokens are tagged
            tags.set(node, tags.size + 1)
            for (const child of Object.values(node)) {
                Array.isArray(child) ? child.forEach(tag) : tag(child)
            }
        }
    }

    function* lines() {
        function view(e) {
            if (tags.has(e)) return `#${tags.get(e)}`
            if (e?.constructor === Token) {
                return `(${e.category},"${e.lexeme}"${
                    e.value ? "," + view(e.value) : ""
                })`
            }
            if (Array.isArray(e)) return `[${e.map(view)}]`
            return util.inspect(e)
        }
        for (let [node, id] of [...tags.entries()].sort(
            (a, b) => a[1] - b[1]
        )) {
            let type = node.constructor.name
            let props = Object.entries(node).map(([k, v]) => `${k}=${view(v)}`)
            yield `${String(id).padStart(4, " ")} | ${type} ${props.join(" ")}`
        }
    }

    tag(this)
    return [...lines()].join("\n")
}
