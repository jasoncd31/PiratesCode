
import assert from "assert/strict"
import fs from "fs"
import ohm from "ohm-js"

const syntaxChecks = [
  ["print statement", "ahoy \"world!\""],
  ["declarations", "vargh x = 5\nint x = 5"],
  ["function declarations", "captain evenOrOdd(x){\nanchor x % 2 == 0\n}"],
  ["if statements", "yo x < 10 { \nanchor 1 \n} yo ho (x < 20) { \n anchor -1} yo ho ho {\nanchor 0\n} "],
  ["while loops", "parrot aye {\nmaroon\n}"],
  ["for loops", "chase vargh x = 0 until 10 {\nmaroon\n}"],
  ["for each loops", "chase vargh x through ledger {\nmaroon\n}"],
  ["class and constructor declarations", "ship Rectangle {\nbuild (height, width) {\nme.height = height\nme.width = width\n}\n}"],
  ["end of program inside comment", "ahoy 1 $$yay"],
  ["comments with no text are ok", "ahoy 1 $$\nahoy 0"],
]

const syntaxErrors = [
  ["non-letter in an identifier", "vargh ab😭c = 2", /Line 1, col 9/],
  ["malformed number", "x= 2.", /Line 1, col 6/],
  ["incomplete variable declaration", "vargh x = ", /Line 1, col 11/],
  ["a missing right operand", "ahoy 5 -", /Line 1, col 9/],
  ["a non-operator", "ahoy 7 * (2 _ 3)", /Line 1/],
  ["an expression starting with a )", "x = )", /Line 1, col 5/],
  ["a statement starting with expression", "x * 5", /Line 1, col 3/],
  ["an illegal statement on line 2", "ahoy 5 \nx * 5", /Line 2, col 3/],
  ["a statement starting with a )", "ahoy 5 \n) * 5", /Line 2, col 1/],
  ["an expression starting with a *", "x = * 71;", /Line 1, col 5/],
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