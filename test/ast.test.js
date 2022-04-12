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
            doubloon me.height = height
            int me.width = width
        }
        captain area() -> doubloon {
            anchor me.height * me.width
        }

        captain getWidth() -> int {
            anchor me.width
        }
        
        captain setWidth(int newWidth) -> none {
            me.width = newWidth
        }
    }
    Rectangle p = new Rectangle(3,4)
    ahoy p.getWidth()
    p.setWidth(15)
`

const source8 = `
    captain S(int x, int y) -> int {
        yo x == 0 {
            anchor 0 
        } 
        anchor S(x-1, y) }`

const naughty_pirate = `
    shanty x <= []
    
`

const expected1 = `   1 | Program statements=[#2,#3,#4,#14]
   2 | VariableDeclaration type=(Sym,"vargh") variable=(Id,"age") initializer=(Double,"10.5")
   3 | VariableDeclaration type=(Sym,"vargh") variable=(Id,"ageLimit") initializer=(Int,"18")
   4 | WhileLoop test=#5 body=[#6,#7,#9]
   5 | BinaryExpression op='<' left=(Id,"age") right=(Id,"ageLimit")
   6 | PrintStatement argument=(Str,""yer a little lad"")
   7 | Assignment target=(Id,"age") source=#8
   8 | BinaryExpression op='+' left=(Id,"age") right=(Int,"1")
   9 | IfStatement test=[(Bool,"aye")] consequent=[#10] alternate=[]
  10 | Array 0=#11
  11 | PrintStatement argument=#12
  12 | Conditional test=#13 consequent=(Str,""aye"") alternate=(Str,""nay"")
  13 | BinaryExpression op='<' left=(Id,"age") right=(Id,"ageLimit")
  14 | PrintStatement argument=(Str,""yer a pirate!"")`

const expected2 = `   1 | Program statements=[#2]
   2 | ForLoop variable=(Id,"x") start=(Int,"0") end=(Int,"10") body=[#3,#7]
   3 | IfStatement test=[#4] consequent=[#5] alternate=[]
   4 | BinaryExpression op='==' left=(Id,"x") right=(Int,"5")
   5 | Array 0=#6
   6 | BreakStatement 
   7 | PrintStatement argument=(Id,"x")`

const expected3 = `   1 | Program statements=[#2,#9,#11,#14]
   2 | FunctionDeclaration fun=(Id,"evenOrOdd") params=[#3] body=[#4,#6] returnType=(Id,"int")
   3 | Parameter type=(Id,"int") id=(Id,"x")
   4 | Assignment target=(Id,"x") source=#5
   5 | UnaryExpression op='-' operand=(Int,"14")
   6 | ReturnStatement expression=#7
   7 | BinaryExpression op='==' left=#8 right=(Int,"0")
   8 | BinaryExpression op='%' left=(Id,"x") right=(Int,"2")
   9 | VariableDeclaration type=(Id,"ledger") variable=(Id,"numbers") initializer=#10
  10 | ArrayExpression elements=[(Int,"1"),(Int,"2"),(Int,"3")]
  11 | ForEachLoop variable=(Id,"x") expression=(Id,"numbers") body=[#12]
  12 | PrintStatement argument=#13
  13 | Call callee=(Id,"evenOrOdd") args=[(Id,"x")]
  14 | FunctionDeclaration fun=(Id,"letsAnchor") params=[] body=[#15] returnType=(Id,"none")
  15 | ShortReturnStatement `

const expected4 = `   1 | Program statements=[#2,#6]
   2 | VariableDeclaration type=(Id,"map") variable=(Id,"companyMap") initializer=#3
   3 | MapExpression elements=[#4,#5]
   4 | MapEntry key=(Str,""Gold"") value=(Str,""(15,17)"")
   5 | MapEntry key=(Str,""Dragons"") value=(Str,""(101, 666)"")
   6 | ForEachLoop variable=(Id,"location") expression=(Id,"companyMap") body=[#7]
   7 | PrintStatement argument=(Id,"location")`

const expected5 = `   1 | Program statements=[#2,#5,#12]
   2 | IfStatement test=[(Bool,"aye")] consequent=[#3] alternate=[]
   3 | Array 0=#4
   4 | PrintStatement argument=(Str,""true"")
   5 | IfStatement test=[(Bool,"nay"),(Bool,"aye"),(Bool,"aye")] consequent=[#6,#8,#10] alternate=[]
   6 | Array 0=#7
   7 | PrintStatement argument=(Str,""false"")
   8 | Array 0=#9
   9 | PrintStatement argument=(Str,""else if"")
  10 | Array 0=#11
  11 | PrintStatement argument=(Str,""else if 2"")
  12 | IfStatement test=[(Bool,"nay"),(Bool,"nay")] consequent=[#13,#15] alternate=[#17]
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

const expected7 = `   1 | Program statements=[#2,#24,#26,#29]
   2 | ClassDeclaration id='Rectangle' constructorDec=#3 methods=[#8,#15,#19]
   3 | ConstructorDeclaration parameters=[#4,#5] body=[#6,#7]
   4 | Parameter type=(Id,"doubloon") id=(Id,"height")
   5 | Parameter type=(Id,"int") id=(Id,"width")
   6 | Field type=(Id,"doubloon") variable=(Id,"height") initializer=(Id,"height")
   7 | Field type=(Id,"int") variable=(Id,"width") initializer=(Id,"width")
   8 | MethodDeclaration name=(Id,"area") params=[] body=[#9] returnType=(Id,"doubloon")
   9 | ReturnStatement expression=#10
  10 | BinaryExpression op='*' left=#11 right=#13
  11 | DotExpression object=#12 member=(Id,"height")
  12 | ThisExpression 
  13 | DotExpression object=#14 member=(Id,"width")
  14 | ThisExpression 
  15 | MethodDeclaration name=(Id,"getWidth") params=[] body=[#16] returnType=(Id,"int")
  16 | ReturnStatement expression=#17
  17 | DotExpression object=#18 member=(Id,"width")
  18 | ThisExpression 
  19 | MethodDeclaration name=(Id,"setWidth") params=[#20] body=[#21] returnType=(Id,"none")
  20 | Parameter type=(Id,"int") id=(Id,"newWidth")
  21 | Assignment target=#22 source=(Id,"newWidth")
  22 | DotExpression object=#23 member=(Id,"width")
  23 | ThisExpression 
  24 | VariableDeclaration type=(Id,"Rectangle") variable=(Id,"p") initializer=#25
  25 | ObjectDec identifier='Rectangle' args=[(Int,"3"),(Int,"4")]
  26 | PrintStatement argument=#27
  27 | DotCall object=(Id,"p") member=#28
  28 | Call callee=(Id,"getWidth") args=[]
  29 | DotCall object=(Id,"p") member=#30
  30 | Call callee=(Id,"setWidth") args=[(Int,"15")]`

const expected8 = `   1 | Program statements=[#2]
   2 | FunctionDeclaration fun=(Id,"S") params=[#3,#4] body=[#5,#9] returnType=(Id,"int")
   3 | Parameter type=(Id,"int") id=(Id,"x")
   4 | Parameter type=(Id,"int") id=(Id,"y")
   5 | IfStatement test=[#6] consequent=[#7] alternate=[]
   6 | BinaryExpression op='==' left=(Id,"x") right=(Int,"0")
   7 | Array 0=#8
   8 | ReturnStatement expression=(Int,"0")
   9 | ReturnStatement expression=#10
  10 | Call callee=(Id,"S") args=[#11,(Id,"y")]
  11 | BinaryExpression op='-' left=(Id,"x") right=(Int,"1")`

// console.log(ast('vargh x = 1\n ahoy 2*3+5**(-3)/2-5%8'))
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
        it("Recursive Function", () => {
            assert.deepStrictEqual(util.format(ast(source8)), expected8)
        })
    })
    describe("Rejects bad programs:", () => {
        it("Assigning ids to other ids, incorrectly written conditionals", () => {
            assert.throws(() => ast(naughty_pirate))
        })
    })
})
