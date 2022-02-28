import fs from "fs"
import ohm from "ohm-js"
import * as core from "./core.js"

const piratesGrammar = ohm.grammar(fs.readFileSync("src/pirates.ohm"))

const astBuilder = piratesGrammar.createSemantics().addOperation("ast", {
    Program(body) {
        return new core.Program(body.ast())
    },
    Statement_print(_print, expression) {
        return new core.PrintStatement(expression.ast())
    },
    Return_exp(_return, expression) {
        return new core.ReturnStatement(expression.ast())
    },
    Return_short(_return) {
        return new core.ShortReturnStatement()
    },
    VarDec(_type, id, _eq, initializer) {
        return new core.VariableDeclaration(id.ast(), initializer.ast())
    },
    FunDec(_fun, id, _left, params, _right, body) {
        return new core.FunctionDeclaration(
            id.ast(),
            params.asIteration().ast(),
            body.ast()
        )
    },
    // ClassDec(_class, id, classBlock) {
    //   return new core.ClassDeclaration(id.ast(), classBlock.ast())
    // },
    Assignment(id, _eq, expression) {
        return new core.Assignment(id.ast(), expression.ast())
    },
    LoopStatement_while(_while, test, body) {
        return new core.WhileLoop(test.ast(), body.ast())
    },
    LoopStatement_ForEach(_for, _type, id1, _through_, id2, body) {
        return new core.ForEachLoop(id1.ast(), id2.ast(), body.ast())
    },
    LoopStatement_For(_for, _type, id, _eq, expression, _until, exp, body) {
        return new core.ForLoop(
            id.ast(),
            expression.ast(),
            exp.ast(),
            body.ast()
        )
    },
    IfStmt_long(
        _if,
        test,
        consequent,
        _elseif,
        _exp2,
        _consequent2,
        _else,
        _alternate
    ) {
        return new core.IfStatement(
            test.ast(),
            consequent.ast(),
            _exp2.ast(),
            _consequent2.ast(),
            _alternate.ast()
        )
    },
    IfStmt_short(_if, test, consequent) {
        return new core.ShortIfStatement(test.ast(), consequent.ast())
    },
    Block(_open, body, _close) {
        return body.ast()
    },
    Exp_unary(op, operand) {
        return new core.UnaryExpression(op.sourceString, operand.ast())
    },
    Exp_ternary(test, _questionMark, consequent, _colon, alternate) {
        return new core.Conditional(
            test.ast(),
            consequent.ast(),
            alternate.ast()
        )
    },
    Exp0_binary(left, op, right) {
        return new core.BinaryExpression(
            op.sourceString,
            left.ast(),
            right.ast()
        )
    },
    Exp1_binary(left, op, right) {
        return new core.BinaryExpression(
            op.sourceString,
            left.ast(),
            right.ast()
        )
    },
    Exp2_binary(left, op, right) {
        return new core.BinaryExpression(
            op.sourceString,
            left.ast(),
            right.ast()
        )
    },
    Exp3_binary(left, op, right) {
        return new core.BinaryExpression(
            op.sourceString,
            left.ast(),
            right.ast()
        )
    },
    Exp4_binary(left, op, right) {
        return new core.BinaryExpression(
            op.sourceString,
            left.ast(),
            right.ast()
        )
    },
    Exp5_binary(left, op, right) {
        return new core.BinaryExpression(
            op.sourceString,
            left.ast(),
            right.ast()
        )
    },
    // Exp6_assignprop(me, _dot, , _eq, expression) {
    //   return new core.Assignment(prop.ast(), expression.ast())
    // },
    Exp6_parens(_left, expression, _right) {
        return new expression.ast()
    },
    Exp6_assign(id, _eq, exp) {
        return new core.Assignment(id.ast(), exp.ast())
    },
    ArrayLit(_left, args, _right) {
        return new core.ArrayExpression(args.asIteration().ast())
    },
    MapLit(_left, args, _right) {
        return new core.MapExpression(args.asIteration().ast())
    },
    MapEntry(left, _colon, right) {
        return new core.MapEntry(left.ast(), right.ast())
    },
    Call(callee, _left, args, _right) {
        return new core.Call(callee.ast(), args.asIteration().ast())
    },
    id(_first, _rest) {
        return new core.Token("Id", this.source)
    },
    true(_) {
        return new core.Token("Bool", this.source)
    },
    false(_) {
        return new core.Token("Bool", this.source)
    },
    num(_whole, _point, _fraction, _e, _sign, _exponent) {
        return new core.Token("Num", this.source)
    },
    strlit(_openQuote, chars, _closeQuote) {
        return new core.Token("Str", this.source)
    },
    _terminal() {
        return new core.Token("Sym", this.source)
    },
    _iter(...children) {
        return children.map((child) => child.ast())
    },
})

export default function ast(sourceCode) {
    const match = piratesGrammar.match(sourceCode)
    if (!match.succeeded()) {
        throw new Error(match.message)
    }
    return astBuilder(match).ast()
}
