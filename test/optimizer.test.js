import assert from "assert/strict"
import optimize from "../src/optimizer.js"
import * as core from "../src/core.js"

// Make some test cases easier to read
const x = new core.Variable("x", false)
const return1p1 = new core.ReturnStatement(new core.BinaryExpression("+", 1, 1))
const return2 = new core.ReturnStatement(2)
const returnX = new core.ReturnStatement(x)
const shortRetun = new core.ShortReturnStatement()
const breakStmt = new core.BreakStatement()
const onePlusTwo = new core.BinaryExpression("+", 1, 2)
const identity = Object.assign(new core.Function("id"), { body: returnX })
const intFun = (body) => new core.FunctionDeclaration("f", [], "int", body)
const callIdentity = (args) => new core.Call(identity, args)
const or = (...d) => d.reduce((x, y) => new core.BinaryExpression("or", x, y))
const and = (...c) => c.reduce((x, y) => new core.BinaryExpression("and", x, y))
const less = (x, y) => new core.BinaryExpression("<", x, y)
const eq = (x, y) => new core.BinaryExpression("==", x, y)
const times = (x, y) => new core.BinaryExpression("*", x, y)
const neg = (x) => new core.UnaryExpression("-", x)
const array = (...elements) => new core.ArrayExpression(elements)
const map = (...entries) => new core.MapExpression(entries)
const emptyArray = new core.EmptyArray(core.Type.INT)
const sub = (a, e) => new core.SubscriptExpression(a, e)
const conditional = (x, y, z) => new core.Conditional(x, y, z)

const tests = [
    ["folds +", new core.BinaryExpression("+", 5, 8), 13],
    ["folds -", new core.BinaryExpression("-", 5n, 8n), -3n],
    ["folds *", new core.BinaryExpression("*", 5, 8), 40],
    ["folds /", new core.BinaryExpression("/", 5, 8), 0.625],
    ["folds **", new core.BinaryExpression("**", 5, 8), 390625],
    ["folds %", new core.BinaryExpression("%", 5, 8), 5],
    ["folds <", new core.BinaryExpression("<", 5, 8), true],
    ["folds <=", new core.BinaryExpression("<=", 5, 8), true],
    ["folds ==", new core.BinaryExpression("==", 5, 8), false],
    ["folds !=", new core.BinaryExpression("!=", 5, 8), true],
    ["folds >=", new core.BinaryExpression(">=", 5, 8), false],
    ["folds >", new core.BinaryExpression(">", 5, 8), false],
    ["optimizes +0", new core.BinaryExpression("+", x, 0), x],
    ["optimizes -0", new core.BinaryExpression("-", x, 0), x],
    ["optimizes *1", new core.BinaryExpression("*", x, 1), x],
    ["optimizes /1", new core.BinaryExpression("/", x, 1), x],
    ["optimizes *0", new core.BinaryExpression("*", x, 0), 0],
    ["optimizes 0*", new core.BinaryExpression("*", 0, x), 0],
    ["optimizes 0/", new core.BinaryExpression("/", 0, x), 0],
    ["optimizes 0+", new core.BinaryExpression("+", 0, x), x],
    ["optimizes 0-", new core.BinaryExpression("-", 0, x), neg(x)],
    ["optimizes 1*", new core.BinaryExpression("*", 1, x), x],
    ["folds negation", new core.UnaryExpression("-", 8), -8],
    ["optimizes 1**", new core.BinaryExpression("**", 1, x), 1],
    ["optimizes **0", new core.BinaryExpression("**", x, 0), 1],
    ["removes left false from or", or(false, less(x, 1)), less(x, 1)],
    ["removes right false from or", or(less(x, 1), false), less(x, 1)],
    ["removes left true from and", and(true, less(x, 1)), less(x, 1)],
    ["removes right true from and", and(less(x, 1), true), less(x, 1)],
    [
        "removes x=x at beginning",
        [new core.Assignment(x, x), return1p1],
        [return2],
    ],
    ["removes x=x at end", [return1p1, new core.Assignment(x, x)], [return2]],
    [
        "removes x=x in middle",
        [return1p1, new core.Assignment(x, x), return1p1],
        [return2, return2],
    ],
    [
        "optimizes if-true",
        new core.IfStatement([true], [returnX], return1p1),
        returnX,
    ],
    [
        "optimizes if-false",
        new core.IfStatement([false, false], [returnX, return1p1], return2),
        return2,
    ],
    [
        "optimizes elseif-true",
        new core.IfStatement(
            [false, false, true],
            [returnX, return1p1, breakStmt],
            returnX
        ),
        breakStmt,
    ],
    [
        "optimizes elseif-true 2",
        new core.IfStatement(
            [false, true, true],
            [returnX, return1p1, return2],
            returnX
        ),
        return1p1,
    ],
    ["optimizes while-false", [new core.WhileLoop(false, x)], []],
    ["optimizes forLoop", [new core.ForLoop(x, 3, 2, [])], []],
    [
        "optimizes for-empty-array",
        [new core.ForEachLoop(x, emptyArray, return2)],
        [],
    ],
    [
        "applies if-false after folding",
        new core.IfStatement([eq(1, 2)], [return2], shortRetun),
        shortRetun,
    ],
    [
        "applies if-true after folding",
        new core.IfStatement([eq(1, 1)], [return2], shortRetun),
        return2,
    ],
    ["optimizes left conditional true", conditional(true, 55, 89), 55],
    ["optimizes left conditional false", conditional(false, 55, 89), 89],
    ["optimizes in functions", intFun(return1p1), intFun(return2)],
    [
        "optimizes object declaration",
        new core.ObjectDec("lmao", [and(true, less(x, 1)), 69]),
        new core.ObjectDec("lmao", [less(x, 1), 69]),
    ],
    [
        "optimizes object method call",
        new core.DotCall(
            "varName",
            new core.MethodDeclaration("name", [], [], "none")
        ),
        new core.DotCall(
            "varName",
            new core.MethodDeclaration("name", [], [], "none")
        ),
    ],
    [
        "optimizes through maps",
        map(new core.MapEntry(onePlusTwo, and(true, less(x, 1)))),
        map(new core.MapEntry(3, less(x, 1))),
    ],
    ["optimizes in subscripts", sub(x, onePlusTwo), sub(x, 3)],
    ["optimizes in array literals", array(0, onePlusTwo, 9), array(0, 3, 9)],
    ["optimizes in arguments", callIdentity([times(3, 5)]), callIdentity([15])],
    [
        "optimiizes field calls",
        new core.DotExpression(
            "varName",
            new core.MethodDeclaration("name", [], [], "none")
        ),
        new core.DotExpression(
            "varName",
            new core.MethodDeclaration("name", [], [], "none")
        ),
    ],
    [
        "optimizes fields",
        new core.Field(core.Type.INT, new core.Token("Id", "x"), 4),
        new core.Field(core.Type.INT, "x", 4),
    ],
    [
        "passes through nonoptimizable constructs",
        ...Array(2).fill([
            new core.Program([new core.ShortReturnStatement()]),
            new core.VariableDeclaration(core.Type.DOUBLE, "var", 1.0),
            new core.VariableDeclaration("x", true, "z"),
            new core.Assignment(x, new core.BinaryExpression("*", x, "z")),
            new core.Assignment(x, new core.UnaryExpression("not", x)),
            new core.Call(identity, new core.DotExpression(x, "f")),
            new core.VariableDeclaration(
                new core.ArrayType(core.Type.INT),
                "q",
                array(1)
            ),
            new core.VariableDeclaration(core.Type.INT, "r", 1),
            new core.WhileLoop(true, [new core.BreakStatement()]),
            conditional(x, 1, 2),
            new core.IfStatement(x, [], []),
            // new core.ShortIfStatement(x, []),
            // new core.ForRangeStatement(x, 2, "..<", 5, []),
            new core.ForEachLoop(x, array(1, 2, 3), []),
            new core.ThisExpression(),
            new core.ArrayType(core.Type.BOOLEAN),
            new core.MapType(core.Type.STRING, core.Type.DOUBLE),
            new core.Parameter(core.Type.DOUBLE, x),
            new core.ClassDeclaration(
                "className",
                new core.ConstructorDeclaration(
                    new core.Parameter(core.Type.INT, x),
                    new core.Field(core.Type.INT, "x", x)
                ),
                [
                    new core.MethodDeclaration("name", [], [], "none"),
                    new core.MethodDeclaration("name2", [], [], "none"),
                ]
            ),
        ]),
    ],
]

describe("The optimizer", () => {
    for (const [scenario, before, after] of tests) {
        it(`${scenario}`, () => {
            assert.deepEqual(optimize(before), after)
        })
    }
})
