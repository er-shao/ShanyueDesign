<template>
    <a-layout id="leafer-editor-layout" class="layout-main" style="height: 100vh;">
        <a-layout-header class="border-bottom">
            <Header></Header>
        </a-layout-header>
        <a-layout class="content-box">
            <PanelLeft></PanelLeft>
            <a-layout>
                <a-layout-content>
                    <CanvasEdit></CanvasEdit>
                </a-layout-content>
                <Footer></Footer>
            </a-layout>
            <PanelRight></PanelRight>
        </a-layout>
    </a-layout>
</template>

<script setup lang="ts">
import { onErrorCaptured, onMounted } from 'vue'
import { useI18n } from "vue-i18n";
import { locales } from "./locales";
import { getFonts } from "./api/font";

import CanvasEdit from './canvasEdit/index.vue'
import PanelRight from './panel/right/index.vue'
import PanelLeft from './panel/left/index.vue'
import Header from './header/index.vue'
import Footer from './footer/index.vue'
import { addCustomFonts } from '../utils/font';

const i18n = useI18n();

for (const key in locales) {
    // @ts-ignore
    i18n.mergeLocaleMessage(key, locales[key]);
}

onMounted(async () => {
    const res = await getFonts({ pageNum: 1, pageSize: 1000 })
    const list = res.data
    console.log(list)
    addCustomFonts(list)
})

onErrorCaptured((err, vm, info) => {
    console.error("Global LeaferEditor Error:", err, vm, "; \n", "Component Info:", info);
    // 打印调用栈
    console.log(new Error().stack)
    return false
})
</script>
<style scoped lang="less">
@import "./styles/layouts";
@import "./styles/classes";

.layout-main :deep(.arco-layout-header),
.layout-main :deep(.arco-layout-footer),
.layout-main :deep(.arco-layout-sider-children),
.layout-main :deep(.arco-layout-content) {
    display: flex;
    flex-direction: column;
    // align-items: center;
    /* color: var(--color-white); */
    font-size: 16px;
    // font-stretch: condensed;
}

.layout-main :deep(.arco-layout-content) {
    overflow: hidden;
}

.layout-main :deep(.arco-layout-header) {
    height: @header-height;
    justify-content: center;
}

.layout-main :deep(.arco-layout-sider) {
    width: @RightPanelWidth;
}

.content-box {
    height: @panelHeight;
}
</style>
