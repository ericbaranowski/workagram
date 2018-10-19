import { registerPrimitives } from "./primitives";
import { registerFunctions } from "./functions";
import { registerActions } from "./actions";
import { registerPortableUIs } from "./portable-renderers";
export function registerPortableComponents() {
    registerPrimitives();
    registerFunctions();
    registerActions();
    registerPortableUIs();
}
//# sourceMappingURL=registerAll.js.map