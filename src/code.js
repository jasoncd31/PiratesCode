import util from "util"

export class Program {
    constructor(statements) {
        this.statements = statements
    }
}

export class VariableDeclaration {
    constructor(variable, initializer) {
        Object.assign(this, { variable, initializer })
    }
}

export class FunctionDeclaration {
    constructor(fun, params, body) {
        Object.assign(this, { fun, params, body })
    }
}

export class Assignment {
    constructor(target, source) {
        Object.assign(this, { target, source })
    }
}

export class WhileLoop {
    constructor(test, body) {
        Object.assign(this, {test, body})
    }
}

export class ForLoop {
    constructor(variable, test, increment, body) {
        Object.assign(this, { test, body })
    }
}

// How do you do a for each loop?
export class ForEachLoop {
    constructor(variable, expression, body) {
        Object.assign(this, { variable, expression, body })
    }
}

export class PrintStatement {
    constructor(argument) {
        Object.assign(this, { argument })
    }
}

export class Call {
    constructor(callee, args) {
        Object.assign(this, { callee, args })
    }
}

export class Conditional {
    constructor(test, consequent, alternate) {
      Object.assign(this, { test, consequent, alternate })
    }
  }
  
export class BinaryExpression {
    constructor(op, left, right) {
      Object.assign(this, { op, left, right })
    }
}
  
export class UnaryExpression {
    constructor(op, operand) {
      Object.assign(this, { op, operand })
    }
}

export class Token {
    constructor(category, source) {
      Object.assign(this, { category, source })
    }
}