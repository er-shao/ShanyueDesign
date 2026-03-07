<script setup lang="ts">
import { ref, onUnmounted, watch, shallowRef } from 'vue';

import TipContentKey from "../../components/tooltip";
import dropdownButton from "../../components/dropdownButton.vue";
import { useLeaferEditor, useLeaferEditorGridLinePluginService } from '../../../index';
const editor = useLeaferEditor();
const gridLineService = useLeaferEditorGridLinePluginService();
const isShow = ref(gridLineService.gridLinesIsShow());
const isEnableGridLineDraggable = ref(gridLineService.isEnableGridLineDraggable);

const sky = shallowRef(editor.skyFrame);
watch(() => sky.value.proxyData!.hittable, (value) => {
    isEnableGridLineDraggable.value = value as boolean;
})

const onClick = () => {
    if (isEnableGridLineDraggable.value) {
        gridLineService.disableGridLineDraggable();
        isEnableGridLineDraggable.value = false;
        return
    }
    if (gridLineService.gridLines.length === 0) return
    if (gridLineService.gridLinesIsShow()) {
        gridLineService.gridLinesHide()
        isShow.value = false
    } else {
        gridLineService.gridLinesShow()
        isShow.value = true
    }
}

const onSelect = (value: string | number | Record<string, any> | undefined, ev: Event) => {
    if (value === 'on') {
        const ok = gridLineService.enableGridLineDraggable();
        if (!ok) return
        gridLineService.gridLinesShow()
        isShow.value = true
        isEnableGridLineDraggable.value = true;
    } else if (value === 'off') {
        const ok = gridLineService.disableGridLineDraggable();
        if (!ok) return
        isEnableGridLineDraggable.value = false;
    } else if (value === 'clear') {
        gridLineService.clearGridLines()
        isShow.value = false
        isEnableGridLineDraggable.value = false;
    }
}

const onPageChange = () => {
    isShow.value = gridLineService.gridLinesIsShow()
    isEnableGridLineDraggable.value = gridLineService.isEnableGridLineDraggable
    sky.value = editor.skyFrame
}
editor.eventBus.on(editor.Events.pageChangeAfter, onPageChange)
onUnmounted(() => {
    editor.eventBus.off(editor.Events.pageChangeAfter, onPageChange)
})
</script>

<template>
    <a-space>
        <dropdownButton @select="onSelect">
            <a-tooltip mini position="bottom" effect="dark">
                <a-button :type="isShow ? 'text' : 'secondary'" class="icon-btn pd-5px" @click="onClick">
                    <!-- <component class="m0px" :is="item.icon"  /> -->
                    <div class="i-svg:gridlines icon"></div>
                </a-button>
                <template #content>
                    <TipContentKey :content="isEnableGridLineDraggable ? $t('header.gridlines.disable') : $t('header.gridlines.showOrHide')"
                        :keys="isEnableGridLineDraggable ? [] : ['H']" />
                </template>
            </a-tooltip>
            <template #content>
                <a-doption value="on" :disabled="isEnableGridLineDraggable">
                    {{ $t('header.gridlines.enable') }}
                </a-doption>
                <a-doption value="off" :disabled="!isEnableGridLineDraggable">
                    {{ $t('header.gridlines.disable') }}
                </a-doption>
                <a-doption value="clear">
                    {{ $t('header.gridlines.clear') }}
                </a-doption>
            </template>
        </dropdownButton>
    </a-space>

</template>

<style scoped lang="less">
svg {
    display: inline-block;
    touch-action: none;
    text-align: center;
}

.icon {
    width: 18px;
    height: 18px;
    fill: currentColor;
    // stroke: #6cf !important;
}
</style>
