import { Console } from "console"
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
    VarDec(type, id, _eq, initializer) {
        return new core.VariableDeclaration(
            type.ast(),
            id.ast(),
            initializer.ast()
        )
    },
    FunDec(_fun, id, _left, params, _right, _arrow, returnType, body) {
        return new core.FunctionDeclaration(
            id.ast(),
            params.asIteration().ast(),
            body.ast(),
            returnType.ast()
        )
    },

    ClassDec(_class, name, _open, constructorDec, methodDec, _close) {
        return new core.ClassDeclaration(
            name.sourceString,
            constructorDec.ast(),
            methodDec.ast()
        )
    },
    ConstructorDec(
        _constructor,
        _left,
        parameters,
        _right,
        _open,
        fields,
        _close
    ) {
        return new core.ConstructorDeclaration(
            parameters.asIteration().ast(),
            fields.ast()
        )
    },
    MethodDeclaration(
        _method,
        name,
        _left,
        parameters,
        _right,
        _arrow,
        returnType,
        body
    ) {
        return new core.MethodDeclaration(
            name.ast(),
            parameters.asIteration().ast(),
            body.ast(),
            returnType.ast()
        )
    },
    Assignment_regular(id, _eq, expression) {
        return new core.Assignment(id.ast(), expression.ast())
    },
    Field(type, _object, _dot, id, _eq, initializer) {
        return new core.Field(type.ast(), id.ast(), initializer.ast())
    },
    ObjectDec(_new, name, _left, args, _right) {
        return new core.ObjectDec(name.sourceString, args.asIteration().ast())
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
            [test.ast(), ..._exp2.ast()],
            [consequent.ast(), ..._consequent2.ast()],
            [..._alternate.ast()]
        )
    },
    Param(type, id) {
        return new core.Parameter(type.ast(), id.ast())
    },
    Block(_open, body, _close) {
        return body.ast()
    },
    Type_list(_left, baseType, _right) {
        return new core.ArrayType(baseType.ast())
    },
    Type_dictionary(_left, keyType, _colon, valueType, _right) {
        return new core.MapType(keyType.ast(), valueType.ast())
    },
    Exp5_unary(op, operand) {
        return new core.UnaryExpression(op.sourceString, operand.ast())
    },
    Exp_ternary(test, _questionMark, consequent, _colon, alternate) {
        return new core.Conditional(
            test.ast(),
            consequent.ast(),
            alternate.ast(),
            true
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
    Exp6_parens(_open, expression, _close) {
        return expression.ast()
    },
    Exp6_subscript(expression, _bracket, index, _bracket1) {
        return new core.SubscriptExpression(expression.ast(), index.ast())
    },
    break(_break) {
        return new core.BreakStatement()
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
    Call_regular(callee, _left, args, _right) {
        return new core.Call(callee.ast(), args.asIteration().ast())
    },
    DotExpression(id, _dot, callee) {
        return new core.DotExpression(id.ast(), callee.ast())
    },
    DotCall(id, _dot, callee) {
        return new core.DotCall(id.ast(), callee.ast())
    },
    this(_) {
        return new core.ThisExpression()
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
    intlit(_digits) {
        return new core.Token("Int", this.source)
    },
    doublelit(_whole, _point, _fraction, _e, _sign, _exponent) {
        return new core.Token("Double", this.source)
    },
    strlit(_openQuote, _chars, _closeQuote) {
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
