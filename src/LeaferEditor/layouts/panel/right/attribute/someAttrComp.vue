<template>
    <div class="p2">
        <a-row :gutter="[4, 4]" :align="'center'">
            <a-col :span="10">
                <swipeNumber size="small" :precision="0" :label="$t('panelRight.attribute.some.swipeNumber.xLabel')" v-bind="x" />
            </a-col>
            <a-col :span="10">
                <swipeNumber size="small" :precision="0" :label="$t('panelRight.attribute.some.swipeNumber.yLabel')" v-bind="y" />
            </a-col>
            <!--  -->
            <a-col :span="10">
                <swipeNumber size="small" :label="$t('panelRight.attribute.some.swipeNumber.rxLabel')" v-bind="rx">
                </swipeNumber>
            </a-col>
            <a-col :span="10">
                <swipeNumber size="small" :label="$t('panelRight.attribute.some.swipeNumber.ryLabel')" v-bind="ry">
                </swipeNumber>
            </a-col>
            <a-col :span="10">
                <swipeNumber size="small" v-bind="rotation">
                    <template #label>
                        <BxRevision />
                    </template>
                    <template #suffix>
                        <div class="absolute top-1 right-1">°</div>
                    </template>
                </swipeNumber>
            </a-col>
            <a-col :span="8">
                <a-space size="mini">
                    <a-tooltip mini position="bottom">
                        <a-button size="small" @click="mousetrap.trigger('shift+h')">
                            <template #icon>
                                <BxReflectHorizontal />
                            </template>
                        </a-button>
                        <template #content>
                            <TipContentKey :content="$t('panelRight.attribute.some.transform.horizontalFlip')" :keys="['Shift', 'H']" />
                        </template>
                    </a-tooltip>
                    <a-tooltip mini position="bottom">
                        <a-button size="small" @click="mousetrap.trigger('shift+v')">
                            <template #icon>
                                <BxReflectVertical />
                            </template>
                        </a-button>
                        <template #content>
                            <TipContentKey :content="$t('panelRight.attribute.some.transform.verticalFlip')" :keys="['Shift', 'V']" />
                        </template>
                    </a-tooltip>
                </a-space>
            </a-col>
        </a-row>
    </div>
    <a-divider :margin="0" />
    <div class="p2">
        <a-row :gutter="[4, 4]" :align="'center'">
            <a-col>
                <a-tooltip mini position="bottom">
                    <a-button size="small" @click="mousetrap.trigger('mod+g')" long>
                        {{ $t('panelRight.attribute.some.group.button') }}
                    </a-button>
                    <template #content>
                        <TipContentKey :content="$t('panelRight.attribute.some.group.tooltip')" :keys="['mod+g']" />
                    </template>
                </a-tooltip>
            </a-col>
        </a-row>
    </div>
    <a-divider :margin="0" />
    <alignTool />
    <a-divider :margin="0" />
    <layerAttr :title="$t('panelRight.attribute.some.layerAttr.title')" :opacity="opacity" :blendMode="blendMode" :visible="visible"></layerAttr>
</template>
<script setup lang="ts">
import { onBeforeUnmount } from "vue";
import mousetrap from "mousetrap"
import TipContentKey from "../../../components/tooltip";
import BxRevision from "../../../assets/icons/bx-revision.svg";
import BxReflectHorizontal from "../../../assets/icons/bx-reflect-vertical.svg";
import BxReflectVertical from "../../../assets/icons/bx-reflect-horizontal.svg";
import { useLeaferEditor } from '../../../../index';
import { useActiveObjectModel } from "./useActiveObjectModel";
import { toFixed } from "../../../../utils/math";
import swipeNumber from '../../../components/swipeNumber.vue';
import alignTool from "./attrs/alignTool.vue";
import layerAttr from "./attrs/_layerAttr.vue";


const editor = useLeaferEditor();

const x = useActiveObjectModel(editor.app.editor.element!.x, (v: any) => {
    if (!editor.app.editor.element) return;
    editor.app.editor.element!.x = v;
})
const y = useActiveObjectModel(editor.app.editor.element!.y, (v: any) => {
    if (!editor.app.editor.element) return;
    editor.app.editor.element!.y = v;
})

const rx = useActiveObjectModel(editor.app.editor.element!.skewX, (v: any) => {
    if (!editor.app.editor.element) return;
    editor.app.editor.element!.skewX = v;
})
const ry = useActiveObjectModel(editor.app.editor.element!.skewY, (v: any) => {
    if (!editor.app.editor.element) return;
    editor.app.editor.element!.skewY = v;
})

const rotation = useActiveObjectModel(editor.app.editor.element!.rotation, (v: any) => {
    if (!editor.app.editor.element) return;
    editor.app.editor.element!.rotation = v;
})


const everyEqual = (arr: any[], itemKey: string) => {
    return arr.every((item, index, arr) => {
        if (index === 0) return true;
        return item[itemKey] === arr[0][itemKey];
    });
}

const opacity = useActiveObjectModel(everyEqual(editor.selected, 'opacity') ? editor.selected[0]!.opacity : 1, (v: any) => {
    editor.selected.forEach((item) => {
        item.opacity = v;
    });
})
const blendMode = useActiveObjectModel(everyEqual(editor.selected, 'blendMode') ? editor.selected[0]!.blendMode : 'unknown', (v: any) => {
    editor.selected.forEach((item) => {
        item.blendMode = v;
    });
})
const visible = useActiveObjectModel(everyEqual(editor.selected, 'visible') ? editor.selected[0]!.visible : true, (v: any) => {
    editor.selected.forEach((item) => {
        item.visible = v;
    });
})

const setValue = () => {
    x.value.onChange(toFixed(editor.app.editor.element?.x as number, 0));
    y.value.onChange(toFixed(editor.app.editor.element?.y as number, 0));
    rx.value.onChange(editor.app.editor.element?.skewX);
    ry.value.onChange(editor.app.editor.element?.skewY);
    rotation.value.onChange(editor.app.editor.element?.rotation);
}
setValue();
editor.eventBus.on(editor.Events.canvasChange, setValue);
onBeforeUnmount(() => {
    editor.eventBus.off(editor.Events.canvasChange, setValue);
});

</script>

<style scoped>
svg {
    display: inline-block;
    vertical-align: -3.5px;
    width: 20px;
    height: 20px;
    touch-action: none;
    text-align: center;
    fill: currentColor;
}
</style>