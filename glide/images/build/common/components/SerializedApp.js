// FIXME: This is a kludge.  We should probably pass the context to `deserializeApp`.
export function serializedAppWithRootContext(serializedApp, ctx) {
    const root = Object.assign({}, serializedApp.root, { ctx: { $kind: "Data", data: ctx } });
    return Object.assign({}, serializedApp, { root });
}
//# sourceMappingURL=SerializedApp.js.map