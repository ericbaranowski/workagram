import { Value, Evaluable, UI, Action, Screen, EnvironmentBoundEvaluable } from "./Component";
import { SerializedRoot, SerializedApp } from "./SerializedApp";
import { ReactRenderer } from "./uis";
export declare type JSONData = unknown;
declare type BuilderDeserializableKind = "ui" | "action";
export declare type DeserializableKind = BuilderDeserializableKind | "evaluable" | "callable";
declare type ArgumentKind = DeserializableKind | "json" | "bindings" | "boolean" | "string" | "string-array" | "kvp-array" | "evaluable-array";
declare type ArgumentSpec = [string, ArgumentKind] | [string, ArgumentKind, boolean];
export declare type DeserializationSpec<TKind extends string> = [string, TKind, ...ArgumentSpec[]];
interface UIDeserializableClass {
    new (componentName: string, ...args: (EnvironmentBoundEvaluable)[]): UI;
    spec: DeserializationSpec<"ui">;
}
interface ActionDeserializableClass {
    new (...args: (EnvironmentBoundEvaluable)[]): Action;
    spec: DeserializationSpec<"action">;
}
interface DeserializableClass {
    new (...args: any[]): Evaluable;
    spec: DeserializationSpec<DeserializableKind>;
}
export declare function registerDeserializable(d: DeserializableClass): void;
export declare function registerUIDeserializable(d: UIDeserializableClass, renderer: ReactRenderer): void;
export declare function registerActionDeserializable(d: ActionDeserializableClass): void;
export declare function lookupReactRenderer(name: string): ReactRenderer;
export declare function makeValueFromJSON(root: JSONData): Value;
export declare function deserializeEvaluable(rootJSON: JSONData): Evaluable;
export declare function deserializeRoot(serializedRoot: SerializedRoot): Screen;
export declare function deserializeApp(serializedApp: SerializedApp): {
    screen: Screen;
    functions: Map<string, Evaluable>;
};
export {};
