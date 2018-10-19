export function checkBoolean(x) {
    if (typeof x === "boolean")
        return x;
    return panic(`Value should be a boolean: ${x}`);
}
export function checkString(x) {
    if (typeof x === "string")
        return x;
    return panic(`Value should be a string: ${x}`);
}
export function panic(message = "This should not happen") {
    throw new Error(message);
}
export function assert(fact, message = "Assertion failed") {
    if (fact)
        return;
    return panic(message);
}
export function assertNever(_never) {
    return panic("Hell froze over");
}
export function defined(v) {
    if (v === undefined)
        return panic("Value was undefined but should be defined");
    return v;
}
export function nonNull(v) {
    if (v === null)
        return panic("Value was null but should be non-null");
    return v;
}
//# sourceMappingURL=Support.js.map