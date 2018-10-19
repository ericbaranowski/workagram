import { Database } from "../Database";
import { Screen, Evaluable, Context, UI, EvalEnvironment } from "./Component";
import { SerializedApp } from "./SerializedApp";
export interface EvaluatedScreen {
    title: string;
    ui: UI;
    ctx: Context;
    name: string | undefined;
}
export interface GlideAppState {
    serializedApp: SerializedApp;
    rootScreen: Screen | undefined;
    functions: Map<string, Evaluable>;
}
export interface TopScreenInfo {
    screen: EvaluatedScreen;
    isSubScreen: boolean;
}
export declare function getTopScreen(screenStack: EvaluatedScreen[]): TopScreenInfo | undefined;
export declare function glideAppStateFromProps(props: GlideAppPropsBase, getRootScreen: (props: GlideAppPropsBase, screen: Screen) => Screen): {
    state: GlideAppState;
    evaluatedRoot: EvaluatedScreen | undefined;
};
export declare function evaluateScreen(screen: Screen, env: EvalEnvironment, name: string | undefined): EvaluatedScreen;
export interface GlideAppPropsBase {
    database: Database;
    serializedApp: SerializedApp;
    serial: number;
}
