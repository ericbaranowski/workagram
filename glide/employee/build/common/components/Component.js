import { definedMap, withDefault } from "collection-utils";
import { assert, defined, panic } from "../Support";
export class UnsubscribableValueProducer {
    set(_v) {
        return panic("Cannot set an UnsubscribableValueProducer");
    }
    subscribe(_l) {
        return;
    }
    unsubscribe(_l) {
        return;
    }
}
// let totalSubscribers = 0;
// const subscriptions: [ValueProducer, ValueListener][] = [];
// function checkTotalSubscribers(): void {
//     if (totalSubscribers % 10 === 0) {
//         console.log("total subscribers", totalSubscribers);
//     }
// }
// function printSubscription(event: string, producer: any, listener: any): void {
//     console.log(`${event} producer ${producer.id} listener ${listener.id}`);
// }
// function addSubscription(producer: ValueProducer, listener: ValueListener): void {
//     totalSubscribers++;
//     printSubscription("subscribed", producer, listener);
//     subscriptions.push([producer, listener]);
//     checkTotalSubscribers();
// }
// function removeSubscription(producer: ValueProducer, listener: ValueListener): void {
//     totalSubscribers--;
//     printSubscription("unsubscribed", producer, listener);
//     for (let i = 0; i < subscriptions.length; i++) {
//         const [p, l] = subscriptions[i];
//         if (p !== producer || l !== listener) continue;
//         const x = defined(subscriptions.pop());
//         if (i < subscriptions.length) {
//             subscriptions[i] = x;
//         }
//         checkTotalSubscribers();
//         return;
//     }
//     console.error("removeSubscription didn't find subscription", producer, listener);
// }
// export function printSubscriptions(): void {
//     console.log("subscriptions");
//     for (const [p, l] of subscriptions) {
//         if ((l as any)._listeners === undefined) {
//             console.log("producer", p, "listener", l);
//         }
//     }
// }
const printUpdates = false;
let updateListenersCalled = 0;
let listenersIterated = 0;
let listenersUpdated = 0;
let listenerFunctionsCalled = 0;
let listenerValuesUpdated = 0;
const listenersUpdatedSet = new Set();
let resetScheduled = false;
function printAndResetListenerCounts() {
    if (printUpdates) {
        console.log("updateListenersCalled", updateListenersCalled);
        console.log("listenersIterated", listenersIterated);
        console.log("listenersUpdated", listenersUpdated);
        console.log("listenerFunctionsCalled", listenerFunctionsCalled);
        console.log("listenerValuesUpdated", listenerValuesUpdated);
        console.log("unique listeners", listenersUpdatedSet.size);
    }
    updateListenersCalled = 0;
    listenersIterated = 0;
    listenersUpdated = 0;
    listenerFunctionsCalled = 0;
    listenerValuesUpdated = 0;
    listenersUpdatedSet.clear();
    resetScheduled = false;
}
export class SubscribableValueProducer {
    constructor() {
        // this.id = Math.floor(Math.random() * 100000);
    }
    updateListeners() {
        if (!resetScheduled) {
            assert(updateListenersCalled === 0);
            setTimeout(printAndResetListenerCounts, 0);
            resetScheduled = true;
        }
        updateListenersCalled++;
        if (this._listeners === undefined)
            return;
        const listeners = this._listeners.slice();
        for (const l of listeners) {
            listenersIterated++;
            if (l === undefined)
                continue;
            listenersUpdated++;
            if (typeof l === "function") {
                listenerFunctionsCalled++;
                l();
            }
            else {
                listenerValuesUpdated++;
                listenersUpdatedSet.add(l);
                l.valueUpdated();
            }
        }
    }
    get hasSubscribers() {
        return this._listeners !== undefined;
    }
    firstSubscribed() {
        // console.log(`first subscribed ${this.id}`, this);
        return;
    }
    lastUnsubscribed() {
        // console.log(`last unsubscribed ${this.id}`, this);
        return;
    }
    subscribe(l) {
        // addSubscription(this, l);
        let listeners = this._listeners;
        if (listeners === undefined) {
            listeners = this._listeners = [];
            this.firstSubscribed();
        }
        listeners.push(l);
    }
    unsubscribe(l) {
        const listeners = this._listeners;
        if (listeners !== undefined) {
            for (let i = 0; i < listeners.length; i++) {
                if (listeners[i] !== l)
                    continue;
                const last = listeners.pop();
                if (i < listeners.length) {
                    listeners[i] = defined(last);
                }
                if (listeners.length === 0) {
                    this._listeners = undefined;
                    this.lastUnsubscribed();
                }
                // removeSubscription(this, l);
                return;
            }
        }
        console.error("Unbalanced unsubscribe");
    }
}
export class ForwardingValueProducer extends SubscribableValueProducer {
    constructor() {
        super(...arguments);
        // null means not computed yet
        this._currentForwardee = null;
        this.forwardeeUpdated = () => this.updateListeners();
    }
    firstSubscribed() {
        super.firstSubscribed();
        if (this._currentForwardee === null || this._currentForwardee === undefined)
            return;
        this._currentForwardee.subscribe(this.forwardeeUpdated);
    }
    lastUnsubscribed() {
        super.lastUnsubscribed();
        if (this._currentForwardee === null || this._currentForwardee === undefined)
            return;
        this._currentForwardee.unsubscribe(this.forwardeeUpdated);
    }
    getCurrentForwardee() {
        if (this._currentForwardee === null) {
            const newForwardee = this.recomputeForwardee();
            if (this.hasSubscribers && newForwardee !== undefined) {
                newForwardee.subscribe(this.forwardeeUpdated);
            }
            this._currentForwardee = newForwardee;
        }
        return this._currentForwardee;
    }
    get current() {
        const forwardee = this.getCurrentForwardee();
        if (forwardee === undefined)
            return null;
        return forwardee.current;
    }
    valueUpdated() {
        const newForwardee = this.recomputeForwardee();
        if (newForwardee === this._currentForwardee)
            return;
        if (this._currentForwardee !== undefined && this._currentForwardee !== null) {
            this._currentForwardee.unsubscribe(this.forwardeeUpdated);
        }
        this._currentForwardee = newForwardee;
        if (this.hasSubscribers && this._currentForwardee !== undefined) {
            this._currentForwardee.subscribe(this.forwardeeUpdated);
        }
        this.updateListeners();
    }
    set(v) {
        const forwardee = this.getCurrentForwardee();
        if (forwardee === undefined) {
            console.error(`Trying to set an invalid value`);
            return;
        }
        forwardee.set(v);
    }
}
export class RecomputingValueProducer extends SubscribableValueProducer {
    get current() {
        if (this.currentValue === undefined) {
            this.currentValue = this.recompute();
        }
        return this.currentValue;
    }
    valueUpdated() {
        const newCurrent = this.recompute();
        if (newCurrent === this.currentValue)
            return;
        this.updateListeners();
    }
}
export class DependingRecomputingValueProducer extends RecomputingValueProducer {
    constructor() {
        super(...arguments);
        this.dependeeUpdated = () => {
            const newValue = this.recomputeFromValues(defined(this._dependees).map(vp => vp.current));
            if (this.currentValue === newValue)
                return;
            this.currentValue = newValue;
            this.updateListeners();
        };
    }
    subscribeDependees(dependees) {
        for (const d of dependees) {
            d.subscribe(this.dependeeUpdated);
        }
    }
    firstSubscribed() {
        super.firstSubscribed();
        if (this._dependees === undefined)
            return;
        this.subscribeDependees(this._dependees);
    }
    unsubscribeDependees(dependees) {
        for (const d of dependees) {
            d.unsubscribe(this.dependeeUpdated);
        }
    }
    lastUnsubscribed() {
        super.lastUnsubscribed();
        if (this._dependees === undefined)
            return;
        this.unsubscribeDependees(this._dependees);
    }
    recompute() {
        if (this.hasSubscribers && this._dependees !== undefined) {
            this.unsubscribeDependees(this._dependees);
        }
        this._dependees = this.getDependees();
        if (this.hasSubscribers) {
            this.subscribeDependees(this._dependees);
        }
        return this.recomputeFromValues(defined(this._dependees).map(vp => vp.current));
    }
}
export class RootEvalEnvironment {
    constructor(_userDefinedComponents) {
        this._userDefinedComponents = _userDefinedComponents;
    }
    lookupUserDefinedComponent(name) {
        return this._userDefinedComponents.get(name);
    }
    get root() {
        return this;
    }
    get(_name) {
        return undefined;
    }
}
export class ChainedEvalEnvironment {
    constructor(_bindings, _next) {
        this._bindings = _bindings;
        this._next = _next;
    }
    lookupUserDefinedComponent(name) {
        return this._next.lookupUserDefinedComponent(name);
    }
    get root() {
        return this._next.root;
    }
    get(name) {
        const result = this._bindings.get(name);
        if (result !== undefined)
            return result;
        return this._next.get(name);
    }
}
export class Callable extends UnsubscribableValueProducer {
    get current() {
        return this;
    }
    evalInEnvironment(_env, _context) {
        return this;
    }
}
export class BindEnvironmentEvaluable {
    constructor(_evaluable, _env) {
        this._evaluable = _evaluable;
        this._env = _env;
    }
    eval(context) {
        return this._evaluable.evalInEnvironment(this._env, context);
    }
    evalInEnvironment(_env, context) {
        return this.eval(context);
    }
}
export class UI extends UnsubscribableValueProducer {
    get current() {
        return this;
    }
    evalInEnvironment(_env, _context) {
        return this;
    }
}
export class UIEvaluable extends Callable {
    constructor(_uiClass, _args) {
        super();
        this._uiClass = _uiClass;
        this._args = _args;
    }
    evalInEnvironment(env, _context) {
        return new this._uiClass(this._uiClass.spec[0], ...this._args.map(a => definedMap(a, d => new BindEnvironmentEvaluable(d, env))));
    }
    call(args, context, rootEnv) {
        assert(args.length === 0, "UI with arguments cannot be called with arguments");
        return this.evalInEnvironment(rootEnv, context);
    }
}
export class Action extends UnsubscribableValueProducer {
    get current() {
        return this;
    }
    evalInEnvironment(_env, _context) {
        return this;
    }
}
export class ActionEvaluable extends Callable {
    constructor(_actionClass, _args) {
        super();
        this._actionClass = _actionClass;
        this._args = _args;
    }
    evalInEnvironment(env, _context) {
        return new this._actionClass(...this._args.map(a => definedMap(a, d => new BindEnvironmentEvaluable(d, env))));
    }
    call(args, context, rootEnv) {
        assert(args.length === 0, "Action with arguments cannot be called with arguments");
        return this.evalInEnvironment(rootEnv, context);
    }
}
export function asList(v) {
    if (Array.isArray(v))
        return v;
    console.error("not an array", v);
    return panic("Value is not an array");
}
export function asNumber(v) {
    if (typeof v === "number")
        return v;
    return panic("Value is not a number");
}
export function asBoolean(v) {
    if (typeof v === "boolean")
        return v;
    return panic("Value is not a boolean");
}
export function asString(x) {
    if (typeof x === "string")
        return x;
    if (typeof x === "number")
        return x.toString();
    // console.log("not a string", x);
    // FIXME: panic?
    return "🔥?🔥";
}
export function asCallable(v) {
    if (!(v instanceof Callable)) {
        return panic("Tried to call an uncallable object");
    }
    return v;
}
export function asUI(v) {
    if (!(v instanceof UI)) {
        return panic("Value is not a UI");
    }
    return v;
}
export function asAction(v) {
    if (!(v instanceof Action)) {
        return panic("Value is not an Action");
    }
    return v;
}
export function asValueArray(v) {
    if (!Array.isArray(v)) {
        return panic("Value is not an array");
    }
    return v;
}
export function asValueObject(v) {
    if (typeof v !== "object" ||
        v === null ||
        Array.isArray(v) ||
        v instanceof Callable ||
        v instanceof UI ||
        v instanceof Action) {
        console.error(v);
        return panic("Value is not an object");
    }
    return v;
}
export function updateRenderFlags(old, updates) {
    return Object.assign({ nestedListKey: old.nestedListKey }, updates);
}
export class RenderEnvironment {
    constructor(appEnvironment, flags) {
        this.appEnvironment = appEnvironment;
        this.flags = flags;
    }
    with(flags) {
        return new RenderEnvironment(this.appEnvironment, updateRenderFlags(this.flags, flags));
    }
    get isInTopLevel() {
        return this.flags.inTopLevel === true;
    }
    get isInTopLevelList() {
        return this.flags.inTopLevelList === true;
    }
    get isRoot() {
        return this.flags.isRoot === true;
    }
    get nestedListKey() {
        return withDefault(this.flags.nestedListKey, "");
    }
}
//# sourceMappingURL=Component.js.map