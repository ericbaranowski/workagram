import { withDefault, definedMap, mapToObject } from "collection-utils";
import { assert, assertNever, panic, defined } from "../Support";
import { getTableColumn, isPrimitiveType, tableColumnScreenName, compoundTypeScreenName, PropertyFormat } from "./description";
function makePrimitive(name, args) {
    return Object.assign({ $kind: name }, args);
}
function makeCall(callee, args) {
    return makePrimitive("Call", { callee, args });
}
function makeFunction(contextName, argNames, body) {
    return makePrimitive("Function", { contextName, argNames, body });
}
function makeGetVariable(name) {
    return makePrimitive("GetVariable", { name });
}
function makeBuiltinCall(name, args) {
    return makeCall(makePrimitive("LookupBuiltin", { name }), args);
}
function makeLookupFunction(name) {
    return makePrimitive("LookupFunction", { name });
}
function makeFunctionCall(callable, args) {
    if (typeof callable === "string") {
        callable = makeLookupFunction(callable);
    }
    return makeCall(callable, args.map(a => (a !== undefined ? a : data(null))));
}
function makeUI(name, args) {
    return Object.assign({ $kind: name }, args);
}
function makeAction(name, args) {
    return Object.assign({ $kind: name }, args);
}
function makeList(items) {
    return makePrimitive("MakeList", { items });
}
function data(v) {
    return { $kind: "Data", data: v };
}
function label(text, variant = "body") {
    return makeUI("Label", { text, variant: data(variant) });
}
function makeLet(bindings, body) {
    return makePrimitive("Let", { bindings, body });
}
function makeColumn(children) {
    return makeUI("Column", {
        children: makeList(children)
    });
}
function makeIfNonNull(ctx, child) {
    return makeUI("IfNonNull", { data: ctx, child });
}
function makeMarkdownItem(markdown, caption) {
    return makeUI("MarkdownItem", { markdown, caption });
}
// const emptyUI = { ui: "Label", text: data(`Nothing to see here`), variant: data("body") };
function listItem(title, subtitle, image, onTap) {
    if (typeof subtitle === "string") {
        subtitle = data(subtitle);
    }
    assert(title !== undefined);
    return makeUI("ListItem", { title, subtitle, image, onTap });
}
function listLength(list) {
    return makeBuiltinCall("ListLength", [list]);
}
function listNth(list, index) {
    return makeBuiltinCall("ListNth", [list, index]);
}
const getContext = makePrimitive("GetContext", {});
function getProperty(property, objectData, propagateNull = false) {
    return makePrimitive("GetProperty", { object: objectData, property, propagateNull });
}
function naiveNumberOfItems(list) {
    return makeFunctionCall("naiveNumberOfItems", [list]);
}
function makeSwitch(value, cases, fallback) {
    return makePrimitive("Switch", {
        value,
        cases,
        fallback
    });
}
function makeBindContextToValue(value, context) {
    if (context === getContext) {
        return value;
    }
    return makePrimitive("BindContextToValue", {
        value,
        context
    });
}
function numberOfItems(list) {
    return makeSwitch(listLength(list), [[data(0), data("none")], [data(1), data("1 item")]], naiveNumberOfItems(list));
}
function openLink(url) {
    return makeAction("OpenLink", { url });
}
function pushBuilderScreen(name, ctx, title) {
    return makeAction("PushBuilderScreen", { name: data(name), ctx, title });
}
// title, subtitle, image, link
function summaryForGlideType(column, sd, ctx) {
    switch (column.kind) {
        case "boolean":
            return [
                makePrimitive("If", { condition: ctx, then: data("Yes"), else: data("No") }),
                data(""),
                undefined,
                undefined
            ];
        case "uri":
            return [data("Link"), undefined, undefined, ctx];
        case "image-uri":
            return [data("Image"), undefined, ctx, undefined];
        case "array":
            return [numberOfItems(ctx), undefined, undefined, undefined];
        case "table-ref": {
            function makeGetProperty(name) {
                return getProperty(name, ctx);
            }
            // FIXME: If our title here is undefined, don't do an entry with
            // "Data" as title and the property name as subtitle, just do the
            // property name as title, no subtitle
            return [
                withDefault(definedMap(sd.titleProperty, makeGetProperty), data("Data")),
                definedMap(sd.subtitleProperty, makeGetProperty),
                definedMap(sd.imageURLProperty, makeGetProperty),
                definedMap(sd.linkURLProperty, makeGetProperty)
            ];
        }
        default:
            if (!isPrimitiveType(column)) {
                return assertNever(column);
            }
            return [ctx, undefined, undefined, undefined];
    }
}
export function makeRoot(topLevelName, content, input) {
    if (input.json !== undefined) {
        return {
            content,
            ctx: data(input.json),
            title: data(topLevelName)
        };
    }
    else if (input.url !== undefined) {
        return {
            content: makeUI("HTTPFetch", {
                url: data(input.url),
                child: content
            }),
            ctx: data({}),
            title: data(topLevelName)
        };
    }
    else if (input.shareID !== undefined) {
        return {
            content: makeUI("ShareFetch", {
                id: data(input.shareID),
                child: content
            }),
            ctx: data({}),
            title: data(topLevelName)
        };
    }
    else {
        return panic("Input is neither JSON nor URL");
    }
}
export function makeReusableComponents() {
    const components = {};
    components.naiveNumberOfItems = makeFunction("_", ["list"], makeBuiltinCall("JoinStrings", [makeList([listLength(makeGetVariable("list")), data(" items")])]));
    /*
    components.smartNumberOfItems = makeFunction(
        "_",
        ["list"],
        makeSwitch(
            listLength(makeGetVariable("list")),
            [[data(0), data("none")], [data(1), data("1 item")]],
            naiveNumberOfItems(makeGetVariable("list"))
        )
    );
    */
    components.smartListItem = makeFunction("list", ["caption", "titleForOne", "imageForOne", "actionForOne", "onTap"], makeSwitch(listLength(makeGetVariable("list")), [
        [data(0), listItem(data("none"), makeGetVariable("caption"), undefined, undefined)],
        [
            data(1),
            makeBindContextToValue(listItem(makeGetVariable("titleForOne"), makeGetVariable("caption"), makeGetVariable("imageForOne"), makeGetVariable("actionForOne")), listNth(makeGetVariable("list"), data(0)))
        ]
    ], listItem(naiveNumberOfItems(makeGetVariable("list")), makeGetVariable("caption"), undefined, makeGetVariable("onTap"))));
    return components;
}
export class AppBuilder {
    constructor(_appDesc) {
        this._appDesc = _appDesc;
        this._screens = new Map();
        this._screensToBuild = [];
    }
    lookupTable(ref) {
        return defined(this._appDesc.tables[ref.tableName]);
    }
    lookupScreen(screenName) {
        this._screensToBuild.push(screenName);
        return makeLookupFunction(screenName);
    }
    callScreen(screenName, ctx) {
        return makeBindContextToValue(this.lookupScreen(screenName), ctx);
    }
    makeAppropriatePushScreen(t, title, ctx) {
        if (isPrimitiveType(t))
            return undefined;
        const screenName = compoundTypeScreenName(t);
        this._screensToBuild.push(screenName);
        return pushBuilderScreen(screenName, ctx, title);
    }
    actionForType(t, caption) {
        if (t.kind === "uri") {
            return openLink(getContext);
        }
        return this.makeAppropriatePushScreen(t, data(caption), getContext);
    }
    entryForTableColumn(t, pd, ctx) {
        if (pd.expandedSummary !== undefined) {
            if (t.type.kind !== "array") {
                return panic(`Trying to expand array, but property ${t.name} has type ${t.type.kind}`);
            }
            return makeBindContextToValue(makeIfNonNull(getContext, makeColumn([label(data(pd.caption), "h6"), this.contentForArray(t.type.items, pd.expandedSummary, false)])), ctx);
        }
        const caption = pd.caption;
        const onTap = this.actionForType(t.type, caption);
        let child;
        if (t.type.kind === "array") {
            const itemType = t.type.items;
            const actionForOne = this.actionForType(itemType, caption);
            const [titleForOne, , imageForOne] = summaryForGlideType(itemType, pd, getContext);
            child = makeFunctionCall(makeLookupFunction("smartListItem"), [
                data(caption),
                titleForOne,
                imageForOne,
                actionForOne,
                onTap
            ]);
        }
        else if (t.type.kind === "string" && pd.format === PropertyFormat.Markdown) {
            child = makeMarkdownItem(getContext, data(caption));
        }
        else {
            const [title, , image] = summaryForGlideType(t.type, pd, getContext);
            if (title === undefined) {
                child = listItem(data(caption), data(""), image, onTap);
            }
            else {
                child = listItem(title, caption, image, onTap);
            }
        }
        const ui = makeIfNonNull(getContext, child);
        return makeBindContextToValue(ui, ctx);
    }
    contentForArray(columnType, itemDesc, search) {
        const [title, subtitle, image] = summaryForGlideType(columnType, itemDesc, getContext);
        const onTap = this.makeAppropriatePushScreen(columnType, title, getContext);
        let item;
        if (itemDesc.properties === undefined) {
            item = listItem(title, subtitle, image, onTap);
        }
        else {
            if (columnType.kind !== "table-ref") {
                return panic(`Trying to build properties for column of type ${columnType.kind}`);
            }
            item = this.contentForColumn(itemDesc, this.lookupTable(columnType));
        }
        if (search) {
            const searchVariable = makeGetVariable("search");
            return makeLet([["search", data("")]], makeColumn([
                makeUI("TextField", {
                    placeholder: data("Search"),
                    text: searchVariable
                }),
                makeUI("List", {
                    list: makePrimitive("Filter", {
                        list: getContext,
                        predicate: makeBuiltinCall("ContainsString", [title, searchVariable])
                    }),
                    item
                })
            ]));
        }
        else {
            return makeUI("List", {
                list: getContext,
                item
            });
        }
    }
    screenForArray(desc, search) {
        return this.contentForArray(desc.type, desc, search);
    }
    screenForPrimitive(desc) {
        const column = getTableColumn(this.lookupTable(desc.table), desc.columnName);
        const [title] = summaryForGlideType(column.type, {}, getContext);
        return label(title);
    }
    contentForColumn(desc, table) {
        const children = [];
        function property(name) {
            return getProperty(name, getContext);
        }
        let item;
        if (desc.titleProperty !== undefined) {
            item = makeUI("BigItem", {
                title: property(desc.titleProperty),
                subtitle: definedMap(desc.subtitleProperty, property),
                image: definedMap(desc.imageURLProperty, property)
            });
        }
        else if (desc.imageURLProperty !== undefined) {
            item = makeUI("Image", { url: property(desc.imageURLProperty) });
        }
        if (item !== undefined) {
            if (desc.linkURLProperty !== undefined) {
                item = makeUI("Clickable", {
                    child: item,
                    onTap: openLink(property(desc.linkURLProperty))
                });
            }
            children.push(item);
        }
        for (const pd of withDefault(desc.properties, [])) {
            if (!pd.visible)
                continue;
            const t = getTableColumn(table, pd.propertyName);
            children.push(this.entryForTableColumn(t, pd, property(pd.propertyName)));
        }
        return makeColumn(children);
    }
    tabContentForProperty(pd, column) {
        if (column.type.kind === "array") {
            return this.contentForArray(column.type.items, defined(pd.expandedSummary), false);
        }
        if (column.type.kind === "table-ref") {
            return this.contentForColumn(defined(pd.expandedSummary), this.lookupTable(column.type));
        }
        return undefined;
    }
    screenForClass(desc) {
        const table = this.lookupTable(desc.type);
        if (desc.format === "tabs") {
            const pairs = [];
            for (const pd of desc.properties) {
                if (!pd.visible)
                    continue;
                const t = getTableColumn(table, pd.propertyName);
                let unboundContent = this.tabContentForProperty(pd, t);
                if (unboundContent === undefined) {
                    unboundContent = this.lookupScreen(tableColumnScreenName(desc.type, t));
                }
                const content = makeBindContextToValue(unboundContent, getProperty(pd.propertyName, getContext));
                pairs.push(makeList([data(pd.caption), defined(content)]));
            }
            return makeLet([["selected", data(0)]], makeUI("Tabs", { items: makeList(pairs), selected: makeGetVariable("selected") }));
        }
        return this.contentForColumn(desc, table);
    }
    makeScreen(screenName) {
        const desc = defined(this._appDesc.screens[screenName]);
        switch (desc.kind) {
            case "class":
                return this.screenForClass(desc);
            case "array":
                return this.screenForArray(desc, desc.search);
            case "primitive":
                return this.screenForPrimitive(desc);
            default:
                return assertNever(desc);
        }
    }
    buildApp() {
        this._screensToBuild.push(this._appDesc.rootScreenName);
        for (;;) {
            const screenName = this._screensToBuild.pop();
            if (screenName === undefined)
                break;
            if (this._screens.has(screenName))
                continue;
            this._screens.set(screenName, this.makeScreen(screenName));
        }
        const components = makeReusableComponents();
        Object.assign(components, mapToObject(this._screens));
        const rootScreen = this.callScreen(this._appDesc.rootScreenName, getContext);
        const root = makeRoot(this._appDesc.topLevelName, rootScreen, this._appDesc.input);
        return Object.assign({}, this._appDesc, { root, components, input: this._appDesc.input });
    }
}
//# sourceMappingURL=builder.js.map