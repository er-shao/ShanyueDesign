<template>
  <a-radio-group type="button" v-model="localeType" :options="langOptions"></a-radio-group>
  <div>

    <div ref="viewport" id="viewport" style=" width: 500px; height: 500px;"></div>

    <a-pagination :total="50" show-total show-jumper show-page-size style="margin-top: 20px; margin-bottom: 20px;" />
  </div>
  <a-space :size="20" style="margin-bottom: 20px;">
    <a-range-picker style="width: 300px;" />
    <a-time-picker type="time-range" style="width: 300px;" />
    <a-popconfirm content="Are you sure you want to delete?">
      <a-button type="primary">Popconfirm</a-button>
    </a-popconfirm>
  </a-space>
  <div>
    {{ localeType }} | {{ $t('greeting') }}
    {{ languageLabels }}
  </div>
  <input type="text" v-model="localeType" />
</template>

<script setup lang="ts">
import { localeType, langOptions } from '@/i18n';
import { getLanguageLabel } from '@/i18n/consts';
import { ref, watch, computed, onMounted } from 'vue';
// import LeaferEditor from "../LeaferEditor/layouts"
import { useLeaferEditor } from '../LeaferEditor'
import { useResizeObserver } from '@vueuse/core';
const viewport = ref()

// const localeType = ref("zh-CN");
watch(localeType, (newVal) => {
  console.log(newVal);
});
const languageLabels = computed(() => {
  return getLanguageLabel(localeType.value);
});
onMounted(() => {
  const app = useLeaferEditor()
  app.resize(viewport.value.offsetWidth, viewport.value.offsetHeight)
  viewport.value.append(app.view)
  useResizeObserver(viewport, (entries) => {
    const [entry] = entries
    const { width, height } = entry ? entry.contentRect : { width: 600, height: 600 }
    app.resize(width, height)
  })
  app.changeRulerUnit('cm')
})
</script>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
