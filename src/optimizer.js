import * as core from "./core.js"

export default function optimize(node) {
    return optimizers[node.constructor.name](node)
  }
  
  const optimizers = {
    Program(p) {
      p.statements = optimize(p.statements)
      return p
    },
    Token(t) {
        // All tokens get optimized away and basically replace with either their
        // value (obtained by the analyzer for literals and ids) or simply with
        // lexeme (if a plain symbol like an operator)
        return t.value ?? t.lexeme
    },
    Array(a) {
    // Flatmap since each element can be an array
    return a.flatMap(optimize)
    },
}