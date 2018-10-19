var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { assert } from "./Support";
export const glideSharesCollectionName = "shares";
export const glideAppsCollectionName = "glide-apps-v1";
export const glideAppsMetadataCollectionName = "glide-apps-v1-metadata";
function loadShareState(db, id) {
    return __awaiter(this, void 0, void 0, function* () {
        const payload = yield db.getSharePayload(id);
        return JSON.parse(payload);
    });
}
// FIXME: Technically we'd have to cache by database, but this
// is just a hack anyway.
// https://github.com/quicktype/glide/issues/1
const shareCache = {};
export function saveShare(db, share) {
    return __awaiter(this, void 0, void 0, function* () {
        const rootState = {
            sourcePad: {
                sources: [
                    {
                        topLevelName: share.name,
                        samples: [
                            {
                                source: JSON.stringify(share.json)
                            }
                        ]
                    }
                ]
            }
        };
        return yield db.addSharePayload(JSON.stringify(rootState));
    });
}
export function loadShare(db, id) {
    return __awaiter(this, void 0, void 0, function* () {
        if (shareCache[id] !== undefined) {
            return shareCache[id];
        }
        const state = yield loadShareState(db, id);
        const sources = state.sourcePad.sources;
        assert(sources.length === 1, `Number of sources must be 1, but is ${sources.length}`);
        const source = sources[0];
        assert(source.samples.length === 1, `Number of samples must be 1, but is ${source.samples.length}`);
        const share = {
            name: source.topLevelName,
            json: JSON.parse(source.samples[0].source)
        };
        shareCache[id] = share;
        return share;
    });
}
export function saveApp(db, id, app) {
    return __awaiter(this, void 0, void 0, function* () {
        yield db.setApp(glideAppsCollectionName, id, JSON.stringify(app));
        return `https://app.heyglide.com/app.html?app=${id}`;
    });
}
export function serializedAppFromAppString(appString) {
    return JSON.parse(appString);
}
export function serializedAppTitle(app) {
    const serializedTitle = app.root.title;
    // FIXME: deserialize
    if (serializedTitle.value === "Data" && typeof serializedTitle.data === "string") {
        return serializedTitle.data;
    }
    return undefined;
}
export function loadApp(db, id) {
    return __awaiter(this, void 0, void 0, function* () {
        const appString = yield db.getApp(glideAppsCollectionName, id);
        return serializedAppFromAppString(appString);
    });
}
export function saveAppMetadata(db, id, metadata) {
    return __awaiter(this, void 0, void 0, function* () {
        yield db.setAppMetadata(glideAppsMetadataCollectionName, id, JSON.stringify(metadata));
    });
}
export function loadAppMetadata(db, id) {
    return __awaiter(this, void 0, void 0, function* () {
        const metadataString = yield db.getAppMetadata(glideAppsMetadataCollectionName, id);
        if (metadataString === undefined)
            return undefined;
        return JSON.parse(metadataString);
    });
}
export function listAppMetadatas(db) {
    return __awaiter(this, void 0, void 0, function* () {
        const map = new Map();
        for (const [id, json] of yield db.listAppMetadatas(glideAppsMetadataCollectionName)) {
            map.set(id, JSON.parse(json));
        }
        return map;
    });
}
//# sourceMappingURL=Database.js.map