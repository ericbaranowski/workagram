var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import React from "react";
import { ActivityIndicator } from "react-native";
import { hasOwnProperty } from "collection-utils";
import { NativeGlideScreen } from "./common/native/native-ios-navigation";
import { navigatorForGlideApp } from "./common/native/native-react-navigation";
import { registerPortableComponents } from "./common/components/registerAll";
import { registerUIs } from "./common/native/native-ui";
import screens from "./screens.json";
import { WebDatabase } from "./common/WebDatabase";
import { defined } from "./common/Support";
let didInit = false;
function initIfNecessary() {
    if (didInit)
        return;
    registerPortableComponents();
    registerUIs();
    didInit = true;
}
function generateApp(screenName, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch("https://us-central1-glide-prod.cloudfunctions.net/inferScreenForComponent", {
            method: "POST",
            body: JSON.stringify({ screenName, inputJSON: context }),
            headers: {
                "Content-Type": "application/json"
            }
        });
        const { serializedApp } = yield response.json();
        return serializedApp;
    });
}
export class GlideEmbedScreen extends React.Component {
    constructor(props) {
        super(props);
        initIfNecessary();
        const { screenName } = props;
        let serializedApp;
        if (hasOwnProperty(screens, screenName)) {
            serializedApp = screens[screenName];
        }
        else {
            /* tslint:disable-next-line:no-floating-promises */
            this.generateApp();
        }
        this.state = { serializedApp };
    }
    generateApp() {
        return __awaiter(this, void 0, void 0, function* () {
            const { context, screenName } = this.props;
            this.setState({ serializedApp: yield generateApp(screenName, context) });
        });
    }
    render() {
        const { serializedApp } = this.state;
        if (serializedApp !== undefined) {
            return <NativeGlideScreen serializedApp={serializedApp} context={this.props.context}/>;
        }
        return <ActivityIndicator size="large"/>;
    }
}
export function createGlideStackNavigator() {
    initIfNecessary();
    return navigatorForGlideApp(defined(screens.main), new WebDatabase());
}
export function inferGlideStackNavigator(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const serializedApp = yield generateApp("main", context);
        initIfNecessary();
        return navigatorForGlideApp(serializedApp, new WebDatabase());
    });
}
//# sourceMappingURL=GlideEmbedScreen.js.map