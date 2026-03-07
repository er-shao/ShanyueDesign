<script setup lang="ts">
import TipContentKey from "../../components/tooltip";

import { ref, onUnmounted, computed } from 'vue';
import { useLeaferEditor } from '../../../index';
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const editor = useLeaferEditor();

const editToolList = computed(() => [
    {
        key: 'normal',
        iconClass: 'i-svg:pointer',
        name: t('header.operation.selectTool'),
        shortcut: ['V'],
    },
    {
        key: 'preview',
        iconClass: 'i-svg:hand',
        name: t('header.operation.preview'),
        shortcut: ['M'],
    },
    {
        key: 'draw',
        iconClass: 'i-svg:bx-pen',
        name: t('header.operation.pencilTool'),
        shortcut: ['P'],
    },
])
const editMode = ref(editor.mode)

const onSelect = (value: any) => {
    editor.mode = value.key;
}
const updataEditMode = (mode: string) => {
    editMode.value = mode;
}
editor.eventBus.on(editor.Events.changeMode, updataEditMode)
onUnmounted(() => {
    editor.eventBus.off(editor.Events.changeMode, updataEditMode)
})
</script>

<template>
    <a-space>
        <a-tooltip mini position="bottom" v-for="(item) in editToolList" effect="dark">
            <a-button :type="editMode === item.key ? 'primary' : 'secondary'" class="icon-btn pd-5px"
                @click="onSelect(item)">
                <div :class="item.iconClass" class="icon"></div>
            </a-button>
            <template #content>
                <TipContentKey :content="item.name" :keys="item.shortcut" />
            </template>
        </a-tooltip>
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
