var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import React from "react";
import { NavigatorIOS, Alert, ActivityIndicator } from "react-native";
import { glideAppStateFromProps, evaluateScreen } from "../components/GlideApp";
import { RootEvalEnvironment } from "../components/Component";
import { defined, panic } from "../Support";
import { lookupReactRenderer } from "../components/deserialization";
import { NativeRenderEnvironment } from "./native-ui";
import { WebDatabase } from "../WebDatabase";
import { serializedAppWithRootContext } from "../components/SerializedApp";
import { definedMapWithDefault } from "collection-utils";
class NativeIOSViewerGlideScreen extends React.Component {
    render() {
        console.log("rendering iOS content");
        const renv = new NativeRenderEnvironment(this.props.appEnv, { inTopLevel: true }, this.props.navigator);
        if (this.props.renderNode !== undefined) {
            return this.props.renderNode(renv);
        }
        const screen = defined(this.props.screen);
        return screen.ui.render(screen.ctx, renv);
    }
}
class NativeIOSViewerGlideApp extends React.Component {
    constructor(props) {
        super(props);
        console.log("making state");
        const { state, evaluatedRoot } = glideAppStateFromProps(this.props, (_, screen) => screen);
        this.state = Object.assign({}, state, { initialScreen: evaluatedRoot });
        console.log("done initing");
    }
    get database() {
        return this.props.database;
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
    wrapRoot(renderNode) {
        return (<NavigatorIOS initialRoute={{
            component: NativeIOSViewerGlideScreen,
            title: "Glide App",
            passProps: {
                renderNode,
                appEnv: this
            }
        }} style={{ flex: 1 }} translucent={false}/>);
    }
    pushBuilderScreen(name, ctx, title, env) {
        const ui = defined(this.state.functions.get(name));
        const rootEnv = new RootEvalEnvironment(this.state.functions);
        const screen = evaluateScreen({ ui, ctx, title }, rootEnv, undefined);
        this.pushScreen(screen, env);
    }
    pushScreen(screen, env) {
        if (!(env instanceof NativeRenderEnvironment)) {
            return panic("Must have a native render environment");
        }
        defined(env.navigator).push({
            component: NativeIOSViewerGlideScreen,
            title: screen.title,
            passProps: { screen, appEnv: this }
        });
    }
    popScreen() {
        return;
    }
    render() {
        console.log("rendering NativeIOSViewerGlideApp");
        const initialScreen = this.state.initialScreen;
        if (initialScreen === undefined)
            return null;
        return initialScreen.ui.render(initialScreen.ctx, new NativeRenderEnvironment(this, { isRoot: true }, undefined));
    }
}
export class NativeGlideScreen extends React.Component {
    constructor(props) {
        super(props);
        this.database = new WebDatabase();
        this.state = NativeGlideScreen.getDerivedStateFromProps(props);
    }
    static getDerivedStateFromProps(newProps) {
        const serializedApp = definedMapWithDefault(newProps.context, newProps.serializedApp, ctx => serializedAppWithRootContext(newProps.serializedApp, ctx));
        return { serializedApp };
    }
    render() {
        return <NativeIOSViewerGlideApp database={this.database} serializedApp={this.state.serializedApp} serial={0}/>;
    }
}
//# sourceMappingURL=native-ios-navigation.js.map