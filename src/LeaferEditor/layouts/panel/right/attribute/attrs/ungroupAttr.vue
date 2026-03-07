<!-- 多元素对齐 -->
<template>
    <div class="p2">
        <a-row :gutter="[4, 4]" :align="'center'">
            <a-col :span="24">
                <a-button size="small" @click="ungroup" long>
                    {{$t('panelRight.attribute.ungroup.title')}}
                </a-button>
            </a-col>
        </a-row>
    </div>
</template>

<script setup lang="ts">
import { useLeaferEditor } from '../../../../../index';

const editor = useLeaferEditor();

const ungroup = () => {
    editor.ungroup()
}
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