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
    ["array declaration with vargh", 'vargh fruits = ["Apple", "Banana"]'],
    ["initialize with empty array", "[int] fruits = []"],
    ["type string declaration", 'shanty s = "hello please work!"'],
    [
        "assign to array element using indexing",
        "vargh a = [1,2,3]\n a[1]=100\n",
    ],
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
    ["arithmetic", "vargh x = 1\n ahoy 2*3+5**(-3)/2-5%8"],
    [
        "recursive functions",
        "captain S(int x, int y) -> int {yo x == 0 {anchor 0 } anchor S(x-1, y) }",
    ],
    ["variables", "vargh x=[[[[1]]]]\n ahoy x[0][0][0][0]+2"],
    [
        "nested functions",
        "captain T(int x) -> none {vargh y = 1\n vargh n = x\n captain S(int z) -> none {ahoy z}}",
    ],
    [
        "member exp with function",
        "ship S { build(int x) {int me.y = x} \n captain T() -> none {ahoy me.y}} \n  S y = new S(1) \n y.T()",
    ],
    [
        "nested member exp with function",
        "ship S { build(int x) {int me.y = x} \n captain T() -> none {yo aye { ahoy me.y}}} \n  S y = new S(1) \n y.T()",
    ],
    [
        "nested member exp with function that has parameters",
        "ship S { build(int x) {int me.y = x} \n captain getY() -> int {anchor me.y} \n captain calculate(int x) -> int {anchor me.y * x}} \n  S y = new S(1) \n vargh c = y.calculate(2)",
    ],
    [
        "object declaration",
        "ship S { build(int x) {int me.y = x }} \n  S y = new S(1)",
    ],
    [
        "array of class objects",
        "ship S{ build(){int me.x = 1}} vargh x=[new S(), new S()]",
    ],
    [
        "map of class objects",
        "ship S{ build(){int me.x = 1}} {int, S} x={1 : new S(), 2 : new S()}",
    ],
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
        "type equivalence of nested maps",
        'captain f({ {int, int}, shanty} x) -> none {} ahoy f({{1:2} : "hello"})',
    ],
    [
        "type equivalence of nested maps 2",
        'captain f({ {int, int}, {shanty, shanty}} x) -> none {} ahoy f({{1:2} : {"hello": "hola"}})',
    ],
    [
        "call of assigned function in expression",
        `captain f(int x, booty y) -> int {}\n vargh g = f\n ahoy g(1, aye)\n f = g`,
    ],
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
    [
        "contexts within contexts",
        "ship S { build(int x) {int me.y = x} \n captain T() -> none {chase vargh x=0 until 10{ahoy me.y}}} \n",
    ],
    [
        "contexts within contexts",
        "ship S { build(int x, int a) {int me.y = x \n int me.b = a} \n captain T() -> none {chase vargh x=0 until 10{ yo aye {ahoy me.y}}}} \n",
    ],
    [
        "long type match in method map",
        "ship Test { build(shanty x){shanty me.y = x} captain blackbeard(shanty x) -> {int, int} {anchor {1 : 2}}}",
    ],
    [
        "long type match in method list",
        "ship Test { build(shanty x){shanty me.y = x} captain blackbeard(shanty x) -> [{int, int}] {anchor [{1 : 2}]}}",
    ],
    [
        "long type match in function list",
        "captain blackbeard(shanty x) -> [int] {anchor [1,2,3]}",
    ],
    [
        "long type match in function map",
        'captain blackbeard(shanty x) -> {shanty, shanty} {anchor {"hey" : "ho"}}',
    ],
    ["array expression subscript", "vargh x = [1,2,3]\n vargh y = x[10]"],
    [
        "object decclaration with vargh",
        "ship S{ build(int z){int me.y = z}} vargh x = new S(1)",
    ],
    ["long class test", `ship Rectangle {
        build (doubloon h, int w) {
            doubloon me.height = h
            int me.width = w
        }
        captain getWidth() -> int {
            anchor me.width
        }
        captain setWidth(int newWidth) -> none {
            me.width = newWidth
        }
    }
    Rectangle p = new Rectangle(3.0,4)
    ahoy p.getWidth()
    p.setWidth(15)`],
]

// // Programs that are syntactically correct but have semantic errors
const semanticErrors = [
    [
        "assigning undeclared variable",
        `z = z + 5`,
        /AVAST! You didn't declare identifier z before ye tried to use it! Declare it first, ye scurvy dog!/,
    ],
    [
        "relations",
        'ahoy 1<=2 and "x">"y" and 3.5<1.2',
        /Expected a number, ye knave/,
    ],
    [
        "assigned functions",
        `captain f() -> none {}\n vargh g = f(1) \n s = g`,
        /0 arrrghument\(s\) required but 1 passed, ye scallywag/,
    ],
    [
        "no return type in function declaration",
        `captain evenOrOdd(int x) -> shanty {\n x = -14 \n anchor x % 2 == 0\n}`,
        /Scrub the deck. Cannot assign a booty to a shanty/,
    ],
    [
        "breaking outside of a loop",
        `yo aye {\n maroon\n }`,
        /ye got gout in the brain! Break can only appear in a loop, bucko./,
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
        /Expected a number or string, ye landlubber/,
    ],
    [
        "non-int decrement",
        'shanty x = "some" \n x = x - 1 ',
        /Expected a number, ye knave/,
    ],
    [
        "undeclared id",
        "ahoy x",
        /AVAST! You didn't declare identifier x before ye tried to use it! Declare it first, ye scurvy dog!/,
    ],
    [
        "redeclared id",
        "vargh x = 1 \n vargh x = 1",
        /OI! Identifier x be already declared. Scrub the deck!/,
    ],
    [
        "recursive class",
        "ship S { \n build(int x, S y){}}",
        /AVAST! You didn't declare identifier S before ye tried to use it! Declare it first, ye scurvy dog!/,
    ],
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
    [
        "return nothing from non-void",
        "captain f() -> shanty{anchor}",
        /MATEY ARE YE THREE SHEETS TO THE WIND OR DID YOU FORGET TO RETURN SOMETHING\?/,
    ],
    [
        "return type mismatch",
        "captain f() -> int {anchor nay}",
        /Scrub the deck. Cannot assign a booty to a int/,
    ],
    ["non-boolean short if test", "yo 1 {}", /Expected a boolean, ye picaroon/],
    ["non-boolean if test", "yo 1 {} ho {}", /Expected a boolean, ye picaroon/],
    [
        "non-boolean while test",
        "parrot 1 {}",
        /Expected a boolean, ye picaroon/,
    ],
    [
        "non-array for loop",
        "booty a = aye \n  chase int i through a {}",
        /Array expected, bucko/,
    ],
    [
        "non-integer value 1",
        "chase vargh i = shanty until 2 {}",
        /Expected an integer, ye rapscallion/,
    ],
    [
        "non-integer value 2",
        "chase vargh i = shanty until close {}",
        /Expected an integer, ye rapscallion/,
    ],
    [
        "non-boolean conditional test",
        "ahoy 1?2:3 ",
        /Expected a boolean, ye picaroon/,
    ],
    [
        "diff types in conditional arms",
        "ahoy aye?1:aye",
        /int BE DIFFERENT FROM booty, YE BLIND LANDLUBBER\./,
    ],
    ["bad types for or", "ahoy nay or 1", /Expected a boolean, ye picaroon/],
    ["bad types for and", "ahoy nay and 1", /Expected a boolean, ye picaroon/],
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
    [
        "bad types for +",
        "ahoy nay +1",
        /Expected a number or string, ye landlubber/,
    ],
    ["bad types for -", "ahoy nay - 1", /Expected a number, ye knave/],
    ["bad types for *", "ahoy nay *1", /Expected a number, ye knave/],
    ["bad types for /", "ahoy nay/1", /Expected a number, ye knave/],
    ["bad types for **", "ahoy nay**1", /Expected a number, ye knave/],
    ["bad types for <", "ahoy nay<1", /Expected a number, ye knave/],
    ["bad types for <=", "ahoy nay<=1", /Expected a number, ye knave/],
    ["bad types for >", "ahoy nay>1", /Expected a number, ye knave/],
    ["bad types for >=", "ahoy nay>=1", /Expected a number, ye knave/],
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
    ["bad types for negation", "ahoy -aye", /Expected a number, ye knave/],
    ["bad types for negation", "ahoy not 2", /Expected a boolean, ye picaroon/],
    [
        "non-integer index",
        "vargh a=[1] \n ahoy a[nay]",
        /Expected an integer, ye rapscallion/,
    ],
    [
        "cannot access fields outside of class",
        "ship S{ build(int z){int me.y = z}} \n vargh x= new S(1) \n ahoy me.y",
        /ITS NOT IN A CLASS, YE COWARDLY SWAB! FIX IT OR ELSE!/,
    ],
    [
        "no such field in class",
        "ship S{ build(int z){int me.y = z} captain f() -> none{ahoy me.g}}",
        /BELAY, SCALLYWAG! There's no such field so stop! Or else.../,
    ],
    [
        "no such function in class",
        "ship S{ build(){}} vargh x = new S() \n ahoy x.Y()",
        /BELAY, SCALLYWAG! There's no such field so stop! Or else.../,
    ],
    [
        "object made from class that does not exist",
        "ship S{ build(){}} T x = new T()",
        /Matey, yer variables are not in locals/,
    ],
    [
        "mismatching types in variable declaration",
        "ship S{ build(){}} int x = new S()",
        /ARGH THOU CANNOT ASSIGN TWO DIFFERENT TYPES/,
    ],
    [
        "diff type array elements",
        "ahoy [3,3.0]",
        /Mate, not all elements have the same type/,
    ],
    [
        "shadowing",
        'vargh x = 1\nparrot aye {x = "shanty"}',
        /Scrub the deck. Cannot assign a shanty to a int/,
    ],
    ["call of uncallable", "vargh x = 1\nahoy x()", /Call of non-function/],
    [
        "Too many args",
        "captain f(int x) -> none{}\nf(1,2)",
        /1 arrrghument\(s\) required but 2 passed, ye scallywag/,
    ],
    [
        "Too few args",
        "captain f(int x) -> none{}\nf()",
        /1 arrrghument\(s\) required but 0 passed, ye scallywag/,
    ],
    [
        "Parameter type mismatch",
        "captain f(int x)->none{}\nf(aye)",
        /Scrub the deck. Cannot assign a booty to a int/,
    ],
    [
        "bad call to a function that doesn't exist",
        "ahoy sin()",
        /AVAST! You didn't declare identifier sin before ye tried to use it! Declare it first, ye scurvy dog!/,
    ],
    [
        "Non-type in param",
        "vargh x=1\ncaptain f(x y) -> none{}",
        /Type expected, mate. Mess up again or ye sleepin' with the fishes./,
    ],
    [
        "Non-type in return type",
        "vargh x=1\ncaptain f() -> x{anchor 1}",
        /Type expected, mate. Mess up again or ye sleepin' with the fishes./,
    ],
    [
        "Non-type in field type",
        "vargh x=1\n ship S {build(x y) {}}",
        /Type expected, mate. Mess up again or ye sleepin' with the fishes./,
    ],
    [
        "me outside of class",
        `captain evenOrOdd(int x) -> shanty {\n me.x = -14 \n anchor "howdy"\n}`,
        /ITS NOT IN A CLASS, YE COWARDLY SWAB! FIX IT OR ELSE!/,
    ],
    [
        "type mismatch",
        "int x = 3.0",
        /ARGH THOU CANNOT ASSIGN TWO DIFFERENT TYPES/,
    ],
    [
        "long type mismatch in function list",
        "captain blackbeard(shanty x) -> {int, int} {anchor [1,2,3]}",
        /Scrub the deck. Cannot assign a \[int\] to a {int : int}/,
    ],
    [
        "arrays with multiple types",
        '[int] x = [1,2, "bye", aye]',
        /Mate\, not all elements have the same type/,
    ],
    [
        "arrays with incorrect types",
        "[int] x = [1.0,2.0,3.0]",
        /ARGH THOU CANNOT ASSIGN TWO DIFFERENT TYPES/,
    ],
    [
        "arrays with incorrect types",
        "[int] x = [1.0,2.0,3.0]",
        /ARGH THOU CANNOT ASSIGN TWO DIFFERENT TYPES/,
    ],
    [
        "incorrect object declaration with wrong type",
        "ship S{ build(int z){int me.y = z}} shanty x = new S(1)",
        /ARGH THOU CANNOT ASSIGN TWO DIFFERENT TYPES/,
    ],
    [
        "incorrect object declaration with wrong number of paramters",
        "ship S{ build(int z){int me.y = z}} S x = new S()",
        /1 arrrghument\(s\) required but 0 passed\, ye scallywag/,
    ],
    [
        "incorrect nest map object declaration",
        "{{int,int}, shanty} x = {{1:2}:3}",
        /ARGH THOU CANNOT ASSIGN TWO DIFFERENT TYPES/,
    ],
    [
        "incorrect empty map declaration",
        "vargh x = {}",
        /Error: ARRR! What's the type of that\?\? Using vargh with an empty MapExpression confuses me matey./,
    ],
    [
        "incorrect empty array declaration",
        "vargh x = []",
        /ARRR! What's the type of that\?\? Using vargh with an empty ArrayExpression confuses me matey\./,
    ],
    [
        "object declaration with class that hasn't been declared yet",
        "vargh x = new S()",
        /Matey, yer variables are not in locals/,
    ],
    [
        "object declaration that doesn't exist",
        "ship S{ build(){}} ship T{ build(){}} S x = new T()",
        /ARGH THOU CANNOT ASSIGN TWO DIFFERENT TYPES/,
    ],
    [
        "incorrect type equivalence of nested maps",
        'captain f({ {int, int}, {shanty, shanty}} x) -> none {} ahoy f({{1:"aye"} : {"hello": "hola"}})',
        /Error: Scrub the deck. Cannot assign a {{int : shanty} : {shanty : shanty}} to a {{int : int} : {shanty : shanty}}/,
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
