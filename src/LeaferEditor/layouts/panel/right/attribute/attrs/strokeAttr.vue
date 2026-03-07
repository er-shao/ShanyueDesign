<script setup lang="ts">
import Panel from './panel.vue'
import fillPicker from "../../../../components/fillPicker";
import swipeNumber from '../../../../components/swipeNumber.vue';
import { computed, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';  
import { selectedProxyData } from '../../../../../proxyData';
import { handleUpload, onSuccess, onDelete, onError, accept, maxImageSize } from "./imageFillMixin";

const { t } = useI18n(); 

const stroke = selectedProxyData('stroke')
const strokeWidth = selectedProxyData('strokeWidth')
const strokeAlign = selectedProxyData('strokeAlign', undefined, true)
const strokeJoin = selectedProxyData('strokeJoin', undefined, true)
const strokeCap = selectedProxyData('strokeCap', undefined, true)
 
const options = computed(() => [
    { value: 'inside', label: t('panelRight.attribute.stroke.alignOptions.inside') },
    { value: 'center', label: t('panelRight.attribute.stroke.alignOptions.center') },
    { value: 'outside', label: t('panelRight.attribute.stroke.alignOptions.outside') },
])

const strokeJoinOptions = computed(() => [
    { value: 'miter', label: t('panelRight.attribute.stroke.joinOptions.miter') },
    { value: 'bevel', label: t('panelRight.attribute.stroke.joinOptions.bevel') },
    { value: 'round', label: t('panelRight.attribute.stroke.joinOptions.round') },
])

const strokeCapOptions = computed(() => [
    { value: 'none', label: t('panelRight.attribute.stroke.capOptions.none') },
    { value: 'round', label: t('panelRight.attribute.stroke.capOptions.round') },
    { value: 'square', label: t('panelRight.attribute.stroke.capOptions.square') },
])

const strokeArray = ref<any[]>([])
watchEffect(() => {
    if (stroke.value.modelValue) {
        const s = stroke.value.modelValue
        if (!s || typeof s === 'string') {
            strokeArray.value = [
                // @ts-ignore
                {
                    type: 'solid',
                    color: s,
                }
            ]
        } else {
            // @ts-ignore
            strokeArray.value = s
        }
    } else {
        strokeArray.value = []
    }
})

const refreshStroke = () => {
    stroke.value.onChange(strokeArray.value.length <= 0 ? [] : strokeArray.value)
}

const addStroke = () => {
    // @ts-ignore
    strokeArray.value.push({
        type: 'solid',
        color: '#66CCFF',
    })
    refreshStroke()
    stroke.value.onEnd()
}
const removeStroke = (index: number) => {
    strokeArray.value.splice(index, 1)
    refreshStroke()
    stroke.value.onEnd()
}
const updateFormatData = (data: any, index: number) => {
    // @ts-ignore
    strokeArray.value[index] = data
    refreshStroke()
}
const onVisibleChange = (visible: boolean) => {
    if (visible) return
    stroke.value.onEnd()
}
</script>

<template>
    <Panel :title="t('panelRight.attribute.stroke.title')" @click-add="addStroke">
        <a-space direction="vertical">
            <a-row v-if="strokeArray.length > 0" :gutter="[4, 4]">
                <a-col :span="10">
                    <swipeNumber size="small" :min="1" :label="t('panelRight.attribute.stroke.widthLabel')"
                        v-bind="strokeWidth" :hide-button="false" />
                </a-col>
                <a-col :span="12">
                    <a-select size="small" v-bind="strokeJoin" :options="strokeJoinOptions">
                        <template #prefix>
                            {{ t('panelRight.attribute.stroke.joinPrefix') }}
                        </template>
                    </a-select>
                </a-col>
                <a-col :span="12">
                    <a-select size="small" v-bind="strokeAlign" :options="options">
                        <template #prefix>
                            {{ t('panelRight.attribute.stroke.alignPrefix') }}
                        </template>
                    </a-select>
                </a-col>
                <a-col :span="12">
                    <a-select size="small" v-bind="strokeCap" :options="strokeCapOptions">
                        <template #prefix>
                            {{ t('panelRight.attribute.stroke.capPrefix') }}
                        </template>
                    </a-select>
                </a-col>
            </a-row>
            <a-row :gutter="[8, 4]" v-for="(item, index) in strokeArray" :key="index" :align="'center'">
                <a-col :span="18">
                    <fillPicker :defaultValue="() => strokeArray[index]"
                        @format-data="(data) => updateFormatData(data, index)" @change="(data) => {
                            updateFormatData(data, index)
                            stroke.onEnd()
                        }" @visible-change="onVisibleChange" :options="{
                            showSolid: true,
                            showLinear: true,
                            showRadial: true,
                            showImage: true,
                        }" :upload-image-callback="handleUpload" @upload-success="onSuccess" @upload-error="onError"
                        @delete="onDelete" :accept="accept" :maxImageSize="maxImageSize" />
                </a-col>
                <a-col :span="3.5" class="mlauto">
                    <a-button size="small" class="icon-btn" @click="removeStroke(index)">
                        <template #icon>
                            <icon-minus />
                        </template>
                    </a-button>
                </a-col>
            </a-row>
        </a-space>
    </Panel>
</template>