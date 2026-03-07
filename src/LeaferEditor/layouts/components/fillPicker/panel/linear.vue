<template>
    <div class="linear-picker">
        <gradientPoints v-model="linearGradient" @select="onSelect" />
        <degree :degree="currentAngle" @change="handleChange" />
        <div @mousedown="(e) => e.preventDefault()">
            <a-color-picker v-model="currentColor" :defaultValue="currentColor" hideTrigger />
        </div>
    </div>
</template>
<script setup lang="ts">
import gradientPoints from "./gradientPoints.vue";
import degree from "./degree.vue";
import { inject, ref, watch } from 'vue'
import { defaultValueKey, type linearGradientType } from "../interface";
import { calculatePoints, calculateAngle } from "../../../../utils/angle";

const emit = defineEmits(['format-data', 'update:modelValue'])

type LinearGradient = { offset: number, color: string }[]

const defaultValue = inject(defaultValueKey) as () => linearGradientType

let defaultVal = defaultValue()
if (defaultVal.type !== 'linear') {
    defaultVal = {
        type: 'linear',
        stops: [
            { offset: 0, color: '#ffffff' },
            { offset: 1, color: '#000000' }
        ],
        from: { x: 0, y: 0.5, type: 'percent' },
        to: { x: 1, y: 0.5, type: 'percent' },
    }
    emit('format-data', defaultVal)
}

const currentPosition = ref(0)
const currentOffset = ref(defaultVal.stops[0]!.offset)
const currentColor = ref(defaultVal.stops[0]!.color)
const currentAngle = ref(
    calculateAngle(
        defaultVal.from.x,
        defaultVal.from.y,
        defaultVal.to.x,
        defaultVal.to.y,
    )
)
const linearGradient = ref(defaultVal.stops)

watch(currentColor, (newVal) => {
    const newLinearGradient = [...linearGradient.value]
    newLinearGradient[currentPosition.value]!.color = newVal
    linearGradient.value = newLinearGradient
})
watch(currentOffset, (newVal) => {
    const newLinearGradient = [...linearGradient.value]
    newLinearGradient[currentPosition.value]!.offset = newVal
    linearGradient.value = newLinearGradient
})
watch(linearGradient, (newVal) => {
    emit('update:modelValue', newVal)
    emit('format-data', updateFormatData(newVal, currentAngle.value))
})
watch(currentAngle, (newVal) => {
    emit('update:modelValue', newVal)
    emit('format-data', updateFormatData(linearGradient.value, newVal))
})

const onSelect = (index: number) => {
    currentPosition.value = index
    currentOffset.value = linearGradient.value[index]!.offset
    currentColor.value = linearGradient.value[index]!.color
}

const handleChange = (v: number) => {
    currentAngle.value = v
}

const updateFormatData = (linearGradient: LinearGradient, angle: number) => {
    const stops: any[] = []
    linearGradient.forEach((item) => {
        stops.push({
            offset: item.offset,
            color: item.color
        })
    })
    const [to, form] = calculatePoints(angle)
    return {
        type: 'linear',
        stops: stops,
        from: {
            x: form.x,
            y: form.y,
            type: 'percent'
        },
        to: {
            x: to.x,
            y: to.y,
            type: 'percent'
        }
    }
}
</script>