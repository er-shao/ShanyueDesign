<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useLeaferEditor } from '../../../../../index';
import SwipeNumber from '../../../../components/swipeNumber.vue';
import { useActiveObjectModel } from "../useActiveObjectModel";


const editor = useLeaferEditor();

const width = useActiveObjectModel(editor.currentPage.width, (v: any) => {
    editor.currentPage.width = v;
})
const height = useActiveObjectModel(editor.currentPage.height, (v: any) => {
    editor.currentPage.height = v;
})
const overflowCheck = ref(!editor.currentPage.overflowShow)
watch(overflowCheck, (v) => {
    editor.currentPage.overflowShow = !v;
})

const setValue = () => {
    width.value.onChange(editor.currentPage.width);
    height.value.onChange(editor.currentPage.height);
    overflowCheck.value = !editor.currentPage.overflowShow
}
setValue();
editor.eventBus.on(editor.Events.pageChangeAfter, setValue);
editor.eventBus.on(editor.Events.undoRedoStackChange, setValue);
editor.eventBus.on(editor.Events.canvasResize, setValue);
onBeforeUnmount(() => {
    editor.eventBus.off(editor.Events.pageChangeAfter, setValue);
    editor.eventBus.off(editor.Events.undoRedoStackChange, setValue);
    editor.eventBus.off(editor.Events.canvasResize, setValue);
});
</script>

<template>
    <div class="p2">
        <a-row :gutter="[4, 4]" :align="'center'">
            <a-col :span="10">
                <SwipeNumber size="small" :min="1" :precision="0" label="W" v-bind="width" />
            </a-col>
            <a-col :span="10">
                <SwipeNumber size="small" :min="1" :precision="0" label="H" v-bind="height" />
            </a-col>
            <a-col :span="16">
                <a-checkbox v-model="overflowCheck">{{ $t('panelRight.attribute.canvas.overflowHidden') }}</a-checkbox>
            </a-col>
        </a-row>
    </div>
</template>

<style scoped lang="less"></style>
