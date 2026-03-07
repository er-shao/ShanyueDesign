<script setup lang="ts">
import { computed } from 'vue';
import Panel from './panel.vue'
import { activeObject } from '../../../../../proxyData';
import { useLeaferEditor } from '../../../../../index';
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const editor = useLeaferEditor();

const children = computed(() => {
    if (!activeObject.value) {
        return []
    } else {
        return activeObject.value.children
    }
})

</script>
<template>
    <div>
        <Panel hidden-add>
            <template #title>
                <div>
                    {{ t('panelRight.attribute.group.title') }}
                    <a-tooltip mini position="lb">
                        <icon-question-circle class="cursor-pointer" :size="14" style="color: rgb(var(--primary-6))" />
                        <template #content>
                            <a-divider orientation="left">
                                {{ t('panelRight.attribute.group.tooltip.visibility') }}</a-divider>
                            <p>{{ t('panelRight.attribute.group.tooltip.visibilityDesc') }}</p>
                            <a-divider orientation="left">{{ t('panelRight.attribute.group.tooltip.mask') }}</a-divider>
                            <p>{{ t('panelRight.attribute.group.tooltip.maskDesc') }}</p>
                            <a-divider
                                orientation="left">{{ t('panelRight.attribute.group.tooltip.eraser') }}</a-divider>
                            <p>{{ t('panelRight.attribute.group.tooltip.eraserDesc') }}</p>
                            <a-divider orientation="left"></a-divider>
                            <p>{{ t('panelRight.attribute.group.tooltip.note') }}</p>
                        </template>
                    </a-tooltip>
                </div>
            </template>
            <a-space direction="vertical" style="width: 100%">
                <a-row :gutter="[8, 4]">
                    <a-col :span="24">
                        <div style="width: 100%; padding: 2px;max-height: 100%">
                            <a-tree :data="children" style="overflow-x: auto;" size="small">
                                <template #title="nodeData">
                                    <span :title="nodeData.name" class="name">{{ nodeData.name }}</span>
                                </template>
                                <template #extra="nodeData">
                                    <div style="position: absolute; right: 8px; font-size: 12px; color: #3370ff;">
                                        <!-- 显隐按钮 -->
                                        <a-tooltip mini position="bottom"
                                            :content="t('panelRight.attribute.group.tooltip.visibility')">
                                            <a-button size="small" class="icon-btn"
                                                @click="nodeData.visible = !nodeData.visible">
                                                <template #icon>
                                                    <icon-eye v-if="nodeData.visible === true" />
                                                    <icon-eye-invisible v-else />
                                                </template>
                                            </a-button>
                                        </a-tooltip>
                                        <!-- 遮罩按钮 -->
                                        <a-tooltip mini position="bottom"
                                            :content="nodeData.mask ? `${nodeData.mask}` : t('panelRight.attribute.group.tooltip.mask')">
                                            <a-button size="small" class="icon-btn" @click="() => {
                                                nodeData.mask = !nodeData.mask;
                                                const currentScale = editor.currentScale
                                                editor.zoom(currentScale + 1)
                                                editor.zoom(currentScale)
                                            }">
                                                <template #icon>
                                                    <div class="i-svg:mask icon"
                                                        :class="{ 'arco-icon-check': nodeData.mask }"></div>
                                                </template>
                                            </a-button>
                                        </a-tooltip>
                                        <!-- 擦除按钮 -->
                                        <a-tooltip mini position="bottom"
                                            :content="t('panelRight.attribute.group.tooltip.eraser')">
                                            <a-button size="small" class="icon-btn" @click="() => {
                                                nodeData.eraser = !nodeData.eraser
                                                const currentScale = editor.currentScale
                                                editor.zoom(currentScale + 1)
                                                editor.zoom(currentScale)
                                            }">
                                                <template #icon>
                                                    <div class="i-svg:eraser icon"
                                                        :class="{ 'arco-icon-check': nodeData.eraser }"></div>
                                                </template>
                                            </a-button>
                                        </a-tooltip>
                                    </div>
                                </template>
                            </a-tree>
                        </div>
                    </a-col>
                </a-row>
            </a-space>
        </Panel>
    </div>
</template>
<style scoped lang="less">
.name {
    overflow: hidden;
}

:deep(.arco-tree-node) {
    padding-right: 10px;

    .arco-tree-node-title {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        // .arco-tree-node-title-text {
        // }
    }
}

.arco-icon-check {
    color: rgb(var(--primary-6));
}
</style>
