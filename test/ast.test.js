import assert from "assert"
import util from "util"
import ast from "../src/ast.js"

const source1 = `
    vargh age = 10.5 
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
    captain evenOrOdd(int x) -> int {
        x = -14
        anchor x % 2 == 0
    }
    ledger numbers = [1, 2, 3]
    chase vargh x through numbers {
        ahoy evenOrOdd(x)
    }
    captain letsAnchor() -> none {
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
    yo ho aye {
        ahoy "else if 2"
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

const source7 = `
    ship Rectangle {
        build (doubloon height, int width) {
            me.height = height
            me.width = width
        }
        captain area() -> doubloon {
            anchor me.height * me.width
        }
    }
    Rectangle p = new Rectangle(3,4)
    p.width = 15
`

const naughty_pirate = `
    shanty x = booty
    yo ho 3 {
        ahoy "a pirates life for me"
    }
    booty me = nay
    jesus = st. ignatius
`

const expected1 = `   1 | Program statements=[#2,#3,#4,#14]
   2 | VariableDeclaration variable=(Id,"age") initializer=(Double,"10.5")
   3 | VariableDeclaration variable=(Id,"ageLimit") initializer=(Int,"18")
   4 | WhileLoop test=#5 body=[#6,#7,#9]
   5 | BinaryExpression op='<' left=(Id,"age") right=(Id,"ageLimit")
   6 | PrintStatement argument=(Str,""yer a little lad"")
   7 | Assignment target=(Id,"age") source=#8
   8 | BinaryExpression op='+' left=(Id,"age") right=(Int,"1")
   9 | Conditional test=[(Bool,"aye")] consequent=[#10] alternate=[]
  10 | Array 0=#11
  11 | PrintStatement argument=#12
  12 | Conditional test=#13 consequent=(Str,""aye"") alternate=(Str,""nay"")
  13 | BinaryExpression op='<' left=(Id,"age") right=(Id,"ageLimit")
  14 | PrintStatement argument=(Str,""yer a pirate!"")`

const expected2 = `   1 | Program statements=[#2]
   2 | ForLoop variable=(Id,"x") start=(Int,"0") end=(Int,"10") body=[#3,#6]
   3 | Conditional test=[#4] consequent=[#5] alternate=[]
   4 | BinaryExpression op='==' left=(Id,"x") right=(Int,"5")
   5 | Array 0=(Sym,"maroon")
   6 | PrintStatement argument=(Id,"x")`

const expected3 = `   1 | Program statements=[#2,#9,#11,#14]
   2 | FunctionDeclaration fun=(Id,"evenOrOdd") params=[#3] body=[#4,#6] returnType=(Sym,"int")
   3 | Parameter type=(Sym,"int") id=(Id,"x")
   4 | Assignment target=(Id,"x") source=#5
   5 | UnaryExpression op='-' operand=(Int,"14")
   6 | ReturnStatement expression=#7
   7 | BinaryExpression op='==' left=#8 right=(Int,"0")
   8 | BinaryExpression op='%' left=(Id,"x") right=(Int,"2")
   9 | VariableDeclaration variable=(Id,"numbers") initializer=#10
  10 | ArrayExpression elements=[(Int,"1"),(Int,"2"),(Int,"3")]
  11 | ForEachLoop variable=(Id,"x") expression=(Id,"numbers") body=[#12]
  12 | PrintStatement argument=#13
  13 | Call callee=(Id,"evenOrOdd") args=[(Id,"x")]
  14 | FunctionDeclaration fun=(Id,"letsAnchor") params=[] body=[#15] returnType=(Sym,"none")
  15 | ShortReturnStatement `

const expected4 = `   1 | Program statements=[#2,#6]
   2 | VariableDeclaration variable=(Id,"companyMap") initializer=#3
   3 | MapExpression elements=[#4,#5]
   4 | MapEntry key=(Str,""Gold"") value=(Str,""(15,17)"")
   5 | MapEntry key=(Str,""Dragons"") value=(Str,""(101, 666)"")
   6 | ForEachLoop variable=(Id,"location") expression=(Id,"companyMap") body=[#7]
   7 | PrintStatement argument=(Id,"location")`

const expected5 = `   1 | Program statements=[#2,#5,#12]
   2 | Conditional test=[(Bool,"aye")] consequent=[#3] alternate=[]
   3 | Array 0=#4
   4 | PrintStatement argument=(Str,""true"")
   5 | Conditional test=[(Bool,"nay"),(Bool,"aye"),(Bool,"aye")] consequent=[#6,#8,#10] alternate=[]
   6 | Array 0=#7
   7 | PrintStatement argument=(Str,""false"")
   8 | Array 0=#9
   9 | PrintStatement argument=(Str,""else if"")
  10 | Array 0=#11
  11 | PrintStatement argument=(Str,""else if 2"")
  12 | Conditional test=[(Bool,"nay"),(Bool,"nay")] consequent=[#13,#15] alternate=[#17]
  13 | Array 0=#14
  14 | PrintStatement argument=(Str,""false"")
  15 | Array 0=#16
  16 | PrintStatement argument=(Str,""false"")
  17 | Array 0=#18
  18 | PrintStatement argument=(Str,""else"")`

const expected6 = `   1 | Program statements=[#2]
   2 | Assignment target=(Id,"bigboolean") source=#3
   3 | BinaryExpression op='or' left=#4 right=#7
   4 | BinaryExpression op='and' left=#5 right=#6
   5 | BinaryExpression op='==' left=(Id,"y") right=(Int,"7")
   6 | BinaryExpression op='<' left=(Id,"z") right=(Int,"10")
   7 | BinaryExpression op='and' left=#8 right=#9
   8 | BinaryExpression op='==' left=(Id,"y") right=(Int,"3")
   9 | BinaryExpression op='<' left=(Id,"z") right=#10
  10 | BinaryExpression op='**' left=(Id,"x") right=(Int,"2")`

const expected7 = `   1 | Program statements=[#2,#13,#15]
   2 | ClassDeclaration id='Rectangle' constructorDec=#3 methods=[#8]
   3 | ConstructorDeclaration parameters=[#4,#5] body=[#6,#7]
   4 | Parameter type=(Sym,"doubloon") id=(Id,"height")
   5 | Parameter type=(Sym,"int") id=(Id,"width")
   6 | Assignment target=(Sym,"me") source=[(Id,"height")]
   7 | Assignment target=(Sym,"me") source=[(Id,"width")]
   8 | Method name='area' parameters=[] body=[#9] returnType=(Sym,"doubloon")
   9 | ReturnStatement expression=#10
  10 | BinaryExpression op='*' left=#11 right=#12
  11 | Call callee=(Sym,"me") args=[(Id,"height")]
  12 | Call callee=(Sym,"me") args=[(Id,"width")]
  13 | VariableDeclaration variable=(Id,"p") initializer=#14
  14 | NewInstance identifier='Rectangle' args=[(Int,"3"),(Int,"4")]
  15 | Assignment target=(Id,"p") source=[(Id,"width")]`

describe("The AST generator:", () => {
    describe("Produces a correct AST for:", () => {
        it(" variable assignments, while loops, if statements, print statements", () => {
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
        it("parens and boolean expression assignment", () => {
            assert.deepStrictEqual(util.format(ast(source6)), expected6)
        })
        it("Class Declarations", () => {
            assert.deepStrictEqual(util.format(ast(source7)), expected7)
        })
    })
    describe("Rejects bad programs:", () => {
        it("Assigning ids to other ids, incorrectly written conditionals", () => {
            assert.throws(() => ast(naughty_pirate))
        })
    })
})
