<template>
    <a-input :clearable="clearable" :size="size" :disabled="disabled" v-model="value"
        style="width: max-content; padding: 2px;" @change="handleChange" v-bind="inputProps">
        <template #prefix>
            <div :class="[]">
                <span v-if="colorModes.includes(mode)" :class="[
                    'color-inner',
                ]" :style="{ background: cssString }"></span>
                <span v-else>
                    <template v-for="(value, key) in $slots" :key="key">
                        <div v-if="(mode + '-view') == key">
                            <slot :name="key"></slot>
                        </div>
                    </template>
                </span>
            </div>
        </template>
    </a-input>
</template>
<script lang="ts" setup>
import type {
    Size as SizeEnum
} from '@arco-design/web-vue'
import { computed, inject, type PropType, ref } from 'vue';
import { defaultValueKey, type fillType, type fillTypes } from './interface';
import { Base64toBlob } from "../../../utils/file";
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const props = defineProps({
    disabled: {
        type: Boolean,
        default: false,
    },
    clearable: {
        type: Boolean,
        default: false,
    },
    inputProps: {
        type: Object as PropType<any>,
        default: () => {
            return {
                autoWidth: true,
            };
        },
    },
    size: {
        type: String as PropType<SizeEnum>,
        default: 'mini',
    },
    colorModes: {
        type: Array,
        default: (): fillTypes[] => ['solid', 'linear', 'radial', 'image'],
    },
})


const emit = defineEmits(['change'])
const defaultValue = inject(defaultValueKey) as () => fillType
const formatData = ref(defaultValue())

const formatVal = (formatData: fillType) => {
    if (!formatData) return ''
    switch (formatData.type) {
        case 'solid':
            return formatData.color
        case 'linear':
            return t('components.fillPicker.fillType.linear')
        case 'radial':
            return t('components.fillPicker.fillType.radial')
        case 'image':
            return t('components.fillPicker.fillType.image')
        default:
            return ''
    }
}

const value = ref(formatVal(formatData.value))
const mode = ref(formatData.value?.type || 'solid')


const handleChange = (input: string) => {
    if (input === '') {
        value.value = "Transparent"
        emit('change', {
            type: 'solid',
            color: 'Transparent',
        })
    } else if (input[0] === '#' && (input.length === 9 || input.length === 7 || input.length === 4)) { // 判断是否是颜色值 #RRGGBBAA 或 #RRGGBB 或 #RGB
        emit('change', {
            type: 'solid',
            color: input,
        })
    } else if (input.toLowerCase() === 'transparent') { // 判断是否为 Transparent
        emit('change', {
            type: 'solid',
            color: 'Transparent',
        })
    }
}

// 计算属性：CSS字符串
const cssString = computed(() => {
    formatData.value = defaultValue()
    const data = formatData.value
    if (!data) return ''
    value.value = formatVal(data)
    switch (data.type) {
        case 'solid':
            return data.color
        case 'linear':
            if (!data.stops || data.stops.length < 2) return ''
            const stops = data.stops
                .map(stop => `${stop.color} ${stop.offset * 100}%`)
                .join(', ')
            const angle = Math.atan2(
                data.to.y - data.from.y,
                data.to.x - data.from.x
            ) * (180 / Math.PI) + 90
            return `linear-gradient(${angle}deg, ${stops})`
        case 'radial':
            if (!data.stops || data.stops.length < 2) return ''
            const radialStops = data.stops
                .map(stop => `${stop.color} ${stop.offset * 100}%`)
                .join(', ')
            const centerXPercent = (data.from.x || 0.5) * 100
            const centerYPercent = (data.from.y || 0.5) * 100
            return `radial-gradient(circle at ${centerXPercent}% ${centerYPercent}%, ${radialStops})`
        case 'image':
            let url = data.url
            // 图个url 是base64的，转换为blob
            if (url.startsWith('data:image/')) {
                const blob = Base64toBlob(url)
                url = URL.createObjectURL(blob!)
            }
            return `url("${url}") no-repeat center center / cover !important`
        default:
            return ''
    }
})

</script>
<style scoped lang="less">
@color-picker-trigger-input-color-inner-size: 22px;
@color-picker-trigger-input-color-inner-size-s: 18px;
@color-picker-trigger-input-color-inner-size-l: 26px;

:deep(.arco-input-prefix) {
    padding-right: 4px !important;
}

.color-inner {
    border: 1px solid rgba(0, 0, 0, 10%);
    display: block;
    width: @color-picker-trigger-input-color-inner-size;
    height: @color-picker-trigger-input-color-inner-size;
    color: transparent;
    position: relative;
    border-radius: 2px;

    &.size-s {
        width: @color-picker-trigger-input-color-inner-size-s;
        height: @color-picker-trigger-input-color-inner-size-s;
    }

    &.size-l {
        width: @color-picker-trigger-input-color-inner-size-l;
        height: @color-picker-trigger-input-color-inner-size-l;
    }
}
</style>
