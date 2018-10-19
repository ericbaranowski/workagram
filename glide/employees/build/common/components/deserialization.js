import { hasOwnProperty } from "collection-utils";
import { defined, assert, assertNever, panic, checkString, checkBoolean } from "../Support";
import { UIEvaluable, ActionEvaluable } from "./Component";
import { Data, asData } from "./primitives";
const registeredDeserializables = new Map();
const registeredUIDeserializables = new Map();
const registeredActionDeserializables = new Map();
const registeredReactRenderers = new Map();
function isDeserializableRegistered(name) {
    return (registeredDeserializables.has(name) ||
        registeredUIDeserializables.has(name) ||
        registeredActionDeserializables.has(name));
}
export function registerDeserializable(d) {
    const [name] = d.spec;
    assert(!isDeserializableRegistered(name), `${name} registered more than once`);
    registeredDeserializables.set(name, d);
}
export function registerUIDeserializable(d, renderer) {
    const [name] = d.spec;
    assert(!isDeserializableRegistered(name), `${name} registered more than once`);
    registeredUIDeserializables.set(name, d);
    registeredReactRenderers.set(name, renderer);
}
export function registerActionDeserializable(d) {
    const [name] = d.spec;
    assert(!isDeserializableRegistered(name), `${name} registered more than once`);
    registeredActionDeserializables.set(name, d);
}
export function lookupReactRenderer(name) {
    const renderer = registeredReactRenderers.get(name);
    if (renderer === undefined) {
        return panic(`No ReactRenderer for ${name}`);
    }
    return renderer;
}
export function makeValueFromJSON(root) {
    const refSetters = [];
    function setValue(json, setter) {
        if (json === null) {
            return setter(null);
        }
        if (typeof json === "string" || typeof json === "number" || typeof json === "boolean") {
            return setter(json);
        }
        if (Array.isArray(json)) {
            const arr = [];
            for (let i = 0; i < json.length; i++) {
                const value = json[i];
                if (value === undefined) {
                    throw new Error(`Undefined value at index ${i}`);
                }
                setValue(value, v => (arr[i] = new Data(v)));
            }
            return setter(arr);
        }
        const keys = Object.getOwnPropertyNames(json);
        if (keys.length === 1 && keys[0] === "$ref") {
            const ref = json.$ref;
            if (typeof ref === "string") {
                refSetters.push([ref, setter]);
                return;
            }
        }
        const obj = {};
        for (const key of keys) {
            const value = json[key];
            if (value === undefined) {
                continue;
            }
            setValue(value, v => (obj[key] = new Data(v)));
        }
        return setter(obj);
    }
    let resultRoot;
    function resolveRef(ref) {
        if (!ref.startsWith("#/")) {
            return panic(`$ref doesn't start with '#/': ${ref}`);
        }
        const parts = ref.split("/").slice(1);
        let data = defined(resultRoot);
        for (const part of parts) {
            if (data === null) {
                return panic(`$ref references into a null value: ${ref}`);
            }
            if (Array.isArray(data)) {
                if (part.match("^[0-9]+$") === null) {
                    return panic(`$ref tries to index an array with a non-integer '${part}': ${ref}`);
                }
                data = data[parseInt(part, 10)].current;
            }
            else {
                if (!hasOwnProperty(data, part)) {
                    return panic(`$ref refers to non-existant property ${part}: ${ref}`);
                }
                data = data[part].current;
            }
        }
        return data;
    }
    if (root === undefined) {
        throw new Error("App root is undefined");
    }
    setValue(root, v => (resultRoot = v));
    for (const [ref, setter] of refSetters) {
        setter(resolveRef(ref));
    }
    return defined(resultRoot);
}
export function deserializeEvaluable(rootJSON) {
    function deserializeArgument(kind, json) {
        // console.log(`deserializing ${kind} in ${JSON.stringify(json)}`);
        switch (kind) {
            case "evaluable":
            case "callable":
            case "ui":
            case "action":
                return deserialize(json);
            case "boolean":
                return checkBoolean(json);
            case "string":
                return checkString(json);
            case "json":
                return makeValueFromJSON(json);
            case "evaluable-array":
                if (!Array.isArray(json))
                    return panic();
                return json.map(deserialize);
            case "bindings":
                if (!Array.isArray(json))
                    return panic();
                return json.map(kvp => {
                    if (!Array.isArray(kvp))
                        return panic();
                    if (kvp.length !== 2)
                        return panic();
                    return [checkString(kvp[0]), deserialize(kvp[1])];
                });
            case "string-array":
                if (!Array.isArray(json))
                    return panic();
                return json.map(checkString);
            case "kvp-array":
                if (!Array.isArray(json))
                    return panic();
                return json.map(kvp => {
                    if (!Array.isArray(kvp))
                        return panic();
                    if (kvp.length !== 2)
                        return panic();
                    return kvp.map(deserialize);
                });
            default:
                assertNever(kind);
        }
    }
    function deserialize(json) {
        if (!hasOwnProperty(json, "$kind")) {
            return panic(`No $kind field in JSON ${json}`);
        }
        const kind = json.$kind;
        if (typeof kind !== "string") {
            return panic(`$kind is not a string in JSON ${json}`);
        }
        let argsSpec;
        let build;
        const deserializable = registeredDeserializables.get(kind);
        if (deserializable !== undefined) {
            [, , ...argsSpec] = deserializable.spec;
            build = a => new deserializable(...a);
        }
        else {
            const uiDeserializable = registeredUIDeserializables.get(kind);
            if (uiDeserializable !== undefined) {
                [, , ...argsSpec] = uiDeserializable.spec;
                build = a => new UIEvaluable(uiDeserializable, a);
            }
            else {
                const actionDeserializable = registeredActionDeserializables.get(kind);
                if (actionDeserializable !== undefined) {
                    [, , ...argsSpec] = actionDeserializable.spec;
                    build = a => new ActionEvaluable(actionDeserializable, a);
                }
                else {
                    return panic(`Deserializable ${kind} not found`);
                }
            }
        }
        const args = argsSpec.map(([argName, argKind, ...rest]) => {
            const required = rest.length === 0 || rest[0] !== false;
            const arg = json[argName];
            if (arg === undefined) {
                if (required) {
                    return panic(`Argument ${argName} missing from component: ${JSON.stringify(json)}`);
                }
                return undefined;
            }
            // console.log(`deserializing ${kind} ${name} arg ${argKind} ${argName} in ${JSON.stringify(json)}`);
            return deserializeArgument(argKind, arg);
        });
        return build(args);
    }
    return deserialize(rootJSON);
}
export function deserializeRoot(serializedRoot) {
    return {
        ui: deserializeEvaluable(serializedRoot.content),
        ctx: asData(deserializeEvaluable(serializedRoot.ctx)),
        title: deserializeEvaluable(serializedRoot.title)
    };
}
export function deserializeApp(serializedApp) {
    const screen = deserializeRoot(serializedApp.root);
    const appComponents = serializedApp.components;
    const functions = new Map();
    if (appComponents !== undefined) {
        for (const name of Object.getOwnPropertyNames(appComponents)) {
            functions.set(name, deserializeEvaluable(appComponents[name]));
        }
    }
    return { screen, functions };
}
//# sourceMappingURL=deserialization.js.map