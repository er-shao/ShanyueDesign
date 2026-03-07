<script setup lang="ts">
import { ref, onUnmounted, h } from 'vue';
import { isDefined } from "@vueuse/core";
import { isNumber } from "lodash";
import mousetrap from "mousetrap"
import TipContentKey from "../../components/tooltip";

import { toFixed } from "../../../utils/math";
import { Input } from '@arco-design/web-vue'
import contextMenu from '../../components/contextMenu'
import { useLeaferEditor } from '../../../index';
import type { ButtonInstance } from "@arco-design/web-vue/es/button";
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const editor = useLeaferEditor();

const zoom = ref(editor.currentScale);
const onClick = () => {
    editor.zoom('fit');
    zoom.value = editor.currentScale;
}
const inputValue = ref<string>(`${toFixed(editor.currentScale * 100, 2)}%`)
const button = ref<ButtonInstance>()
const openMenu = (e: MouseEvent) => {
    let x = e.clientX
    let y = e.clientY
    if (isDefined(button)) {
        const rect = button.value?.$el.getBoundingClientRect()
        x = Math.max(rect.x - 8, 0)
        y = rect.y + rect.height + 4
    }
    contextMenu.showContextMenu({
        x,
        y,
        preserveIconWidth: false,
        items: [
            {
                customRender: () =>
                    h(
                        'div',
                        {
                            class: 'p2',
                        },
                        h(
                            Input,
                            {
                                size: 'small',
                                modelValue: inputValue.value,
                                'onUpdate:modelValue': (value: string) => {
                                    inputValue.value = value
                                },
                                onChange: (value) => {
                                    const zoom = parseInt(value as unknown as string)
                                    if (!isNumber(zoom) || Number.isNaN(zoom)) return
                                    editor.zoom(zoom / 100);
                                },
                            },
                            {},
                        ),
                    ),
            },
            {
                label: t("header.zoom.percent50"),
                onClick: () => {
                    editor.zoom(.5);
                },
            },
            {
                label: t("header.zoom.percent100"),
                onClick: () => {
                    mousetrap.trigger('mod+1')
                },
                shortcut: `mod+1`,
            },
            {
                label: t("header.zoom.percent200"),
                onClick: () => {
                    editor.zoom(2);
                },
                divided: true,
            },
            {
                label: t("header.zoom.zoomIn"),
                onClick: () => {
                    editor.zoom("in");
                },
                shortcut: `+`,
            },
            {
                label: t("header.zoom.zoomOut"),
                onClick: () => {
                    editor.zoom("out");
                },
                shortcut: `-`,
            },
        ],
    })
}


const onChangeZoom = (scale: number) => {
    zoom.value = scale;
    inputValue.value = `${toFixed(scale * 100, 2)}%`
}
editor.eventBus.on(editor.Events.canvasZoomChange, onChangeZoom);
onUnmounted(() => {
    editor.eventBus.off(editor.Events.canvasZoomChange, onChangeZoom);
});
</script>

<template>
    <a-tooltip effect="dark" content="自适应画布" mini>
        <a-button ref="button" class="icon-btn px2!" @click="onClick">
            <icon-fullscreen />
        </a-button>
        <template #content>
            <TipContentKey content="自适应画布" :keys="['mod+0']" />
        </template>
    </a-tooltip>
    <a-button ref="button" class="icon-btn w110px" @click="openMenu">
        {{ toFixed(zoom * 100, 2) }}%
        <icon-down class="ml1" />
    </a-button>
</template>

<style scoped lang="less"></style>
