import * as React from "react";
import { Text, View, TouchableHighlight, Image, TextInput, TabBarIOS, FlatList, ScrollView, StyleSheet, TouchableOpacity, Platform, TouchableNativeFeedback } from "react-native";
import Markdown from "react-native-markdown-renderer";
import { definedMapWithDefault } from "collection-utils";
import { defined, assert, panic } from "../Support";
import { asString, asNumber, asValueArray, asUI, asAction, RenderEnvironment, updateRenderFlags } from "../components/Component";
import { registerUIDeserializable } from "../components/deserialization";
import { evalSummary } from "../components/portable-renderers";
import { LabelUI, RowUI, ColumnUI, ClickableUI, ImageUI, TextFieldUI, ListUI, ListItemUI, BigItemUI, TabsUI, MarkdownItemUI } from "../components/uis";
function wrap(env, render) {
    if (!env.isRoot)
        return render(env);
    if (!(env instanceof NativeRenderEnvironment)) {
        return panic("Render environment must be NativeRenderEnvironment");
    }
    const appEnv = env.appEnvironment;
    return appEnv.wrapRoot(render);
}
class NativeReactRenderer {
    renderContent(values, context, renv, valueProducers) {
        return wrap(renv, env => this.renderNativeContent(values, context, env, valueProducers));
    }
}
class LabelMaterialRenderer extends NativeReactRenderer {
    renderNativeContent([text, variantValue], _context, _env) {
        const variant = definedMapWithDefault(variantValue, "body", asString);
        let style;
        if (variant === "h6") {
            style = styles.textH6;
        }
        return <Text style={style}>{asString(text)}</Text>;
    }
}
class RowMaterialRenderer extends NativeReactRenderer {
    renderNativeContent([_itemsValue, ...items], context, env) {
        return (<View style={{ display: "flex", flexDirection: "row" }}>
                {items.map((v, i) => (<View style={{ flex: 1 }} key={i}>
                        {asUI(v).render(context, env.with({}))}
                    </View>))}
            </View>);
    }
}
class ColumnMaterialRenderer extends NativeReactRenderer {
    renderNativeContent([_itemsValue, ...items], context, env) {
        const children = items.map((v, i) => {
            const nestedListKey = `${env.nestedListKey}+${i}`;
            return (<View style={{ flex: 1 }} key={i}>
                    {asUI(v).render(context, env.with({ inTopLevelList: env.isInTopLevel, nestedListKey }))}
                </View>);
        });
        const style = { display: "flex", flexDirection: "column" };
        if (env.isInTopLevel) {
            return <ScrollView style={style}>{children}</ScrollView>;
        }
        else {
            return <View style={style}>{children}</View>;
        }
    }
}
class ClickableMaterialRenderer extends NativeReactRenderer {
    renderNativeContent([childValue, onTap], ctx, env) {
        const onClick = () => asAction(onTap).run(ctx, env);
        const child = asUI(childValue).render(ctx, env);
        if (Platform.OS === "ios") {
            return <TouchableHighlight onPress={onClick}>{child}</TouchableHighlight>;
        }
        else if (Platform.OS === "android") {
            return <TouchableNativeFeedback onPress={onClick}>{child}</TouchableNativeFeedback>;
        }
        else {
            return panic(`Platform ${Platform.OS} is not supported`);
        }
    }
}
class ImageMaterialRenderer extends NativeReactRenderer {
    renderNativeContent([url], _ctx, _env) {
        return <Image source={{ uri: asString(url) }}/>;
    }
}
class TextFieldMaterialRenderer extends NativeReactRenderer {
    renderNativeContent([label, text], _ctx, _env, [, textValueProducer]) {
        return (<TextInput style={styles.textField} placeholder={asString(label)} value={asString(text)} onChangeText={t => defined(textValueProducer).set(t)}/>);
    }
}
class MarkdownItemMaterialRenderer {
    renderContent([markdown, caption], _ctx, _env) {
        const markdownString = asString(markdown);
        const markdownView = <Markdown>{markdownString}</Markdown>;
        const captionString = asString(caption);
        if (captionString === "") {
            return markdownView;
        }
        return (<View style={{ display: "flex", flexDirection: "column" }}>
                {markdownView}
                <Text>{captionString}</Text>;
            </View>);
    }
}
class ListMaterialRenderer extends NativeReactRenderer {
    renderNativeContent([list, itemUI], _ctx, env) {
        const arr = asValueArray(list);
        const listKey = `list${env.nestedListKey}`;
        return (<FlatList listKey={listKey} data={arr} keyExtractor={(_, i) => i.toString()} renderItem={({ item, index }) => asUI(itemUI).render(item, env.with({
            inTopLevelList: env.isInTopLevel,
            nestedListKey: `${env.nestedListKey}+${index}`
        }))}/>);
    }
}
class ListItemBaseMaterialRenderer extends NativeReactRenderer {
    renderNativeContent([titleValue, subtitleValue, imageValue, onTapValue], ctx, env) {
        const addOuter = (here, style) => {
            if (here) {
                return [style, this.outerStyle];
            }
            else {
                return [style];
            }
        };
        const onTap = onTapValue === null ? undefined : onTapValue;
        const { title, subtitle, image } = evalSummary(titleValue, subtitleValue, imageValue);
        const texts = (<React.Fragment>
                <Text style={this.titleStyle}>{title}</Text>
                <Text style={this.subtitleStyle}>{subtitle}</Text>
            </React.Fragment>);
        let child;
        if (image === undefined) {
            child = <View style={addOuter(onTap === undefined, this.textViewStyle)}>{texts}</View>;
        }
        else {
            child = (<View style={addOuter(onTap === undefined, this.imageTextView)}>
                    <Image style={this.imageStyle} source={{ uri: image }}/>
                    <View style={this.textViewStyle}>{texts}</View>
                </View>);
        }
        if (onTap === undefined) {
            return child;
        }
        else {
            const onClick = () => asAction(onTap).run(ctx, env);
            return (<TouchableOpacity style={this.outerStyle} onPress={onClick}>
                    {child}
                </TouchableOpacity>);
        }
    }
}
class ListItemMaterialRenderer extends ListItemBaseMaterialRenderer {
    constructor() {
        super(...arguments);
        this.titleStyle = styles.listItemTitle;
        this.subtitleStyle = styles.listItemSubtitle;
        this.textViewStyle = styles.listItemTextView;
        this.imageStyle = imageStyles.listItem;
        this.outerStyle = styles.listItemOuter;
        this.imageTextView = styles.listItemImageTextView;
    }
}
class BigItemMaterialRenderer extends ListItemBaseMaterialRenderer {
    constructor() {
        super(...arguments);
        this.titleStyle = styles.bigItemTitle;
        this.subtitleStyle = styles.bigItemSubtitle;
        this.textViewStyle = styles.bigItemTextView;
        this.imageStyle = imageStyles.bigItem;
        this.outerStyle = styles.bigItemOuter;
        this.imageTextView = styles.bigItemImageTextView;
    }
}
class TabsMaterialRenderer {
    renderContent([itemsValue], ctx, renv, [, selectedVP]) {
        const selectedValueProducer = defined(selectedVP);
        const selected = asNumber(selectedValueProducer.current);
        const items = asValueArray(itemsValue).map((itemValue, i) => {
            const itemArray = asValueArray(itemValue.current);
            assert(itemArray.length === 2, "Item arrays for Tabs must have two entries");
            const [nameValue, contentValue] = itemArray;
            const ui = asUI(contentValue.current);
            return (<TabBarIOS.Item key={i} selected={selected === i} title={asString(nameValue.current)} onPress={() => selectedValueProducer.set(i)}>
                    {wrap(renv, env => ui.render(ctx, env))}
                </TabBarIOS.Item>);
        });
        return <TabBarIOS style={{ flex: 1 }}>{items}</TabBarIOS>;
    }
}
export function registerUIs() {
    registerUIDeserializable(LabelUI, new LabelMaterialRenderer());
    registerUIDeserializable(RowUI, new RowMaterialRenderer());
    registerUIDeserializable(ColumnUI, new ColumnMaterialRenderer());
    registerUIDeserializable(ClickableUI, new ClickableMaterialRenderer());
    registerUIDeserializable(ImageUI, new ImageMaterialRenderer());
    registerUIDeserializable(TextFieldUI, new TextFieldMaterialRenderer());
    registerUIDeserializable(MarkdownItemUI, new MarkdownItemMaterialRenderer());
    registerUIDeserializable(ListUI, new ListMaterialRenderer());
    registerUIDeserializable(ListItemUI, new ListItemMaterialRenderer());
    registerUIDeserializable(BigItemUI, new BigItemMaterialRenderer());
    registerUIDeserializable(TabsUI, new TabsMaterialRenderer());
}
const styles = StyleSheet.create({
    listItemOuter: {
        marginHorizontal: 10,
        marginVertical: 5
    },
    listItemImageTextView: {
        display: "flex",
        flexDirection: "row"
    },
    listItemTextView: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
    },
    listItemTitle: {
        fontSize: 18
    },
    listItemSubtitle: {
        color: "darkgray",
        marginTop: 3
    },
    bigItemOuter: {
        marginHorizontal: 10,
        marginVertical: 5
    },
    bigItemImageTextView: {
        display: "flex",
        flexDirection: "row"
    },
    bigItemTextView: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
    },
    bigItemTitle: {
        fontSize: 24
    },
    bigItemSubtitle: {
        color: "darkgray",
        fontSize: 16,
        marginTop: 5
    },
    textField: {
        fontSize: 18,
        margin: 10
    },
    textH6: {
        color: "darkgray",
        fontSize: 20,
        marginTop: 5,
        marginLeft: 10
    }
});
const imageStyles = StyleSheet.create({
    listItem: {
        width: 64,
        height: 64,
        marginRight: 10
    },
    bigItem: {
        width: 128,
        height: 128,
        marginRight: 10
    }
});
export class NativeRenderEnvironment extends RenderEnvironment {
    constructor(appEnvironment, flags, navigator) {
        super(appEnvironment, flags);
        this.appEnvironment = appEnvironment;
        this.flags = flags;
        this.navigator = navigator;
    }
    with(flags) {
        return new NativeRenderEnvironment(this.appEnvironment, updateRenderFlags(this.flags, flags), this.navigator);
    }
}
//# sourceMappingURL=native-ui.js.map