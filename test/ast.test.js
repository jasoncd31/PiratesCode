import assert from "assert"
import util from "util"
import ast from "../src/ast.js"

const source1 = `
    vargh age = 10 
    vargh ageLimit = 18

    parrot age < ageLimit {
        ahoy "yer a little lad" 
        age = age + 1
        yo aye {
            ahoy age < ageLimit ? "aye" : "nay"
        }
    }
    ahoy "yer a pirate!"
    `
const source2 = `
    chase vargh x = 0 until 10 {
        yo x == 5 {
            maroon
        }
        ahoy x
    }
`

const source3 = `
    captain evenOrOdd(x) {
        x = -14
        anchor x % 2 == 0
    }
    ledger numbers = [1, 2, 3]
    chase vargh x through numbers {
        ahoy evenOrOdd(x)
    }
    captain letsAnchor() {
        anchor
    }
`

const source4 = `
    map companyMap = {"Gold": "(15,17)", "Dragons": "(101, 666)"}
    chase vargh location through companyMap {
        ahoy location
    }
`
const source5 = `
    yo aye {
        ahoy "true"
    }
    yo nay {
        ahoy "false"
    }
    yo ho aye {
        ahoy "else if"
    }
    yo nay{
        ahoy "false"
    }
    yo ho nay {
        ahoy "false"
    }
    ho {
        ahoy "else"
    }
`

const source6 = `
    bigboolean = y == 7 and z < 10 or (y == 3 and z < x**2)
`

const naughty_pirate =`
    shanty x = booty
    yo ho 3 {
        ahoy "a pirates life for me"
    }
    booty me = nay
    jesus = st. ignatius
`
  
const expected1 = `   1 | Program statements=[#2,#3,#4,#14]
   2 | VariableDeclaration variable=(Id,"age") initializer=(Num,"10")
   3 | VariableDeclaration variable=(Id,"ageLimit") initializer=(Num,"18")
   4 | WhileLoop test=#5 body=[#6,#7,#9]
   5 | BinaryExpression op='<' left=(Id,"age") right=(Id,"ageLimit")
   6 | PrintStatement argument=(Str,""yer a little lad"")
   7 | Assignment target=(Id,"age") source=#8
   8 | BinaryExpression op='+' left=(Id,"age") right=(Num,"1")
   9 | Conditional test=[(Bool,"aye")] consequent=[#10] alternate=[]
  10 | Array 0=#11
  11 | PrintStatement argument=#12
  12 | Conditional test=#13 consequent=(Str,""aye"") alternate=(Str,""nay"")
  13 | BinaryExpression op='<' left=(Id,"age") right=(Id,"ageLimit")
  14 | PrintStatement argument=(Str,""yer a pirate!"")`

const expected2 = `   1 | Program statements=[#2]
   2 | ForLoop variable=(Id,"x") start=(Num,"0") end=(Num,"10") body=[#3,#6]
   3 | Conditional test=[#4] consequent=[#5] alternate=[]
   4 | BinaryExpression op='==' left=(Id,"x") right=(Num,"5")
   5 | Array 0=(Sym,"maroon")
   6 | PrintStatement argument=(Id,"x")`

const expected3 = `   1 | Program statements=[#2,#8,#10,#13]
   2 | FunctionDeclaration fun=(Id,"evenOrOdd") params=[(Id,"x")] body=[#3,#5]
   3 | Assignment target=(Id,"x") source=#4
   4 | UnaryExpression op='-' operand=(Num,"14")
   5 | ReturnStatement expression=#6
   6 | BinaryExpression op='==' left=#7 right=(Num,"0")
   7 | BinaryExpression op='%' left=(Id,"x") right=(Num,"2")
   8 | VariableDeclaration variable=(Id,"numbers") initializer=#9
   9 | ArrayExpression elements=[(Num,"1"),(Num,"2"),(Num,"3")]
  10 | ForEachLoop variable=(Id,"x") expression=(Id,"numbers") body=[#11]
  11 | PrintStatement argument=#12
  12 | Call callee=(Id,"evenOrOdd") args=[(Id,"x")]
  13 | FunctionDeclaration fun=(Id,"letsAnchor") params=[] body=[#14]
  14 | ShortReturnStatement `

const expected4 = `   1 | Program statements=[#2,#6]
   2 | VariableDeclaration variable=(Id,"companyMap") initializer=#3
   3 | MapExpression elements=[#4,#5]
   4 | MapEntry key=(Str,""Gold"") value=(Str,""(15,17)"")
   5 | MapEntry key=(Str,""Dragons"") value=(Str,""(101, 666)"")
   6 | ForEachLoop variable=(Id,"location") expression=(Id,"companyMap") body=[#7]
   7 | PrintStatement argument=(Id,"location")`

const expected5 = `   1 | Program statements=[#2,#5,#10]
   2 | Conditional test=[(Bool,"aye")] consequent=[#3] alternate=[]
   3 | Array 0=#4
   4 | PrintStatement argument=(Str,""true"")
   5 | Conditional test=[(Bool,"nay"),(Bool,"aye")] consequent=[#6,#8] alternate=[]
   6 | Array 0=#7
   7 | PrintStatement argument=(Str,""false"")
   8 | Array 0=#9
   9 | PrintStatement argument=(Str,""else if"")
  10 | Conditional test=[(Bool,"nay"),(Bool,"nay")] consequent=[#11,#13] alternate=[#15]
  11 | Array 0=#12
  12 | PrintStatement argument=(Str,""false"")
  13 | Array 0=#14
  14 | PrintStatement argument=(Str,""false"")
  15 | Array 0=#16
  16 | PrintStatement argument=(Str,""else"")`

const expected6 = `   1 | Program statements=[#2]
   2 | Assignment target=(Id,"bigboolean") source=#3
   3 | BinaryExpression op='or' left=#4 right=#7
   4 | BinaryExpression op='and' left=#5 right=#6
   5 | BinaryExpression op='==' left=(Id,"y") right=(Num,"7")
   6 | BinaryExpression op='<' left=(Id,"z") right=(Num,"10")
   7 | BinaryExpression op='and' left=#8 right=#9
   8 | BinaryExpression op='==' left=(Id,"y") right=(Num,"3")
   9 | BinaryExpression op='<' left=(Id,"z") right=#10
  10 | BinaryExpression op='**' left=(Id,"x") right=(Num,"2")`

describe("The AST generator produces a correct AST for:", () => {
    it("variable assignments, while loops, if statements, print statements", () => {
        assert.deepStrictEqual(util.format(ast(source1)), expected1)
    })
    it("for loops", () => {
        assert.deepStrictEqual(util.format(ast(source2)), expected2)
    })
    it("function declarations, arrays, foreach, returns", () => {
        assert.deepStrictEqual(util.format(ast(source3)), expected3)
    })
    it("dictionary", () => {
        assert.deepStrictEqual(util.format(ast(source4)), expected4)
    })
    it("true and false boolean expression", () => {
        assert.deepStrictEqual(util.format(ast(source5)), expected5)
    })
    it("parens and boolean expression assignment", () => {
        assert.deepStrictEqual(util.format(ast(source6)), expected6)
    })
    it("rejects a bad program", () => {
        assert.throws(() => ast(naughty_pirate))
    })
})

// console.log(ast(naughty_pirate))