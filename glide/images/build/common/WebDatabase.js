var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as firebase from "firebase/app";
import "firebase/firestore";
import { panic } from "./Support";
import { glideSharesCollectionName } from "./Database";
const FirebaseConfigGlide = {
    apiKey: "AIzaSyCdlydoa5aGY9eVkZODhJFbD_lx_q7Pmks",
    authDomain: "glide-prod.firebaseapp.com",
    projectId: "glide-prod",
    databaseURL: "https://glide-prod.firebaseio.com",
    storageBucket: "glide-prod.appspot.com"
};
export class WebDatabase {
    constructor() {
        // Sometimes multiple instances are created of this class,
        // but we can only initialize firebase once.
        if (firebase.apps.length === 0) {
            firebase.initializeApp(FirebaseConfigGlide);
        }
        // Initialize Cloud Firestore through Firebase
        this._db = firebase.firestore();
        // Disable deprecated features
        this._db.settings({
            timestampsInSnapshots: true
        });
    }
    addSharePayload(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield this._db.collection(glideSharesCollectionName).add({ payload });
            return doc.id;
        });
    }
    getSharePayload(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield this._db
                .collection(glideSharesCollectionName)
                .doc(id)
                .get();
            const data = doc.data();
            if (data === undefined) {
                return panic("Could not load share");
            }
            return data.payload;
        });
    }
    setApp(_collectionName, _id, _appString) {
        return __awaiter(this, void 0, void 0, function* () {
            return panic("setApp not implemented in app driver");
        });
    }
    getApp(collectionName, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield this._db
                .collection(collectionName)
                .doc(id)
                .get();
            const data = doc.data();
            if (data === undefined) {
                return panic(`Could not load app ${id}`);
            }
            return data.app;
        });
    }
    setAppMetadata(_collectionName, _id, _metadataString) {
        return __awaiter(this, void 0, void 0, function* () {
            return panic("setAppMetadata not implemented in app driver");
        });
    }
    getAppMetadata(_collectionName, _id) {
        return __awaiter(this, void 0, void 0, function* () {
            return panic("getAppMetadata not implemented in app driver");
        });
    }
    listAppMetadatas(collectionName) {
        return __awaiter(this, void 0, void 0, function* () {
            const querySnapshot = yield this._db.collection(collectionName).get();
            const metadatas = [];
            querySnapshot.forEach(doc => {
                const data = doc.data();
                const metadata = data.metadata;
                if (metadata === undefined)
                    return;
                metadatas.push([doc.id, metadata]);
            });
            return metadatas;
        });
    }
}
//# sourceMappingURL=WebDatabase.js.map