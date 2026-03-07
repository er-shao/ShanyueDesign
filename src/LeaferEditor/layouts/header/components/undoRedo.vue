<template>
    <a-space>
        <a-tooltip effect="dark" mini>
            <a-button class="icon-btn pd-5px" :disabled="!canUndo" @click="undo()">
                <icon-undo :size="18" />
            </a-button>
            <template #content>
                <TipContentKey :content="undoLabel" :keys="['ctrl+z']" />
            </template>
        </a-tooltip>
        <a-tooltip effect="dark" mini>
            <a-button class="icon-btn pd-5px" :disabled="!canRedo" @click="redo()">
                <icon-redo :size="18" />
            </a-button>
            <template #content>
                <TipContentKey :content="redoLabel" :keys="['ctrl+y', 'ctrl ⇧ z']" />
            </template>
        </a-tooltip>
    </a-space>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

import TipContentKey from "../../components/tooltip";
import { useLeaferEditor } from '../../../index';
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const editor = useLeaferEditor();
const canUndo = ref(false)
const canRedo = ref(false)
const undoLabel = ref(t('header.undoRedo.undo'))
const redoLabel = ref(t('header.undoRedo.redo'))

const updateCan = () => {
    canUndo.value = editor.historyCanUndo()
    canRedo.value = editor.historyCanRedo()
    const info = editor.historyInfo()
    undoLabel.value = canUndo.value ? `${t('header.undoRedo.undo')} (${info.undoCount})` : t('header.undoRedo.noUndo')
    redoLabel.value = canRedo.value ? `${t('header.undoRedo.redo')} (${info.redoCount})` : t('header.undoRedo.noRedo')
}
const undo = () => {
    editor.historyUndo()
    updateCan()
}
const redo = () => {
    editor.historyRedo()
    updateCan()
}
onMounted(() => {
    editor.eventBus.on(editor.Events.undoRedoStackChange, updateCan)
    editor.eventBus.on(editor.Events.historyStateSavedAfter, updateCan)
    editor.eventBus.on(editor.Events.pageAddAfter, updateCan)
    editor.eventBus.on(editor.Events.pageChangeAfter, updateCan)
})
onUnmounted(() => {
    editor.eventBus.off(editor.Events.undoRedoStackChange, updateCan)
    editor.eventBus.off(editor.Events.historyStateSavedAfter, updateCan)
    editor.eventBus.off(editor.Events.pageAddAfter, updateCan)
    editor.eventBus.off(editor.Events.pageChangeAfter, updateCan)
})
</script>