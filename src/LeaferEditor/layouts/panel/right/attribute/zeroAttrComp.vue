<template>
    <canvasAttr></canvasAttr>
    <canvasAutoSizeAttr></canvasAutoSizeAttr>
    <a-divider :margin="0" />
    <canvasBgAttr></canvasBgAttr>
    <a-divider v-if="editMode === 'draw'" :margin="0" />
    <drawAttr v-if="editMode === 'draw'"></drawAttr>
</template>

<script setup lang="ts">
import canvasAttr from "./attrs/canvasAttr.vue";
import canvasAutoSizeAttr from './attrs/canvasAutoSizeAttr.vue';
import canvasBgAttr from './attrs/canvasBgAttr.vue';
import drawAttr from './attrs/drawAttr.vue';
import { useLeaferEditor } from '../../../../index';
import { onUnmounted, ref } from "vue";

const editor = useLeaferEditor();
const editMode = ref(editor.mode)

const updataEditMode = (mode: string) => {
    editMode.value = mode;
}
editor.eventBus.on(editor.Events.changeMode, updataEditMode)
onUnmounted(() => {
    editor.eventBus.off(editor.Events.changeMode, updataEditMode)
})
</script>

<style scoped></style>