<template>
    <div class="viewport-container">
        <div ref="viewport" id="viewport"></div>
    </div>
</template>

<script setup lang="ts">
import { useLeaferEditor } from '../../index'
import { onMounted, ref } from 'vue';
import { useResizeObserver } from "@vueuse/core";

// @ts-ignore
import jsondata from '/public/export.json'

const viewport = ref()

onMounted(() => {

    const app = useLeaferEditor()
    // app.reLoadFromJSON(jsondata)
    // useLeaferEditorShortcutPluginService().bindShortcut('mod+o', () => {
    //     app.reLoadFromJSON(jsondata)
    //     return false
    // })
    // app.view.style.display = 'block'
    app.changeRulerUnit('px')
    app.resize(viewport.value.offsetWidth, viewport.value.offsetHeight)
    useResizeObserver(viewport, (entries) => {
        const [entry] = entries
        const { width, height } = entry!.contentRect
        app.resize(width, height)
    })
    viewport.value.append(app.view)
})

</script>
<style scoped>
.viewport-container {
    width: 100%;
    height: 100%;
    padding: 15px;
    padding-bottom: 8px;
    background-color: #f1f1f1;
    overflow: hidden;
}

#viewport {
    width: 100%;
    height: 100%;
}

.contentBox {
    width: 100%;
    /*解决画布宽度一直增加的问题*/
    display: flex;
    overflow: hidden;
}
</style>
