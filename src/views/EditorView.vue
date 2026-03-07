<template>
  <div style="width: 100vw; height: 100vh;">
    <div ref="viewport" id="viewport" style=" width: 100%; height: 100%;"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
// import LeaferEditor from "../LeaferEditor/layouts"
import { useLeaferEditor } from '../LeaferEditor'
import { useResizeObserver } from '@vueuse/core';
const viewport = ref()

onMounted(() => {
  const app = useLeaferEditor()
  app.resize(viewport.value.offsetWidth, viewport.value.offsetHeight)
  viewport.value.append(app.view)
  useResizeObserver(viewport, (entries) => {
    const [entry] = entries
    const { width, height } = entry ? entry.contentRect : { width: 600, height: 600 }
    app.resize(width, height)
  })
  app.changeRulerUnit('mm')
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
