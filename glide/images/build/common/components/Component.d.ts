/// <reference types="react" />
import { DeserializationSpec, JSONData } from "./deserialization";
import { Database } from "../Database";
import { ReactRenderer } from "./uis";
export declare type Value = string | number | boolean | null | Callable | ValueProducer[] | {
    [key: string]: ValueProducer;
} | UI | Action;
export interface ValueUpdatee {
    valueUpdated(): void;
}
declare type ValueUpdatedCallback = () => void;
declare type ValueListener = ValueUpdatee | ValueUpdatedCallback;
export interface ValueProducer {
    readonly current: Value;
    set(v: Value): void;
    subscribe(l: ValueListener): void;
    unsubscribe(l: ValueListener): void;
}
export declare type ValueProducers = (ValueProducer | undefined)[];
export declare abstract class UnsubscribableValueProducer implements ValueProducer {
    abstract readonly current: Value;
    set(_v: Value): void;
    subscribe(_l: ValueListener): void;
    unsubscribe(_l: ValueListener): void;
}
export declare abstract class SubscribableValueProducer implements ValueProducer {
    private _listeners;
    abstract readonly current: Value;
    constructor();
    protected updateListeners(): void;
    abstract set(_v: Value): void;
    protected readonly hasSubscribers: boolean;
    protected firstSubscribed(): void;
    protected lastUnsubscribed(): void;
    subscribe(l: ValueListener): void;
    unsubscribe(l: ValueListener): void;
}
export declare abstract class ForwardingValueProducer extends SubscribableValueProducer implements ValueUpdatee {
    private _currentForwardee;
    protected abstract recomputeForwardee(): ValueProducer | undefined;
    private forwardeeUpdated;
    protected firstSubscribed(): void;
    protected lastUnsubscribed(): void;
    private getCurrentForwardee;
    readonly current: Value;
    valueUpdated(): void;
    set(v: Value): void;
}
export declare abstract class RecomputingValueProducer extends SubscribableValueProducer implements ValueUpdatee {
    protected currentValue: Value | undefined;
    protected abstract recompute(): Value;
    readonly current: Value;
    valueUpdated(): void;
}
export declare abstract class DependingRecomputingValueProducer extends RecomputingValueProducer {
    private _dependees;
    protected abstract getDependees(): ValueProducer[];
    protected abstract recomputeFromValues(values: Value[]): Value;
    private subscribeDependees;
    protected firstSubscribed(): void;
    private unsubscribeDependees;
    protected lastUnsubscribed(): void;
    protected recompute(): Value;
    private dependeeUpdated;
}
export declare type Context = ValueProducer;
export interface Evaluable {
    evalInEnvironment(env: EvalEnvironment, context: Context): ValueProducer;
}
export interface EnvironmentBoundEvaluable extends Evaluable {
    eval(context: Context): ValueProducer;
}
export interface EvalEnvironment {
    lookupUserDefinedComponent(name: string): Evaluable | undefined;
    readonly root: RootEvalEnvironment;
    get(name: string): EnvironmentBoundEvaluable | undefined;
}
export declare class RootEvalEnvironment implements EvalEnvironment {
    private readonly _userDefinedComponents;
    constructor(_userDefinedComponents: ReadonlyMap<string, Evaluable>);
    lookupUserDefinedComponent(name: string): Evaluable | undefined;
    readonly root: RootEvalEnvironment;
    get(_name: string): EnvironmentBoundEvaluable | undefined;
}
export declare class ChainedEvalEnvironment implements EvalEnvironment {
    private readonly _bindings;
    private readonly _next;
    constructor(_bindings: ReadonlyMap<string, EnvironmentBoundEvaluable>, _next: EvalEnvironment);
    lookupUserDefinedComponent(name: string): Evaluable | undefined;
    readonly root: RootEvalEnvironment;
    get(name: string): EnvironmentBoundEvaluable | undefined;
}
export declare abstract class Callable extends UnsubscribableValueProducer implements Evaluable {
    abstract call(args: EnvironmentBoundEvaluable[], context: Context, rootEnv: RootEvalEnvironment): ValueProducer;
    readonly current: Value;
    evalInEnvironment(_env: EvalEnvironment, _context: Context): ValueProducer;
}
export declare class BindEnvironmentEvaluable implements EnvironmentBoundEvaluable {
    private readonly _evaluable;
    private readonly _env;
    constructor(_evaluable: Evaluable, _env: EvalEnvironment);
    eval(context: Context): ValueProducer;
    evalInEnvironment(_env: EvalEnvironment, context: Context): ValueProducer;
}
export declare abstract class UI extends UnsubscribableValueProducer implements Evaluable {
    abstract render(context: Context, renv: RenderEnvironment): React.ReactNode;
    readonly current: Value;
    evalInEnvironment(_env: EvalEnvironment, _context: Context): ValueProducer;
}
export interface UIClass {
    new (componentName: string, ...args: (EnvironmentBoundEvaluable | undefined)[]): UI;
    spec: DeserializationSpec<"ui">;
}
export declare class UIEvaluable extends Callable implements Evaluable {
    private readonly _uiClass;
    private readonly _args;
    constructor(_uiClass: UIClass, _args: (Evaluable | undefined)[]);
    evalInEnvironment(env: EvalEnvironment, _context: Context): ValueProducer;
    call(args: EnvironmentBoundEvaluable[], context: Context, rootEnv: RootEvalEnvironment): ValueProducer;
}
export declare abstract class Action extends UnsubscribableValueProducer implements Evaluable {
    abstract run(context: Context, env: RenderEnvironment): void;
    readonly current: Value;
    evalInEnvironment(_env: EvalEnvironment, _context: Context): ValueProducer;
}
export interface ActionClass {
    new (...args: (EnvironmentBoundEvaluable | undefined)[]): Action;
}
export declare class ActionEvaluable extends Callable implements Evaluable {
    private readonly _actionClass;
    private readonly _args;
    constructor(_actionClass: ActionClass, _args: (Evaluable | undefined)[]);
    evalInEnvironment(env: EvalEnvironment, _context: Context): ValueProducer;
    call(args: EnvironmentBoundEvaluable[], context: Context, rootEnv: RootEvalEnvironment): ValueProducer;
}
export declare function asList(v: Value): ValueProducer[];
export declare function asNumber(v: Value): number;
export declare function asBoolean(v: Value): boolean;
export declare function asString(x: Value): string;
export declare function asCallable(v: Value | Evaluable): Callable;
export declare function asUI(v: Value): UI;
export declare function asAction(v: Value): Action;
export declare function asValueArray(v: Value): ValueProducer[];
export declare function asValueObject(v: Value): {
    [key: string]: ValueProducer;
};
export interface AppEnvironment {
    readonly database: Database;
    pushBuilderScreen(name: string, ctx: Context, title: Evaluable, env: RenderEnvironment): void;
    lookupRenderer(name: string): ReactRenderer;
    renderProgress(): React.ReactNode;
    fetchJSON(url: string): Promise<JSONData>;
    alert(message: string): void;
    openURL(url: string): void;
}
export interface RenderFlags {
    inTopLevel?: boolean;
    inTopLevelList?: boolean;
    isRoot?: boolean;
    nestedListKey?: string;
}
export declare function updateRenderFlags(old: RenderFlags, updates: RenderFlags): RenderFlags;
export declare class RenderEnvironment {
    readonly appEnvironment: AppEnvironment;
    readonly flags: RenderFlags;
    constructor(appEnvironment: AppEnvironment, flags: RenderFlags);
    with(flags: RenderFlags): RenderEnvironment;
    readonly isInTopLevel: boolean;
    readonly isInTopLevelList: boolean;
    readonly isRoot: boolean;
    readonly nestedListKey: string;
}
export interface Screen {
    ui: Evaluable;
    ctx: Context;
    title: Evaluable;
}
export {};
