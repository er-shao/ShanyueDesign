<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Panel from "./panel.vue";
import { selectedProxyData } from '../../../../../proxyData';
import { watchEffect } from "vue";
import swipeNumber from '../../../../components/swipeNumber.vue';
import { useActiveObjectModel } from "../useActiveObjectModel";

const { t } = useI18n()

const cornerRadius = selectedProxyData('cornerRadius', [0, 0, 0, 0])

const lt = useActiveObjectModel(
    cornerRadius.value.modelValue && cornerRadius.value.modelValue[0] || 0,
    (value) => {
        cornerRadius.value.onChange([value, rt.value.modelValue, rb.value.modelValue, lb.value.modelValue])
    },
)
const rt = useActiveObjectModel(
    cornerRadius.value.modelValue && cornerRadius.value.modelValue[1] || 0,
    (value) => {
        cornerRadius.value.onChange([lt.value.modelValue, value, rb.value.modelValue, lb.value.modelValue])
    },
)
const lb = useActiveObjectModel(
    cornerRadius.value.modelValue && cornerRadius.value.modelValue[3] || 0,
    (value) => {
        cornerRadius.value.onChange([lt.value.modelValue, rt.value.modelValue, rb.value.modelValue, value])
    },
)
const rb = useActiveObjectModel(
    cornerRadius.value.modelValue && cornerRadius.value.modelValue[2] || 0,
    (value) => {
        cornerRadius.value.onChange([lt.value.modelValue, rt.value.modelValue, value, lb.value.modelValue])
    },
)

watchEffect(() => {
    const v = cornerRadius.value.modelValue || [0, 0, 0, 0]
    lt.value.onChange(v[0], false)
    rt.value.onChange(v[1], false)
    rb.value.onChange(v[2], false)
    lb.value.onChange(v[3], false)
})
</script>

<template>
    <Panel :title=" t('panelRight.attribute.cornerRadius.title')" :hiddenAdd="true">
        <a-row :gutter="[4, 4]">
            <a-col :span="12">
                <swipe-number v-bind="lt" :label=" t('panelRight.attribute.cornerRadius.labels.lt')" :min="0" :labelWidth="'30px'"
                    @end="cornerRadius.onEnd" />
            </a-col>
            <a-col :span="12">
                <swipe-number v-bind="rt" :label=" t('panelRight.attribute.cornerRadius.labels.rt')" :min="0" :labelWidth="'30px'"
                    @end="cornerRadius.onEnd" />
            </a-col>
            <a-col :span="12">
                <swipe-number v-bind="lb" :label=" t('panelRight.attribute.cornerRadius.labels.lb')" :min="0" :labelWidth="'30px'"
                    @end="cornerRadius.onEnd" />
            </a-col>
            <a-col :span="12">
                <swipe-number v-bind="rb" :label=" t('panelRight.attribute.cornerRadius.labels.rb')" :min="0" :labelWidth="'30px'"
                    @end="cornerRadius.onEnd" />
            </a-col>
        </a-row>
    </Panel>
</template>