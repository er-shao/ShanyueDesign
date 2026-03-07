<script setup lang="ts">
import Panel from './panel.vue'
import strInput from '../../../../components/strInput.vue';
import { selectedProxyData } from '../../../../../proxyData';

const name = selectedProxyData('name')
</script>

<template>
    <Panel :title=" $t('panelRight.attribute.layerName.title')" hidden-add>
        <a-row :gutter="[8, 4]" align="center">
            <a-col :span="24">
                <strInput v-bind="name" />
            </a-col>
        </a-row>
    </Panel>
</template>