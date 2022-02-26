import compile from "./compiler.js"
import fs from "fs/promises"
import process from "process"
const help = `PiratesCode compiler
Syntax: piratesCode.js <filename> <outputType>
Prints to stdout according to <outputType>, which must be one of:
`

console.log("Hello world!")

export function add(x, y) {
    return x + y
}

export function times(x, y) {
    return x * y
}

async function compileFromFile(filename, outputType) {
    try {
      const buffer = await fs.readFile(filename)
      console.log(compile(buffer.toString(), outputType))
    } catch (e) {
      console.error(`\u001b[31m${e}\u001b[39m`)
      process.exitCode = 1
    }
  }
  
  if (process.argv.length !== 4) {
    console.log(help)
  } else {
    compileFromFile(process.argv[2], process.argv[3])
  }