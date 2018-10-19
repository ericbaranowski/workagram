import { Value } from "./Component";
export declare function evalSummary(title: Value, subtitle: Value | undefined, image: Value | undefined): {
    title: string | undefined;
    subtitle: string | undefined;
    image: string | undefined;
};
export declare function registerPortableUIs(): void;
