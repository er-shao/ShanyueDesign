<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import type { IShadowEffect } from "@leafer-ui/interface"
import { useI18n } from 'vue-i18n' 

import Panel from './panel.vue'
import swipeNumber from '../../../../components/swipeNumber.vue';
import { selectedProxyData } from '../../../../../proxyData';

const { t } = useI18n()

const shadow = selectedProxyData('shadow')
const innerShadow = selectedProxyData('innerShadow')

const shadowArray = ref<IShadowEffect[]>([])
const innerShadowArray = ref<IShadowEffect[]>([])
watchEffect(() => {
    if (shadow.value.modelValue) {
        shadowArray.value = <any>shadow.value.modelValue
    } else {
        shadowArray.value = []
    }
})
watchEffect(() => {
    if (innerShadow.value.modelValue) {
        innerShadowArray.value = <any>innerShadow.value.modelValue
    } else {
        innerShadowArray.value = []
    }
})

const refreshShadow = () => {
    shadow.value.onChange([])
    shadow.value.onChange(shadowArray.value.length <= 0 ? [] : shadowArray.value)
}

const refreshInnerShadow = () => {
    innerShadow.value.onChange([])
    innerShadow.value.onChange(innerShadowArray.value.length <= 0 ? [] : innerShadowArray.value)
}

const addShadow = () => {
    shadowArray.value.push({
        x: 5,
        y: 5,
        blur: 5,
        spread: 1,
        color: '#66CCFF',
        box: false,
        visible: true,
    })
    refreshShadow()
    shadow.value.onEnd()
}
const removeShadow = (index: number) => {
    shadowArray.value.splice(index, 1)
    refreshShadow()
    shadow.value.onEnd()
}

const addInnerShadow = () => {
    innerShadowArray.value.push({
        x: 5,
        y: 5,
        blur: 5,
        spread: 1,
        color: '#66CCFF',
        box: false,
        visible: true,
    })
    refreshInnerShadow()
    shadow.value.onEnd()
}
const removeInnerShadow = (index: number) => {
    innerShadowArray.value.splice(index, 1)
    refreshInnerShadow()
    shadow.value.onEnd()
}
</script>

<template>
    <div>
        <Panel :title=" t('panelRight.attribute.shadow.outer.title')" @click-add="addShadow">
            <a-space direction="vertical">
                <a-row v-if="shadowArray.length > 0" :gutter="[4, 4]" v-for="(item, index) in shadowArray" :key="index">
                    <a-col :span="10">
                        <a-switch v-model="item.visible" @change="() => {
                            refreshShadow()
                            shadow.onEnd()
                        }">
                            <template #checked>{{  t('panelRight.attribute.shadow.switch.checked') }}</template>
                            <template #unchecked>{{  t('panelRight.attribute.shadow.switch.unchecked') }}</template>
                        </a-switch>
                    </a-col>
                    <a-col :span="4" class="mlauto">
                        <a-button size="small" class="icon-btn" @click="removeShadow(index)">
                            <template #icon>
                                <icon-minus />
                            </template>
                        </a-button>
                    </a-col>
                    <a-col :span="12">
                        <swipeNumber size="small" v-model="item.x" @change="refreshShadow" @end="shadow.onEnd"
                            style="padding: 0 6px" label-class="text-left" label-width="55px">
                            <template #label>
                                {{  t('panelRight.attribute.shadow.outer.xOffset') }}
                            </template>
                        </swipeNumber>
                    </a-col>
                    <a-col :span="12">
                        <swipeNumber size="small" v-model="item.y" @change="refreshShadow" @end="shadow.onEnd"
                            style="padding: 0 6px" label-class="text-left" label-width="55px">
                            <template #label>
                                {{  t('panelRight.attribute.shadow.outer.yOffset') }}
                            </template>
                        </swipeNumber>
                    </a-col>
                    <a-col :span="12">
                        <swipeNumber size="small" v-model="item.blur" @change="refreshShadow" @end="shadow.onEnd"
                            style="padding: 0 6px" :min="0" label-class="text-left" label-width="55px">
                            <template #label>
                                {{  t('panelRight.attribute.shadow.outer.blurRadius') }}
                            </template>
                        </swipeNumber>
                    </a-col>
                    <a-col :span="12">
                        <swipeNumber size="small" v-model="item.spread" @change="refreshShadow" @end="shadow.onEnd"
                            style="padding: 0 6px" label-class="text-left" label-width="55px">
                            <template #label>
                                {{  t('panelRight.attribute.shadow.outer.spread') }}
                            </template>
                        </swipeNumber>
                    </a-col>
                    <a-col :span="20">
                        <a-color-picker v-model="item.color" size="mini" :position="'bottom'"
                            @mousedown="(e: MouseEvent) => e.preventDefault()" @change="refreshShadow">
                            <a-input size="mini" v-model="item.color" @blur="shadow.onEnd">
                                <template #prefix>
                                    {{  t('panelRight.attribute.shadow.outer.color') }}
                                    <div class="w18px h18px ml5px" :style="{ backgroundColor: item.color as string }">
                                    </div>
                                </template>
                            </a-input>
                        </a-color-picker>
                    </a-col>
                    <a-col :span="20">
                        <a-checkbox v-model="item.box"
                            @change="refreshShadow">{{  t('panelRight.attribute.shadow.outer.showOnlyOutside') }}</a-checkbox>
                    </a-col>
                </a-row>
            </a-space>
        </Panel>
        <Panel :title=" t('panelRight.attribute.shadow.inner.title')" @click-add="addInnerShadow">
            <a-space direction="vertical">
                <a-row v-if="innerShadowArray.length > 0" :gutter="[4, 4]" v-for="(item, index) in innerShadowArray"
                    :key="index">
                    <a-col :span="10">
                        <a-switch v-model="item.visible" @change="() => {
                            refreshInnerShadow()
                            innerShadow.onEnd()
                        }">
                            <template #checked>{{  t('panelRight.attribute.shadow.switch.checked') }}</template>
                            <template #unchecked>{{  t('panelRight.attribute.shadow.switch.unchecked') }}</template>
                        </a-switch>
                    </a-col>
                    <a-col :span="4" class="mlauto">
                        <a-button size="small" class="icon-btn" @click="removeInnerShadow(index)">
                            <template #icon>
                                <icon-minus />
                            </template>
                        </a-button>
                    </a-col>
                    <a-col :span="12">
                        <swipeNumber size="small" v-model="item.x" @end="innerShadow.onEnd" @change="refreshInnerShadow"
                            style="padding: 0 6px" label-class="text-left" label-width="55px">
                            <template #label>
                                {{  t('panelRight.attribute.shadow.inner.xOffset') }}
                            </template>
                        </swipeNumber>
                    </a-col>
                    <a-col :span="12">
                        <swipeNumber size="small" v-model="item.y" @end="innerShadow.onEnd" @change="refreshInnerShadow"
                            style="padding: 0 6px" label-class="text-left" label-width="55px">
                            <template #label>
                                {{  t('panelRight.attribute.shadow.inner.yOffset') }}
                            </template>
                        </swipeNumber>
                    </a-col>
                    <a-col :span="12">
                        <swipeNumber size="small" v-model="item.blur" @end="innerShadow.onEnd"
                            @change="refreshInnerShadow" :min="0" style="padding: 0 6px" label-class="text-left"
                            label-width="55px">
                            <template #label>
                                {{  t('panelRight.attribute.shadow.inner.blurRadius') }}
                            </template>
                        </swipeNumber>
                    </a-col>
                    <a-col :span="12">
                        <swipeNumber size="small" v-model="item.spread" @end="innerShadow.onEnd"
                            @change="refreshInnerShadow" style="padding: 0 6px" label-class="text-left"
                            label-width="55px">
                            <template #label>
                                {{  t('panelRight.attribute.shadow.inner.spread') }}
                            </template>
                        </swipeNumber>
                    </a-col>
                    <a-col :span="20">
                        <a-color-picker v-model="item.color" size="mini" :position="'bottom'"
                            @mousedown="(e: MouseEvent) => e.preventDefault()" @change="refreshInnerShadow">
                            <a-input size="mini" v-model="item.color" @blur="innerShadow.onEnd">
                                <template #prefix>
                                    {{  t('panelRight.attribute.shadow.inner.color') }}
                                    <div class="w18px h18px ml5px" :style="{ backgroundColor: item.color as string }">
                                    </div>
                                </template>
                            </a-input>
                        </a-color-picker>
                    </a-col>
                </a-row>
            </a-space>
        </Panel>
    </div>
</template>

<style scoped lang="less"></style>