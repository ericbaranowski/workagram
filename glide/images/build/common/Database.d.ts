import { SerializedApp } from "./components/SerializedApp";
interface Sample {
    source: string;
}
interface Source {
    topLevelName: string;
    samples: Sample[];
}
interface SourcePadState {
    sources: Source[];
}
export interface RootState {
    sourcePad: SourcePadState;
}
export interface QuicktypeShare {
    name: string;
    json: unknown;
}
export interface AppMetadata {
    title?: string;
    createdAt: number;
}
export interface Database {
    addSharePayload(payload: string): Promise<string>;
    getSharePayload(id: string): Promise<string>;
    setApp(collectionName: string, id: string, appString: string): Promise<void>;
    getApp(collectionName: string, id: string): Promise<string>;
    setAppMetadata(collectionName: string, id: string, metadataString: string): Promise<void>;
    getAppMetadata(collectionName: string, id: string): Promise<string | undefined>;
    listAppMetadatas(collectionName: string): Promise<[string, string][]>;
}
export declare const glideSharesCollectionName = "shares";
export declare const glideAppsCollectionName = "glide-apps-v1";
export declare const glideAppsMetadataCollectionName = "glide-apps-v1-metadata";
export declare function saveShare(db: Database, share: QuicktypeShare): Promise<string>;
export declare function loadShare(db: Database, id: string): Promise<QuicktypeShare>;
export declare function saveApp(db: Database, id: string, app: SerializedApp): Promise<string>;
export declare function serializedAppFromAppString(appString: string): SerializedApp;
export declare function serializedAppTitle(app: SerializedApp): string | undefined;
export declare function loadApp(db: Database, id: string): Promise<SerializedApp>;
export declare function saveAppMetadata(db: Database, id: string, metadata: AppMetadata): Promise<void>;
export declare function loadAppMetadata(db: Database, id: string): Promise<AppMetadata | undefined>;
export declare function listAppMetadatas(db: Database): Promise<Map<string, AppMetadata>>;
export {};
