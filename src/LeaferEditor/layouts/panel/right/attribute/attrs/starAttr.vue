<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Panel from "./panel.vue";
import { selectedProxyData } from '../../../../../proxyData';
import swipeNumber from '../../../../components/swipeNumber.vue';

const { t } = useI18n()

const corners = selectedProxyData('corners')
const innerRadius = selectedProxyData('innerRadius')
const cornerRadius = selectedProxyData('cornerRadius')
</script>

<template>
    <Panel :title=" t('panelRight.attribute.star.title')" :hiddenAdd="true">
        <a-row :gutter="[4, 4]">
            <a-col :span="20">
                <swipe-number v-bind="corners" :label=" t('panelRight.attribute.star.corners')" :min="3" :labelWidth="'66px'" />
            </a-col>
        </a-row>
        <a-row :gutter="[4, 4]">
            <a-col :span="20">
                <swipe-number v-bind="cornerRadius" :label=" t('panelRight.attribute.star.cornerRadius')" :min="0" :labelWidth="'66px'" />
            </a-col>
        </a-row>
        <a-row :gutter="[4, 4]">
            <a-col :span="20">
                <swipe-number v-bind="innerRadius" :label=" t('panelRight.attribute.star.innerRadius')" :min=".01" :max="1" :step="0.05"
                    :labelWidth="'66px'" />
            </a-col>
        </a-row>
    </Panel>
</template>