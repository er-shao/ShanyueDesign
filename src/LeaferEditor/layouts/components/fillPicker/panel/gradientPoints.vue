<template>
    <div class="gradient-stops">
        <div v-for="(stop, index) in formatData" :key="index" class="stop-item"
            :style="{ left: `${stop.offset * 100}%` }" @mousedown="startDrag($event, index)">
            <div class="stop-handle" :style="{ backgroundColor: stop.color }" @click="selectStop(index)"
                @dblclick="removeStop(index)" :class="{ selected: index === selectedStopIndex }"></div>
        </div>
        <div class="gradient-bar" @click="addStop($event)" :style="gradientBarStyle"></div>
    </div>
</template>
<script setup lang="ts">
import { computed, reactive, ref, } from 'vue'

const emit = defineEmits(['update:modelValue', 'change', 'select'])



const props = withDefaults(defineProps<{
    modelValue: { offset: number, color: string }[],
}>(), {
    modelValue: () => [
        { offset: 0, color: '#ffffff' },
        { offset: 1, color: '#000000' }
    ]
})


const formatData = reactive([...props.modelValue])


// 方法：触发change事件
const emitChange = () => {
    const output = [...formatData]
    emit('update:modelValue', output)
    emit('change', output)
}
// 方法：删除色标
const removeStop = (index: number) => {
    if (formatData && formatData.length > 2) {
        formatData.splice(index, 1)
        sortStops()
        emitChange()
        selectStop(Math.min(index, formatData.length - 1))
    }
}

// 方法：选中色标
const selectStop = (index: number) => {
    selectedStopIndex.value = index
    emit('select', index)
}

// 方法：排序色标
const sortStops = () => {
    if (formatData) {
        formatData.sort((a, b) => a.offset - b.offset)
    }
}

const selectedStopIndex = ref(0)

const stopAlpha = ref(100)
const draggingStop = ref(null)

// 方法：开始拖动色标
const startDrag = (event: any, index: number) => {
    // 阻止默认选择行为
    event.preventDefault();

    draggingStop.value = event.target
    // selectedStopIndex.value = index
    selectStop(index)

    // 设置当前透明度
    const color = formatData[index]!.color
    const alphaMatch = color.match(/rgba?\([^)]*,\s*([^)]+)\)/)
    if (alphaMatch) {
        stopAlpha.value = Math.round(parseFloat(alphaMatch[1]!) * 100)
    }

    const handleMouseMove = (e: any) => {
        if (draggingStop.value !== null) {
            const rect = event.target.closest('.gradient-stops').getBoundingClientRect()
            const offset = (e.clientX - rect.left) / rect.width
            formatData[selectedStopIndex.value]!.offset = Math.max(0, Math.min(1, offset))
            sortStops()
            emitChange()
        }
    }

    const handleMouseUp = () => {
        draggingStop.value = null
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
}

// 方法：更新色标颜色
const updateStopColor = (index: number, color: string) => {
    if (!formatData) return

    const rgba = hexToRgba(color, (formatData[index]!.color.match(/rgba?\([^)]*,\s*([^)]+)\)/)?.[1]) || 1)
    formatData[index]!.color = rgba
    emitChange()
}


// 方法：十六进制转RGBA
const hexToRgba = (hex: string, alpha: number | string = 1) => {
    if (hex.startsWith('rgba')) return hex

    // 处理3位或6位十六进制
    let r, g, b
    if (hex.length === 4) {
        r = parseInt(hex[1]! + hex[1], 16)
        g = parseInt(hex[2]! + hex[2], 16)
        b = parseInt(hex[3]! + hex[3], 16)
    } else {
        r = parseInt(hex.slice(1, 3), 16)
        g = parseInt(hex.slice(3, 5), 16)
        b = parseInt(hex.slice(5, 7), 16)
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
// 方法：获取颜色的十六进制值
const getColorHex = (rgba: string) => {
    if (rgba.startsWith('#')) return rgba
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (match) {
        const r = parseInt(match[1]!).toString(16).padStart(2, '0')
        const g = parseInt(match[2]!).toString(16).padStart(2, '0')
        const b = parseInt(match[3]!).toString(16).padStart(2, '0')
        return `#${r}${g}${b}`
    }
    return '#000000'
}

// 方法：添加色标
const addStop = (event: any) => {
    if (!formatData) {
        throw new Error('formatData is not defined')
    }

    const rect = event.target.getBoundingClientRect()
    const offset = (event.clientX - rect.left) / rect.width

    // 生成一个随机的中间色
    const randomColor = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`

    const item = {
        offset: Math.max(0, Math.min(1, offset)),
        color: randomColor
    }
    formatData.push(item)
    sortStops()
    emitChange()
    const index = formatData.indexOf(item)
    selectStop(index)
}
// 计算属性：渐变条样式
const gradientBarStyle = computed(() => {
    if (formatData) {
        const stops = formatData
            .map(stop => `${stop.color} ${stop.offset * 100}%`)
            .join(', ')
        return {
            background: `linear-gradient(to right, ${stops})`
        }
    }
    return {}
})
</script>