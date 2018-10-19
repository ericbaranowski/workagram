import React from "react";
import { NavigationContainer } from "react-navigation";
import { SerializedApp } from "./common/components/SerializedApp";
import { Context } from "./common/components/Component";
interface GlideEmbedScreenProps {
    screenName: string;
    context: any;
}
interface GlideEmbedScreenState {
    serializedApp: SerializedApp | undefined;
}
export declare class GlideEmbedScreen extends React.Component<GlideEmbedScreenProps, GlideEmbedScreenState> {
    constructor(props: GlideEmbedScreenProps);
    private generateApp;
    render(): React.ReactNode;
}
export declare function createGlideStackNavigator(): NavigationContainer;
export declare function inferGlideStackNavigator(context: Context): Promise<NavigationContainer>;
export {};
