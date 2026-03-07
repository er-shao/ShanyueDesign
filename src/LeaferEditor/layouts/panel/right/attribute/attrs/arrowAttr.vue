<script setup lang="ts">
import Panel from "./panel.vue";
import { selectedProxyData } from '../../../../../proxyData';
import { computed } from "vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const startArrow = selectedProxyData('startArrow', undefined, true);
const endArrow = selectedProxyData('endArrow', undefined, true);

const arrowList = computed(() => [
    { label: t('panelRight.attribute.arrow.options.none'), value: 'none' },
    { label: t('panelRight.attribute.arrow.options.angle'), value: 'angle' },
    { label: t('panelRight.attribute.arrow.options.angle-side'), value: 'angle-side' },
    { label: t('panelRight.attribute.arrow.options.arrow'), value: 'arrow' },
    { label: t('panelRight.attribute.arrow.options.triangle'), value: 'triangle' },
    { label: t('panelRight.attribute.arrow.options.triangle-flip'), value: 'triangle-flip' },
    { label: t('panelRight.attribute.arrow.options.circle'), value: 'circle' },
    { label: t('panelRight.attribute.arrow.options.circle-line'), value: 'circle-line' },
    { label: t('panelRight.attribute.arrow.options.square'), value: 'square' },
    { label: t('panelRight.attribute.arrow.options.square-line'), value: 'square-line' },
    { label: t('panelRight.attribute.arrow.options.diamond'), value: 'diamond' },
    { label: t('panelRight.attribute.arrow.options.diamond-line'), value: 'diamond-line' },
    { label: t('panelRight.attribute.arrow.options.mark'), value: 'mark' },
]);
</script>
<template>
    <Panel :title="t('panelRight.attribute.arrow.title')" :hiddenAdd="true">
        <div class="line-attr">
            <a-row :gutter="[4, 4]">
                <a-col :span="24">
                    <a-select size="small" :placeholder="t('panelRight.attribute.arrow.startPlaceholder')"
                        v-bind="startArrow" :options="arrowList" allow-search>
                        <template #prefix>
                            {{ t('panelRight.attribute.arrow.startPrefix') }}
                        </template>
                    </a-select>
                </a-col>
                <a-col :span="24">
                    <a-select size="small" :placeholder="t('panelRight.attribute.arrow.endPlaceholder')"
                        v-bind="endArrow" :options="arrowList" allow-search>
                        <template #prefix>
                            {{ t('panelRight.attribute.arrow.endPrefix') }}
                        </template>
                    </a-select>
                </a-col>
            </a-row>
        </div>
    </Panel>
</template>
<style>
.font-preview-cls {
    background-size: cover;
    background-position: center center;
    height: 40px;
    width: 200px;
    color: #fff;
    text-align: center;
    -webkit-filter: invert(100%);
    filter: invert(100%);
}
</style>