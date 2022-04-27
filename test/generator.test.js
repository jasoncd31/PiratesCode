import assert from "assert/strict"
import ast from "../src/ast.js"
import analyze from "../src/analyzer.js"
import optimize from "../src/optimizer.js"
import generate from "../src/generator.js"

function dedent(s) {
    return `${s}`.replace(/(?<=\n)\s+/g, "").trim()
}

const fixtures = [
    {
        name: "small",
        source: `
      vargh x = 3 * 7
      x = x + 1
      x = x - 1
      vargh y = aye
      y = 5 ** -x / -100 > - x or nay
      ahoy (y and y) or nay or (x*2) != 5
    `,
        expected: dedent`
      let x_1 = 21;
      x_1 = x_1 + 1;
      x_1 = x_1 - 1;
      let y_2 = true;
      y_2 = (((5 ** -(x_1)) / -(100)) > -(x_1));
      console.log(((y_2 && y_2) || ((x_1 * 2) !== 5)));
    `,
    },
    {
        name: "if",
        source: `
      vargh x = 0
      yo x == 0 { ahoy "1" }
      yo x == 0 { ahoy 1 } ho { ahoy 2 }
      yo x == 0 { ahoy 1 } yo ho x == 2 { ahoy 3 }
      yo x == 0 { ahoy 1 } yo ho x == 2 { ahoy 3 } ho { ahoy 4 }
    `,
        expected: dedent`
      vargh x_1 = 0;
      if ((x_1 === 0)) {
        console.log("1");
      }
      if ((x_1 === 0)) {
        console.log(1);
      } else {
        console.log(2);
      }
      if ((x_1 === 0)) {
        console.log(1);
      } else {
        if ((x_1 === 2)) {
          console.log(3);
        }
      }
      if ((x_1 === 0)) {
        console.log(1);
      } else
        if ((x_1 === 2)) {
          console.log(3);
        } else {
          console.log(4);
        }
    `,
    },
    {
        name: "while",
        source: `
      vargh x = 0
      parrot x < 5 {
        vargh y = 0
        parrot y < 5 {
          ahoy x * y
          y = y + 1
          maroon
        }
        x = x + 1
      }
    `,
        expected: dedent`
      let x_1 = 0;
      while ((x_1 < 5)) {
        let y_2 = 0;
        while ((y_2 < 5)) {
          console.log((x_1 * y_2));
          y_2 = (y_2 + 1);
          break;
        }
        x_1 = (x_1 + 1);
      }
    `,
    },
    {
        name: "functions",
        source: `
      vargh z = 0.5
      captain f(doubloon x, doubloon y) -> none {
        ahoy x < y
        anchor
      }
      captain g() -> doubloon {
        anchor 3.0
      }
      f(z, g())
    `,
        expected: dedent`
      vargh z_1 = 0.5
      function f_2(x_3, y_4) {
        console.log((Math.sin(x_3) > Math.PI));
        return;
      }
      function g_5() {
        return false;
      }
      f_2(z_1, g_5());
    `,
    },
    {
        name: "arrays",
        source: `
      vargh a = [aye, nay, aye]
      vargh b = [10, 40 - 20, 30]
      [int] c = []
      ahoy a[1] or (b[0] < 88 ? nay : aye)
    `,
        expected: dedent`
      let a_1 = [true,false,true];
      let b_2 = [10,20,30];
      let c_3 = [];
      console.log((a_1[1] || (((b_2[0] < 88)) ? (false) : (true))));
    `,
    },
    {
        name: "classes",
        source: `
      ship S { 
        build(int x) {int me.shipX = x} 
        captain getX() -> int { anchor me.shipX }
      }
      vargh x = S(3)
      print(x.getX())
    `,
        expected: dedent`
      class S_1 {
        constructor(x_2) {
        this["x_2"] = x_2;
        }
        function getX() {
          return this["X_2"]
        }
      }
      let x_3 = new S_1(3);
      console.log((x_3["x_2"]));
    `,
    },
    // {
    //     name: "optionals",
    //     source: `
    //   let x = no int;
    //   let y = x ?? 2;
    //   struct S {x: int}
    //   let z = some S(1);
    //   let w = z?.x;
    // `,
    //     expected: dedent`
    //   let x_1 = undefined;
    //   let y_2 = (x_1 ?? 2);
    //   class S_3 {
    //   constructor(x_4) {
    //   this["x_4"] = x_4;
    //   }
    //   }
    //   let z_5 = (new S_3(1));
    //   let w_6 = (z_5?.["x_4"]);
    // `,
    // },
    {
        name: "for loops",
        source: `
      chase int i = 0 until 50 {
        ahoy i
      }
      vargh list = [10, 20, 30]
      chase vargh j through list {
        ahoy j
      }
      chase vargh k = 1 until 10 {
      }
    `,
        expected: dedent`
      for (let i_1 = 0; i_1 < 50; i_1++) {
        console.log(i_1);
      }
      let list_3 = [10,20,30];
      for (let j_2 of list_3) {
        console.log(j_2);
      }
      for (let i_4 = 0; i_4 < 3; i_4++) {
      }
      for (let k_5 = 1; k_5 < 10; k_5++) {
      }
    `,
    },
    // {
    //     name: "standard library",
    //     source: `
    //   vargh x = 0.5;
    //   ahoy sin(x) - cos(x) + exp(x) * ln(x) / hypot(2.3, x)
    //   ahoy bytes("∞§¶•")
    //   ahoy codepoints("💪🏽💪🏽🖖👩🏾💁🏽‍♀️")
    // `,
    //     expected: dedent`
    //   let x_1 = 0.5;
    //   console.log(((Math.sin(x_1) - Math.cos(x_1)) + ((Math.exp(x_1) * Math.log(x_1)) / Math.hypot(2.3,x_1))));
    //   console.log([...Buffer.from("∞§¶•", "utf8")]);
    //   console.log([...("💪🏽💪🏽🖖👩🏾💁🏽‍♀️")].map(s=>s.codePointAt(0)));
    // `,
    // },
]

describe("The code generator", () => {
    for (const fixture of fixtures) {
        it(`produces expected js output for the ${fixture.name} program`, () => {
            const actual = generate(optimize(analyze(ast(fixture.source))))
            assert.deepEqual(actual, fixture.expected)
        })
    }
})
