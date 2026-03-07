<script setup lang="ts">
import { shallowRef, watch } from "vue";
import Panel from './panel.vue'

import { useLeaferEditor } from '../../../../../index';
import { useActiveObjectModel } from "../useActiveObjectModel";
import SwipeNumber from '../../../../components/swipeNumber.vue';

const editor = useLeaferEditor();
const drawStyle = shallowRef(editor.drawPenStyle)


const strokeWidth = useActiveObjectModel<number>(drawStyle.value.strokeWidth as number, (value) => {
    drawStyle.value = { ...drawStyle.value, strokeWidth: value };
})
const stroke = useActiveObjectModel<string>(drawStyle.value.stroke as string, (value) => {
    drawStyle.value = { ...drawStyle.value, stroke: value };
})
watch(drawStyle, (value) => {
    editor.setDrawPenStyle(value);
});


const setValue = (v: number) => {
    strokeWidth.value.onChange(v);
}
const onColorChange = (color: string) => {
    stroke.value.onChange(color);
}
</script>

<template>
    <Panel :title="$t('panelRight.attribute.draw.title')" hidden-add>
        <a-row :gutter="[4, 4]" align="center">
            <a-col :span="13">
                <SwipeNumber size="small" v-bind="strokeWidth" :step="1" :min="1" style="padding: 0 6px"
                    label-class="text-left" label-width="60px">
                    <template #label>
                        <div>{{ $t('panelRight.attribute.draw.strokeWidth') }}</div>
                    </template>
                </SwipeNumber>
            </a-col>
            <a-col :span="11">
                <a-radio-group size="small" type="button" v-model="strokeWidth.modelValue" @change="setValue">
                    <a-radio :value="2">2</a-radio>
                    <a-radio :value="5">5</a-radio>
                    <a-radio :value="10">10</a-radio>
                </a-radio-group>
            </a-col>
            <a-col :span="17">
                <a-color-picker v-model="stroke.modelValue" size="mini" @change="onColorChange">
                    <a-input size="mini" v-model="stroke.modelValue">
                        <template #prefix>
                            {{ $t('panelRight.attribute.draw.strokeColor') }}<div class="w18px h18px ml5px"
                                :style="{ backgroundColor: (stroke.modelValue as string) }">
                            </div>
                        </template>
                    </a-input>
                </a-color-picker>
            </a-col>
        </a-row>
    </Panel>
</template>