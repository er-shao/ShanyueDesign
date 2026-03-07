<script setup lang="ts">
import Panel from "./panel.vue";
import { selectedProxyData } from '../../../../../proxyData';
import { ref, watchEffect } from "vue";
import swipeNumber from '../../../../components/swipeNumber.vue';
import { useActiveObjectModel } from "../useActiveObjectModel";
import { useI18n } from 'vue-i18n';  // 引入 i18n

const { t } = useI18n();  // 获取 t 函数

const dashPattern = selectedProxyData('dashPattern')
const isDash = ref(dashPattern.value.modelValue && dashPattern.value.modelValue.length > 0)
const a = useActiveObjectModel(
    dashPattern.value.modelValue && dashPattern.value.modelValue[0] || 10,
    (value) => {
        dashPattern.value.onChange([value, b.value.modelValue])
    },
)
const b = useActiveObjectModel(
    dashPattern.value.modelValue && dashPattern.value.modelValue[1] || 10,
    (value) => {
        dashPattern.value.onChange([a.value.modelValue, value])
    },
)

watchEffect(() => {
    if (dashPattern.value.modelValue && dashPattern.value.modelValue.length > 0) {
        isDash.value = true
        a.value.onChange(dashPattern.value.modelValue[0], false)
        b.value.onChange(dashPattern.value.modelValue[1], false)
    } else {
        isDash.value = false
        a.value.onChange(10, false)
        b.value.onChange(10, false)
    }
})
</script>

<template>
    <Panel :title=" t('panelRight.attribute.line.title')" :hiddenAdd="true">
        <div class="line-attr">
            <a-row :gutter="[4, 4]">
                <a-col :span="20">
                    <a-checkbox v-model="isDash" @change="(v: boolean) => {
                        dashPattern.onChange(v ? [a.modelValue, b.modelValue] : [])
                    }">{{  t('panelRight.attribute.line.setAsDash') }}</a-checkbox>
                </a-col>
            </a-row>
            <a-row :gutter="[4, 4]">
                <a-col :span="12">
                    <swipe-number v-bind="a" :label=" t('panelRight.attribute.line.length')" :min="1" :labelWidth="'30px'" :disabled="!isDash"
                        @end="dashPattern.onEnd" />
                </a-col>
                <a-col :span="12">
                    <swipe-number v-bind="b" :label=" t('panelRight.attribute.line.gap')" :min="1" :labelWidth="'30px'" :disabled="!isDash"
                        @end="dashPattern.onEnd" />
                </a-col>
            </a-row>
        </div>
    </Panel>
</template>