<script setup lang="ts">
import { ref, computed, watch, useSlots } from 'vue'

const props = withDefaults(
    defineProps<{
        label?: string
        labelWidth?: string
        labelClass?: string
        modelValue?: string
        disabled?: boolean
        readonly?: boolean
    }>(),
    {
        labelWidth: '26px',
        step: 1,
        disabled: false,
        readonly: false,
    },
)

const emit = defineEmits(['change', 'end'])

const slots = useSlots()


const change = (value: number | undefined, ev: Event) => {
    emit('change', value, ev)
}


const inputRef = ref<HTMLInputElement>()
const strValue = ref<string>(props.modelValue || "")



// 输入框失去焦点时，执行 end 事件
const onBlur = () => {
    if (props.disabled || props.readonly) return
    emit('end', strValue.value, undefined)
}

const hasLabel = computed(() => !!props.label || !!slots.label)

watch(() => props.modelValue, (value) => {
    if (value === undefined) return
    strValue.value = value
},
    { immediate: true } // 立即执行一次
);

</script>

<template>
    <a-input ref="inputRef" v-model="strValue" :disabled="disabled" :readonly="readonly" :hide-button="hasLabel" :class="{
        hasLabel,
    }" @change="change" @blur="onBlur" @keydown.enter="inputRef?.blur()">
        <template #prefix v-if="hasLabel">
            <div ref="labelRef" class="text-center" :class="labelClass"
                :style="{ width: labelWidth, cursor: props.disabled ? 'not-allowed' : '' }">
                <slot v-if="$slots.label" name="label"></slot>
                <template v-else>{{ label }}</template>
            </div>
        </template>
        <template v-for="(item, key) in slots" :key="key" #[key]>
            <slot :name="key"></slot>
        </template>
    </a-input>
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
</style>
