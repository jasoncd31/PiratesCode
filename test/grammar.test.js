
import assert from "assert/strict"
import fs from "fs"
import ohm from "ohm-js"

const syntaxChecks = [
  ["print statement", "ahoy \"world!\""],
  ["simple return statement", "anchor -5.0"],
  ["simple break statement", "maroon"],
  ["multiple statements", "ahoy 1\nmaroon\nint x=5 anchor anchor"],
  ["declarations", "vargh x = 5\nint x = 5\nvargh bigMap = {\"hi jason\":\"hola jason\", \"hi maya\":\"hola maya\"}"],
  ["function declarations", "captain isEven(x){\nanchor x % 2 == 0\n}"],
  ["function with no params, no return type", "captain f() {}"],
  ["function with one params", "captain f(x) {anchor x}"],
  ["function with two params", "captain f(x, y) {anchor x + y}"],
  ["if statements", "yo x < 10 { \nanchor 1 \n} yo ho (x < 20) { \n anchor -1} yo ho ho {\nanchor 0\n} "],
  ["while loops", "parrot aye {\nmaroon\n}"],
  ["for loops", "chase vargh x = 0 until 10 {\nmaroon\n}"],
  ["for each loops", "chase vargh x through list {\nmaroon\n}"],
  ["end of program inside comment", "ahoy 1 $$yay"],
  ["comments with no text are ok", "ahoy 1 $$\nahoy 0"],
  ["relational operators", "ahoy 1<2 or 1<=2 or 1==2 and 1!=2 or 1>=2 and 1>2"],
  ["numeric literals", "ahoy -8 * 89.123 * 1.3E5 * (-1.3E+5) * 1.3E-5"],
  ["arithmetic", "anchor 2 * x + 3 / 5 - (-1) % 7 ** 3 ** 3"],
  ["class and constructor declarations", "ship Rectangle {\nbuild (height, width) {\nme.height = height\nme.width = width\n}\n}"],
  ["function declartion inside of a class", "ship Rectangle {\nbuild (height, width) {\nme.height = height\nme.width = width\n}\ncaptain getHeight(){\nanchor me.height\n}\n}\n"],
  ["instantiating an object using a class", "ship Rectangle {\nbuild (height, width) {\nme.height = height\nme.width = width\n}\ncaptain getHeight(){\nanchor me.height\n}\n}\n Rectangle rec1 = new Rectangle(5,4)"],
  ["assigning a class function with a return to a new variable", "ship Rectangle {\nbuild (height, width) {\nme.height = height\nme.width = width\n}\ncaptain getHeight(){\nanchor me.height\n}\n}\nRectangle rec1 = new Rectangle(5,4)\nvargh height = rec1.getHeight()"],
]

const syntaxErrors = [
  ["non-letter in an identifier", "vargh ab😭c = 2", /Line 1, col 9/],
  ["malformed number", "x= 2.", /Line 1, col 6/],
  ["a float with an E but no exponent", "vargh x = 5E * 11"],
  ["incomplete variable declaration", "vargh x = ", /Line 1, col 11/],
  ["a missing right operand", "ahoy 5 -", /Line 1, col 9/],
  ["a non-operator", "ahoy 7 * (2 _ 3)", /Line 1/],
  ["an expression starting with a )", "x = )", /Line 1, col 5/],
  ["a statement starting with expression", "x * 5", /Line 1, col 3/],
  ["an illegal statement on line 2", "ahoy 5 \nx * 5", /Line 2, col 3/],
  ["a statement starting with a )", "ahoy 5 \n) * 5", /Line 2, col 1/],
  ["an expression starting with a *", "x = * 71", /Line 1, col 5/],
  ["type as a variable name", "ledger map = []", /Line 1, col 8/],
  ["keyword as a variable name", "int yo = 5", /Line 1, col 5/],
  ["while without braces", "parrot true\nahoy 1", /Line 2, col 1/],
  ["if without braces", "yo x < 3\nahoy 1", /Line 2, col 1/],
  ["while as identifier", "vargh parrot = 3"],
  ["if as identifier", "vargh yo = 8"],
  ["unbalanced brackets", "captain f(){"],
  // ["true is not assignable", "vargh yay = 1"],
  ["false is not assignable", "vargh nay = 1"],





  
]

describe("The grammar", () => {
  const grammar = ohm.grammar(fs.readFileSync("src/pirates.ohm"))
  for (const [scenario, source] of syntaxChecks) {
    it(`properly specifies ${scenario}`, () => {
      assert(grammar.match(source).succeeded())
    })
  }
  for (const [scenario, source, errorMessagePattern] of syntaxErrors) {
    it(`does not permit ${scenario}`, () => {
      const match = grammar.match(source)
      assert(!match.succeeded())
      assert(new RegExp(errorMessagePattern).test(match.message))
    })
  }
})