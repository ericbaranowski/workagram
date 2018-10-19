import { Value, ValueProducer, SubscribableValueProducer, EvalEnvironment, EnvironmentBoundEvaluable, Context } from "./Component";
import { DeserializationSpec, DeserializableKind } from "./deserialization";
export declare class Data extends SubscribableValueProducer implements EnvironmentBoundEvaluable {
    private _current;
    constructor(_current: Value);
    readonly current: Value;
    set(v: Value): void;
    eval(_context: Context): ValueProducer;
    evalInEnvironment(_env: EvalEnvironment, _context: Context): ValueProducer;
    static fromJSON(json: unknown): Data;
    static readonly spec: DeserializationSpec<DeserializableKind>;
}
export declare function asData(x: unknown): Data;
export declare class EnvironmentBoundValueProducer implements EnvironmentBoundEvaluable {
    private readonly _vp;
    constructor(_vp: ValueProducer);
    eval(_context: Context): ValueProducer;
    evalInEnvironment(_env: EvalEnvironment, _context: Context): ValueProducer;
}
export declare function registerPrimitives(): void;
