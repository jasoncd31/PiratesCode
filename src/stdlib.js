// STANDARD LIBRARY

import { Type, Function } from "./core.js"

export const types = Object.freeze({
    int: Type.INT,
    doubloon: Type.DOUBLE,
    booty: Type.BOOLEAN,
    shanty: Type.STRING,
    none: Type.NONE
})

export const functions = {
    print: makeFunction("ahoy", Type.NONE )
}

function makeFunction(name, type) {
    return Object.assign(new Function(name), { type })
}

