<template>
    <div class="slider-container" :class="containerClass">
        <div class="slider-area" ref="sliderArea" :style="areaStyle" @mousedown="handleMouseDown"
            @touchstart="handleTouchStart" @click="handleAreaClick">
            <div class="slider-thumb" :style="thumbStyle"></div>

            <!-- 网格背景 -->
            <div class="grid-overlay">
                <div class="grid-line vertical" :style="{ left: '50%' }"></div>
                <div class="grid-line horizontal" :style="{ top: '50%' }"></div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

// 定义props
const props = defineProps({
    // 初始X值 (0-1)
    modelValue: {
        type: Object,
        default: () => ({ x: 0.5, y: 0.5 })
    },
    // 选择区域宽度
    width: {
        type: [String, Number],
        default: '100px'
    },
    // 选择区域高度
    height: {
        type: [String, Number],
        default: '100px'
    },
    // 滑块颜色
    thumbColor: {
        type: String,
        default: '#ffffff'
    },
    // 滑块边框颜色
    thumbBorderColor: {
        type: String,
        default: '#333'
    },
    // 区域背景色
    areaColor: {
        type: String,
        default: '#6cf'
    },
    containerClass: {
        type: String,
        default: ''
    }
})

// 定义emit事件
const emit = defineEmits(['update:modelValue', 'change'])

// 响应式数据
const currentX = ref(props.modelValue.x || 0)
const currentY = ref(props.modelValue.y || 0)
const sliderArea = ref(null)
const isDragging = ref(false)

// 计算样式
const areaStyle = computed(() => ({
    width: typeof props.width === 'number' ? `${props.width}px` : props.width,
    height: typeof props.height === 'number' ? `${props.height}px` : props.height,
    background: props.areaColor,
}))

const thumbStyle = computed(() => ({
    left: `calc(${currentX.value * 100}%)`,
    top: `calc(${currentY.value * 100}%)`,
    backgroundColor: props.thumbColor,
    borderColor: props.thumbBorderColor
}))

// 监听props变化
watch(() => props.modelValue, (newValue) => {
    if (newValue.x !== undefined) currentX.value = newValue.x
    if (newValue.y !== undefined) currentY.value = newValue.y
}, { deep: true })

// 更新当前值并触发事件
const updatePosition = (x: number, y: number) => {
    // 限制值在0-1范围内
    const clampedX = Math.max(0, Math.min(1, x))
    const clampedY = Math.max(0, Math.min(1, y))

    currentX.value = clampedX
    currentY.value = clampedY

    const newValue = { x: clampedX, y: clampedY }
    emit('update:modelValue', newValue)
    emit('change', newValue)
}

// 处理鼠标按下事件
const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault()
    isDragging.value = true
    updateFromEvent(e)

    // 添加全局鼠标移动和释放事件监听器
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
}

// 处理鼠标移动事件
const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.value) return
    updateFromEvent(e)
}

// 处理鼠标释放事件
const handleMouseUp = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
}

// 处理触摸开始事件
const handleTouchStart = (e: TouchEvent) => {
    e.preventDefault()
    isDragging.value = true
    // @ts-ignore
    updateFromEvent(e.touches[0])

    // 添加全局触摸移动和结束事件监听器
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)
}

// 处理触摸移动事件
const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging.value) return
    // @ts-ignore
    updateFromEvent(e.touches[0])
}

// 处理触摸结束事件
const handleTouchEnd = () => {
    isDragging.value = false
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleTouchEnd)
}

// 从事件中更新位置
const updateFromEvent = (e: MouseEvent | TouchEvent) => {
    if (!sliderArea.value) return

    // @ts-ignore
    const rect = sliderArea.value.getBoundingClientRect()
    // @ts-ignore
    const x = (e.clientX - rect.left) / rect.width
    // @ts-ignore
    const y = (e.clientY - rect.top) / rect.height

    updatePosition(x, y)
}

// 处理区域点击
const handleAreaClick = (e: MouseEvent) => {
    updateFromEvent(e)
}

// 组件挂载时清除事件监听器
onMounted(() => {
    // 确保初始值有效
    updatePosition(currentX.value, currentY.value)
})

onUnmounted(() => {
    // 清理事件监听器
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleTouchEnd)
})
</script>

<style scoped>
.slider-container {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    display: inline-flex;
    flex-direction: column;
    gap: 20px;
    padding: 4px;
    background-color: #f8f9fa;
    border-radius: 10px;
}

.slider-area {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    cursor: crosshair;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    user-select: none;
    touch-action: none;
}

.slider-thumb {
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 10;
    transition: transform 0.1s;
}

.slider-thumb:hover {
    transform: translate(-50%, -50%) scale(1.2);
}

.grid-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}

.grid-line {
    position: absolute;
    background-color: rgba(255, 255, 255, 0.3);
}

.grid-line.vertical {
    top: 0;
    width: 1px;
    height: 100%;
}

.grid-line.horizontal {
    left: 0;
    height: 1px;
    width: 100%;
}

.coordinates {
    position: absolute;
    bottom: 10px;
    left: 10px;
    background-color: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 12px;
    display: flex;
    gap: 10px;
}

.controls {
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 10px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.control-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.control-group label {
    font-size: 14px;
    font-weight: 500;
    color: #333;
}

.control-group input[type="range"] {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: #e9ecef;
    outline: none;
    -webkit-appearance: none;
    appearance: none;
}

.control-group input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #4d7cfe;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.reset-btn {
    padding: 8px 16px;
    background-color: #4d7cfe;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;
}

.reset-btn:hover {
    background-color: #3a6bfd;
}

/* 响应式设计 */
@media (max-width: 480px) {
    .slider-container {
        width: 100%;
        padding: 10px;
    }

    .slider-area {
        width: 100% !important;
        height: 250px !important;
    }

    .controls {
        padding: 8px;
    }
}
</style>