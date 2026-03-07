<script setup lang="ts">
import { ref, computed, watch, useSlots } from 'vue'
import { usePointerSwipe, isDefined, useMagicKeys } from '@vueuse/core'
import { toFixed } from '../../utils/math'
import { isNumber } from "lodash"

const props = withDefaults(
    defineProps<{
        label?: string
        labelWidth?: string
        labelClass?: string
        modelValue?: number
        step?: number
        max?: number
        min?: number
        precision?: number
        disabled?: boolean
        readonly?: boolean
    }>(),
    {
        labelWidth: '26px',
        step: 1,
        disabled: false,
        readonly: false,
        precision: 2,
    },
)

const emit = defineEmits(['update:modelValue', 'change', 'end'])

const slots = useSlots()


const change = (value: number | undefined, ev: Event) => {
    emit('change', value, ev)
    emit('update:modelValue', value)
}

// Swipe
const { shift, alt } = useMagicKeys()
const labelRef = ref<HTMLElement>()
const inputRef = ref<HTMLInputElement>()
const startValue = ref<number>()
const numberValue = ref<number>(props.modelValue || 0)
const { posStart, posEnd, stop } = usePointerSwipe(labelRef, {
    threshold: 0,
    onSwipeStart: () => {
        if (props.disabled || props.readonly) return
        startValue.value = numberValue.value
    },
    onSwipe: (e) => {
        if (props.disabled || props.readonly) return
        // 检查startValue的值是否是数字，如果不是，退出函数
        if (!isNumber(startValue.value)) return
        // 根据props.step的值调整步长
        let step: number = props.step
        if (shift!.value) step *= 10
        if (alt!.value) step /= 10
        step = Math.max(step, 0.01)

        // 根据鼠标拖动的距离计算新的数值
        let value = (startValue.value as number) + Math.round(posEnd.x - posStart.x) * step

        // 如果props.min或props.max存在，则确保新值在指定范围内
        if (isDefined(props.min) && value < props.min) value = props.min
        if (isDefined(props.max) && value > props.max) value = props.max

        // 四舍五入计算的值，并将其分配给numberValue
        value = toFixed(value, props.precision)
        numberValue.value = value

        // 调用swipe函数并传递新值和事件对象
        change(value, e)
    },
    onSwipeEnd: (e) => {
        change(numberValue.value, e)
        startValue.value = undefined
        inputRef.value?.blur()
    },
})


// 输入框失去焦点时，执行 end 事件
const onBlur = (e: FocusEvent) => {
    if (props.disabled || props.readonly) return
    change(numberValue.value, e)
    emit('end', numberValue.value, e)
}

const hasLabel = computed(() => !!props.label || !!slots.label)

watch(() => props.modelValue, (value) => {
    if (value === undefined) return
    numberValue.value = toFixed(value, props.precision);
},
    { immediate: true } // 立即执行一次
);

</script>

<template>
    <a-input-number ref="inputRef" v-model="numberValue" :step="step" :max="max" :min="min" :disabled="disabled"
        :readonly="readonly" :hide-button="hasLabel" :class="{
            hasLabel,
        }" @change="change" @blur="onBlur" @keydown.enter="inputRef?.blur()">
        <template #prefix v-if="hasLabel">
            <div ref="labelRef" class="text-center cursor-ew-resize" :class="labelClass"
                :style="{ width: labelWidth, cursor: props.disabled ? 'not-allowed' : '' }">
                <slot v-if="$slots.label" name="label"></slot>
                <template v-else>{{ label }}</template>
            </div>
        </template>
        <template v-for="(item, key) in slots" :key="key" #[key]>
            <slot :name="key"></slot>
        </template>
    </a-input-number>
</template>

<style scoped>
.arco-input-wrapper.hasLabel {
    line-height: 1;
    padding-left: 0;
    padding-right: 4px;

    :deep(.arco-input-prefix) {
        padding-right: 0;
    }
}

.cursor-ew-resize {
    cursor: ew-resize;
}
</style>
