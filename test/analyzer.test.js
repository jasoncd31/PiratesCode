import assert from "assert"
import ast from "../src/ast.js"
import analyze from "../src/analyzer.js"
import * as core from "../src/core.js"

// Programs that are semantically correct
const semanticChecks = [
    ["variable declaration int", 'vargh x = 1\n'],
    ["variable declaration double", 'vargh x = 1.2\n'],
    ["variable declaration bool", 'vargh x = nay\n'],
    ["variable declaration string", 'vargh x = "please work"\n'],
  //   ["array types", "vargh fruits = [\"Apple\", \"Banana\"]"],
  //   ["initialize with empty array", "vargh fruits = []"],
    ["type declaration", 'shanty s = "hello please work!"'],
  //   ["assign to array element", "ledger a = [1,2,3]\n a[1]=100\n"], //Kinda unsure if this even exists syntactially
  //   ["short return", "captain f() { anchor }"],
  //   ["long return", "captain f() { anchor nay }"],
  //   ["return in nested if", "captain f() {yo yay {anchor}}"],
  //   ["break in nested if", "parrot nay {yo yay {maroon}}"],
  //   ["long if", "yo yay {ahoy 1} ho {ahoy 3}"],
  //   ["else if", "yo yay {ahoy 1} yo ho yay {ahoy 0} ho {ahoy 3}"],
  //   ["for over collection", "chase vargh through [2,3,5] {ahoy 1}"],
  //   ["for in range", "chase vargh i = 0 until 10 {ahoy 0}"],
  //   ["or", "ahoy true or 1<2"],
  //   ["&&", "print(true&&1<2&&false&&!true);"],
  //   ["bit ops", "print((1&2)|(9^3));"],
  //   ["relations", 'print(1<=2 && "x">"y" && 3.5<1.2);'],
  //   ["ok to == arrays", "print([1]==[5,8]);"],
  //   ["ok to != arrays", "print([1]!=[5,8]);"],
  //   ["shifts", "print(1<<3<<5<<8>>2>>0);"],
  //   ["arithmetic", "let x=1;print(2*3+5**-3/2-5%8);"],
  //   ["array length", "print(#[1,2,3]);"],
  //   ["optional types", "let x = no int; x = some 100;"],
  //   ["variables", "let x=[[[[1]]]]; print(x[0][0][0][0]+2);"],
  //   ["recursive structs", "struct S {z: S?} let x = S(no S);"],
  //   ["nested structs", "struct T{y:int} struct S{z: T} let x=S(T(1)); print(x.z.y);"],
  //   ["member exp", "struct S {x: int} let y = S(1);print(y.x);"],
  //   ["subscript exp", "let a=[1,2];print(a[0]);"],
  //   ["array of struct", "struct S{} let x=[S(), S()];"],
  //   ["struct of arrays and opts", "struct S{x: [int] y: string??}"],
  //   ["assigned functions", "function f() {}\nlet g = f;g = f;"],
  //   ["call of assigned functions", "function f(x: int) {}\nlet g=f;g(1);"],
  //   ["type equivalence of nested arrays", "function f(x: [[int]]) {} print(f([[1],[2]]));"],
  //   [
  //     "call of assigned function in expression",
  //     `function f(x: int, y: boolean): int {}
  //     let g = f;
  //     print(g(1, true));
  //     f = g; // Type check here`,
  //   ],
  //   [
  //     "pass a function to a function",
  //     `function f(x: int, y: (boolean)->void): int { return 1; }
  //      function g(z: boolean) {}
  //      f(2, g);`,
  //   ],
  //   [
  //     "function return types",
  //     `function square(x: int): int { return x * x; }
  //      function compose(): (int)->int { return square; }`,
  //   ],
  //   ["function assign", "function f() {} let g = f; let h = [g, f]; print(h[0]());"],
  //   ["struct parameters", "struct S {} function f(x: S) {}"],
  //   ["array parameters", "function f(x: [int?]) {}"],
  //   ["optional parameters", "function f(x: [int], y: string?) {}"],
  //   ["empty optional types", "print(no [int]); print(no string);"],
  //   ["types in function type", "function f(g: (int?, float)->string) {}"],
  //   ["voids in fn type", "function f(g: (void)->void) {}"],
  //   ["outer variable", "let x=1; while(false) {print(x);}"],
  //   ["built-in constants", "print(25.0 * π);"],
  //   ["built-in sin", "print(sin(π));"],
  //   ["built-in cos", "print(cos(93.999));"],
  //   ["built-in hypot", "print(hypot(-4.0, 3.00001));"],
  ]
  
  // // Programs that are syntactically correct but have semantic errors
  // const semanticErrors = [
     const semanticErrors = []
  //   ["non-distinct fields", "struct S {x: boolean x: int}", /Fields must be distinct/],
  //   ["non-int increment", "let x=false;x++;", /an integer/],
  //   ["non-int decrement", 'let x=some[""];x++;', /an integer/],
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