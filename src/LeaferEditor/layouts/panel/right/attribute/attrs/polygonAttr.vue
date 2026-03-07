<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Panel from "./panel.vue";
import { selectedProxyData } from '../../../../../proxyData';
import swipeNumber from '../../../../components/swipeNumber.vue';

const { t } = useI18n()

const sides = selectedProxyData('sides')
const cornerRadius = selectedProxyData('cornerRadius')
</script>

<template>
    <Panel :title=" t('panelRight.attribute.polygon.title')" :hiddenAdd="true">
        <a-row :gutter="[4, 4]">
            <a-col :span="20">
                <swipe-number v-bind="sides" :label=" t('panelRight.attribute.polygon.sides')" :min="3" :labelWidth="'66px'" />
            </a-col>
        </a-row>
        <a-row :gutter="[4, 4]">
            <a-col :span="20">
                <swipe-number v-bind="cornerRadius" :label=" t('panelRight.attribute.polygon.cornerRadius')" :min="0" :labelWidth="'66px'" />
            </a-col>
        </a-row>
    </Panel>
</template>