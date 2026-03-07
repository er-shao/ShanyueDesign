<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";
import Panel from './panel.vue'
import { useLeaferEditor } from '../../../../../index';
import fillPicker from "../../../../components/fillPicker";
import { useActiveObjectModel } from "../useActiveObjectModel";
import { handleUpload, onSuccess, onDelete, onError, accept, maxImageSize } from "./imageFillMixin";

const editor = useLeaferEditor();

// const fill = selectedProxyData("fill")

const fill = useActiveObjectModel(editor.contentFrame.fill as any, (value) => {
    editor.contentFrame.fill = value;
});

const fillArray = ref([fill.value.modelValue])

const updateFormatData = (data: any, index: number) => {
    fillArray.value[index] = data
    refreshFill()
}

const refreshFill = () => {
    fill.value.onChange(fillArray.value.length <= 0 ? [] : fillArray.value)
}
const addFill = () => {
    fill.value.onChange([])
    // @ts-ignore
    fillArray.value.push({
        type: 'solid',
        color: '#66CCFF',
    })
    refreshFill()
}
const removeFill = (index: number) => {
    fillArray.value.splice(index, 1)
    refreshFill()
}
const onVisibleChange = (visible: boolean) => {
    if (visible) return
    fill.value.onEnd()
}
const onColorChange = () => {
    const fillcolor = editor.contentFrame.fill
    if (!fillcolor || typeof fillcolor === 'string') {
        fillArray.value = [
            {
                type: 'solid',
                color: fillcolor || "Transparent",
            }
        ]
    } else {
        // @ts-ignore
        fillArray.value = fillcolor
    }
    refreshFill()
}
onColorChange()
editor.eventBus.on(editor.Events.pageChangeAfter, onColorChange)
editor.eventBus.on(editor.Events.undoRedoStackChange, onColorChange)
onBeforeUnmount(() => {
    fill.value.onEnd()
    editor.eventBus.off(editor.Events.pageChangeAfter, onColorChange)
    editor.eventBus.off(editor.Events.undoRedoStackChange, onColorChange)
})
</script>

<template>
    <Panel :title="$t('panelRight.attribute.canvas.background')" @click-add="addFill">
        <a-space direction="vertical">
            <a-row :gutter="[8, 4]" v-for="(item, index) in fillArray" :key="index" :align="'center'">
                <a-col :span="18">
                    <fillPicker :defaultValue="() => fillArray[index]"
                        @format-data="(data) => updateFormatData(data, index)" @change="(data) => {
                            updateFormatData(data, index)
                            fill.onEnd()
                        }" @visible-change="onVisibleChange" :upload-image-callback="handleUpload"
                        @upload-success="onSuccess" @upload-error="onError" @delete="onDelete" :accept="accept"
                        :maxImageSize="maxImageSize" />
                </a-col>
                <a-col :span="3.5" class="mlauto">
                    <a-button size="small" class="icon-btn" v-if="index !== 0" @click="removeFill(index)">
                        <template #icon>
                            <icon-minus />
                        </template>
                    </a-button>
                </a-col>
            </a-row>
        </a-space>
    </Panel>
</template>

<style scoped lang="less">
:deep(.arco-row-align-center) {
    align-items: normal;
}
</style>
