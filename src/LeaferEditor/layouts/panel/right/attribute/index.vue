<template>
    <div class="attr">
        <oneAttrComp v-if="attrType === 'one'"></oneAttrComp>
        <someAttrComp v-if="attrType === 'some'"></someAttrComp>
        <zeroAttrComp v-if="attrType === 'zero'"></zeroAttrComp>
    </div>
</template>
<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue';
import { useLeaferEditor } from '../../../../index';

import oneAttrComp from './oneAttrComp.vue'
import someAttrComp from './someAttrComp.vue'
import zeroAttrComp from './zeroAttrComp.vue'

const attrType = ref("zero") // zero、one、some 类型
const editor = useLeaferEditor();

const updateAttrType = () => {
    if (editor.selected.length === 0) {
        attrType.value = "zero"
    } else if (editor.selected.length === 1) {
        attrType.value = "one"
    } else {
        attrType.value = "some"
    }
}
editor.eventBus.on(editor.Events.selected, updateAttrType)
editor.eventBus.on(editor.Events.cancelSelected, updateAttrType)
onBeforeUnmount(() => {
    editor.eventBus.off(editor.Events.selected, updateAttrType)
    editor.eventBus.off(editor.Events.cancelSelected, updateAttrType)
})

</script>
<style scoped></style>