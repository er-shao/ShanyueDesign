<script setup lang="ts">
import { ref, watchEffect } from "vue";
import Panel from './panel.vue'
import fillPicker from "../../../../components/fillPicker";
import { selectedProxyData } from '../../../../../proxyData';
import { Tag } from "../../../../../core/interfaces";
import { handleUpload, onSuccess, onDelete, onError, accept, maxImageSize } from "./imageFillMixin";


const fill = selectedProxyData("fill")
const tag = selectedProxyData("tag")

// BUG?: 2026年2月11日11:28:05 "leafer-ui": "^1.12.1"
// tag === text； 文字的填充径向填充（Radial）填充的图案会与文字位置分离；导致填充错位
// 原因： 不支持文字的径向填充


const fillArray = ref([fill.value.modelValue])

watchEffect(() => {
    if (fill.value.modelValue) {
        const fillcolor = fill.value.modelValue
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
    } else {
        fillArray.value = []
    }
})

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
</script>

<template>
    <Panel :title="$t('panelRight.attribute.fill.title')" @click-add="addFill">
        <a-space direction="vertical">
            <a-row :gutter="[8, 4]" v-for="(item, index) in fillArray" :key="index" :align="'center'">
                <a-col :span="18">
                    <fillPicker :defaultValue="() => fillArray[index]"
                        @format-data="(data) => updateFormatData(data, index)" @change="(data) => {
                            updateFormatData(data, index)
                            fill.onEnd()
                        }" @visible-change="onVisibleChange" :options="{
                            showSolid: true,
                            showLinear: true,
                            showRadial: tag.modelValue !== Tag.Text,
                            showImage: true,
                        }" :upload-image-callback="handleUpload" @upload-success="onSuccess" @upload-error="onError"
                        @delete="onDelete" :accept="accept" :maxImageSize="maxImageSize" />
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
