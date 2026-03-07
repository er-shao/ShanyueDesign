<template>
    <panel title="控制点位置" :hiddenAdd="true">
        <a-grid :cols="3" :colGap="5" :rowGap="5" class="grid-demo-grid">
            <a-grid-item class="demo-item" v-for="align in aligns" :key="align" :span="1">
                <a-button :disabled="disabled" @click="onclick($event, align)"
                    :type="currentType === align ? 'primary' : 'secondary'" :value="align">
                    <template #icon>{{align.split('-').map((s) => s.charAt(0).toUpperCase()).join('')}}</template>
                </a-button>
            </a-grid-item>
        </a-grid>
    </panel>
</template>

<script setup lang="ts">
import panel from "./panel.vue";
import { selectedProxyData } from '../../../../../proxyData';
import { computed, ref, watch } from 'vue';
// 方位
type IAlign =
    | 'top-left'
    | 'top'
    | 'top-right'
    | 'right'
    | 'bottom-right'
    | 'bottom'
    | 'bottom-left'
    | 'left'
    | 'center'

const aligns: IAlign[] = [
    'top-left',
    'top',
    'top-right',
    'left',
    'center',
    'right',
    'bottom-left',
    'bottom',
    'bottom-right',
]

const props = withDefaults(
    defineProps<{
        disabled?: boolean
        readonly?: boolean
    }>(),
    {
        disabled: false,
        readonly: false,
    },
)
const locked = selectedProxyData('locked', false)
const disabled = computed(() => props.disabled || props.readonly || locked.value.modelValue)

const origin = selectedProxyData("origin", 'top-left')
const currentType = ref(origin.value.modelValue)
watch(() => origin.value.modelValue, (newValue) => {
    currentType.value = newValue
})
const onclick = (e: MouseEvent, align: IAlign) => {
    origin.value.onChange(align)
    currentType.value = align
    // origin.value.onEnd()
}

</script>
<style scoped>
:deep(.arco-col-8) {
    flex: 0;
    width: auto;
}

.grid-demo-grid {
    width: 110px;
}

.grid-demo-grid .demo-item,
.grid-demo-grid .demo-suffix {
    /* height: 48px;
    line-height: 48px; */
    color: var(--color-white);
    text-align: center;
}
</style>