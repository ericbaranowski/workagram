import { asString, Action } from "./Component";
import { registerActionDeserializable } from "./deserialization";
export class AlertAction extends Action {
    constructor(_message) {
        super();
        this._message = _message;
    }
    run(ctx, env) {
        const message = asString(this._message.eval(ctx).current);
        env.appEnvironment.alert(message);
    }
    static get spec() {
        return ["Alert", "action", ["message", "evaluable"]];
    }
}
export class PushBuilderScreenAction extends Action {
    constructor(_name, _ctx, _title) {
        super();
        this._name = _name;
        this._ctx = _ctx;
        this._title = _title;
    }
    run(ctx, env) {
        env.appEnvironment.pushBuilderScreen(asString(this._name.eval(ctx).current), this._ctx.eval(ctx), this._title, env);
    }
    static get spec() {
        return ["PushBuilderScreen", "action", ["name", "evaluable"], ["ctx", "evaluable"], ["title", "evaluable"]];
    }
}
export class OpenLinkAction extends Action {
    constructor(_url) {
        super();
        this._url = _url;
    }
    run(ctx, env) {
        env.appEnvironment.openURL(asString(this._url.eval(ctx).current));
    }
    static get spec() {
        return ["OpenLink", "action", ["url", "evaluable"]];
    }
}
export class SetAction extends Action {
    constructor(_lhs, _rhs) {
        super();
        this._lhs = _lhs;
        this._rhs = _rhs;
    }
    run(ctx) {
        const lhs = this._lhs.eval(ctx);
        const rhs = this._rhs.eval(ctx);
        lhs.set(rhs.current);
    }
    static get spec() {
        return ["Set", "action", ["lhs", "evaluable"], ["rhs", "evaluable"]];
    }
}
export function registerActions() {
    registerActionDeserializable(AlertAction);
    registerActionDeserializable(PushBuilderScreenAction);
    registerActionDeserializable(OpenLinkAction);
    registerActionDeserializable(SetAction);
}
//# sourceMappingURL=actions.js.map