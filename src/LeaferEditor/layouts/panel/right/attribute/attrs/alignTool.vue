<template>
    <div class="p2">
        <a-row :gutter="[4, 4]" :align="'center'">
            <a-col :span="20">
                <a-space>
                    <a-tooltip mini position="bottom">
                        <a-button size="small" @click="left">
                            <template #icon>
                                <i class="i-svg:bxs-objects-horizontal-left"></i>
                            </template>
                        </a-button>
                        <template #content>
                            {{ t('panelRight.attribute.alignment.left') }}
                        </template>
                    </a-tooltip>
                    <a-tooltip mini position="bottom">
                        <a-button size="small" @click="right">
                            <template #icon>
                                <i class="i-svg:bxs-objects-horizontal-right"></i>
                            </template>
                        </a-button>
                        <template #content>
                            {{ t('panelRight.attribute.alignment.right') }}
                        </template>
                    </a-tooltip>
                    <a-tooltip mini position="bottom">
                        <a-button size="small" @click="top">
                            <template #icon>
                                <i class="i-svg:bxs-objects-vertical-top"></i>
                            </template>
                        </a-button>
                        <template #content>
                            {{ t('panelRight.attribute.alignment.top') }}
                        </template>
                    </a-tooltip>
                    <a-tooltip mini position="bottom">
                        <a-button size="small" @click="bottom">
                            <template #icon>
                                <i class="i-svg:bxs-objects-vertical-bottom"></i>
                            </template>
                        </a-button>
                        <template #content>
                            {{ t('panelRight.attribute.alignment.bottom') }}
                        </template>
                    </a-tooltip>
                    <a-tooltip mini position="bottom">
                        <a-button size="small" @click="xcenter">
                            <template #icon>
                                <i class="i-svg:bxs-objects-horizontal-center"></i>
                            </template>
                        </a-button>
                        <template #content>
                            {{ t('panelRight.attribute.alignment.xcenter') }}
                        </template>
                    </a-tooltip>
                    <a-tooltip mini position="bottom">
                        <a-button size="small" @click="ycenter">
                            <template #icon>
                                <i class="i-svg:bxs-objects-vertical-center"></i>
                            </template>
                        </a-button>
                        <template #content>
                            {{ t('panelRight.attribute.alignment.ycenter') }}
                        </template>
                    </a-tooltip>
                </a-space>
            </a-col>
            <a-col :span="20">
                <a-space>
                    <a-tooltip mini position="bottom">
                        <a-button size="small" @click="xequation">
                            <template #icon>
                                <i class="i-svg:xequation"></i>
                            </template>
                        </a-button>
                        <template #content>
                            {{ t('panelRight.attribute.alignment.xequation') }}
                        </template>
                    </a-tooltip>
                    <a-tooltip mini position="bottom">
                        <a-button size="small" @click="yequation">
                            <template #icon>
                                <i class="i-svg:yequation"></i>
                            </template>
                        </a-button>
                        <template #content>
                            {{ t('panelRight.attribute.alignment.yequation') }}
                        </template>
                    </a-tooltip>
                </a-space>
            </a-col>
        </a-row>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { selectedProxyData, activeObject } from '../../../../../proxyData';
import { useLeaferEditor } from '../../../../../index';
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const editor = useLeaferEditor();

const active = computed(() => {
    return activeObject.value ? activeObject.value : editor.app.editor.element!;
})


// 左对齐
const left = () => {
    const children = active.value.children ? active.value.children : editor.selected
    let minx = Math.min(...children.map((child) => child.getBounds('box', 'page').x || 0))
    children?.forEach((child) => {
        const bounds = child.getBounds('box', 'page')
        child.x = minx + (child.x! - bounds.x)
    })
    if (!active.value.children) {
        editor.cancel()
        editor.select(children)
    }
    editor.historySaveState()
};
// 右对齐
const right = () => {
    const children = active.value.children ? active.value.children : editor.selected
    let maxx = Math.max(...children.map((child) => child.getBounds('box', 'page').x + child.getBounds('box', 'page').width))
    children?.forEach((child) => {
        const bounds = child.getBounds('box', 'page')
        child.x = maxx - bounds.width + (child.x! - bounds.x)
    })
    if (!active.value.children) {
        editor.cancel()
        editor.select(children)
    }
    editor.historySaveState()
};
// 顶部对齐
const top = () => {
    const children = active.value.children ? active.value.children : editor.selected
    let miny = Math.min(...children.map((child) => child.getBounds('box', 'page').y || 0))
    children?.forEach((child) => {
        const bounds = child.getBounds('box', 'page')
        child.y = miny + (child.y! - bounds.y)
    })
    if (!active.value.children) {
        editor.cancel()
        editor.select(children)
    }
    editor.historySaveState()
};
// 底部对齐
const bottom = () => {
    const children = active.value.children ? active.value.children : editor.selected
    let maxy = Math.max(...children.map((child) => child.getBounds('box', 'page').y + child.getBounds('box', 'page').height))
    children?.forEach((child) => {
        const bounds = child.getBounds('box', 'page')
        child.y = maxy - bounds.height + (child.y! - bounds.y)
    })
    if (!active.value.children) {
        editor.cancel()
        editor.select(children)
    }
    editor.historySaveState()
};

// 垂直居中对齐
const xcenter = () => {
    const children = active.value.children ? active.value.children : editor.selected
    let minx = Math.min(...children.map((child) => child.getBounds('box', 'page').x || 0))
    let maxx = Math.max(...children.map((child) => child.getBounds('box', 'page').x + child.getBounds('box', 'page').width))
    let width = maxx - minx
    children?.forEach((child) => {
        const bounds = child.getBounds('box', 'page')
        child.x = minx + (width - bounds.width) / 2 + (child.x! - bounds.x)
    })
    if (!active.value.children) {
        editor.cancel()
        editor.select(children)
    }
    editor.historySaveState()
};
// 水平居中对齐
const ycenter = () => {
    const children = active.value.children ? active.value.children : editor.selected
    let miny = Math.min(...children.map((child) => child.getBounds('box', 'page').y || 0))
    let maxy = Math.max(...children.map((child) => child.getBounds('box', 'page').y + child.getBounds('box', 'page').height))
    let height = maxy - miny
    children?.forEach((child) => {
        const bounds = child.getBounds('box', 'page')
        child.y = miny + (height - bounds.height) / 2 + (child.y! - bounds.y)
    })
    if (!active.value.children) {
        editor.cancel()
        editor.select(children)
    }
    editor.historySaveState()
};

// 水平平均对齐
const xequation = () => {
    const children = active.value.children ? active.value.children : editor.selected;
    if (children.length < 2) return;

    // 获取每个元素的包围盒，并建立映射
    const items = children.map(child => ({
        element: child,
        bounds: child.getBounds('box', 'page') // { x, y, width, height }
    }));

    // 按左边缘排序
    items.sort((a, b) => a.bounds.x - b.bounds.x);

    // 计算总跨度、总宽度
    const first = items[0]!.bounds;
    const last = items[items.length - 1]!.bounds;
    const totalSpan = (last.x + last.width) - first.x;
    const totalWidth = items.reduce((sum, item) => sum + item.bounds.width, 0);
    const totalGap = totalSpan - totalWidth;
    const gap = totalGap / (items.length - 1);

    // 重新定位
    let currentLeft = first.x;
    for (let i = 0; i < items.length; i++) {
        const item = items[i]!;
        const deltaX = currentLeft - item.bounds.x;
        if (deltaX !== 0) {
            // 平移元素，保持y不变
            // item.element.translate(deltaX, 0);
            item.element.x! += deltaX;
        }
        if (i < items.length - 1) {
            // 计算下一个元素的左边缘
            currentLeft += item.bounds.width + gap;
        }
    }
    if (!active.value.children) {
        editor.cancel()
        editor.select(children)
    }
    editor.historySaveState()
};
// 垂直平均对齐
const yequation = () => {
    const children = active.value.children ? active.value.children : editor.selected
    if (children.length < 2) return;

    // 获取每个元素的包围盒，并建立映射
    const items = children.map(child => ({
        element: child,
        bounds: child.getBounds('box', 'page') // { x, y, width, height }
    }));

    // 按上边缘排序
    items.sort((a, b) => a.bounds.y - b.bounds.y);

    // 计算总跨度、总高度
    const first = items[0]!.bounds;
    const last = items[items.length - 1]!.bounds;
    const totalSpan = (last.y + last.height) - first.y;
    const totalHeight = items.reduce((sum, item) => sum + item.bounds.height, 0);
    const totalGap = totalSpan - totalHeight;
    const gap = totalGap / (items.length - 1);

    // 重新定位
    let currentTop = first.y;
    for (let i = 0; i < items.length; i++) {
        const item = items[i]!;
        const deltaY = currentTop - item.bounds.y;
        if (deltaY !== 0) {
            // 平移元素，保持x不变
            // item.element.translate(0, deltaY);
            item.element.y! += deltaY;
        }
        if (i < items.length - 1) {
            // 计算下一个元素的上边缘
            currentTop += item.bounds.height + gap;
        }
    }
    if (!active.value.children) {
        editor.cancel()
        editor.select(children)
    }
    editor.historySaveState()
};

</script>
<style scoped>
svg {
    display: inline-block;
    vertical-align: -3.5px;
    width: 20px;
    height: 20px;
    touch-action: none;
    text-align: center;
    fill: currentColor;
}
</style>