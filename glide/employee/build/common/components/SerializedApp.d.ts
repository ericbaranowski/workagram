import { ScreenDescription, TableGlideType } from "../generator/description";
interface SerializedComponent {
    readonly $kind: string;
    readonly [arg: string]: SerializedComponent | any;
}
export interface SerializedRoot {
    readonly content: SerializedComponent;
    readonly ctx: SerializedComponent;
    readonly title: SerializedComponent;
}
export interface BaseAppDescription {
    readonly topLevelName: string;
    readonly rootScreenName: string;
    readonly screens: {
        [name: string]: ScreenDescription;
    };
    readonly tables: {
        [name: string]: TableGlideType;
    };
}
export interface GeneratorInput {
    json?: unknown;
    url?: string;
    shareID?: string;
}
export interface AppDescription extends BaseAppDescription {
    readonly input: GeneratorInput;
}
export interface SerializedApp extends AppDescription {
    readonly root: SerializedRoot;
    readonly components?: {
        [name: string]: SerializedComponent;
    };
}
export declare function serializedAppWithRootContext(serializedApp: SerializedApp, ctx: any): SerializedApp;
export {};
