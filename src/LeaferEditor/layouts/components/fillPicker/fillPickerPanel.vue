<template>
    <div class="color-picker-panel">
        <a-radio-group type="button" class="color-picker-tab" :default-checked="tabTypes[0]" v-model="currentType"
            size="large">
            <a-radio type="button" v-for="type in tabTypes" :value="type">{{ typeLabels[type] }}</a-radio>
        </a-radio-group>

        <!-- 纯色选择器 -->
        <solidPanel v-if="currentType === 'solid'" @format-data="updateFormatData" />
        <!-- <solidPanel v-if="currentType === 'solid'" /> -->

        <!-- 线性渐变选择器 -->
        <linearPanel v-if="currentType === 'linear'" @format-data="updateFormatData" />

        <!-- 径向渐变选择器 -->
        <radialPanel v-if="currentType === 'radial'" @format-data="updateFormatData" />

        <!-- 图片选择器 -->
        <imagePanel v-if="currentType === 'image'" @format-data="updateFormatData" v-bind="attrs" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, useAttrs } from 'vue'
import type { fillType } from "./interface";

import solidPanel from "./panel/solid.vue";
import linearPanel from "./panel/linear.vue";
import radialPanel from "./panel/radial.vue";
import imagePanel from "./panel/image.vue";
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const attrs = useAttrs()

const props = withDefaults(defineProps<{
    defaultValue: () => fillType,
    // modelValue: fillType,
    showSolid?: boolean,
    showLinear?: boolean,
    showRadial?: boolean,
    showImage?: boolean,
}>(), {
    showSolid: true,
    showLinear: true,
    showRadial: true,
    showImage: true,
})

const emit = defineEmits(['update:modelValue', 'change', 'format-data'])

// 标签类型（根据props过滤）
const tabTypes = computed(() => {
    const types = []
    if (props.showSolid) types.push('solid')
    if (props.showLinear) types.push('linear')
    if (props.showRadial) types.push('radial')
    if (props.showImage) types.push('image')
    return types as ('solid' | 'linear' | 'radial' | 'image')[]
})

const typeLabels = computed(() => ({
    solid: t('components.fillPicker.gradient.typeLabels.solid'),
    linear: t('components.fillPicker.gradient.typeLabels.linear'),
    radial: t('components.fillPicker.gradient.typeLabels.radial'),
    image: t('components.fillPicker.gradient.typeLabels.image')
}))

// 状态管理
const currentType = ref(props.defaultValue().type || 'solid')

const updateFormatData = (data: fillType) => {
    emit('format-data', data)
}
</script>