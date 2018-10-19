var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as React from "react";
import { loadShare } from "../Database";
import { Data } from "./primitives";
import { registerUIDeserializable } from "./deserialization";
import { asString, asUI } from "./Component";
import { IfNonNullUI, HTTPFetchUI, ShareFetchUI } from "./uis";
export function evalSummary(title, subtitle, image) {
    const titles = [];
    if (title !== null) {
        titles.push(asString(title));
    }
    if (subtitle !== undefined && subtitle !== null) {
        titles.push(asString(subtitle));
    }
    return {
        title: titles[0],
        subtitle: titles[1],
        image: image !== null && image !== undefined ? asString(image) : undefined
    };
}
class IfNonNullMaterialRenderer {
    renderContent([_data, child], context, env) {
        if (child === undefined) {
            return null;
        }
        return asUI(child).render(context, env);
    }
}
class Fetcher extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        /* tslint:disable-next-line:no-floating-promises */
        this.fetch();
    }
    fetch() {
        return __awaiter(this, void 0, void 0, function* () {
            const json = yield this.props.jsonPromise;
            this.setState({ ctx: Data.fromJSON(json) });
        });
    }
    render() {
        if (this.state.ctx === undefined) {
            return this.props.env.appEnvironment.renderProgress();
        }
        return asUI(this.props.ui).render(this.state.ctx, this.props.env);
    }
}
class HTTPFetchMaterialRenderer {
    renderContent([url, child], _ctx, env) {
        const fetchURL = () => __awaiter(this, void 0, void 0, function* () {
            return yield env.appEnvironment.fetchJSON(asString(url));
        });
        return <Fetcher jsonPromise={fetchURL()} ui={child} env={env}/>;
    }
}
class ShareFetchMaterialRenderer {
    renderContent([id, child], _ctx, env) {
        const db = env.appEnvironment.database;
        function fetchShare() {
            return __awaiter(this, void 0, void 0, function* () {
                const share = yield loadShare(db, asString(id));
                return share.json;
            });
        }
        return <Fetcher jsonPromise={fetchShare()} ui={child} env={env}/>;
    }
}
export function registerPortableUIs() {
    registerUIDeserializable(IfNonNullUI, new IfNonNullMaterialRenderer());
    registerUIDeserializable(HTTPFetchUI, new HTTPFetchMaterialRenderer());
    registerUIDeserializable(ShareFetchUI, new ShareFetchMaterialRenderer());
}
//# sourceMappingURL=portable-renderers.js.map