<script setup lang="ts">
import { selectedProxyData } from '../../../../../proxyData';
import layerAttr from "./_layerAttr.vue";

const opacity = selectedProxyData('opacity')
const blendMode = selectedProxyData('blendMode')
const visible = selectedProxyData('visible')

</script>

<template>
    <layerAttr :opacity="opacity" :blendMode="blendMode" :visible="visible" />
</template>