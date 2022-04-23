import assert from "assert/strict"
import optimize from "../src/optimizer.js"
import * as core from "../src/core.js"

// Make some test cases easier to read
const x = new core.Variable("x", false)
const return1p1 = new core.ReturnStatement(new core.BinaryExpression("+", 1, 1))
const return2 = new core.ReturnStatement(2)
const returnX = new core.ReturnStatement(x)
const onePlusTwo = new core.BinaryExpression("+", 1, 2)
const identity = Object.assign(new core.Function("id"), { body: returnX })
const intFun = body => new core.FunctionDeclaration("f", [], "int", body)
const callIdentity = args => new core.Call(identity, args)
const or = (...d) => d.reduce((x, y) => new core.BinaryExpression("or", x, y))
const and = (...c) => c.reduce((x, y) => new core.BinaryExpression("and", x, y))
const less = (x, y) => new core.BinaryExpression("<", x, y)
const eq = (x, y) => new core.BinaryExpression("==", x, y)
const times = (x, y) => new core.BinaryExpression("*", x, y)
const neg = x => new core.UnaryExpression("-", x)
const array = (...elements) => new core.ArrayExpression(elements)
const emptyArray = new core.EmptyArray(core.Type.INT)
const sub = (a, e) => new core.SubscriptExpression(a, e)
const conditional = (x, y, z) => new core.Conditional(x, y, z)

const tests = [
  ["folds +", new core.BinaryExpression("+", 5, 8), 13],
  ["folds -", new core.BinaryExpression("-", 5n, 8n), -3n],
  ["folds *", new core.BinaryExpression("*", 5, 8), 40],
  ["folds /", new core.BinaryExpression("/", 5, 8), 0.625],
  ["folds **", new core.BinaryExpression("**", 5, 8), 390625],
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
  // ["removes x=x at beginning", [new core.Assignment(x, x), xpp], [xpp]],
  // ["removes x=x at end", [xpp, new core.Assignment(x, x)], [xpp]],
  // ["removes x=x in middle", [xpp, new core.Assignment(x, x), xpp], [xpp, xpp]],
  ["optimizes if-true", new core.IfStatement([true], [returnX], return1p1), x],
  ["optimizes if-false", new core.IfStatement([false], returnX, return2), 2],
  ["optimizes while-false", [new core.WhileLoop(false, x)], []],
  // ["optimizes for-range", [new core.ForLoop(x, 5, "...", 3, returnX)], []],
  // ["optimizes for-empty-array", [new core.ForEachLoop(x, emptyArray, xpp)], []],
  // ["applies if-false after folding", new core.IfStatement(eq(1, 1), returnX), returnX],
  ["optimizes left conditional true", conditional(true, 55, 89), 55],
  ["optimizes left conditional false", conditional(false, 55, 89), 89],
  // ["optimizes in functions", intFun(return1p1), intFun(return2)],
  // ["optimizes in subscripts", sub(x, onePlusTwo), sub(x, 3)],
  // ["optimizes in array literals", array(0, onePlusTwo, 9), array(0, 3, 9)],
  // ["optimizes in arguments", callIdentity([times(3, 5)]), callIdentity([15])],
  // [
  //   "passes through nonoptimizable constructs",
  //   ...Array(2).fill([
  //     new core.Program([new core.ShortReturnStatement()]),
  //     new core.VariableDeclaration("x", true, "z"),
  //     new core.TypeDeclaration([new core.Field("x", core.Type.INT)]),
  //     new core.Assignment(x, new core.BinaryExpression("*", x, "z")),
  //     new core.Assignment(x, new core.UnaryExpression("not", x)),
  //     new core.Call(identity, new core.MemberExpression(x, "f")),
  //     new core.VariableDeclaration("q", false, new core.EmptyArray(core.Type.FLOAT)),
  //     new core.VariableDeclaration("r", false, new core.EmptyOptional(core.Type.INT)),
  //     new core.WhileStatement(true, [new core.BreakStatement()]),
  //     new core.RepeatStatement(5, [new core.ReturnStatement(1)]),
  //     conditional(x, 1, 2),
  //     unwrapElse(some(x), 7),
  //     new core.IfStatement(x, [], []),
  //     new core.ShortIfStatement(x, []),
  //     new core.ForRangeStatement(x, 2, "..<", 5, []),
  //     new core.ForStatement(x, array(1, 2, 3), []),
  //   ]),
  // ],
]

describe("The optimizer", () => {
  for (const [scenario, before, after] of tests) {
    it(`${scenario}`, () => {
      assert.deepEqual(optimize(before), after)
    })
  }
})
