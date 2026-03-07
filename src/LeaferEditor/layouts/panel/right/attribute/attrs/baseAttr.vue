<template>
    <div class="p2">
        <a-row :gutter="[4, 4]" :align="'center'">
            <a-col :span="10">
                <swipeNumber size="small" label="X" v-bind="x" :disabled="disabled" :readonly="readonly" :precision="0">
                </swipeNumber>
            </a-col>
            <a-col :span="10">
                <swipeNumber size="small" label="Y" v-bind="y" :disabled="disabled" :readonly="readonly" :precision="0">
                </swipeNumber>
            </a-col>
            <a-col :span="10" v-if="tag.modelValue !== 'Group' && tag.modelValue !== 'Pen'">
                <swipeNumber size="small" label="W" v-bind="width" :min="1" :disabled="disabled" :readonly="readonly"
                    :precision="0">
                </swipeNumber>
            </a-col>
            <a-col :span="10" v-if="tag.modelValue !== 'Group' && tag.modelValue !== 'Pen'">
                <swipeNumber size="small" label="H" v-bind="height" :min="1" :disabled="disabled" :readonly="readonly"
                    :precision="0">
                </swipeNumber>
            </a-col>
            <a-col :span="10">
                <swipeNumber size="small" label="RX" v-bind="rx" :disabled="disabled" :readonly="readonly">
                </swipeNumber>
            </a-col>
            <a-col :span="10">
                <swipeNumber size="small" label="RY" v-bind="ry" :disabled="disabled" :readonly="readonly">
                </swipeNumber>
            </a-col>
            <a-col :span="10">
                <swipeNumber size="small" v-bind="rotation" :disabled="disabled" :readonly="readonly">
                    <template #label>
                        <BxRevision />
                    </template>
                    <template #suffix>
                        <div class="absolute top-1 right-1">°</div>
                    </template>
                </swipeNumber>
            </a-col>
            <a-col :span="8">
                <a-space size="mini">
                    <a-tooltip mini position="bottom">
                        <a-button size="small" @click="mousetrap.trigger('shift+h')" :disabled="disabled"
                            :readonly="readonly">
                            <template #icon>
                                <BxReflectHorizontal />
                            </template>
                        </a-button>
                        <template #content>
                            <TipContentKey :content="$t('panelRight.attribute.some.transform.horizontalFlip')" :keys="['Shift', 'H']" />
                        </template>
                    </a-tooltip>
                    <a-tooltip mini position="bottom">
                        <a-button size="small" @click="() => {
                            mousetrap.trigger('shift+v')
                        }" :disabled="disabled" :readonly="readonly">
                            <template #icon>
                                <BxReflectVertical />
                            </template>
                        </a-button>
                        <template #content>
                            <TipContentKey :content="$t('panelRight.attribute.some.transform.verticalFlip')" :keys="['Shift', 'V']" />
                        </template>
                    </a-tooltip>
                </a-space>
            </a-col>
        </a-row>
    </div>
    <div class="attr">
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import mousetrap from "mousetrap"
import TipContentKey from "../../../../components/tooltip";
import swipeNumber from '../../../../components/swipeNumber.vue';
import { selectedProxyData, activeObject } from '../../../../../proxyData';

import BxRevision from "../../../../assets/icons/bx-revision.svg";
import BxReflectHorizontal from "../../../../assets/icons/bx-reflect-vertical.svg";
import BxReflectVertical from "../../../../assets/icons/bx-reflect-horizontal.svg";

const readonly = ref(false)
const disabled = ref(false)

const width = selectedProxyData("width")
const height = selectedProxyData("height");
const x = selectedProxyData("x");
const y = selectedProxyData("y");

const rotation = selectedProxyData('rotation')
const rx = selectedProxyData('skewX')
const ry = selectedProxyData('skewY')
const tag = selectedProxyData('tag')

const locked = selectedProxyData('locked', false)
readonly.value = locked.value.modelValue
disabled.value = locked.value.modelValue
watch(locked, (value) => {
    readonly.value = value.modelValue
    disabled.value = value.modelValue
})
</script>
<style scoped>
svg {
    display: inline-block;
    vertical-align: -3.5px;
    width: 20px;
    height: 20px;
    touch-action: none;
    text-align: center;
    fill: currentColor;
}
</style>