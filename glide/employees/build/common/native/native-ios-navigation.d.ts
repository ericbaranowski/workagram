import React from "react";
import { RenderEnvironment, AppEnvironment } from "../components/Component";
import { NativeGlideScreenProps } from "./native-ui";
import { WebDatabase } from "../WebDatabase";
import { SerializedApp } from "../components/SerializedApp";
export interface NativeAppEnvironment extends AppEnvironment {
    wrapRoot(render: (env: RenderEnvironment) => React.ReactNode): React.ReactNode;
}
interface NativeGlideScreenState {
    serializedApp: SerializedApp;
}
export declare class NativeGlideScreen extends React.Component<NativeGlideScreenProps, NativeGlideScreenState> {
    static getDerivedStateFromProps(newProps: NativeGlideScreenProps): NativeGlideScreenState;
    protected readonly database: WebDatabase;
    constructor(props: NativeGlideScreenProps);
    render(): React.ReactNode;
}
export {};
