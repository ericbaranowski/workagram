import "firebase/firestore";
import { Database } from "./Database";
export declare class WebDatabase implements Database {
    private readonly _db;
    constructor();
    addSharePayload(payload: string): Promise<string>;
    getSharePayload(id: string): Promise<string>;
    setApp(_collectionName: string, _id: string, _appString: string): Promise<void>;
    getApp(collectionName: string, id: string): Promise<string>;
    setAppMetadata(_collectionName: string, _id: string, _metadataString: string): Promise<void>;
    getAppMetadata(_collectionName: string, _id: string): Promise<string>;
    listAppMetadatas(collectionName: string): Promise<[string, string][]>;
}
