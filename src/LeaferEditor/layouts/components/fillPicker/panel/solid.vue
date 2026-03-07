<template>
    <!-- 纯色选择器 -->
    <div class="solid-picker" @mousedown="(e)=>e.preventDefault()">
        <a-color-picker class="color-picker" v-model="solidColor" hideTrigger />
    </div>
</template>
<script setup lang="ts">
import { inject, ref, watch } from 'vue'
import { defaultValueKey, type solidType } from "../interface";


const emit = defineEmits(['format-data'])
const updateFormatData = (newVal: string) => {
    emit('format-data', {
        type: 'solid',
        color: newVal,
    } as solidType)
}
const defaultValue = inject(defaultValueKey) as () => solidType
let defaultVal = defaultValue()
if (defaultVal.type !== 'solid') {
    defaultVal = {
        type: 'solid',
        color: '#FFFFFF',
    }
    updateFormatData(defaultVal.color)
}
const solidColor = ref(defaultVal.color)
watch(solidColor, (newVal) => {
    updateFormatData(newVal)
})
</script>