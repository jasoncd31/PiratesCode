import assert from 'assert';
import ast from '../src/ast.js';
import analyze from '../src/analyzer.js';
import * as core from '../src/core.js';

// Programs that are semantically correct
const semanticChecks = [
	[ 'variable declaration int', 'vargh x = 1\n' ],
	[ 'variable declaration double', 'vargh x = 1.2\n' ],
	[ 'variable declaration bool', 'vargh x = nay\n' ],
	[ 'variable declaration string', 'vargh x = "please work"\n' ],
	[ 'array types', 'vargh fruits = ["Apple", "Banana"]' ],
	[ 'initialize with empty array', 'vargh fruits = [int]' ],
	[ 'type declaration', 'shanty s = "hello please work!"' ],
  // ["assign to array element", "ledger a = [1,2,3]\n a[1]=100\n"], // need to edit the grammar
	['short return','captain f() -> none { anchor }'],
	[ 'long return', 'captain f() -> booty { anchor aye }' ],
	[ 'return in nested if', 'captain f() -> none {yo aye {anchor}}' ],
	[ 'long if statement', 'captain f() -> none {yo aye {anchor} yo ho 3 == 4 {anchor} ho {anchor}}' ],
	[ 'ternary statement', 'captain f() -> none { ahoy aye ? 1.0 : 0.0 }' ],
	[ 'break in nested if', 'parrot nay {yo aye {maroon}}' ],
	[ 'long if', 'yo aye {ahoy 1} ho {ahoy 3}' ],
	[ 'else if', 'yo aye {ahoy 1} yo ho aye {ahoy 0} ho {ahoy 3}' ],
	[ 'for over collection', 'ledger y = [2,3,4]\nchase vargh x through y {ahoy 1}' ],
	[ 'for in range', 'chase vargh i = 0 until 10 {ahoy 0}' ],
	[ 'or', 'yo aye or 1<2 {ahoy 0}' ],
	['relations','ahoy 1<=2 and "x">"y" and 3.5<1.2'],
  // [ 'and', 'ahoy aye and 1<2 and nay and not aye' ], // need to edit the grammar
	[ 'ok to == arrays', 'ahoy [1]==[5,8]' ],
	[ 'ok to != arrays', 'ahoy [1]!=[5,8]' ],
	[ 'arithmetic', 'vargh x = 1\n ahoy 2*3+5**(-3)/2-5%8' ],
	['recursive functions','captain S(int x, int y) -> int {yo x == 0 {anchor 0 } anchor S(x-1, y) }'],
  //   ["array length", "print(#[1,2,3]);"], // length function + implment in grammar
	// [ ('variables', 'vargh x=[[[[1]]]]; ahoy x[0][0][0][0]+2') ], // implement in our grammar
	[ 'nested functions', 'captain T(int x) -> none {vargh y = 1\n vargh x = x\n captain S(int z) -> none {ahoy z}}' ],
	['member exp with function','ship S { build(int x) {vargh x = x \n captain T() -> none {ahoy me.x}}} \n  S y = S(1) \n y.T() \n ahoy y.x'],
	[ 'member exp', 'ship S { build(int x) {vargh x = x }} \n  S y = S(1) \n ahoy y.x' ],
	['array of class objects', 'ship S{ build(){vargh x = 1}} vargh x=[S(), S()]'],
  //   ["subscript exp", "let a=[1,2];print(a[0]);"], // need to implement in grammar
	[ 'assigned functions', 'captain f() -> none {}\n vargh g = f(1) \n s = g' ], // should this work with our current grammar?
	[ 'call of assigned functions', 'captain f(int x) -> none {}\n vargh g = f \n g(1)' ],
	// ['type equivalence of nested arrays', 'captain f( [[int]] x) -> none {} ahoy f([[1],[2]]))'], // array implementation in grammar
  ['call of assigned function in expression', 
  `captain f(int x, booty y) -> int {}
	    vargh g = f
	    ahoy g(1, true)
	    f = g` //type check here
	],
	// [ // not currently working but it should - fix the pirates code below
	// 	'pass a function to a function',
	// 	`captain f(int x, (booty->none y)) -> int { anchor 1 }
	//      captain g(booty g) -> none{}
	//      f(2, g)`
	// ]
	['function return types',
		`captain square(int x) -> int { anchor x * x }
	     captain compose() -> int { anchor square }`],
  // [ 'function assign', 'captain f() -> none {} vargh g = f\n let h = [g, f]\n ahoy h[0]() ' ] // indexing in grammar
	// [ 'pass in class as a parameter', 'ship S { build(){}} captain f(S x) -> none {}' ] // put in grammar but it's not pretty - should make it nicer
	//   ["array parameters", "function f(x: [int?]) {}"], // implement in grammar
  //   ["types in function type", "function f(g: (int?, float)->string) {}"], // translate to PC
	['none in fn type','captain f() -> none {}'],
	[ 'outer variable', 'vargh x = 1 \n parrot nay { ahoy x }' ],
	//   ["built-in constants", "print(25.0 * π);"], // do we want built in constants? maybe something pirate themed?
	['map initialization and looping',
		`map companyMap = {"Gold": "(15,17)", "Dragons": "(101, 666)"}
		{shanty, shanty} a = {shanty : shanty}
		{shanty, shanty} b = {}
		chase vargh location through companyMap {
			ahoy location
		}`
	],
];

// // Programs that are syntactically correct but have semantic errors
const semanticErrors = [
	// [ 'incorrect initialize with empty array', 'vargh fruits = []' ],
	// ['assigning undeclared variable', `x + 5`, /HEY! You didn't declare identifier x before you tried to use it. Declare it first, ye scurvy dog!/],
	// ['no return type in function declaration',`captain evenOrOdd(int x) -> shanty {\n x = -14 \n anchor x % 2 == 0\n}`,/OI KNAVE! Ye anchored the wrong type!/],
	// ['breaking outside of a loop', `yo aye {\n maroon\n }`,/Break can only appear in a loop/],
	// ['breaking outside of a loop', `yo aye {\n anchor\n }`,/YE BILGERAT! A RETURN CAN ONLY BE IN A FUNCTION./],
	// ['typechecking in operations',`1 + "1"`, /`int BE DIFFERENT FROM shanty, YE BLIND LANDLUBBER./],
	// ['function has no return', `captain evenOrOdd(int x) -> shanty {\n x = -14 \n ahoy x % 2 == 0\n}`,/MATEY ARE YE THREE SHEETS TO THE WIND OR DID YOU FORGET TO RETURN SOMETHING?/],
	// ['void function has return',`captain evenOrOdd(int x) -> none {\n x = -14 \n anchor x % 2 == 0\n}`,/OI, RAPSCALLION. YE PROMISED NOT TO RETURN ANYTHING FROM YER FUNCTION./],
	// ['assigning the wrong type to a variable', `int x = 5 \n x = "five"`,/Scrub the deck. Cannot assign a shanty to a int/],
	// ['redeclaring a variable', `shanty x = "five"\n shanty x = "four"`, /OI! Identifier x be already declared. Scrub the deck!/]
	// //  [ 'non-distinct fields', 'captain S (booty x, int x) -> none{}', /Fields must be distinct/ ]
	// 	[ 'non-int increment', 'booty x=false \n x = x +1', /an integer/ ],
	// 	[ 'non-int decrement', 'let x=some[""];x++;', /an integer/ ],
	//   ["undeclared id", "print(x);", /Identifier x not declared/],
	//   ["redeclared id", "let x = 1;let x = 1;", /Identifier x already declared/],
	//   ["recursive struct", "struct S { x: int y: S }", /must not be recursive/],
	//   ["assign to const", "const x = 1;x = 2;", /Cannot assign to constant x/],
	//   ["assign bad type", "let x=1;x=true;", /Cannot assign a boolean to a int/],
	//   ["assign bad array type", "let x=1;x=[true];", /Cannot assign a \[boolean\] to a int/],
	//   ["assign bad optional type", "let x=1;x=some 2;", /Cannot assign a int\? to a int/],
	//   ["break outside loop", "break;", /Break can only appear in a loop/],
	//   [
	//     "break inside function",
	//     "while true {function f() {break;}}",
	//     /Break can only appear in a loop/,
	//   ],
	//   ["return outside function", "return;", /Return can only appear in a function/],
	//   [
	//     "return value from void function",
	//     "function f() {return 1;}",
	//     /Cannot return a value here/,
	//   ],
	//   [
	//     "return nothing from non-void",
	//     "function f(): int {return;}",
	//     /should be returned here/,
	//   ],
	//   ["return type mismatch", "function f(): int {return false;}", /boolean to a int/],
	//   ["non-boolean short if test", "if 1 {}", /Expected a boolean/],
	//   ["non-boolean if test", "if 1 {} else {}", /Expected a boolean/],
	//   ["non-boolean while test", "while 1 {}", /Expected a boolean/],
	//   ["non-integer repeat", 'repeat "1" {}', /Expected an integer/],
	//   ["non-integer low range", "for i in true...2 {}", /Expected an integer/],
	//   ["non-integer high range", "for i in 1..<no int {}", /Expected an integer/],
	//   ["non-array in for", "for i in 100 {}", /Array expected/],
	//   ["non-boolean conditional test", "print(1?2:3);", /Expected a boolean/],
	//   ["diff types in conditional arms", "print(true?1:true);", /not have the same type/],
	//   ["unwrap non-optional", "print(1??2);", /Optional expected/],
	//   ["bad types for ||", "print(false||1);", /Expected a boolean/],
	//   ["bad types for &&", "print(false&&1);", /Expected a boolean/],
	//   ["bad types for ==", "print(false==1);", /Operands do not have the same type/],
	//   ["bad types for !=", "print(false==1);", /Operands do not have the same type/],
	//   ["bad types for +", "print(false+1);", /Expected a number or string/],
	//   ["bad types for -", "print(false-1);", /Expected a number/],
	//   ["bad types for *", "print(false*1);", /Expected a number/],
	//   ["bad types for /", "print(false/1);", /Expected a number/],
	//   ["bad types for **", "print(false**1);", /Expected a number/],
	//   ["bad types for <", "print(false<1);", /Expected a number or string/],
	//   ["bad types for <=", "print(false<=1);", /Expected a number or string/],
	//   ["bad types for >", "print(false>1);", /Expected a number or string/],
	//   ["bad types for >=", "print(false>=1);", /Expected a number or string/],
	//   ["bad types for ==", "print(2==2.0);", /not have the same type/],
	//   ["bad types for !=", "print(false!=1);", /not have the same type/],
	//   ["bad types for negation", "print(-true);", /Expected a number/],
	//   ["bad types for length", "print(#false);", /Array expected/],
	//   ["bad types for not", 'print(!"hello");', /Expected a boolean/],
	//   ["non-integer index", "let a=[1];print(a[false]);", /Expected an integer/],
	//   ["no such field", "struct S{} let x=S(); print(x.y);", /No such field/],
	//   ["diff type array elements", "print([3,3.0]);", /Not all elements have the same type/],
	//   ["shadowing", "let x = 1;\nwhile true {let x = 1;}", /Identifier x already declared/],
	//   ["call of uncallable", "let x = 1;\nprint(x());", /Call of non-function/],
	//   [
	//     "Too many args",
	//     "function f(x: int) {}\nf(1,2);",
	//     /1 argument\(s\) required but 2 passed/,
	//   ],
	//   [
	//     "Too few args",
	//     "function f(x: int) {}\nf();",
	//     /1 argument\(s\) required but 0 passed/,
	//   ],
	//   [
	//     "Parameter type mismatch",
	//     "function f(x: int) {}\nf(false);",
	//     /Cannot assign a boolean to a int/,
	//   ],
	//   [
	//     "function type mismatch",
	//     `function f(x: int, y: (boolean)->void): int { return 1; }
	//      function g(z: boolean): int { return 5; }
	//      f(2, g);`,
	//     /Cannot assign a \(boolean\)->int to a \(boolean\)->void/,
	//   ],
	//   ["bad call to stdlib sin()", "print(sin(true));", /Cannot assign a boolean to a float/],
	//   ["Non-type in param", "let x=1;function f(y:x){}", /Type expected/],
	//   ["Non-type in return type", "let x=1;function f():x{return 1;}", /Type expected/],
	//   ["Non-type in field type", "let x=1;struct S {y:x}", /Type expected/],
	// ]
	// Test cases for expected semantic graphs after processing the AST. In general
	// this suite of cases should have a test for each kind of node, including
	// nodes that get rewritten as well as those that are just "passed through"
	// by the analyzer. For now, we're just testing the various rewrites only.
];
describe('The analyzer', () => {
	for (const [ scenario, source ] of semanticChecks) {
		it(`recognizes ${scenario}`, () => {
			assert.ok(analyze(ast(source)));
		});
	}
	for (const [ scenario, source, errorMessagePattern ] of semanticErrors) {
		it(`throws on ${scenario}`, () => {
			assert.throws(() => analyze(ast(source)), errorMessagePattern);
		});
	}
});
