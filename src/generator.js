// CODE GENERATOR: Carlos -> JavaScript
//
// Invoke generate(program) with the program node to get back the JavaScript
// translation as a string.

import { Type } from "./core.js"
import * as stdlib from "./stdlib.js"

export default function generate(program) {
    const output = []

    // Variable and function names in JS will be suffixed with _1, _2, _3,
    // etc. This is because "switch", for example, is a legal name in Carlos,
    // but not in JS. So, the Carlos variable "switch" must become something
    // like "switch_1". We handle this by mapping each name to its suffix.
    const targetName = ((mapping) => {
        return (entity) => {
            if (!mapping.has(entity)) {
                mapping.set(entity, mapping.size + 1)
            }
            return `${entity.name ?? entity.description}_${mapping.get(entity)}`
        }
    })(new Map())

    function gen(node) {
        return generators[node.constructor.name](node)
    }

    const generators = {
        // Key idea: when generating an expression, just return the JS string; when
        // generating a statement, write lines of translated JS to the output array.
        Program(p) {
            gen(p.statements)
        },
        VariableDeclaration(d) {
            // We don't care about const vs. let in the generated code! The analyzer has
            // already checked that we never updated a const, so let is always fine.
            output.push(`let ${gen(d.variable)} = ${gen(d.initializer)};`)
        },
        Type(d) {
            // TODO
            // The only type declaration in Carlos is the struct! Becomes a JS class.
            output.push(`class ${gen(d.type)} {`)
            output.push(`constructor(${gen(d.type.fields).join(",")}) {`)
            for (let field of d.type.fields) {
                output.push(
                    `this[${JSON.stringify(gen(field))}] = ${gen(field)};`
                )
            }
            output.push("}")
            output.push("}")
        },
        ClassType(t) {
            // TODO
            return targetName(t)
        },
        Field(f) {
            return targetName(f)
        },
        FunctionDeclaration(d) {
            output.push(
                `function ${gen(d.fun)}(${gen(d.fun.params).join(", ")}) {`
            )
            gen(d.body)
            output.push("}")
        },
        Parameter(p) {
            return targetName(p)
        },
        Variable(v) {
            // Standard library constants just get special treatment
            // if (v === stdlib.contents.π) {
            //     return "Math.PI"
            // }
            return targetName(v)
        },
        Function(f) {
            return targetName(f)
        },
        Assignment(s) {
            output.push(`${gen(s.target)} = ${gen(s.source)};`)
        },
        BreakStatement(s) {
            output.push("break;")
        },
        ReturnStatement(s) {
            output.push(`return ${gen(s.expression)};`)
        },
        ShortReturnStatement(s) {
            output.push("return;")
        },
        IfStatement(s) {
            for (let i = 0; i < s.test.length; i++) {
                output.push(`if (${gen(s.test[i])}) {`)
                gen(s.consequent[i])
                if (i < s.test.length - 1) {
                    output.push(`} else`)
                }
            }
            output.push("} else {")
            gen(s.alternate)
            output.push("}")
        },
        WhileLoop(s) {
            output.push(`while (${gen(s.test)}) {`)
            gen(s.body)
            output.push("}")
        },
        ForLoop(s) {
            const i = targetName(s.variable)
            output.push(
                `for (let ${i} = ${gen(s.start)}; ${i} < ${gen(
                    s.end
                )}; ${i}++) {`
            )
            gen(s.body)
            output.push("}")
        },
        ForEachLoop(s) {
            output.push(
                `for (let ${gen(s.variable)} of ${gen(s.expression)}) {`
            )
            gen(s.body)
            output.push("}")
        },
        Conditional(e) {
            return `((${gen(e.test)}) ? (${gen(e.consequent)}) : (${gen(
                e.alternate
            )}))`
        },
        BinaryExpression(e) {
            const op = { "==": "===", "!=": "!==" }[e.op] ?? e.op
            return `(${gen(e.left)} ${op} ${gen(e.right)})`
        },
        UnaryExpression(e) {
            return `${e.op}(${gen(e.operand)})`
        },
        SubscriptExpression(e) {
            return `${gen(e.array)}[${gen(e.index)}]`
        },
        ArrayExpression(e) {
            return `[${gen(e.elements).join(",")}]`
        },
        EmptyArray(e) {
            return "[]"
        },
        DotExpression(e) {
            const object = gen(e.object)
            const member = JSON.stringify(gen(e.member))
            // const chain = e.isOptional ? "?." : ""
            return `(${object}${chain}[${member}])`
        },
        ThisExpression(e) {
            return "this"
        },
        ClassDeclaration(c) {},
        ConstructorDeclaraction(c) {},
        PrintStatement(e) {},
        DotCall(c) {},
        MethodDeclaration(c) {},
        Call(c) {
            // TODO
            const targetCode =
                c.callee.constructor === ClassType
                    ? `new ${gen(c.callee)}(${gen(c.args).join(", ")})`
                    : `${gen(c.callee)}(${gen(c.args).join(", ")})`
            // Calls in expressions vs in statements are handled differently
            if (
                c.callee instanceof Type ||
                c.callee.type.returnType !== Type.VOID
            ) {
                return targetCode
            }
            output.push(`${targetCode};`)
        },
        Number(e) {
            return e
        },
        BigInt(e) {
            return e
        },
        Boolean(e) {
            return e
        },
        String(e) {
            return e
        },
        Array(a) {
            return a.map(gen)
        },
    }

    gen(program)
    return output.join("\n")
}
