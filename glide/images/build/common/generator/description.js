import { panic, defined, assertNever } from "../Support";
export function isPrimitiveType(t) {
    return ["string", "number", "boolean", "uri", "image-uri"].indexOf(t.kind) >= 0;
}
export const numberType = { kind: "number" };
export const stringType = { kind: "string" };
export var PropertyFormat;
(function (PropertyFormat) {
    PropertyFormat["Plain"] = "plain";
    PropertyFormat["Markdown"] = "markdown";
})(PropertyFormat || (PropertyFormat = {}));
export function makeTableRef(tableName) {
    return { kind: "table-ref", tableName };
}
export function getTableColumn(t, name) {
    for (const c of defined(t.columns)) {
        if (c.name === name)
            return c;
    }
    return panic(`Property ${name} not found`);
}
export function filterColumns(t, p) {
    return defined(t.columns).filter(p);
}
export function getStringyColumns(t) {
    return filterColumns(t, c => ["string", "number", "boolean"].indexOf(c.type.kind) >= 0);
}
export function getURIColumns(t) {
    return filterColumns(t, c => ["uri", "image-uri"].indexOf(c.type.kind) >= 0);
}
export function getColumnsOfKind(t, kind) {
    return filterColumns(t, c => c.type.kind === kind);
}
export function primitiveScreenName(table, columnName) {
    return "primitive-" + table.tableName + "-" + columnName;
}
export function classScreenName(type) {
    return "class-" + type.tableName;
}
export function arrayScreenName(itemType) {
    if (itemType.kind === "table-ref") {
        return "array-table-" + itemType.tableName;
    }
    else {
        return "array-primitive-" + itemType.kind;
    }
}
export function compoundTypeScreenName(type) {
    switch (type.kind) {
        case "table-ref":
            return classScreenName(type);
        case "array":
            return arrayScreenName(type.items);
        default:
            return assertNever(type);
    }
}
export function tableColumnScreenName(table, column) {
    if (isPrimitiveType(column.type)) {
        return primitiveScreenName(table, column.name);
    }
    return compoundTypeScreenName(column.type);
}
export function componentName(desc) {
    switch (desc.kind) {
        case "class":
            return classScreenName(desc.type);
        case "array":
            return arrayScreenName(desc.type);
        case "primitive":
            return primitiveScreenName(desc.table, desc.columnName);
        default:
            return assertNever(desc);
    }
}
//# sourceMappingURL=description.js.map