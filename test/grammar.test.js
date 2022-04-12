import assert from "assert/strict"
import fs from "fs"
import ohm from "ohm-js"

const syntaxChecks = [
    ["print statement", 'ahoy "world!"'],
    ["simple return statement", "anchor -5.0"],
    ["simple break statement", "maroon"],
    ["multiple statements", "ahoy 1\nmaroon\nint x=5 anchor anchor"],
    [
        "declarations",
        'vargh x = 5\nint x = 5\nvargh bigMap = {"hi jason":"hola jason", "hi maya":"hola maya"}',
    ],
    [
        "function declarations",
        "captain isEven(int x) -> booty {\nanchor x % 2 == 0\n}",
    ],
    ["function with no params", "captain f() -> none {}"],
    ["function with one params", "captain f(shanty x) -> shanty {anchor x}"],
    [
        "function with two params",
        "captain f(int x, int y) -> int {anchor x + y}",
    ],
    [
        "if statements",
        "yo x < 10 { \nanchor 1 \n} yo ho (x < 20) { \n anchor -1} ho {\nanchor 0\n} ",
    ],
    ["while loops", "parrot aye {\nmaroon\n}"],
    ["for loops", "chase vargh x = 0 until 10 {\nmaroon\n}"],
    ["for each loops", "chase vargh x through list {\nmaroon\n}"],
    ["end of program inside comment", "ahoy 1 $$yay"],
    ["comments with no text are ok", "ahoy 1 $$\nahoy 0"],
    [
        "relational operators",
        "ahoy 1<2 or 1<=2 or 1==2 and 1!=2 or 1>=2 and 1>2",
    ],
    ["numeric literals", "ahoy -8 * 89.123 * 1.3E5 * (-1.3E+5) * 1.3E-5"],
    ["arithmetic", "anchor 2 * x + 3 / 5 - (-1) % 7 ** 3 ** 3"],
    [
        "class and constructor declarations",
        "ship Rectangle {\nbuild (doubloon height, int width) {\ndoubloon me.height = height\nint me.width = width\n}\n}",
    ],
    [
        "function declartion inside of a class",
        "ship Rectangle {\nbuild (int height, doubloon width) {\nint me.height = height\ndoubloon me.width = width\n}\ncaptain getHeight() -> int {\nanchor me.height\n}\n}\n",
    ],
    [
        "instantiating an object using a class",
        "ship Rectangle {\nbuild (doubloon height, shanty width) {\ndoubloon me.height = height\nint me.width = width\n}\ncaptain getHeight() -> int{\nanchor me.height\n}\n}\n Rectangle rec1 = new Rectangle(5,4)",
    ],
    [
        "assigning a class function with a return to a new variable",
        "ship Rectangle {\nbuild (shanty height, doubloon width) {\nshanty me.height = height\ndoubloon me.width = width\n}\ncaptain getHeight() -> int {\nanchor me.height\n}\n}\nRectangle rec1 = new Rectangle(5,4)\nvargh height = rec1.getHeight()",
    ],
    [
        "booleans as expressions",
        "bigboolean = y == 7 and z < 10 or (y == 3 and z < x**2)",
    ],
    ["lists can be indexed and assigned", "a[x] = 9"],
    ["lists can be declared", "[shanty] list = [shanty]"],
    ["lists can be declared with vargh", "vargh list = [shanty]"],
    [
        "dictionaries can be declared",
        "{shanty, shanty} myDict = {x: aye, y:nay}",
    ],
    ["array declaration", "[int] list = []"],
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
    // ["type as a variable name", "ledger map = []"],
    ["keyword as a variable name", "int yo = 5", /Line 1, col 5/],
    ["while without braces", "parrot true\nahoy 1", /Line 2, col 1/],
    ["if without braces", "yo x < 3\nahoy 1", /Line 2, col 1/],
    ["while as identifier", "vargh parrot = 3"],
    ["if as identifier", "vargh yo = 8"],
    ["unbalanced brackets", "captain f(){"],
    ["true is not assignable", "vargh aye = 1"],
    ["false is not assignable", "vargh nay = 1"],
    ["function with no return type", "captain f(x) {anchor x}"],
    [
        "incorrect dictionary declaration",
        "{shanty, shanty} myMap = {true, false}",
    ],
    ["incorrect dictionary assignment", "myMap = {true, false}"],
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
