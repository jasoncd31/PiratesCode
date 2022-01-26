import assert from "assert/strict"
import { add, times } from "../src/piratesCode.js"

describe("The compiler", () => {
    describe("has an add function", () => {
        it("it should return 4 when adding 2 and 2", () => {
            assert.deepEqual(add(2, 2), 4)
            assert.deepEqual(add(2, 2), 4)
        })
    })
    describe("has a times function", () => {
        it("it should return 4 when multiplying 2 and 2", () => {
            assert.deepEqual(times(2, 2), 4)
        })
        it("it should return 0 when multiplying by 0", () => {
            assert.deepEqual(times(2, 0), 0)
            assert.deepEqual(times(0, 123345456767), 0)
        })
    })
})
