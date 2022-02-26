import ast from "./ast.js"

export default function compile(source, outputType) {
  const program = ast(source)
  if (outputType === "ast") return program
  throw new Error("Unknown output type")
}