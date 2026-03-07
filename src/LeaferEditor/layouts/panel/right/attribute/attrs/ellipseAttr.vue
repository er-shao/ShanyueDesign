<script setup lang="ts">
import Panel from "./panel.vue";
import { selectedProxyData } from '../../../../../proxyData';
import swipeNumber from '../../../../components/swipeNumber.vue';

const innerRadius = selectedProxyData('innerRadius')
const startAngle = selectedProxyData('startAngle')
const endAngle = selectedProxyData('endAngle')
</script>

<template>
    <Panel :title="$t('panelRight.attribute.ellipse.title')" :hiddenAdd="true">
        <a-row :gutter="[4, 4]">
            <a-col :span="20">
                <swipe-number v-bind="innerRadius" :label="$t('panelRight.attribute.ellipse.innerRadius')" :min="0" :max="1" :step="0.01" :labelWidth="'66px'" />
            </a-col>
        </a-row>
        <a-row :gutter="[4, 4]">
            <a-col :span="20">
                <swipe-number v-bind="startAngle" :label="$t('panelRight.attribute.ellipse.startAngle')" :min="0" :max="360" :step="0.5" :labelWidth="'66px'" />
            </a-col>
        </a-row>
        <a-row :gutter="[4, 4]">
            <a-col :span="20">
                <swipe-number v-bind="endAngle" :label="$t('panelRight.attribute.ellipse.endAngle')" :min="0" :max="360" :step="0.5" :labelWidth="'66px'" />
            </a-col>
        </a-row>
    </Panel>
</template>