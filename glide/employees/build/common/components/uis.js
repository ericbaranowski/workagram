import * as React from "react";
import { definedMap } from "collection-utils";
import { defined, nonNull } from "../Support";
import { UI, asValueArray } from "./Component";
export class ReactRenderer {
}
class GlideReactComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = nonNull(GlideReactComponent.getDerivedStateFromProps(props, undefined));
        // console.log("init", this.props, this.state);
    }
    static getDerivedStateFromProps(props, state) {
        // console.log("getDerivedState", props, state);
        if (state !== undefined && state.ui === props.ui && state.context === props.context && state.renv === props.renv)
            return null;
        const valueProducers = props.ui.getValueProducers(props.context);
        return {
            ui: props.ui,
            context: props.context,
            renv: props.renv,
            serial: state !== undefined ? state.serial + 1 : 0,
            valueProducers
        };
    }
    render() {
        return this.props.renderer.renderContent(this.state.valueProducers.map(vp => definedMap(vp, x => x.current)), this.props.context, this.props.renv, this.state.valueProducers);
    }
    subscribeValueProducers(valueProducers) {
        for (const vp of valueProducers) {
            if (vp === undefined)
                continue;
            vp.subscribe(this);
        }
    }
    unsubscribeValueProducers(valueProducers) {
        for (const vp of valueProducers) {
            if (vp === undefined)
                continue;
            vp.unsubscribe(this);
        }
    }
    componentDidMount() {
        // console.log("mount", this.props, this.state);
        this.props.context.subscribe(this);
        this.subscribeValueProducers(this.state.valueProducers);
    }
    componentWillUnmount() {
        // console.log("unmount", this.props, this.state);
        this.props.context.unsubscribe(this);
        this.unsubscribeValueProducers(this.state.valueProducers);
    }
    componentDidUpdate(prevProps, prevState) {
        // console.log("didUpdate", this.props, this.state, prevState);
        if (prevProps.context !== this.props.context) {
            prevProps.context.unsubscribe(this);
            this.props.context.subscribe(this);
        }
        if (prevState.valueProducers !== this.state.valueProducers) {
            this.unsubscribeValueProducers(prevState.valueProducers);
            this.subscribeValueProducers(this.state.valueProducers);
        }
    }
    valueUpdated() {
        // console.log("valueUpdated", this.props, this.state);
        this.setState((state, props) => {
            // console.log("valueUpdated.setState", props, state);
            // this.unsubscribeValueProducers(state.valueProducers);
            const valueProducers = props.ui.getValueProducers(props.context);
            // this.subscribeValueProducers(valueProducers);
            return { serial: state.serial + 1, valueProducers };
        });
    }
}
class ReactUI extends UI {
    constructor(_componentName, ...args) {
        super();
        this._componentName = _componentName;
        this.args = args;
    }
    getValueProducers(context) {
        return this.args.map(a => definedMap(a, x => x.eval(context)));
    }
    render(context, renv) {
        const renderer = renv.appEnvironment.lookupRenderer(this._componentName);
        return (<GlideReactComponent id={Math.floor(Math.random() * 100000)} ui={this} renderer={renderer} context={context} renv={renv}/>);
    }
}
export class LabelUI extends ReactUI {
    static get spec() {
        return ["Label", "ui", ["text", "evaluable"], ["variant", "evaluable", false]];
    }
}
export class ChipUI extends ReactUI {
    static get spec() {
        return ["Chip", "ui", ["text", "evaluable"]];
    }
}
export class RowUI extends ReactUI {
    getValueProducers(context) {
        const [itemsEvaluable] = this.args;
        const items = defined(itemsEvaluable).eval(context);
        return [items, ...asValueArray(items.current)];
    }
    static get spec() {
        return ["Row", "ui", ["children", "evaluable"]];
    }
}
export class ColumnUI extends ReactUI {
    getValueProducers(context) {
        const [itemsEvaluable] = this.args;
        const items = defined(itemsEvaluable).eval(context);
        return [items, ...asValueArray(items.current)];
    }
    static get spec() {
        return ["Column", "ui", ["children", "evaluable"]];
    }
}
export class ClickableUI extends ReactUI {
    static get spec() {
        return ["Clickable", "ui", ["child", "ui"], ["onTap", "action"]];
    }
}
export class ImageUI extends ReactUI {
    static get spec() {
        return ["Image", "ui", ["url", "evaluable"]];
    }
}
export class TextFieldUI extends ReactUI {
    static get spec() {
        return ["TextField", "ui", ["placeholder", "evaluable"], ["text", "evaluable"]];
    }
}
export class MarkdownItemUI extends ReactUI {
    static get spec() {
        return ["MarkdownItem", "ui", ["markdown", "evaluable"], ["caption", "evaluable"]];
    }
}
// FIXME: We can implement this with `If` if we have an `IsNonNull` function.
export class IfNonNullUI extends ReactUI {
    getValueProducers(context) {
        const [dataEvaluable, childEvaluable] = this.args;
        const data = defined(dataEvaluable).eval(context);
        if (data.current === null) {
            return [data];
        }
        return [data, defined(childEvaluable).eval(context)];
    }
    static get spec() {
        return ["IfNonNull", "ui", ["data", "evaluable"], ["child", "ui"]];
    }
}
export class ListUI extends ReactUI {
    static get spec() {
        return ["List", "ui", ["list", "evaluable"], ["item", "ui"]];
    }
}
export class ListItemUI extends ReactUI {
    static get spec() {
        return [
            "ListItem",
            "ui",
            ["title", "evaluable"],
            ["subtitle", "evaluable", false],
            ["image", "evaluable", false],
            ["onTap", "action", false]
        ];
    }
}
export class BigItemUI extends ReactUI {
    static get spec() {
        return [
            "BigItem",
            "ui",
            ["title", "evaluable"],
            ["subtitle", "evaluable", false],
            ["image", "evaluable", false],
            ["onTap", "action", false]
        ];
    }
}
export class TabsUI extends ReactUI {
    // FIXME: We're not subscribing to the tab names, nor to the
    // individual item arrays, nor the UI value producers, actually.
    static get spec() {
        return ["Tabs", "ui", ["items", "evaluable"], ["selected", "evaluable"]];
    }
}
export class HTTPFetchUI extends ReactUI {
    static get spec() {
        return ["HTTPFetch", "ui", ["url", "evaluable"], ["child", "ui"]];
    }
}
export class ShareFetchUI extends ReactUI {
    static get spec() {
        return ["ShareFetch", "ui", ["id", "evaluable"], ["child", "ui"]];
    }
}
//# sourceMappingURL=uis.js.map