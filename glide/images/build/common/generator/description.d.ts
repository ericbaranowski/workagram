declare type PrimitiveGlideTypeKind = "string" | "number" | "boolean" | "uri" | "image-uri";
export declare function isPrimitiveType(t: ColumnType): t is PrimitiveGlideType;
export declare const numberType: PrimitiveGlideType;
export declare const stringType: PrimitiveGlideType;
export interface PrimitiveGlideType {
    kind: PrimitiveGlideTypeKind;
}
export interface TableRefGlideType {
    kind: "table-ref";
    tableName: string;
}
export declare type ArrayItemType = PrimitiveGlideType | TableRefGlideType;
export interface ArrayColumnType {
    kind: "array";
    items: ArrayItemType;
}
export declare type ColumnType = PrimitiveGlideType | ArrayColumnType | TableRefGlideType;
declare type ColumnTypeKind = PrimitiveGlideTypeKind | "array" | "table-ref";
export interface TableColumn {
    name: string;
    type: ColumnType;
    isOptional: boolean;
}
export interface TableGlideType {
    name: string;
    columns: TableColumn[];
}
export interface TopLevelType {
    table: TableRefGlideType;
    isArray: boolean;
}
export interface SummaryDescription {
    titleProperty?: string;
    subtitleProperty?: string;
    imageURLProperty?: string;
    linkURLProperty?: string;
}
export declare enum PropertyFormat {
    Plain = "plain",
    Markdown = "markdown"
}
export interface SummaryAndPropertyDescription extends SummaryDescription {
    properties?: PropertyDescription[];
}
export interface SummaryAndDefinedPropertyDescription extends SummaryAndPropertyDescription {
    properties: PropertyDescription[];
}
export interface PropertyDescription extends SummaryDescription {
    propertyName: string;
    caption: string;
    visible: boolean;
    format: PropertyFormat;
    expandedSummary?: SummaryAndPropertyDescription;
}
export declare type ClassScreenFormat = "column" | "tabs";
export interface ClassScreenDescription extends SummaryAndDefinedPropertyDescription {
    kind: "class";
    type: TableRefGlideType;
    format: ClassScreenFormat;
}
export interface PrimitiveScreenDescription {
    kind: "primitive";
    table: TableRefGlideType;
    columnName: string;
}
export interface ArrayScreenDescription extends SummaryAndPropertyDescription {
    kind: "array";
    type: ArrayItemType;
    search: boolean;
}
export declare type ScreenDescription = ClassScreenDescription | PrimitiveScreenDescription | ArrayScreenDescription;
export declare function makeTableRef(tableName: string): TableRefGlideType;
export declare function getTableColumn(t: TableGlideType, name: string): TableColumn;
export declare function filterColumns(t: TableGlideType, p: (c: TableColumn) => boolean): TableColumn[];
export declare function getStringyColumns(t: TableGlideType): TableColumn[];
export declare function getURIColumns(t: TableGlideType): TableColumn[];
export declare function getColumnsOfKind(t: TableGlideType, kind: ColumnTypeKind): TableColumn[];
export declare function primitiveScreenName(table: TableRefGlideType, columnName: string): string;
export declare function classScreenName(type: TableRefGlideType): string;
export declare function arrayScreenName(itemType: ArrayItemType): string;
export declare function compoundTypeScreenName(type: TableRefGlideType | ArrayColumnType): string;
export declare function tableColumnScreenName(table: TableRefGlideType, column: TableColumn): string;
export declare function componentName(desc: ScreenDescription): string;
export {};
