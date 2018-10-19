var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import React from "react";
import { Alert, ActivityIndicator } from "react-native";
import { createStackNavigator } from "react-navigation";
import { serializedAppWithRootContext } from "../components/SerializedApp";
import { glideAppStateFromProps, evaluateScreen } from "../components/GlideApp";
import { RootEvalEnvironment } from "../components/Component";
import { defined, panic } from "../Support";
import { lookupReactRenderer } from "../components/deserialization";
import { NativeRenderEnvironment } from "./native-ui";
import { WebDatabase } from "../WebDatabase";
import { definedMapWithDefault } from "collection-utils";
class ViewerScreen extends React.Component {
    render() {
        console.log("rendering iOS content");
        let props;
        if (this.props.screen !== undefined) {
            props = this.props;
        }
        else {
            props = defined(this.props.navigation.getParam("props"));
        }
        const renv = new NativeRenderEnvironment(props.appEnv, { inTopLevel: true }, this.props.navigation);
        if (props.screen === undefined) {
            console.log(JSON.stringify(Object.getOwnPropertyNames(this.props)));
            return panic("screen is not defined");
        }
        const screen = defined(props.screen);
        return screen.ui.render(screen.ctx, renv);
    }
}
ViewerScreen.navigationOptions = ({ navigation }) => {
    const props = defined(navigation.getParam("props"));
    return { title: props.screen.title };
};
function evaluateApp(serializedApp, database) {
    const { state, evaluatedRoot } = glideAppStateFromProps({ serializedApp, database, serial: 0 }, (_, screen) => screen);
    const appEnv = new NativeAppEnvironment(state, database);
    return { glideAppState: state, evaluatedRoot, appEnv, waitingForGeneratedApp: false };
}
function getContext(props) {
    const maybeContext = props.navigation.getParam("context");
    if (maybeContext !== undefined) {
        return maybeContext;
    }
    if (props.screenProps !== undefined) {
        return props.screenProps.context;
    }
    return undefined;
}
class RootScreen extends React.Component {
    static getDerivedStateFromProps(newProps) {
        return evaluateApp(newProps.serializedApp, newProps.database);
    }
    constructor(props) {
        super(props);
        // The state will get initialized properly right away via getDerivedStateFromProps.
        // If we don't do this assignment, React Native will complain with a warning.
        this.state = {};
    }
    // FIXME: set title once we're evaluated:
    // https://reactnavigation.org/docs/en/navigation-prop.html#setparams-make-changes-to-route-params
    render() {
        if (this.state.evaluatedRoot !== undefined) {
            return (<ViewerScreen appEnv={defined(this.state.appEnv)} screen={this.state.evaluatedRoot} navigation={this.props.navigation}/>);
        }
        return <ActivityIndicator size="large"/>;
    }
}
class NativeAppEnvironment {
    // FIXME: We really only need the functions.  Do we have to pass the whole GlideAppState?
    constructor(_glideAppState, database) {
        this._glideAppState = _glideAppState;
        this.database = database;
    }
    lookupRenderer(name) {
        return lookupReactRenderer(name);
    }
    alert(message) {
        Alert.alert("Alert", message);
    }
    fetchJSON(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(url);
            return yield response.json();
        });
    }
    renderProgress() {
        return <ActivityIndicator size="large"/>;
    }
    openURL(url) {
        console.log("opening url", url);
    }
    pushBuilderScreen(name, ctx, title, env) {
        const ui = defined(this._glideAppState.functions.get(name));
        const rootEnv = new RootEvalEnvironment(this._glideAppState.functions);
        const screen = evaluateScreen({ ui, ctx, title }, rootEnv, undefined);
        this.pushScreen(screen, env);
    }
    pushScreen(screen, env) {
        if (!(env instanceof NativeRenderEnvironment)) {
            return panic("Must have a native render environment");
        }
        const nativeEnv = env;
        defined(nativeEnv.navigator).push("generic", {
            props: {
                screen: defined(screen),
                appEnv: this
            }
        });
    }
    popScreen() {
        return;
    }
}
function rootGlideScreen(serializedApp, database) {
    class RootWrapper extends React.Component {
        static getDerivedStateFromProps(newProps) {
            const sa = definedMapWithDefault(getContext(newProps), serializedApp, ctx => serializedAppWithRootContext(serializedApp, ctx));
            return { serializedApp: sa };
        }
        constructor(props) {
            super(props);
            this.state = RootWrapper.getDerivedStateFromProps(props);
        }
        render() {
            return (<RootScreen database={database} serializedApp={this.state.serializedApp} navigation={this.props.navigation} screenProps={this.props.screenProps}/>);
        }
    }
    return RootWrapper;
}
export function navigatorForGlideApp(serializedApp, database) {
    return createStackNavigator({
        root: {
            screen: rootGlideScreen(serializedApp, database)
        },
        generic: {
            screen: ViewerScreen
        }
    }, { initialRouteName: "root" });
}
export class NativeGlideScreen extends React.Component {
    constructor() {
        super(...arguments);
        this.database = new WebDatabase();
    }
    render() {
        const navigator = navigatorForGlideApp(this.props.serializedApp, this.database);
        return React.createElement(navigator, { screenProps: { context: this.props.context } });
    }
}
//# sourceMappingURL=native-react-navigation.js.map