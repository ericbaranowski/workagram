import { ClassScreenDescription, ArrayScreenDescription, PrimitiveScreenDescription, TableColumn, PropertyDescription } from "./description";
import { AppDescription, SerializedApp, GeneratorInput } from "../components/SerializedApp";
export interface AppPart {
    [key: string]: unknown;
}
export declare function makeRoot(topLevelName: string, content: AppPart, input: GeneratorInput): AppPart;
export declare function makeReusableComponents(): {
    [name: string]: AppPart;
};
export declare class AppBuilder {
    private readonly _appDesc;
    private readonly _screens;
    private readonly _screensToBuild;
    constructor(_appDesc: AppDescription);
    private lookupTable;
    private lookupScreen;
    private callScreen;
    private makeAppropriatePushScreen;
    private actionForType;
    entryForTableColumn(t: TableColumn, pd: PropertyDescription, ctx: AppPart): AppPart;
    private contentForArray;
    screenForArray(desc: ArrayScreenDescription, search: boolean): AppPart;
    screenForPrimitive(desc: PrimitiveScreenDescription): AppPart;
    private contentForColumn;
    private tabContentForProperty;
    screenForClass(desc: ClassScreenDescription): AppPart;
    makeScreen(screenName: string): AppPart;
    buildApp(): SerializedApp;
}
