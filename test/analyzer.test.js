import assert from "assert"
import ast from "../src/ast.js"
import analyze from "../src/analyzer.js"
import * as core from "../src/core.js"

// Programs that are semantically correct
const semanticChecks = [
    ["variable declaration int", "vargh x = 1\n"],
    ["variable declaration double", "vargh x = 1.2\n"],
    ["variable declaration bool", "vargh x = nay\n"],
    ["variable declaration string", 'vargh x = "please work"\n'],
    ["array types", 'vargh fruits = ["Apple", "Banana"]'],
    ["initialize with empty array", "[int] fruits = []"],
    ["type declaration", 'shanty s = "hello please work!"'],
    ["assign to array element", "vargh a = [1,2,3]\n a[1]=100\n"],
    ["short return", "captain f() -> none { anchor }"],
    ["long return", "captain f() -> booty { anchor aye }"],
    ["return in nested if", "captain f() -> none {yo aye {anchor}}"],
    [
        "long if statement",
        "captain f() -> none {yo aye {anchor} yo ho 3 == 4 {anchor} ho {anchor}}",
    ],
    ["ternary statement", "captain f() -> none { ahoy aye ? 1.0 : 0.0 }"],
    ["break in nested if", "parrot nay {yo aye {maroon}}"],
    ["long if", "yo aye {ahoy 1} ho {ahoy 3}"],
    ["else if", "yo aye {ahoy 1} yo ho aye {ahoy 0} ho {ahoy 3}"],
    [
        "loop through array",
        "[int] y = [2,3,4] \nchase vargh x through y {ahoy 1}",
    ],
    ["for in range", "chase vargh i = 0 until 10 {ahoy 0}"],
    ["or", "yo aye or 1<2 {ahoy 0}"],
    ["relations", "int x = 3\n vargh y = 2\n ahoy 1<=2 and x>y and 3.5<1.2"],
    ["and", "ahoy aye and 1<2 and nay and not aye"],
    ["and 2 ", "ahoy not aye and 1<2 and nay and not aye"],
    ["ok to == arrays", "ahoy [1]==[5,8]"],
    ["ok to != arrays", "ahoy [1]!=[5,8]"],
    ["simple arithmetic", `int x = 2*4`],
    ["arithmetic", "vargh x = 1\n ahoy 2*3+5**(-3)/2-5%8"], //Something with this is fucked
    [
        "recursive functions",
        "captain S(int x, int y) -> int {yo x == 0 {anchor 0 } anchor S(x-1, y) }",
    ],
    // // ["array length", "print(#[1,2,3]);"], // length function + implment in grammar + how to do this?
    ["variables", "vargh x=[[[[1]]]]\n ahoy x[0][0][0][0]+2"],
    [
        "nested functions",
        "captain T(int x) -> none {vargh y = 1\n vargh n = x\n captain S(int z) -> none {ahoy z}}",
    ],
    // [
    //     "member exp with function",
    //     "ship S { build(int x) {int me.y = x} \n captain T() -> none {ahoy me.y}} \n  S y = new S(1) \n y.T()",
    // ],
    // //[ 'member exp', 'ship S { build(int x) {vargh x = x }} \n  S y = S(1) \n ahoy y.x' ],
    // [
    //     "array of class objects",
    //     "ship S{ build(){int me.x = 1}} vargh x=[new S(), new S()]",
    // ],
    ["subscript exp", "vargh a=[1,2]\n ahoy a[0]\n"],
    [
        "assigned functions",
        "captain f() -> none {}\n vargh g = f() \n vargh s = g",
    ],
    [
        "call of assigned functions",
        "captain f(int x) -> none {}\n vargh g = f \n g(1)",
    ],
    [
        "type equivalence of nested arrays",
        "captain f([[int]] x) -> none {} ahoy f([[1,2]])",
    ],
    [
        "call of assigned function in expression",
        `captain f(int x, booty y) -> int {}\n vargh g = f\n ahoy g(1, aye)\n f = g`,
    ],

    // [ // not currently implemented in grammar: need to figure out how to identify passing functions as valid types
    // 	'pass a function to a function',
    // 	`captain f(int x, booty -> none y) -> int { anchor 1 }
    //      captain g(booty g) -> none{}
    //      f(2, g)`
    // ], // check type in carlos.ohm for the fix

    // //['function return types',`int x = 1\n captain square(int x) -> int { anchor x * x }\n captain compose() -> int { anchor square }`], //functions as return types?
    [
        "function assign",
        "captain f() -> none {} vargh g = f\n vargh h = [g, f]\n ahoy h[0] ",
    ],
    [
        "pass in class as a parameter",
        "ship S { build(){}} captain f(S x) -> none {}",
    ],
    ["array parameters", "captain f([int] x) -> none {}"],
    ["none in fn type", "captain f() -> none {}"],
    ["outer variable", "vargh x = 1 \n parrot nay { ahoy x }"],
    [
        "map initialization and looping",
        `{shanty, shanty} a = {"Gold": "(15,17)", "Dragons": "(101, 666)}"}
    	{shanty, shanty} b = {}`,
    ],
    [
        "map initialization with variables",
        `vargh x = "argh" \n vargh y = "polly" {shanty, shanty} a = {x: "(15,17)", y: "(101, 666)}"}`,
    ],
    ["map initialization with empty map", "{shanty, shanty} a = {}"],
    [
        "looping through a map",
        '{shanty, shanty} a = {"Gold": "(15,17)", "Dragons": "(101, 666)"}\nchase vargh location through a {ahoy location}',
    ],
]

// // Programs that are syntactically correct but have semantic errors
const semanticErrors = [
    ["incorrect initialize with empty array", "vargh fruits = []"],
    [
        "assigning undeclared variable",
        `z = z + 5`,
        /HEY! You didn't declare identifier z before you tried to use it. Declare it first, ye scurvy dog!/,
    ],
    [
        "initialize with empty array",
        "vargh fruits = []",
        /Hey! What's the type of that - Using vargh with an empty map or array confuses me./,
    ],
    ["relations", 'ahoy 1<=2 and "x">"y" and 3.5<1.2', /Expected a number/],
    [
        "assigned functions",
        `captain f() -> none {}\n vargh g = f(1) \n s = g`,
        /0 argument\(s\) required but 1 passed/,
    ],
    [
        "no return type in function declaration",
        `captain evenOrOdd(int x) -> shanty {\n x = -14 \n anchor x % 2 == 0\n}`,
        /Scrub the deck. Cannot assign a booty to a shanty/,
    ],
    [
        "breaking outside of a loop",
        `yo aye {\n maroon\n }`,
        /Break can only appear in a loop/,
    ],
    [
        "returning outside of a function",
        `yo aye {\n anchor\n }`,
        /YE BILGERAT! A RETURN CAN ONLY BE IN A FUNCTION./,
    ],
    [
        "typechecking in operations",
        `vargh x = 1 + "1"`,
        /int BE DIFFERENT FROM shanty, YE BLIND LANDLUBBER./,
    ],
    [
        "void function has return",
        `captain evenOrOdd(int x) -> none {\n x = -14 \n anchor x % 2 == 0\n}`,
        /OI, RAPSCALLION. YE PROMISED NOT TO RETURN ANYTHING FROM YER FUNCTION./,
    ],
    [
        "assigning the wrong type to a variable",
        `int x = 5 \n x = "five"`,
        /Scrub the deck. Cannot assign a shanty to a int/,
    ],
    [
        "redeclaring a variable",
        `shanty x = "five"\n shanty x = "four"`,
        /OI! Identifier x be already declared. Scrub the deck!/,
    ],

    [
        "non-distinct fields",
        "captain S (booty x, int x) -> none{}",
        /OI! Identifier x be already declared. Scrub the deck!/,
    ],
    [
        "non-int increment",
        "booty x=nay \n x = x +1",
        /Expected a number or string/,
    ],
    [
        "non-int decrement",
        'shanty x = "some" \n x = x - 1 ',
        /Expected a number/,
    ],
    [
        "undeclared id",
        "ahoy x",
        /HEY! You didn't declare identifier x before you tried to use it. Declare it first, ye scurvy dog!/,
    ],
    [
        "redeclared id",
        "vargh x = 1 \n vargh x = 1",
        /OI! Identifier x be already declared. Scrub the deck!/,
    ],
    [
        "recursive class",
        "ship S { \n build(int x, S y){}}",
        /HEY! You didn't declare identifier S before you tried to use it. Declare it first, ye scurvy dog!/,
    ], // is this the error it should be throwing?
    [
        "once the type has been declared you cannot reassign the var",
        'vargh x = 1\n x = "2"',
        /Scrub the deck. Cannot assign a shanty to a int/,
    ],
    [
        "assign bad type",
        "int x=1 \n x=aye",
        /Scrub the deck. Cannot assign a booty to a int/,
    ],
    [
        "assign bad array type",
        "vargh x = [1,2,3]\n x = [aye]",
        /Scrub the deck. Cannot assign a \[booty\] to a \[int\]/,
    ],
    ["break outside loop", "maroon", /Break can only appear in a loop/],
    [
        "break inside function",
        "parrot aye {captain f() -> none {maroon}}",
        /Break can only appear in a loop/,
    ],
    [
        "return outside function",
        "anchor",
        /YE BILGERAT! A RETURN CAN ONLY BE IN A FUNCTION\./,
    ],
    // [
    //     "return nothing from non-void",
    //     "captain f() -> shanty{}",
    //     /should be returned here/,
    // ], // must check that if we say we are returning something that we actually return it
    // [
    //     "return type mismatch",
    //     "captain f() -> int {anchor nay}",
    //     /Scrub the deck. Cannot assign a booty to a int/,
    // ], // current error it is giving - but is this the right error?
    ["non-boolean short if test", "yo 1 {}", /Expected a boolean/],
    ["non-boolean if test", "yo 1 {} ho {}", /Expected a boolean/],
    ["non-boolean while test", "parrot 1 {}", /Expected a boolean/],
    [
        "non-array for loop",
        "booty a = aye \n  chase int i through a {}",
        /Array expected/,
    ],
    [
        "non-integer value 1",
        "chase vargh i = shanty until 2 {}",
        /Expected an integer/,
    ],
    [
        "non-integer value 2",
        "chase vargh i = shanty until close {}",
        /Expected an integer/,
    ],
    ["non-boolean conditional test", "ahoy 1?2:3 ", /Expected a boolean/],
    [
        "diff types in conditional arms",
        "ahoy aye?1:aye",
        /int BE DIFFERENT FROM booty, YE BLIND LANDLUBBER\./,
    ],
    ["bad types for or", "ahoy nay or 1", /Expected a boolean/],
    ["bad types for and", "ahoy nay and 1", /Expected a boolean/],
    [
        "bad types for ==",
        "ahoy nay ==1",
        /booty BE DIFFERENT FROM int, YE BLIND LANDLUBBER./,
    ],
    [
        "bad types for !=",
        "ahoy nay ==1",
        /booty BE DIFFERENT FROM int, YE BLIND LANDLUBBER./,
    ],
    ["bad types for +", "ahoy nay +1", /Expected a number or string/],
    ["bad types for -", "ahoy nay - 1", /Expected a number/],
    ["bad types for *", "ahoy nay *1", /Expected a number/],
    ["bad types for /", "ahoy nay/1", /Expected a number/],
    ["bad types for **", "ahoy nay**1", /Expected a number/],
    ["bad types for <", "ahoy nay<1", /Expected a number/],
    ["bad types for <=", "ahoy nay<=1", /Expected a number/],
    ["bad types for >", "ahoy nay>1", /Expected a number/],
    ["bad types for >=", "ahoy nay>=1", /Expected a number/],
    [
        "bad types for ==",
        "ahoy 2==2.0",
        /int BE DIFFERENT FROM doubloon, YE BLIND LANDLUBBER\./,
    ],
    [
        "bad types for !=",
        "ahoy nay!=1",
        /booty BE DIFFERENT FROM int, YE BLIND LANDLUBBER\./,
    ],
    ["bad types for negation", "ahoy -aye", /Expected a number/],
    ["bad types for negation", "ahoy not 2", /Expected a boolean/],
    // ["non-integer index", "vargh a=[1] \n ahoy a[nay]", /Expected an integer/], // this doesn't throw. We need a check for subscript
    // ["cannot access fields outside of class", "ship S{ build(int z){int me.y = z}} vargh x=S(1) \n ahoy x.y", /No such field/],
    // ["no such field in class", "ship S{ build(int z){int me.y = z} captain f() -> {ahoy me.g}}", /No such field/],
    // ["no such function in class", "ship S{ build(){}} vargh x=S() \n ahoy x.Y()", /No such field/],
    [
        "diff type array elements",
        "ahoy [3,3.0]",
        /Not all elements have the same type/,
    ],
    // [
    //     "shadowing",
    //     "vargh x = 1\nparrot aye {vargh x = 2}",
    //     /Identifier x already declared/,
    // ], // can we rename variable names in our language? is that allowed? this currently doesn't throw
    ["call of uncallable", "vargh x = 1\nahoy x()", /Call of non-function/],
    [
        "Too many args",
        "captain f(int x) -> none{}\nf(1,2)",
        /1 argument\(s\) required but 2 passed/,
    ],
    [
        "Too few args",
        "captain f(int x) -> none{}\nf()",
        /1 argument\(s\) required but 0 passed/,
    ],
    [
        "Parameter type mismatch",
        "captain f(int x)->none{}\nf(aye)",
        /Scrub the deck. Cannot assign a booty to a int/,
    ],
    // [
    //     "function type mismatch",
    //     `function f(x: int, y: (boolean)->void): int { return 1; }
    //      function g(z: boolean): int { return 5; }
    //      f(2, g);`,
    //     /Cannot assign a \(boolean\)->int to a \(boolean\)->void/,
    // ], // are implementing this? We would have to change the grammar again.
    [
        "bad call to a function that doesn't exist",
        "ahoy sin()",
        /HEY! You didn't declare identifier sin before you tried to use it. Declare it first, ye scurvy dog!/,
    ],
    [
        "Non-type in param",
        "vargh x=1\ncaptain f(x y) -> none{}",
        /Type expected/,
    ],
    [
        "Non-type in return type",
        "vargh x=1\ncaptain f() -> x{anchor 1}",
        /Type expected/,
    ],
    [
        "Non-type in field type",
        "vargh x=1\n ship S {build(x y) {}}",
        /Type expected/,
    ],
]
// Test cases for expected semantic graphs after processing the AST. In general
// this suite of cases should have a test for each kind of node, including
// nodes that get rewritten as well as those that are just "passed through"
// by the analyzer. For now, we're just testing the various rewrites only.
describe("The analyzer", () => {
    for (const [scenario, source] of semanticChecks) {
        it(`recognizes ${scenario}`, () => {
            assert.ok(analyze(ast(source)))
        })
    }
    for (const [scenario, source, errorMessagePattern] of semanticErrors) {
        it(`throws on ${scenario}`, () => {
            assert.throws(() => analyze(ast(source)), errorMessagePattern)
        })
    }
})
