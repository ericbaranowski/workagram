import { Action, Context, EnvironmentBoundEvaluable, RenderEnvironment } from "./Component";
import { DeserializationSpec } from "./deserialization";
export declare class AlertAction extends Action {
    private readonly _message;
    constructor(_message: EnvironmentBoundEvaluable);
    run(ctx: Context, env: RenderEnvironment): void;
    static readonly spec: DeserializationSpec<"action">;
}
export declare class PushBuilderScreenAction extends Action {
    private readonly _name;
    private readonly _ctx;
    private readonly _title;
    constructor(_name: EnvironmentBoundEvaluable, _ctx: EnvironmentBoundEvaluable, _title: EnvironmentBoundEvaluable);
    run(ctx: Context, env: RenderEnvironment): void;
    static readonly spec: DeserializationSpec<"action">;
}
export declare class OpenLinkAction extends Action {
    private readonly _url;
    constructor(_url: EnvironmentBoundEvaluable);
    run(ctx: Context, env: RenderEnvironment): void;
    static readonly spec: DeserializationSpec<"action">;
}
export declare class SetAction extends Action {
    private readonly _lhs;
    private readonly _rhs;
    constructor(_lhs: EnvironmentBoundEvaluable, _rhs: EnvironmentBoundEvaluable);
    run(ctx: Context): void;
    static readonly spec: DeserializationSpec<"action">;
}
export declare function registerActions(): void;
