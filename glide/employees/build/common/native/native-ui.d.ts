import { RenderEnvironment, RenderFlags, AppEnvironment } from "../components/Component";
import { EvaluatedScreen } from "../components/GlideApp";
import { SerializedApp } from "../components/SerializedApp";
export declare function registerUIs(): void;
export declare class NativeRenderEnvironment<TAppEnvironment extends AppEnvironment, TNavigator> extends RenderEnvironment {
    readonly appEnvironment: TAppEnvironment;
    readonly flags: RenderFlags;
    readonly navigator: TNavigator | undefined;
    constructor(appEnvironment: TAppEnvironment, flags: RenderFlags, navigator: TNavigator | undefined);
    with(flags: RenderFlags): NativeRenderEnvironment<TAppEnvironment, TNavigator>;
}
export interface NativeViewerGlideScreenBaseProps<TAppEnvironment extends AppEnvironment> {
    screen?: EvaluatedScreen;
    appEnv: TAppEnvironment;
}
export interface NativeGlideScreenProps {
    serializedApp: SerializedApp;
    context?: any;
}
