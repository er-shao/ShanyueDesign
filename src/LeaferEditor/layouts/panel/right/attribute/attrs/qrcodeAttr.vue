<script setup lang="ts">
import Panel from './panel.vue'
import swipeNumber from '../../../../components/swipeNumber.vue'
import { reactive, ref, watch, watchEffect, computed } from 'vue'
import { selectedProxyData } from '../../../../../proxyData'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const textValue = selectedProxyData('text', undefined, true)
const options = selectedProxyData('options', undefined, true)

const newTextVal = ref(textValue.value.modelValue)
const errorCorrectionLevel = ref()

watch(newTextVal, (value) => {
    textValue.value.onChange(value)
})
watchEffect(() => {
    newTextVal.value = textValue.value.modelValue
})

watch(errorCorrectionLevel, (value) => {
    options.value.onChange({ ...options.value.modelValue, errorCorrectionLevel: value })
    options.value.onEnd()
})
watchEffect(() => {
    errorCorrectionLevel.value = options.value.modelValue?.errorCorrectionLevel
})

const darkColor = ref(<any>options.value.modelValue.color.dark)
const lightColor = ref(<any>options.value.modelValue.color.light)

watch([darkColor, lightColor], () => {
    options.value.onChange({ ...options.value.modelValue, color: { light: lightColor.value, dark: darkColor.value } })
})
watchEffect(() => {
    if (options.value.modelValue?.color.dark) {
        darkColor.value = <any>options.value.modelValue.color.dark
    } else {
        darkColor.value = ''
    }
    if (options.value.modelValue?.color.light) {
        lightColor.value = <any>options.value.modelValue.color.light
    } else {
        lightColor.value = ''
    }
})

const errorCorrectionLevelOptions = computed(() => [
    {
        value: 'L',
        label: t('panelRight.attribute.qrCode.settings.errorCorrectionLevel.options.L'),
    },
    {
        value: 'M',
        label: t('panelRight.attribute.qrCode.settings.errorCorrectionLevel.options.M'),
    },
    {
        value: 'Q',
        label: t('panelRight.attribute.qrCode.settings.errorCorrectionLevel.options.Q'),
    },
    {
        value: 'H',
        label: t('panelRight.attribute.qrCode.settings.errorCorrectionLevel.options.H'),
    },
])

const margin = ref(options.value.modelValue?.margin || 0)
watch(margin, (value) => {
    options.value.onChange({ ...options.value.modelValue, margin: value })
})
watchEffect(() => {
    margin.value = options.value.modelValue?.margin || 0
})
</script>

<template>
    <div>
        <Panel :title="t('panelRight.attribute.qrCode.content.title')" hidden-add>
            <a-row :wrap="false" :gutter="[4, 4]" align="center">
                <a-col>
                    <a-textarea v-model="newTextVal" :placeholder="t('panelRight.attribute.qrCode.content.placeholder')"
                        :auto-size="{
                            minRows: 3,
                        }" @blur="textValue.onEnd()" />
                </a-col>
            </a-row>
        </Panel>
        <Panel :title="t('panelRight.attribute.qrCode.settings.title')" hidden-add>
            <a-space direction="vertical" size="mini">
                <a-row :wrap="false" :gutter="[4, 4]" align="center">
                    <a-col flex="none">
                        <a-select size="small" v-model="errorCorrectionLevel" :options="errorCorrectionLevelOptions">
                            <template #prefix>
                                {{ t('panelRight.attribute.qrCode.settings.errorCorrectionLevel.prefix') }}
                            </template>
                        </a-select>
                    </a-col>
                </a-row>
                <a-row :gutter="[4, 4]" align="center">
                    <a-col :span="15">
                        <swipeNumber size="small" v-model="margin" :min="0" :step="1" style="padding: 0 6px"
                            label-class="text-left" label-width="45px" @end="options.onEnd()">
                            <template #label>
                                <div>{{ t('panelRight.attribute.qrCode.settings.margin.label') }}</div>
                            </template>
                        </swipeNumber>
                    </a-col>
                    <a-col :span="20">
                        <a-color-picker v-model="darkColor" size="mini" :position="'bottom'"
                            @mousedown="(e: MouseEvent) => e.preventDefault()">
                            <a-input size="mini" v-model="darkColor">
                                <template #prefix>
                                    {{ t('panelRight.attribute.qrCode.settings.darkColor.prefix') }}
                                    <div class="w18px h18px ml5px" :style="{ backgroundColor: darkColor }"></div>
                                </template>
                            </a-input>
                        </a-color-picker>
                    </a-col>
                    <a-col :span="20">
                        <a-color-picker v-model="lightColor" size="mini" :position="'bottom'"
                            @mousedown="(e: MouseEvent) => e.preventDefault()">
                            <a-input size="mini" v-model="lightColor">
                                <template #prefix>
                                    {{ t('panelRight.attribute.qrCode.settings.lightColor.prefix') }}
                                    <div class="w18px h18px ml5px" :style="{ backgroundColor: lightColor }"></div>
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
