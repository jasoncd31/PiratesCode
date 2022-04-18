import assert from "assert/strict"
import optimize from "../src/optimizer.js"
import * as core from "../src/core.js"

const x = new core.Variable("x", false)

const tests = [
]

describe("The optimizer", () => {
    for (const [scenario, before, after] of tests) {
      it(`${scenario}`, () => {
        assert.deepEqual(optimize(before), after)
      })
    }
  })