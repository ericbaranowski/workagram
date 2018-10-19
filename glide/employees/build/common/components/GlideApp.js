import { Callable, asString, asUI, RootEvalEnvironment } from "./Component";
import { deserializeApp } from "./deserialization";
import { Data } from "./primitives";
export function getTopScreen(screenStack) {
    if (screenStack.length === 0)
        return undefined;
    return { screen: screenStack[screenStack.length - 1], isSubScreen: screenStack.length > 1 };
}
export function glideAppStateFromProps(props, getRootScreen) {
    // console.log(props.serializedApp);
    // printSubscriptions();
    try {
        const { functions, screen } = deserializeApp(props.serializedApp);
        const rootScreen = getRootScreen(props, screen);
        const evaluatedRoot = evaluateScreen(rootScreen, new RootEvalEnvironment(functions), props.serializedApp.rootScreenName);
        const state = {
            serializedApp: props.serializedApp,
            rootScreen,
            functions,
            lastSerial: props.serial
        };
        return { state, evaluatedRoot };
    }
    catch (e) {
        console.error("Exception when deserializing app", e);
        const state = {
            serializedApp: props.serializedApp,
            rootScreen: undefined,
            functions: new Map(),
            lastSerial: props.serial
        };
        return { state, evaluatedRoot: undefined };
    }
}
export function evaluateScreen(screen, env, name) {
    const maybeTitle = screen.title.evalInEnvironment(env, screen.ctx).current;
    const title = maybeTitle !== null ? asString(maybeTitle) : "Item";
    let uiValueProducer;
    if (screen.ui instanceof Callable) {
        uiValueProducer = screen.ui.call([], new Data(null), env.root);
    }
    else {
        uiValueProducer = screen.ui.evalInEnvironment(env, screen.ctx);
    }
    const ui = asUI(uiValueProducer.current);
    return {
        title,
        ui,
        ctx: screen.ctx,
        name
    };
}
//# sourceMappingURL=GlideApp.js.map