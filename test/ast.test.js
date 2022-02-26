import assert from "assert"
import util from "util"
import ast from "../src/ast.js"

let source = 'ahoy "HEY"'

console.log(ast(source))