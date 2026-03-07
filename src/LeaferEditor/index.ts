import { markRaw, type App } from "vue";
import { LeaferEditorSingleton, type LeaferEditor } from "./core";
import type {
    ILeaferEditor,
    LeaferEditorOptions,
    IContextMenuPluginService,
    IShortcutPluginService,
    IGridLinePluginService,
} from "./core/interfaces";
// import { TestPrint } from "./plugins";
import {
    ShortcutPlugin,
    ContextMenuPlugin,
    GridLinePlugin,
    GridLinePluginServiceName,
    ShortcutPluginServiceName,
    ContextMenuPluginServiceName
} from "./core/plugins";

export { setLocale, getLocale } from "./core/i18n";


let leaferEditorInstance: LeaferEditor | null = null;

function newLeaferEditor(options?: LeaferEditorOptions) {
    if (leaferEditorInstance) {
        return;
    }
    leaferEditorInstance = new LeaferEditorSingleton(options);
    leaferEditorInstance.use(new GridLinePlugin(), {
        strokeColor: leaferEditorInstance.options.gridStrokeColor,
        strokeDragColor: leaferEditorInstance.options.gridStrokeDragColor,
    })
    leaferEditorInstance.use(new ShortcutPlugin())
    leaferEditorInstance.use(new ContextMenuPlugin())
    // leaferEditorInstance.use(new TestPrint(), { "test": "test1" })
}

export function createLeaferEditor() {
    return markRaw({
        install(app: App, options?: LeaferEditorOptions) {
            newLeaferEditor(options)
            app.provide('leaferEditor', leaferEditorInstance);
        }
    })
}

export function useLeaferEditor(): LeaferEditor {
    if (!leaferEditorInstance) {
        throw new Error('LeaferEditor instance is not created yet');
    }
    return leaferEditorInstance;
}

export function useLeaferEditorShortcutPluginService(): IShortcutPluginService {
    const leaferEditor = useLeaferEditor();
    const plugin = leaferEditor.getService(ShortcutPluginServiceName) as IShortcutPluginService;
    if (!plugin) {
        throw new Error('ShortcutPlugin is not installed');
    }
    return plugin;
}

export function useLeaferEditorContextMenuPluginService(): IContextMenuPluginService {
    const leaferEditor = useLeaferEditor();
    const plugin = leaferEditor.getService(ContextMenuPluginServiceName) as IContextMenuPluginService;
    if (!plugin) {
        throw new Error('ContextMenuPlugin is not installed');
    }
    return plugin;
}

export function useLeaferEditorGridLinePluginService(): IGridLinePluginService {
    const leaferEditor = useLeaferEditor();
    const plugin = leaferEditor.getService(GridLinePluginServiceName) as IGridLinePluginService;
    if (!plugin) {
        throw new Error('GridLinePlugin is not installed');
    }
    return plugin;
}