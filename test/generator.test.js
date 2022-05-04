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
      x_1 = (x_1 + 1);
      x_1 = (x_1 - 1);
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
      let x_1 = 0;
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
      } else if ((x_1 === 2)) {
          console.log(3);
      }
      if ((x_1 === 0)) {
        console.log(1);
      } else if ((x_1 === 2)) {
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
      let z_1 = 0.5;
      function f_2(x_3, y_4) {
        console.log((x_3 < y_4));
        return;
      }
      function g_5() {
        return 3;
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
      vargh x = new S(3)
      ahoy x.getX()
    `,
        expected: dedent`
      class S_1 {
        constructor(x_2) {
        this["shipX_3"] = x_2;
        }
        function getX_4() {
          return (this["shipX_3"]);
        }
      }
      let x_5 = new S_6(3);
      console.log(x_5.getX_4());
    `,
    },

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
      let list_2 = [10,20,30];
      for (let j_3 of list_2) {
        console.log(j_3);
      }
      for (let k_4 = 1; k_4 < 10; k_4++) {
      }
    `,
    },
    {
      name: 'misc tests',
      source: `
    [int] a  = []
    `,
      expected: dedent`
    let a_1 = [];
      `
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
