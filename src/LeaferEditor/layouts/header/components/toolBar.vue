<template>
    <div>
        <a-tooltip effect="dark" :content="t('header.toolBar.group')" mini>
            <a-button class="icon-btn pd-5px" @click="handleGroupBtnClick" :disabled="!isGroupBtnEnabled">
                <div class="i-svg:object-group icon"></div>
            </a-button>
        </a-tooltip>
        <a-tooltip effect="dark" :content="t('header.toolBar.ungroup')" mini>
            <a-button class="icon-btn pd-5px" @click="handleUnGroupBtnClick" :disabled="!isUnGroupBtnEnabled">
                <div class="i-svg:object-ungroup icon"></div>
            </a-button>
        </a-tooltip>
    </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

import { useLeaferEditor } from '../../../index';
import { selectedProxyData, activeObject } from '../../../proxyData';
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const editor = useLeaferEditor();
const tag = selectedProxyData('tag')

watch(activeObject, (newValue) => {
    if (newValue === null) {
        isGroupBtnEnabled.value = true
    } else {
        isGroupBtnEnabled.value = false
    }
})
const isGroupBtnEnabled = ref(activeObject.value === null)

const isUnGroupBtnEnabled = computed(() => {
    return tag.value.modelValue === 'Group' && tag.value.modelValue !== 'Pen'
})

const handleGroupBtnClick = () => {
    if (isGroupBtnEnabled) {
        editor.group()
    }
};
const handleUnGroupBtnClick = () => {
    if (isUnGroupBtnEnabled) {
        editor.ungroup()
    }
};
</script>

<style scoped lang="less">
svg {
    display: inline-block;
    touch-action: none;
    text-align: center;
}

.icon {
    width: 18px;
    height: 18px;
    fill: currentColor;
}
</style>