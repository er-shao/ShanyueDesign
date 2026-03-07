<template>
    <!-- 纯色选择器 -->
    <div class="radial-picker">
        <gradientPoints v-model="radialGradient" @select="onSelect" />
        <div class="flex w260px">
            <div class="flex-item">
                <slider v-model="position" @change="updateRadialCenter" :width="'80px'" :height="'80px'" />
            </div>
            <div class="flex-item p-l-5px flex-1">
                <a-slider :default-value="50" v-model="positionX" @change="updatePosition" />
                <a-slider :default-value="50" v-model="positionY" @change="updatePosition" />
                <a-slider :default-value="0.5" v-model="size" :min="0.1" :max="2" :step="0.1" @change="updatePosition"
                    show-input />
            </div>
        </div>
        <div @mousedown="(e) => e.preventDefault()">
            <a-color-picker v-model="currentColor" :defaultValue="currentColor" hideTrigger />
        </div>
    </div>
</template>
<script setup lang="ts">
import gradientPoints from "./gradientPoints.vue";
import slider from "./slider.vue";

import { inject, ref, watch } from 'vue'
import { defaultValueKey, type radialGradientType } from "../interface";


const emit = defineEmits(['format-data', 'update:modelValue'])

type RadialGradient = { offset: number, color: string }[]

const defaultValue = inject(defaultValueKey) as () => radialGradientType

let defaultVal = defaultValue()
if (defaultVal.type !== 'radial') {
    defaultVal = {
        type: 'radial',
        stops: [
            { offset: 0, color: '#ffffff' },
            { offset: 1, color: '#000000' }
        ],
        // FIXME: 当type===percent时，如果画布不是正方形，渐变会变形
        from: { x: 0.5, y: 0.5, type: 'percent' },
        to: { x: 1, y: 1, type: 'percent' },
    }
    emit('format-data', defaultVal)
}

const currentPosition = ref(0)
const currentOffset = ref(defaultVal.stops[0]!.offset)
const currentColor = ref(defaultVal.stops[0]!.color)
const radialGradient = ref(defaultVal.stops)

const size = ref(defaultVal.to.x - defaultVal.from.x)
const position = ref({
    x: (defaultVal.from.x),
    y: (defaultVal.from.y)
})
const positionX = ref(position.value.x * 100)
const positionY = ref(position.value.y * 100)


watch(currentColor, (newVal) => {
    const newLinearGradient = [...radialGradient.value]
    newLinearGradient[currentPosition.value]!.color = newVal
    radialGradient.value = newLinearGradient
})
watch(currentOffset, (newVal) => {
    const newLinearGradient = [...radialGradient.value]
    newLinearGradient[currentPosition.value]!.offset = newVal
    radialGradient.value = newLinearGradient
})
watch(radialGradient, (newVal) => {
    emit('update:modelValue', newVal)
    emit('format-data', updateFormatData(newVal))
})


const onSelect = (index: number) => {
    currentPosition.value = index
    currentOffset.value = radialGradient.value[index]!.offset
    currentColor.value = radialGradient.value[index]!.color
}



const updateFormatData = (gradient: RadialGradient): radialGradientType => {
    const stops: any[] = []
    gradient.forEach((item) => {
        stops.push({
            offset: item.offset,
            color: item.color
        })
    })
    const toNum = Math.max(position.value.x, position.value.y)
    return {
        type: 'radial',
        stops: stops,
        from: {
            x: position.value.x,
            y: position.value.y,
            type: 'percent'
        },
        to: {
            x: (position.value.x) + (size.value),
            y: (position.value.y) + (size.value),
            type: 'percent'
        },
        // to: {
        //     x: toNum + (size.value),
        //     y: toNum + (size.value),
        //     type: 'percent'
        // }
    }
}

// 方法：更新径向渐变中心点
const updateRadialCenter = () => {
    positionX.value = position.value.x * 100
    positionY.value = position.value.y * 100
    emit('format-data', updateFormatData(radialGradient.value))
}
const updatePosition = () => {
    position.value = { x: positionX.value / 100, y: positionY.value / 100 }
    emit('format-data', updateFormatData(radialGradient.value))
}
</script>