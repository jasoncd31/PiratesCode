import fs from "fs"
import ohm from "ohm-js"
import * as core from "./core.js"

const piratesGrammar = ohm.grammar(fs.readFileSync("src/pirates.ohm"))

const astBuilder = piratesGrammar.createSemantics().addOperation("ast", {
  Program(body) {
    return new core.Program(body.ast())
  },
  Statement_vardec(_type, id, _eq, initializer) { // do we need the type?
    return new core.VariableDeclaration(id.ast(), initializer.ast())
  },
  Statement_fundec(_fun, id, params, body) {
    return new core.FunctionDeclaration(id.ast(), params.asIteration().ast(), body.ast())
  },
  Statement_assignment(id, _eq, expression) {
    return new core.Assignment(id.ast(), expression.ast())
  },
  Statement_print(_print, argument) {
    return new core.PrintStatement(argument.ast())
  },
  Statement_while(_while, test, body) {
    return new core.WhileStatement(test.ast(), body.ast())
  },
  ForLoop(_for, _type, id, _eq, expression, _until, expression, body) {
    return new core.ForLoop(id.ast(), expression.asst(), expression.ast(), body.ast())
  },
  ForEachLoop(_for, _type, id, _through, id, body) {
    return new core.ForEachLoop(id.ast(), id.ast(), body.ast())
  },
  IfStmt(_if, test, body, _) {
    return new core.ForEachLoop(test.ast(), body.ast())
  },
  Block(_open, body, _close) {
    return body.ast()
  },
  Exp_unary(op, operand) {
    return new core.UnaryExpression(op.ast(), operand.ast())
  },
  Exp_ternary(test, _questionMark, consequent, _colon, alternate) {
    return new core.Conditional(test.ast(), consequent.ast(), alternate.ast())
  },
  Exp1_binary(left, op, right) {
    return new core.BinaryExpression(op.ast(), left.ast(), right.ast())
  },
  Exp2_binary(left, op, right) {
    return new core.BinaryExpression(op.ast(), left.ast(), right.ast())
  },
  Exp3_binary(left, op, right) {
    return new core.BinaryExpression(op.ast(), left.ast(), right.ast())
  },
  Exp4_binary(left, op, right) {
    return new core.BinaryExpression(op.ast(), left.ast(), right.ast())
  },
  Exp5_call(id, args) {
    return new core.BinaryExpression(id.ast(), args.asIteration().ast())
  },
  Exp5_assign(id, _eq, expression) {
    return new core.BinaryExpression(id.ast(), expression.ast(), right.ast())
  },
  Exp5_parens(_left, expression, _right) {
    return new core.BinaryExpression(expression.ast())
  },
  Exp6_assign(id, _eq, exp) {
    return new core.Assignment(id.ast(), exp.ast())
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
  _terminal() {
    return new core.Token("Sym", this.source)
  },
  _iter(...children) {
    return children.map(child => child.ast())
  },
})

export default function ast(sourceCode) {
  const match = piratesGrammar.match(sourceCode)
  if (!match.succeeded()) core.error(match.message)
  return astBuilder(match).ast()
}