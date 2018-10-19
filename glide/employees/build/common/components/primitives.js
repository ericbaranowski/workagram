import { hasOwnProperty } from "collection-utils";
import { panic, defined } from "../Support";
import { asValueObject, SubscribableValueProducer, Callable, asCallable, ChainedEvalEnvironment, BindEnvironmentEvaluable, UI, Action, RecomputingValueProducer, ForwardingValueProducer, asList, asBoolean } from "./Component";
import { makeValueFromJSON, registerDeserializable } from "./deserialization";
export class Data extends SubscribableValueProducer {
    constructor(_current) {
        super();
        this._current = _current;
    }
    get current() {
        return this._current;
    }
    set(v) {
        this._current = v;
        this.updateListeners();
    }
    eval(_context) {
        return this;
    }
    evalInEnvironment(_env, _context) {
        return this;
    }
    static fromJSON(json) {
        return new Data(makeValueFromJSON(json));
    }
    static get spec() {
        return ["Data", "evaluable", ["data", "json"]];
    }
}
export function asData(x) {
    if (x instanceof Data)
        return x;
    return panic("Value is not a Data");
}
class GetContextEvaluable {
    evalInEnvironment(_env, context) {
        return context;
    }
    static get spec() {
        return ["GetContext", "evaluable"];
    }
}
export class EnvironmentBoundValueProducer {
    constructor(_vp) {
        this._vp = _vp;
    }
    eval(_context) {
        return this._vp;
    }
    evalInEnvironment(_env, _context) {
        return this._vp;
    }
}
class ContextBoundCallable extends Callable {
    constructor(_callable, _context) {
        super();
        this._callable = _callable;
        this._context = _context;
    }
    call(args, _context, rootEnv) {
        return this._callable.call(args, this._context, rootEnv);
    }
}
class ContextBoundUI extends UI {
    constructor(_ui, _context) {
        super();
        this._ui = _ui;
        this._context = _context;
    }
    render(_context, renv) {
        return this._ui.render(this._context, renv);
    }
}
class ContextBoundAction extends Action {
    constructor(_action, _context) {
        super();
        this._action = _action;
        this._context = _context;
    }
    run(_context, appEnv) {
        return this._action.run(this._context, appEnv);
    }
}
class BindContextValueProducer extends RecomputingValueProducer {
    constructor(_value, _context) {
        super();
        this._value = _value;
        this._context = _context;
    }
    firstSubscribed() {
        super.firstSubscribed();
        this._value.subscribe(this);
        this._context.subscribe(this);
    }
    lastUnsubscribed() {
        super.lastUnsubscribed();
        this._value.unsubscribe(this);
        this._context.unsubscribe(this);
    }
    recompute() {
        const current = this._value.current;
        if (current instanceof UI) {
            return new ContextBoundUI(current, this._context);
        }
        else if (current instanceof Action) {
            return new ContextBoundAction(current, this._context);
        }
        else if (current instanceof Callable) {
            return new ContextBoundCallable(current, this._context);
        }
        return current;
    }
    set(_v) {
        return panic("Cannot set a BindContext");
    }
}
class BindContextToValueEvaluable {
    constructor(_value, _context) {
        this._value = _value;
        this._context = _context;
    }
    evalInEnvironment(env, context) {
        const valueContext = this._context.evalInEnvironment(env, context);
        return new BindContextValueProducer(this._value.evalInEnvironment(env, valueContext), valueContext);
    }
    static get spec() {
        return ["BindContextToValue", "evaluable", ["value", "evaluable"], ["context", "evaluable"]];
    }
}
class CallValueProducer extends ForwardingValueProducer {
    constructor(_callee, _args, _context, _rootEnv) {
        super();
        this._callee = _callee;
        this._args = _args;
        this._context = _context;
        this._rootEnv = _rootEnv;
    }
    firstSubscribed() {
        super.firstSubscribed();
        this._callee.subscribe(this);
        this._context.subscribe(this);
    }
    lastUnsubscribed() {
        super.lastUnsubscribed();
        this._callee.unsubscribe(this);
        this._context.unsubscribe(this);
    }
    recomputeForwardee() {
        const callee = asCallable(this._callee.current);
        return callee.call(this._args, this._context, this._rootEnv);
    }
}
class CallEvaluable {
    constructor(_callee, _args) {
        this._callee = _callee;
        this._args = _args;
    }
    evalInEnvironment(env, context) {
        return new CallValueProducer(this._callee.evalInEnvironment(env, context), this._args.map(a => new BindEnvironmentEvaluable(a, env)), context, env.root);
    }
    static get spec() {
        return ["Call", "evaluable", ["callee", "evaluable"], ["args", "evaluable-array"]];
    }
}
class LetEvaluable {
    constructor(_bindings, _body) {
        this._bindings = _bindings;
        this._body = _body;
    }
    evalInEnvironment(env, context) {
        const bindings = new Map();
        for (const [n, e] of this._bindings) {
            const vp = e.evalInEnvironment(env, context);
            bindings.set(n, new EnvironmentBoundValueProducer(vp));
        }
        return this._body.evalInEnvironment(new ChainedEvalEnvironment(bindings, env), context);
    }
    static get spec() {
        return ["Let", "evaluable", ["bindings", "bindings"], ["body", "evaluable"]];
    }
}
class GetVariableEvaluable {
    constructor(_name) {
        this._name = _name;
    }
    evalInEnvironment(env, _context) {
        const result = env.get(this._name);
        if (result === undefined) {
            return panic(`Variable not found in environment: ${this._name}`);
        }
        return result.eval(_context);
    }
    static get spec() {
        return ["GetVariable", "evaluable", ["name", "string"]];
    }
}
class GetPropertyValueProducer extends ForwardingValueProducer {
    constructor(_obj, _property, _propagateNull = false) {
        super();
        this._obj = _obj;
        this._property = _property;
        this._propagateNull = _propagateNull;
    }
    firstSubscribed() {
        super.firstSubscribed();
        this._obj.subscribe(this);
    }
    lastUnsubscribed() {
        super.lastUnsubscribed();
        this._obj.unsubscribe(this);
    }
    recomputeForwardee() {
        const maybeObj = this._obj.current;
        if (maybeObj === null) {
            if (this._propagateNull) {
                return undefined;
            }
        }
        const obj = asValueObject(maybeObj);
        // Missing properties are returned as null
        if (!hasOwnProperty(obj, this._property)) {
            return undefined;
        }
        return obj[this._property];
    }
}
class GetPropertyEvaluable {
    constructor(_obj, _property, _propagateNull = false) {
        this._obj = _obj;
        this._property = _property;
        this._propagateNull = _propagateNull;
    }
    evalInEnvironment(env, context) {
        const obj = this._obj.evalInEnvironment(env, context);
        return new GetPropertyValueProducer(obj, this._property, this._propagateNull);
    }
    static get spec() {
        return [
            "GetProperty",
            "evaluable",
            ["object", "evaluable"],
            ["property", "string"],
            ["propagateNull", "boolean", false]
        ];
    }
}
class LookupFunctionEvaluable {
    constructor(_name) {
        this._name = _name;
    }
    evalInEnvironment(env, _context) {
        if (this._func === undefined) {
            this._func = defined(env.lookupUserDefinedComponent(this._name));
        }
        return this._func.evalInEnvironment(env.root, new Data(null));
    }
    static get spec() {
        return ["LookupFunction", "evaluable", ["name", "string"]];
    }
}
class IfValueProducer extends ForwardingValueProducer {
    constructor(_condition, _then, _else, _context) {
        super();
        this._condition = _condition;
        this._then = _then;
        this._else = _else;
        this._context = _context;
    }
    firstSubscribed() {
        super.firstSubscribed();
        this._condition.subscribe(this);
        this._context.subscribe(this);
    }
    lastUnsubscribed() {
        super.lastUnsubscribed();
        this._condition.unsubscribe(this);
        this._context.unsubscribe(this);
    }
    recomputeForwardee() {
        if (this._condition.current !== false) {
            return this._then.eval(this._context);
        }
        else {
            return this._else.eval(this._condition);
        }
    }
}
class IfEvaluable {
    constructor(_condition, _then, _else) {
        this._condition = _condition;
        this._then = _then;
        this._else = _else;
    }
    evalInEnvironment(env, context) {
        return new IfValueProducer(this._condition.evalInEnvironment(env, context), new BindEnvironmentEvaluable(this._then, env), new BindEnvironmentEvaluable(this._else, env), context);
    }
    static get spec() {
        return ["If", "evaluable", ["condition", "evaluable"], ["then", "evaluable"], ["else", "evaluable"]];
    }
}
class SwitchValueProducer extends ForwardingValueProducer {
    constructor(_value, _cases, _fallback, _context) {
        super();
        this._value = _value;
        this._cases = _cases;
        this._fallback = _fallback;
        this._context = _context;
    }
    firstSubscribed() {
        super.firstSubscribed();
        this._value.subscribe(this);
        this._context.subscribe(this);
    }
    lastUnsubscribed() {
        super.lastUnsubscribed();
        this._value.unsubscribe(this);
        this._context.unsubscribe(this);
    }
    recomputeForwardee() {
        const value = this._value.current;
        for (const [comparand, result] of this._cases) {
            const c = comparand.eval(this._context).current;
            if (value === c) {
                return result.eval(this._context);
            }
        }
        return this._fallback.eval(this._context);
    }
}
class SwitchEvaluable {
    constructor(_value, _cases, _fallback) {
        this._value = _value;
        this._cases = _cases;
        this._fallback = _fallback;
    }
    evalInEnvironment(env, context) {
        const cases = this._cases.map(([c, r]) => [
            new BindEnvironmentEvaluable(c, env),
            new BindEnvironmentEvaluable(r, env)
        ]);
        return new SwitchValueProducer(this._value.evalInEnvironment(env, context), cases, new BindEnvironmentEvaluable(this._fallback, env), context);
    }
    static get spec() {
        return ["Switch", "evaluable", ["value", "evaluable"], ["cases", "kvp-array"], ["fallback", "evaluable"]];
    }
}
class MakeListEvaluable {
    constructor(_items) {
        this._items = _items;
    }
    evalInEnvironment(env, context) {
        return new Data(this._items.map(e => e.evalInEnvironment(env, context)));
    }
    static get spec() {
        return ["MakeList", "evaluable", ["items", "evaluable-array"]];
    }
}
class FilterValueProducer extends RecomputingValueProducer {
    constructor(_predicate, _list) {
        super();
        this._predicate = _predicate;
        this._list = _list;
        this._outcomes = [];
    }
    subscribeOutcomes() {
        for (const vp of this._outcomes) {
            vp.subscribe(this);
        }
    }
    unsubscribeOutcomes() {
        for (const vp of this._outcomes) {
            vp.unsubscribe(this);
        }
    }
    firstSubscribed() {
        super.firstSubscribed();
        this._list.subscribe(this);
        this.subscribeOutcomes();
    }
    lastUnsubscribed() {
        super.lastUnsubscribed();
        this._list.unsubscribe(this);
        this.unsubscribeOutcomes();
    }
    recompute() {
        if (this.hasSubscribers) {
            this.unsubscribeOutcomes();
        }
        const outcomes = [];
        const filtered = [];
        for (const item of asList(this._list.current)) {
            const outcome = this._predicate.eval(item);
            outcomes.push(outcome);
            if (asBoolean(outcome.current)) {
                filtered.push(item);
            }
        }
        this._outcomes = outcomes;
        if (this.hasSubscribers) {
            this.subscribeOutcomes();
        }
        return filtered;
    }
    set(_v) {
        return panic("Cannot set a Filter");
    }
}
class FilterEvaluable {
    constructor(_predicate, _list) {
        this._predicate = _predicate;
        this._list = _list;
    }
    evalInEnvironment(env, context) {
        return new FilterValueProducer(new BindEnvironmentEvaluable(this._predicate, env), this._list.evalInEnvironment(env, context));
    }
    static get spec() {
        return ["Filter", "evaluable", ["predicate", "evaluable"], ["list", "evaluable"]];
    }
}
export function registerPrimitives() {
    registerDeserializable(Data);
    registerDeserializable(GetContextEvaluable);
    registerDeserializable(BindContextToValueEvaluable);
    registerDeserializable(LetEvaluable);
    registerDeserializable(CallEvaluable);
    registerDeserializable(GetVariableEvaluable);
    registerDeserializable(GetPropertyEvaluable);
    registerDeserializable(LookupFunctionEvaluable);
    registerDeserializable(IfEvaluable);
    registerDeserializable(SwitchEvaluable);
    registerDeserializable(MakeListEvaluable);
    registerDeserializable(FilterEvaluable);
}
//# sourceMappingURL=primitives.js.map