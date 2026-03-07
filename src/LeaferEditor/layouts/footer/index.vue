<template>
    <a-layout-footer id="footer" class="footer">
        <div class="bg-white page-box not-select">
            <a-space class="p-r-20px">
                <a-tooltip v-for="(item, index) in pagesData" @click="changePage(item)" :key="item.name" effect="dark"
                    :content="item.title || `${item.index + 1}`" mini>
                    <div class="page-view " @click="onSelect(item)" @contextmenu.stop="openContextMenu($event, item)"
                        :class="{ 'page-selected': currentPageID === item.name }" :key="index" :title="item.name"
                        :style="{ 'background-image': `url(${item?.cover})`, 'background-size': 'cover' }">
                        <a-avatar class="page-ava" :class="item.cover ? 'opacity-0' : 'opacity-1'" :size="40"
                            shape="square">{{ index + 1 }}</a-avatar>
                    </div>
                </a-tooltip>
                <div v-if="editor.options.pageAddable" class="page-add page-view" @click="addOnClick">
                    <icon-plus size="20" />
                </div>
            </a-space>
        </div>
    </a-layout-footer>
    <div style="background: #f1f2f4; padding: 5px; display: flex; justify-content: center; align-items: center;">
        <div class="flex justify-center flex-items-center" style="color: var(--color-text-2)">
            <span>{{ $t('footer.copyright') }}</span>
            <a-divider direction="vertical" />

            <span>{{ $t('footer.cdn') }}</span>
            <a-divider direction="vertical" />
            <a-link :hoverable="false" target="_blank" href="https://beian.miit.gov.cn/">
                {{ $t('footer.icp') }}
            </a-link>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useLeaferEditor } from '../../index';
import contextMenu from '../components/contextMenu'
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

interface PageData {
    index: number
    name: string
    cover?: string
    title?: string
}

const editor = useLeaferEditor();
const pagesData = ref<PageData[]>([]);
const currentPageID = ref(editor.currentPageID)


const updatePagesData = () => {
    const pagesCanvas = editor.pages()
    const value = []
    let n = 0
    for (let page of pagesCanvas) {
        const data: PageData = {
            index: n,
            name: page.name,
            cover: page?.metaData?.cover || page.thumbnailDataURL || '',
            title: page?.metaData?.title,
        }
        value.push(data)
        n++
    }
    // @ts-ignore
    pagesData.value = value
    currentPageID.value = editor.currentPageID
}

const onSelect = (item: PageData) => {
    editor.pageSetCurrent(item.name)
}
const addOnClick = (e: PointerEvent) => {
    editor.pageAdd()
}
const changePage = (page: PageData) => {
    editor.pageSetCurrent(page.name)
}
const scrollToRight = async () => {
    await nextTick(); // 等待 DOM 更新
    const container = document.getElementById('footer')
    if (container) {
        container.scrollLeft = container.scrollWidth;
    }
}
updatePagesData()

editor.eventBus.on(editor.Events.pageAddAfter, updatePagesData)
editor.eventBus.on(editor.Events.pageRemoveAfter, updatePagesData)
editor.eventBus.on(editor.Events.pageChangeAfter, updatePagesData)
// editor.eventBus.on(editor.Events.undoRedoStackChange, updatePagesData)
// editor.eventBus.on(editor.Events.historyStateSavedAfter, updatePagesData)
// editor.eventBus.on(editor.Events.canvasChange, updatePagesData)
editor.eventBus.on(editor.Events.pageAddAfter, scrollToRight)


onUnmounted(() => {
    editor.eventBus.off(editor.Events.pageAddAfter, updatePagesData)
    editor.eventBus.off(editor.Events.pageRemoveAfter, updatePagesData)
    editor.eventBus.off(editor.Events.pageChangeAfter, updatePagesData)
    // editor.eventBus.off(editor.Events.undoRedoStackChange, updatePagesData)
    // editor.eventBus.off(editor.Events.historyStateSavedAfter, updatePagesData)
    // editor.eventBus.off(editor.Events.canvasChange, updatePagesData)
    editor.eventBus.off(editor.Events.pageAddAfter, scrollToRight)
});
const openContextMenu = (e: MouseEvent, node: any) => {
    e.preventDefault()
    contextMenu.showContextMenu({
        x: e.clientX,
        y: e.clientY,
        preserveIconWidth: false,
        items: [
            {
                label: t('footer.contextMenu.copy'),
                disabled: !editor.options.pageAddable,
                hidden: !editor.options.pageAddable,
                onClick: async () => {
                    if (!node.name) return
                    editor.pageSetCurrent(node.name)
                    const data = editor.currentPage.toJSON()
                    editor.appendPagesFromJSON({ pages: [data] })
                },
            },
            {
                label: t('footer.contextMenu.clear'),
                disabled: editor.currentPage.name !== node.name,
                onClick: async () => {
                    if (!node.name) return
                    editor.clear()
                },
            },
            {
                label: t('footer.contextMenu.delete'),
                // disabled: editor.pages().length <= 1 || editor.currentPage.name === node.name,
                disabled: editor.pages().length <= 1 || !editor.options.pageAddable,
                hidden: editor.pages().length <= 1 || !editor.options.pageAddable,
                onClick: () => {
                    if (!node.name) return
                    editor.pageRemove(node.name)
                },
                // divided: true,
            },
            {
                label: t('footer.contextMenu.rename'),
                disabled: editor.currentPage.name !== node.name,
                onClick: () => {
                    // 弹窗
                    const res = prompt(t('footer.contextMenu.renameInputInfo'), editor.currentPage.metaData.title)
                    if (res) {
                        editor.currentPage.metaData.title = res
                        updatePagesData()
                    }
                },
            },
        ],
    })
}

let onWheel: ((e: WheelEvent) => void) | null
onMounted(() => {
    const footerEl = document.getElementById('footer')
    if (footerEl) {
        onWheel = (e: WheelEvent) => {
            if (e.deltaY !== 0) {
                // 阻止默认的垂直滚动
                e.preventDefault();
                // 将垂直滚动转换为水平滚动
                footerEl.scrollLeft += e.deltaY;
            }
        }
        footerEl.addEventListener('wheel', onWheel);
        // footerEl.addEventListener('wheel', onWheel, { passive: true });
    }
})
onUnmounted(() => {
    const footerEl = document.getElementById('footer')
    if (footerEl && onWheel) {
        footerEl.removeEventListener('wheel', onWheel);
    }
})
</script>

<style scoped lang="less">
@import "../styles/layouts.less";

// 滚动条
.footer::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

.footer::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 5px;
}

.footer::-webkit-scrollbar-track {
    background-color: #f1f1f1;
}

.footer {
    padding: 10px 20px 10px 20px;
    height: @footerBoxHeight;
    flex-direction: row;
    overflow: auto;

    .page-box {
        padding: 0 5px;
        height: 100%;
        align-items: center;
        display: flex;
    }

    .page-view {
        cursor: pointer;
        border: 1px solid var(--color-neutral-4);
        border-radius: 5px;
        padding: 5px;
        height: calc(@footerBoxHeight - 30px);
        align-items: center;
        align-content: center;
        display: flex;
    }

    .page-selected {
        border-color: rgb(var(--primary-6));
    }

    .page-add {
        height: calc(@footerBoxHeight - 30px);
        width: calc(@footerBoxHeight - 30px);
        text-align: center;
        align-items: center;
        display: flex;
        align-content: center;
        justify-content: center;
    }

    .page-add:hover {
        color: rgb(var(--primary-6));
        border-color: rgb(var(--primary-6));
        cursor: pointer;
    }

    // .page-ava {
    //     background-color: #3370ff;
    //     // opacity: 0;
    // }

    .opacity-0 {
        opacity: 0;
    }

    .opacity-1 {
        opacity: 1;
    }
}
</style>
