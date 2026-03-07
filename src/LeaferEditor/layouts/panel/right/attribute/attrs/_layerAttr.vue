<script setup lang="ts">
import Panel from './panel.vue'
import swipeNumber from '../../../../components/swipeNumber.vue'
import { computed, watch } from 'vue'
import { useActiveObjectModel } from '../useActiveObjectModel'
import { activeObject } from '../../../../../proxyData'
import { useI18n } from "vue-i18n"
const { t } = useI18n()

type dataType = {
    modelValue: any
    onChange: (value: any) => void
    onEnd: () => void
}

interface Props {
    opacity: dataType
    blendMode: dataType
    visible: dataType
    title?: string
}

const props = defineProps<Props>()

const opacity = props.opacity
const blendMode = props.blendMode
const visible = props.visible
const title = computed(() => props.title || t('panelRight.attribute.layer.title'))

const newBlendMode = useActiveObjectModel(blendMode.modelValue, (value) => {
    blendMode.onChange(value)
    blendMode.onEnd()
})
const newVisible = useActiveObjectModel(visible.modelValue, (value) => {
    visible.onChange(value)
    visible.onEnd()
})
const newOpacity = useActiveObjectModel(opacity.modelValue * 100, (value) => {
    opacity.onChange(value / 100)
})

watch(() => activeObject.value, (value) => {
    if (!value) return
    newBlendMode.value.onChange(value.blendMode)
    newVisible.value.onChange(value.visible)
    newOpacity.value.onChange(value.opacity! * 100)
})

const blendModeOptions = computed(() => [
    {
        value: 'pass-through',
        label: t('panelRight.attribute.layer.blendMode.default'),
    },
    {
        value: 'normal',
        label: t('panelRight.attribute.layer.blendMode.isolate'),
    },
    {
        isGroup: true,
        label: t('panelRight.attribute.layer.blendMode.darken.group'),
        options: [
            { value: 'darken', label: t('panelRight.attribute.layer.blendMode.darken.darken') },
            { value: 'multiply', label: t('panelRight.attribute.layer.blendMode.darken.multiply') },
            { value: 'color-burn', label: t('panelRight.attribute.layer.blendMode.darken.colorBurn') },
        ],
    },
    {
        isGroup: true,
        label: t('panelRight.attribute.layer.blendMode.lighten.group'),
        options: [
            { value: 'lighten', label: t('panelRight.attribute.layer.blendMode.lighten.lighten') },
            { value: 'screen', label: t('panelRight.attribute.layer.blendMode.lighten.screen') },
            { value: 'color-dodge', label: t('panelRight.attribute.layer.blendMode.lighten.colorDodge') },
        ],
    },
    {
        isGroup: true,
        label: t('panelRight.attribute.layer.blendMode.contrast.group'),
        options: [
            { value: 'overlay', label: t('panelRight.attribute.layer.blendMode.contrast.overlay') },
            { value: 'soft-light', label: t('panelRight.attribute.layer.blendMode.contrast.softLight') },
            { value: 'hard-light', label: t('panelRight.attribute.layer.blendMode.contrast.hardLight') },
        ],
    },
    {
        isGroup: true,
        label: t('panelRight.attribute.layer.blendMode.comparison.group'),
        options: [
            { value: 'difference', label: t('panelRight.attribute.layer.blendMode.comparison.difference') },
            { value: 'exclusion', label: t('panelRight.attribute.layer.blendMode.comparison.exclusion') },
        ],
    },
    {
        isGroup: true,
        label: t('panelRight.attribute.layer.blendMode.color.group'),
        options: [
            { value: 'hue', label: t('panelRight.attribute.layer.blendMode.color.hue') },
            { value: 'saturation', label: t('panelRight.attribute.layer.blendMode.color.saturation') },
            { value: 'color', label: t('panelRight.attribute.layer.blendMode.color.color') },
            { value: 'luminosity', label: t('panelRight.attribute.layer.blendMode.color.luminosity') },
        ],
    },
])
</script>

<template>
    <Panel :title="title" hidden-add>
        <a-row :gutter="[8, 4]" align="center">
            <a-col :span="12">
                <a-select size="small" v-bind="newBlendMode" @change="newBlendMode.onChange($event)"
                    :options="blendModeOptions">
                    <template #prefix>
                        <icon-layers />
                    </template>
                </a-select>
            </a-col>
            <a-col :span="9">
                <swipeNumber size="small" v-bind="newOpacity" :min="0" :max="100" :step="1" :precision="0">
                    <template #label>
                        <icon-mosaic />
                    </template>
                    <template #suffix>
                        <div>%</div>
                    </template>
                </swipeNumber>
            </a-col>
            <a-col :span="3" class="mlauto">
                <a-button size="small" class="icon-btn" @click="newVisible.onChange(!newVisible.modelValue)">
                    <template #icon>
                        <icon-eye v-if="newVisible.modelValue === true" />
                        <icon-eye-invisible v-else />
                    </template>
                </a-button>
            </a-col>
        </a-row>
    </Panel>
</template>