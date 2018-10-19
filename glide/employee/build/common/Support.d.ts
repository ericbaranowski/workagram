export declare function checkBoolean(x: unknown): boolean;
export declare function checkString(x: unknown): string;
export declare function panic(message?: string): never;
export declare function assert(fact: boolean, message?: string): void;
export declare function assertNever(_never: never): never;
export declare function defined<T>(v: T | undefined): T;
export declare function nonNull<T>(v: T | null): T;
