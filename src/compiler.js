import ast from "./ast.js"
import analyze from "./analyzer.js"

export default function compile(source, outputType) {
    const program = ast(source)
    if (outputType === "ast") return program
    const analyzed = analyze(program)
    if (outputType === "analyzed") return analyzed
    throw new Error("Unknown output type")
}
