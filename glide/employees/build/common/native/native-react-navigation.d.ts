import React from "react";
import { NavigationContainer } from "react-navigation";
import { SerializedApp } from "../components/SerializedApp";
import { Database } from "../Database";
import { NativeGlideScreenProps } from "./native-ui";
export declare function navigatorForGlideApp(serializedApp: SerializedApp, database: Database): NavigationContainer;
export declare class NativeGlideScreen extends React.Component<NativeGlideScreenProps> {
    private readonly database;
    render(): React.ReactNode;
}
