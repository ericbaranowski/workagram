import { panic, assert, defined } from "../Support";
import { Callable, asList, asNumber, asString, asValueObject, RecomputingValueProducer, DependingRecomputingValueProducer, ForwardingValueProducer, ChainedEvalEnvironment } from "./Component";
import { EnvironmentBoundValueProducer, Data } from "./primitives";
import { registerDeserializable } from "./deserialization";
class FunctionCallable extends Callable {
    constructor(_contextName, _argNames, _body) {
        super();
        this._contextName = _contextName;
        this._argNames = _argNames;
        this._body = _body;
    }
    call(args, context, rootEnv) {
        const numArgs = args.length;
        assert(numArgs === this._argNames.length);
        const bindings = new Map();
        bindings.set(this._contextName, new EnvironmentBoundValueProducer(context));
        for (let i = 0; i < numArgs; i++) {
            bindings.set(this._argNames[i], args[i]);
        }
        return this._body.evalInEnvironment(new ChainedEvalEnvironment(bindings, rootEnv), context);
    }
    static get spec() {
        return ["Function", "callable", ["contextName", "string"], ["argNames", "string-array"], ["body", "evaluable"]];
    }
}
const builtinFunctions = new Map();
function registerBuiltinFunction(name, builtin) {
    assert(!builtinFunctions.has(name), `Function ${name} registered more than once`);
    builtinFunctions.set(name, builtin);
}
class LookupBuiltinCallable extends Callable {
    constructor(name) {
        super();
        this._builtin = defined(builtinFunctions.get(name));
    }
    call(args, context, rootEnv) {
        return this._builtin.call(args, context, rootEnv);
    }
    static get spec() {
        return ["LookupBuiltin", "callable", ["name", "string"]];
    }
}
class BuiltinCallable extends Callable {
    constructor(_valueProducerClass) {
        super();
        this._valueProducerClass = _valueProducerClass;
    }
    call(args, context) {
        return new this._valueProducerClass(...args.map(a => a.eval(context)));
    }
}
class JoinStringsValueProducer extends DependingRecomputingValueProducer {
    constructor(_stringList) {
        super();
        this._stringList = _stringList;
    }
    firstSubscribed() {
        super.firstSubscribed();
        this._stringList.subscribe(this);
    }
    lastUnsubscribed() {
        super.lastUnsubscribed();
        this._stringList.unsubscribe(this);
    }
    getDependees() {
        return asList(this._stringList.current);
    }
    recomputeFromValues(values) {
        return values.map(asString).join("");
    }
    set(_v) {
        return panic("Cannot set a JoinStrings");
    }
}
class ListLengthValueProducer extends RecomputingValueProducer {
    constructor(_list) {
        super();
        this._list = _list;
    }
    firstSubscribed() {
        super.firstSubscribed();
        this._list.subscribe(this);
    }
    lastUnsubscribed() {
        super.lastUnsubscribed();
        this._list.unsubscribe(this);
    }
    recompute() {
        return asList(this._list.current).length;
    }
    set(_v) {
        return panic("Cannot set a ListLength");
    }
}
class ListNthValueProducer extends ForwardingValueProducer {
    constructor(_list, _index) {
        super();
        this._list = _list;
        this._index = _index;
    }
    firstSubscribed() {
        super.firstSubscribed();
        this._list.subscribe(this);
        this._index.subscribe(this);
    }
    lastUnsubscribed() {
        super.lastUnsubscribed();
        this._list.unsubscribe(this);
        this._index.unsubscribe(this);
    }
    recomputeForwardee() {
        const l = asList(this._list.current);
        const i = asNumber(this._index.current);
        return l[i];
    }
}
class ListFromObjectValueProducer extends RecomputingValueProducer {
    constructor(_obj) {
        super();
        this._obj = _obj;
    }
    firstSubscribed() {
        super.firstSubscribed();
        this._obj.subscribe(this);
    }
    lastUnsubscribed() {
        super.lastUnsubscribed();
        this._obj.unsubscribe(this);
    }
    recompute() {
        const o = asValueObject(this._obj.current);
        const list = [];
        for (const name of Object.getOwnPropertyNames(o)) {
            list.push(new Data({ name: new Data(name), value: o[name] }));
        }
        return list;
    }
    set(_v) {
        return panic("Cannot set a ListFromObject");
    }
}
class AddValueProducer extends RecomputingValueProducer {
    constructor(_a, _b) {
        super();
        this._a = _a;
        this._b = _b;
    }
    firstSubscribed() {
        super.firstSubscribed();
        this._a.subscribe(this);
        this._b.subscribe(this);
    }
    lastUnsubscribed() {
        super.lastUnsubscribed();
        this._a.unsubscribe(this);
        this._b.unsubscribe(this);
    }
    recompute() {
        return asNumber(this._a.current) + asNumber(this._b.current);
    }
    set(_v) {
        return panic("Cannot set an Add");
    }
}
class ContainsStringValueProducer extends RecomputingValueProducer {
    constructor(_haystack, _needle) {
        super();
        this._haystack = _haystack;
        this._needle = _needle;
    }
    firstSubscribed() {
        super.firstSubscribed();
        this._haystack.subscribe(this);
        this._needle.subscribe(this);
    }
    lastUnsubscribed() {
        super.lastUnsubscribed();
        this._haystack.unsubscribe(this);
        this._needle.unsubscribe(this);
    }
    recompute() {
        const haystack = asString(this._haystack.current).toLowerCase();
        const needle = asString(this._needle.current).toLowerCase();
        return haystack.includes(needle);
    }
    set(_v) {
        return panic("Cannot set a ContainsString");
    }
}
export function registerFunctions() {
    registerDeserializable(FunctionCallable);
    registerDeserializable(LookupBuiltinCallable);
    registerBuiltinFunction("JoinStrings", new BuiltinCallable(JoinStringsValueProducer));
    registerBuiltinFunction("ListLength", new BuiltinCallable(ListLengthValueProducer));
    registerBuiltinFunction("ListNth", new BuiltinCallable(ListNthValueProducer));
    registerBuiltinFunction("ListFromObject", new BuiltinCallable(ListFromObjectValueProducer));
    registerBuiltinFunction("Add", new BuiltinCallable(AddValueProducer));
    registerBuiltinFunction("ContainsString", new BuiltinCallable(ContainsStringValueProducer));
}
//# sourceMappingURL=functions.js.map