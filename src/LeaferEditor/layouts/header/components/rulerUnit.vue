<template>
    <a-space size="medium">
        <a-tooltip effect="dark" :content="t('header.rulerUnit.unit') + '(' + rulerUnitLabel + ')'" mini>
            <a-button style="width: 32px;" class="icon-btn pd-5px" @click="changeRulerUnit">
                {{ rulerUnit }}
            </a-button>
        </a-tooltip>
    </a-space>
</template>
<style scoped></style>

<script setup lang="ts">
import { useLeaferEditor } from '../../../index'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const editor = useLeaferEditor()

// px、cm、in、pt、pc、mm
const rulerUnitList = computed(() => [
    { label: t('header.rulerUnit.px'), value: 'px' },
    { label: t('header.rulerUnit.cm'), value: 'cm' },
    { label: t('header.rulerUnit.in'), value: 'in' },
    { label: t('header.rulerUnit.mm'), value: 'mm' },
    { label: t('header.rulerUnit.pt'), value: 'pt' },
    { label: t('header.rulerUnit.pc'), value: 'pc' },
])

const rulerUnit = ref(rulerUnitList.value[0]!.value || 'px')
const rulerUnitLabel = ref(rulerUnitList.value[0]!.label || '')

let n = 1
const changeRulerUnit = () => {
    const list = rulerUnitList.value
    const unit = list[n]?.value || 'px'
    rulerUnitLabel.value = list[n]?.label || ''
    n = (n + 1) % list.length
    editor.changeRulerUnit(unit)
    rulerUnit.value = unit
}
</script>
