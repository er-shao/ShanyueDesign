<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useI18n } from 'vue-i18n';
import { watch } from 'vue';
import { arcolocale, localeType } from './i18n';

// editor i18n
import { setLocale } from './LeaferEditor';

const i18n = useI18n();

// const localeType = ref("zh-CN");
watch(localeType, (newVal) => {
  i18n.locale.value = newVal;
  setLocale(newVal);
  console.log("localeType changed to", newVal);
});

// TEST: change localeType
// localeType.value = "en-US";
// setTimeout(() => {
//   localeType.value = "zh-CN";
// }, 10000);

</script>

<template>
  <a-config-provider :locale="arcolocale">
    <RouterView />
  </a-config-provider>
</template>

<style scoped>

</style>
