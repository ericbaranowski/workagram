import * as React from "react";
import { UI, Context, RenderEnvironment, EnvironmentBoundEvaluable, ValueProducers, Value } from "./Component";
import { DeserializationSpec } from "./deserialization";
export declare abstract class ReactRenderer {
    abstract renderContent(values: (Value | undefined)[], context: Context, env: RenderEnvironment, valueProducers: ValueProducers): React.ReactNode;
}
declare abstract class ReactUI extends UI {
    private readonly _componentName;
    protected readonly args: (EnvironmentBoundEvaluable | undefined)[];
    constructor(_componentName: string, ...args: (EnvironmentBoundEvaluable | undefined)[]);
    getValueProducers(context: Context): ValueProducers;
    render(context: Context, renv: RenderEnvironment): React.ReactNode;
}
export declare class LabelUI extends ReactUI {
    static readonly spec: DeserializationSpec<"ui">;
}
export declare class ChipUI extends ReactUI {
    static readonly spec: DeserializationSpec<"ui">;
}
export declare class RowUI extends ReactUI {
    getValueProducers(context: Context): ValueProducers;
    static readonly spec: DeserializationSpec<"ui">;
}
export declare class ColumnUI extends ReactUI {
    getValueProducers(context: Context): ValueProducers;
    static readonly spec: DeserializationSpec<"ui">;
}
export declare class ClickableUI extends ReactUI {
    static readonly spec: DeserializationSpec<"ui">;
}
export declare class ImageUI extends ReactUI {
    static readonly spec: DeserializationSpec<"ui">;
}
export declare class TextFieldUI extends ReactUI {
    static readonly spec: DeserializationSpec<"ui">;
}
export declare class MarkdownItemUI extends ReactUI {
    static readonly spec: DeserializationSpec<"ui">;
}
export declare class IfNonNullUI extends ReactUI {
    getValueProducers(context: Context): ValueProducers;
    static readonly spec: DeserializationSpec<"ui">;
}
export declare class ListUI extends ReactUI {
    static readonly spec: DeserializationSpec<"ui">;
}
export declare class ListItemUI extends ReactUI {
    static readonly spec: DeserializationSpec<"ui">;
}
export declare class BigItemUI extends ReactUI {
    static readonly spec: DeserializationSpec<"ui">;
}
export declare class TabsUI extends ReactUI {
    static readonly spec: DeserializationSpec<"ui">;
}
export declare class HTTPFetchUI extends ReactUI {
    static readonly spec: DeserializationSpec<"ui">;
}
export declare class ShareFetchUI extends ReactUI {
    static readonly spec: DeserializationSpec<"ui">;
}
export {};
