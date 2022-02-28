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
            ahoy "aye"
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
        anchor x % 2 == 0
    }
    ledger numbers = [1, 2, 3]
    chase vargh x through numbers {
        ahoy evenOrOdd(x)
    }
`

const source4 = `
    map companyMap = {"Gold": "(15,17)", "Dragons": "(101, 666)"}
    chase vargh location through companyMap {
        ahoy location
    }
`
const source5 = `
    yo true {
        ahoy "true"
    }
    yo false {
        ahoy "false"
    }
`

const source6 = `
    vargh bigboolean = true
    bigboolean = y == 7 and z < 10 or (y == 3 and z < x**2)
`

const expected1 = `   1 | Program statements=[#2,#3,#4,#11]
   2 | VariableDeclaration variable=(Id,"age") initializer=(Num,"10")
   3 | VariableDeclaration variable=(Id,"ageLimit") initializer=(Num,"18")
   4 | WhileLoop test=#5 body=[#6,#7,#9]
   5 | BinaryExpression op='<' left=(Id,"age") right=(Id,"ageLimit")
   6 | PrintStatement argument=(Str,""yer a little lad"")
   7 | Assignment target=(Id,"age") source=#8
   8 | BinaryExpression op='+' left=(Id,"age") right=(Num,"1")
   9 | IfStatement test=(Id,"aye") consequent=[#10] alternate=[]
  10 | PrintStatement argument=(Str,""aye"")
  11 | PrintStatement argument=(Str,""yer a pirate!"")`

const expected2 = `   1 | Program statements=[#2]
   2 | ForLoop variable=(Id,"x") startingVal=(Num,"0") endingVal=(Num,"10") body=[#3,#5]
   3 | IfStatement test=#4 consequent=[(Sym,"maroon")] alternate=[]
   4 | BinaryExpression op='==' left=(Id,"x") right=(Num,"5")
   5 | PrintStatement argument=(Id,"x")`

const expected3 = `   1 | Program statements=[#2,#6,#8]
   2 | FunctionDeclaration fun=(Id,"evenOrOdd") params=[(Id,"x")] body=[#3]
   3 | ReturnStatement expression=#4
   4 | BinaryExpression op='==' left=#5 right=(Num,"0")
   5 | BinaryExpression op='%' left=(Id,"x") right=(Num,"2")
   6 | VariableDeclaration variable=(Id,"numbers") initializer=#7
   7 | ArrayExpression elements=[(Num,"1"),(Num,"2"),(Num,"3")]
   8 | ForEachLoop variable=(Id,"x") expression=(Id,"numbers") body=[#9]
   9 | PrintStatement argument=#10
  10 | Call callee=(Id,"evenOrOdd") args=[(Id,"x")]`

const expected4 = `   1 | Program statements=[#2,#6]
   2 | VariableDeclaration variable=(Id,"companyMap") initializer=#3
   3 | MapExpression elements=[#4,#5]
   4 | MapEntry key=(Str,""Gold"") value=(Str,""(15,17)"")
   5 | MapEntry key=(Str,""Dragons"") value=(Str,""(101, 666)"")
   6 | ForEachLoop variable=(Id,"location") expression=(Id,"companyMap") body=[#7]
   7 | PrintStatement argument=(Id,"location")`

const expected5 = `   1 | Program statements=[#2,#4]
   2 | IfStatement test=(Id,"true") consequent=[#3] alternate=[]
   3 | PrintStatement argument=(Str,""true"")
   4 | IfStatement test=(Id,"false") consequent=[#5] alternate=[]
   5 | PrintStatement argument=(Str,""false"")`

describe("The AST generator produces a correct AST for:", () => {
    it("variable assignments, while loops, if statements, print statements", () => {
        assert.deepStrictEqual(util.format(ast(source1)), expected1)
    })
    it("for loops", () => {
        assert.deepStrictEqual(util.format(ast(source2)), expected2)
    })
    it("function declarations, arrays, foreach", () => {
        assert.deepStrictEqual(util.format(ast(source3)), expected3)
    })
    it("dictionary", () => {
        assert.deepStrictEqual(util.format(ast(source4)), expected4)
    })
    it("true and false boolean expression", () => {
        assert.deepStrictEqual(util.format(ast(source5)), expected5)
    })
})

// console.log(ast(source6))