<script setup lang="ts">
import { computed, ref, watch, watchEffect } from 'vue'
import Panel from './panel.vue'
import SwipeNumber from '../../../../components/swipeNumber.vue';
import { selectedProxyData } from '../../../../../proxyData';
import { Message } from '@arco-design/web-vue';
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const textValue = selectedProxyData('text')
const margin = selectedProxyData('margin')
const codeHeight = selectedProxyData('codeHeight')
const codeUnitWidth = selectedProxyData('codeUnitWidth')
const format = selectedProxyData('format', undefined, true)
const textAlign = selectedProxyData('textAlign', undefined, true)
const textPosition = selectedProxyData('textPosition', undefined, true)
const textMargin = selectedProxyData('textMargin')
const fontSize = selectedProxyData('fontSize')
const background = selectedProxyData('background')
const lineColor = selectedProxyData('lineColor')
const error = selectedProxyData('error')
watch(() => error.value.modelValue, (value) => {
    if (!value) return
    Message.error({
        content: value,
        duration: 5000
    })
})

const newTextVal = ref()
const lineColorVal = ref()
const backgroundVal = ref()
watchEffect(() => {
    newTextVal.value = textValue.value.modelValue
    backgroundVal.value = background.value.modelValue
    lineColorVal.value = lineColor.value.modelValue
})
watchEffect(() => {
    textValue.value.onChange(newTextVal.value)
    background.value.onChange(backgroundVal.value)
    lineColor.value.onChange(lineColorVal.value)
})

const formatOptions = computed(() => [
    {
        label: 'AUTO',
        isGroup: true,
        options: [ // 'CODE 128是一种多功能条形码。它支持所有128个ASCII字符，但也有效地编码数字。它有三种模式（A/B/C），但可以随时在它们之间切换' 
            { label: 'CODE128', value: 'CODE128' },
        ]
    },
    {
        label: 'EAN',
        isGroup: true,
        options: [ // 'EAN有多种形式，最常用的是EAN-13（GTIN-13），在世界范围内用于标识产品的身份'
            { label: 'EAN-13', value: 'EAN13' },
            { label: 'EAN-8', value: 'EAN8' },
            { label: 'EAN-5', value: 'EAN5' },
            { label: 'EAN-2', value: 'EAN2' },
        ]
    },
    {
        label: 'UPC',
        isGroup: true,
        options: [
            { label: 'UPC(A)', value: 'UPC' },
            { label: 'UPC(E)', value: 'EAN-13' },
        ]
    },
    {
        label: 'ITF',
        isGroup: true,
        options: [
            { label: 'ITF', value: 'ITF' },
            { label: 'ITF-14', value: 'ITF14' },
        ]
    },
    {
        label: 'MSI',
        isGroup: true,
        options: [
            { label: 'MSI', value: 'MSI' },
            { label: 'MSI-10', value: 'MSI10' },
            { label: 'MSI-11', value: 'MSI11' },
            { label: 'MSI-1010', value: 'MSI1010' },
            { label: 'MSI-1110', value: 'MSI1110' },
        ]
    },
    {
        label: 'CODE39',
        isGroup: true,
        options: [
            { label: 'CODE39', value: 'CODE39' },
        ]
    },
    {
        label: 'Pharmacode',
        isGroup: true,
        options: [
            { label: 'Pharmacode', value: 'pharmacode' },
        ]
    },
    {
        label: 'Codabar',
        isGroup: true,
        options: [
            { label: 'Codabar', value: 'codabar' },
        ]
    },
])
const textAlignOptions = computed(() => [
    {
        value: 'left',
        label: t('panelRight.attribute.barcode.textAlign.options.left'),
    },
    {
        value: 'center',
        label: t('panelRight.attribute.barcode.textAlign.options.center'),
    },
    {
        value: 'right',
        label: t('panelRight.attribute.barcode.textAlign.options.right'),
    },
])
const textPositionOptions = computed(() => [
    {
        value: 'bottom',
        label: t('panelRight.attribute.barcode.textPosition.options.bottom'),
    },
    {
        value: 'top',
        label: t('panelRight.attribute.barcode.textPosition.options.top'),
    },
])

</script>

<template>
    <div>
        <Panel :title="t('panelRight.attribute.barcode.panel.contentTitle')" hidden-add>
            <a-row :wrap="false" :gutter="[4, 4]" align="center">
                <a-col>
                    <a-textarea v-model="newTextVal"
                        :placeholder="t('panelRight.attribute.barcode.textarea.placeholder')" :auto-size="{
                            minRows: 3,
                        }" />
                </a-col>
            </a-row>
        </Panel>
        <Panel :title="t('panelRight.attribute.barcode.panel.settingsTitle')" hidden-add>
            <a-space direction="vertical" size="mini">
                <a-col :span="20">
                    <a-select size="small" placeholder="" v-bind="format" :options="formatOptions">
                        <template #prefix>
                            {{ t('panelRight.attribute.barcode.format.prefix') }}
                        </template>
                    </a-select>
                </a-col>
                <a-row :gutter="[4, 4]" align="center">
                    <a-col :span="12">
                        <SwipeNumber size="small" v-bind="codeHeight" :step="1" style="padding: 0 6px"
                            label-class="text-left" label-width="45px">
                            <template #label>
                                <div>{{ t('panelRight.attribute.barcode.codeHeight.label') }}</div>
                            </template>
                        </SwipeNumber>
                    </a-col>
                    <a-col :span="12">
                        <SwipeNumber size="small" v-bind="margin" :step="1" style="padding: 0 6px"
                            label-class="text-left" label-width="45px">
                            <template #label>
                                <div>{{ t('panelRight.attribute.barcode.margin.label') }}</div>
                            </template>
                        </SwipeNumber>
                    </a-col>
                    <a-col :span="20">
                        <SwipeNumber size="small" v-bind="codeUnitWidth" :min="1" :step="1" style="padding: 0 6px"
                            label-class="text-left" label-width="90px">
                            <template #label>
                                <div>{{ t('panelRight.attribute.barcode.codeUnitWidth.label') }}</div>
                            </template>
                        </SwipeNumber>
                    </a-col>
                    <a-col :span="20">
                        <a-select size="small" placeholder="" v-bind="{ ...textAlign }" :options="textAlignOptions">
                            <template #prefix>
                                {{ t('panelRight.attribute.barcode.textAlign.prefix') }}
                            </template>
                        </a-select>
                    </a-col>
                    <a-col :span="20">
                        <a-select size="small" placeholder="" v-bind="{ ...textPosition }"
                            :options="textPositionOptions">
                            <template #prefix>
                                {{ t('panelRight.attribute.barcode.textPosition.prefix') }}
                            </template>
                        </a-select>
                    </a-col>
                    <a-col :span="12">
                        <SwipeNumber size="small" v-bind="fontSize" :step="1" style="padding: 0 6px"
                            label-class="text-left" label-width="60px">
                            <template #label>
                                <div>{{ t('panelRight.attribute.barcode.fontSize.label') }}</div>
                            </template>
                        </SwipeNumber>
                    </a-col>
                    <a-col :span="12">
                        <SwipeNumber size="small" v-bind="textMargin" :step="1" style="padding: 0 6px"
                            label-class="text-left" label-width="60px">
                            <template #label>
                                <div>{{ t('panelRight.attribute.barcode.textMargin.label') }}</div>
                            </template>
                        </SwipeNumber>
                    </a-col>
                    <a-col :span="20">
                        <a-color-picker v-model="lineColorVal" size="mini" :position="'bottom'"
                            @mousedown="(e: MouseEvent) => e.preventDefault()">
                            <a-input size="mini" v-model="lineColorVal" @blur="lineColor.onEnd">
                                <template #prefix>
                                    {{ t('panelRight.attribute.barcode.lineColor.prefix') }}<div
                                        class="w18px h18px ml5px" :style="{ backgroundColor: lineColorVal }"></div>
                                </template>
                            </a-input>
                        </a-color-picker>
                    </a-col>
                    <a-col :span="20">
                        <a-color-picker v-model="backgroundVal" size="mini" :position="'bottom'"
                            @mousedown="(e: MouseEvent) => e.preventDefault()">
                            <a-input size="mini" v-model="backgroundVal" @blur="background.onEnd">
                                <template #prefix>
                                    {{ t('panelRight.attribute.barcode.background.prefix') }}<div
                                        class="w18px h18px ml5px" :style="{ backgroundColor: backgroundVal }"></div>
                                </template>
                            </a-input>
                        </a-color-picker>
                    </a-col>
                </a-row>
            </a-space>
        </Panel>
    </div>
</template>

<style scoped lang="less"></style>