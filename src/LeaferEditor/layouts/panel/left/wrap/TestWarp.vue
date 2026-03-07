<template>
    <div class="wrap">
        <div class="title">TestWarp</div>
        <hr>
        <button @click="addPage">Add Page</button>
        <button @click="exportJson"> Export JSON </button>
        <button @click="removePage">Remove Page</button>
        <button @click="nextPage">Next Page</button>
        <button @click="prevPage">Prev Page</button>
        <button @click="addRect">Add Rect</button>
        <button @click="setGroup">Set Group</button>
        <button @click="addImg">Add Image</button>
        <button @click="remove">Remove</button>
        <button @click="removeEmptyGroup">Remove Empty Group</button>
        <button @click="undo">Undo</button>
        <button @click="redo">Redo</button>
        <button @click="addSkyLayer">Add Sky Layer</button>
        <button @click="resize">Resize</button>
        <br>
        <button @click="zIndexMoveUp">Z-Index Move Up</button>
        <button @click="zIndexMoveDown">Z-Index Move Down</button>
        <button @click="zIndexMoveToTop">Z-Index Move To Top</button>
        <button @click="zIndexMoveToBottom">Z-Index Move To Bottom</button>
        <br>
        <button @click="gridLineAdd">Grid Line Add</button>
        <button @click="gridLinesShow">Grid Lines Show</button>
        <button @click="gridLinesHide">Grid Lines Hide</button>
        <button @click="gridLinesClear">Grid Lines Clear</button>
        <button @click="gridLineRemove">Grid Line Remove</button>
        <br>
        <button @click="setDrawPenStyle">Set Draw Pen Style</button>
        <hr>
        <button @click="appendPagesFromJSON">appendPagesFromJSON</button>
        <button @click="triggerGridLineDraggable">triggerGridLineDraggable</button>
        <button @click="addQrCode">addQrCode</button>
        <button @click="addBarCode">addBarCode</button>
        <button @click="addMask">addMask</button>
        <hr>
        <button @click="openDialog">openDialog</button>
        <button @click="currentScale">currentScale</button>
        <button @click="setLocale">setLocale</button>
        <div class="page-count">Page Count: {{ pageCount }}</div>
    </div>
</template>
<script setup>
import { App, Leafer, Frame, Rect, Image, Group, Ellipse, Canvas, Star } from 'leafer-ui'
import { useLeaferEditor, useLeaferEditorGridLinePluginService } from '../../../../index'
import { onMounted, ref } from 'vue';
import jsondata from '/public/export.json'

const viewport = ref()

const pageCount = ref(0)

const gridLineService = useLeaferEditorGridLinePluginService()

const addPage = () => {
    const editor = useLeaferEditor()

    editor.pageAdd()
    pageCount.value = editor.pages().size
}

const removePage = () => {
    const editor = useLeaferEditor()

    editor.pageRemove(editor.currentCanvas.name)
    pageCount.value = editor.pages().size
}

const nextPage = () => {
    const editor = useLeaferEditor()
    editor.pageNext()
    // const pages = editor.pages()
    // const current = editor.currentPage
    // const currentIndex = Array.from(pages.values()).indexOf(current)
    // const nextIndex = currentIndex + 1
    // if (nextIndex >= pages.size) {
    //     editor.pageSetCurrent(Array.from(pages.values())[0].name)
    // } else {
    //     editor.pageSetCurrent(Array.from(pages.values())[nextIndex].name)
    // }
    // console.log("editor.currentCanvas", editor.currentCanvas);
}

const randomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

const prevPage = () => {
    const editor = useLeaferEditor()
    editor.pagePrev()
}

const addRect = () => {
    const editor = useLeaferEditor()
    const r = Rect.one({ editable: true, fill: randomColor(), }, 1, 1, 200, 200)
    const r2 = Rect.one({ editable: true, fill: randomColor(), }, 1, 1, 500, 500)
    const r3 = Rect.one({ editable: true, fill: randomColor(), }, 1, 1, 300, 300)
    editor.add(r)
    editor.addMany([r2, r3])
}

const setGroup = () => {
    const editor = useLeaferEditor()
    // const r = Rect.one({ editable: true, fill: 'red' }, 10, 100, 20, 200)
    // const r2 = Rect.one({ editable: true, fill: 'blue' }, 150, 100, 20, 200)
    // // editor.add(r)
    // // editor.add(r2)
    // const g = editor.setGroup([r, r2])

    // const r3 = Rect.one({ editable: true, fill: 'green' }, 10, 100, 20, 200)
    // const r4 = Rect.one({ editable: true, fill: 'yellow' }, 150, 100, 20, 200)
    // editor.add(r3)
    // editor.add(r4)
    editor.group()
}

const addImg = () => {
    const editor = useLeaferEditor()
    const image = new Image({
        url: '/1.png',
        editable: true,
        x: 0, y: 0,
        width: 800, height: 800,
        origin: 'center',
    })
    // setTimeout(() => {
    //     image.origin = 'left'
    //     console.log("image.origin", image.origin);
    //     setTimeout(() => {
    //         image.origin = 'top'
    //         console.log("image.origin", image.origin);
    //     }, 5000);
    // }, 5000);
    editor.add(image)
}

const exportJson = () => {
    const editor = useLeaferEditor()

    const json = editor.toJSON()
    console.log(json);
}

const remove = () => {
    const editor = useLeaferEditor()
    console.log("selected", editor.selected);
    editor.remove()
}

const removeEmptyGroup = () => {
    const editor = useLeaferEditor()
    editor.removeEmptyGroup()
}

const undo = () => {
    const editor = useLeaferEditor()
    editor.historyUndo()
    console.log("undo", editor.historyCanUndo());
    console.log("getHistoryInfo", editor.historyInfo());

}
const redo = () => {
    const editor = useLeaferEditor()
    editor.historyRedo()
    console.log("redo", editor.historyCanRedo());
    console.log("getHistoryInfo", editor.historyInfo());
}

const addSkyLayer = () => {
    const editor = useLeaferEditor()
    editor.skyFrame.add(
        Rect.one({ editable: true, fill: 'blue' },
            Math.random() * 800, Math.random() * 800, 100, 100)
    )
    editor.skyFrame.add(
        Rect.one({ editable: true, fill: 'yellow' },
            Math.random() * 800, Math.random() * 800, 100, 100)
    )
    setTimeout(() => {
        editor.skyFrame.add(
            Rect.one({ editable: false, fill: 'green' },
                Math.random() * 800, Math.random() * 800, 100, 100)
        )
        // editor.skyFrame.editable = true
        editor.skyFrame.hittable = true
        // editor.skyFrame.draggable = true
    }, 5000);
}

const resize = () => {
    const editor = useLeaferEditor()
    editor.historyDisable()
    // editor.canvasResize(500, 500)
    let n = 500
    const t = setInterval(() => {
        editor.canvasResize(n, n)
        n += 100
        if (n > 1000) {
            editor.canvasResize(5000, 5000)
            editor.historyEnable()
            clearInterval(t)
        }
        console.log("editor.isSaveHistory", editor.isSaveHistory);
        console.log("resize", n);
        console.log(editor.historyInfo());

    }, 10)
}

const zIndexMoveUp = () => {
    const editor = useLeaferEditor()
    console.log("editor.currentChildren", editor.currentChildren);
    if (editor.selected.length === 1)
        editor.zIndexMoveUp(editor.selected[0])
}
const zIndexMoveDown = () => {
    const editor = useLeaferEditor()
    console.log("editor.currentChildren", editor.currentChildren);
    if (editor.selected.length === 1)
        editor.zIndexMoveDown(editor.selected[0])
}
const zIndexMoveToTop = () => {
    const editor = useLeaferEditor()
    console.log("editor.currentChildren", editor.currentChildren);
    if (editor.selected.length === 1)
        editor.zIndexMoveToTop(editor.selected[0])
}
const zIndexMoveToBottom = () => {
    const editor = useLeaferEditor()
    console.log("editor.currentChildren", editor.currentChildren);
    if (editor.selected.length === 1)
        editor.zIndexMoveToBottom(editor.selected[0])
}

const gridLineAdd = () => {
    const editor = gridLineService
    editor.addGridLine(editor.newGridLine(200, "h"))
    editor.addGridLine(editor.newGridLine(200, "v"))
    editor.addGridLine(editor.newGridLine(400, "v"))
}

const gridLinesShow = () => {
    const editor = useLeaferEditor().getService("GridLine")
    gridLineService.gridLinesShow()
}

const gridLinesHide = () => {
    gridLineService.gridLinesHide()
}
const gridLinesClear = () => {
    gridLineService.clearGridLines()
}
const gridLineRemove = () => {
    gridLineService.removeGridLine(gridLineService.gridLines[0])
}

const setDrawPenStyle = () => {
    const editor = useLeaferEditor()
    editor.setDrawPenStyle({
        strokeWidth: 10,
        stroke: "#6cf"
    })
    setTimeout(() => {
        editor.setDrawPenStyle()
    }, 6000);
}

const appendPagesFromJSON = () => {
    const editor = useLeaferEditor()
    editor.appendPagesFromJSON(jsondata)
}

const triggerGridLineDraggable = () => {
    if (gridLineService.isEnableGridLineDraggable) {
        gridLineService.disableGridLineDraggable()
    } else {
        gridLineService.enableGridLineDraggable()
    }
}
import QrCode from "../../../../core/shapes/QrCode";
const addQrCode = () => {
    const editor = useLeaferEditor()
    const code = new QrCode({
        editable: true,
        x: 0,
        y: 0,
        text: 'http://guozimi.cn',
        size: 100,
    })
    setTimeout(() => {
        console.log("code.text", code.text);
        code.text = 'https://www.baidu.com'
    }, 3000);
    editor.add(code)
}

const addMask = () => {
    const editor = useLeaferEditor()
    const group = new Group({ x: 100, y: 100, hitChildren: false, editable: true, })

    const mask = new Ellipse({
        width: 100,
        height: 100,
        innerRadius: 0.5,
        opacity: 0.5,
        fill: 'black',
        // mask: true,
        editable: true,
        name: 'mask',
    })

    const canvas = new Star({
        width: 150,
        height: 150,
        corners: 5,
        editable: true,
        fill: '#66CCFF',
        name: 'canvas',
    })
    const g2 = new Group({ x: 200, y: 200, hitChildren: false, editable: true, })
    const mask2 = new Image({
        url: '/favicon.ico',
        mask: 'clipping',
        editable: true,
        name: 'mask-image',
    })
    const canvas2 = new Image({
        url: '/1.png',
        editable: true,
        name: 'mask-image',
    })

    group.add([mask, canvas])
    g2.add([mask2, canvas2])
    editor.add(group)
    editor.add(g2)

    setTimeout(() => {
        mask.mask = true
        // BUG?: 2026年2月7日10:52:23 "leafer-ui": "^1.12.1"
        // 在 设置 mask 之后，需要重新渲染一次，否则有残影； 原因不明
        // 通过设置 zoom 值缩放视口，触发重新渲染
        const currentScale = editor.currentScale
        editor.zoom(currentScale + 0.1)
        editor.zoom(currentScale)
    }, 500);
}

import BarCode from "../../../../core/shapes/BarCode";
const addBarCode = () => {
    const editor = useLeaferEditor()
    const code = new BarCode({
        editable: true,
        x: 0,
        y: 0,
        // height:100,
        // width:200,
        text: '123456789012',
        codeHeight: 100,
    })
    editor.add(code)
    setTimeout(() => {
        code.text = '987654321098'
        console.log("code.text", code.text);

    }, 3000);
}

import Dialog from "../../../components/dialog";
import { h } from "vue";
const openDialog = () => {
    const dialog = Dialog.open({
        title: '自定义组件演示',
        width: 300,
        height: 200,
        top: 100,
        left: 100,
        body: () => { return " h(Editor) " }
    })
    console.log("dialog", dialog);
    // setTimeout(() => {
    //     dialog.close()
    // }, 3000);

}

const currentScale = () => {
    const editor = useLeaferEditor()
    console.log("currentScale", editor.currentScale);
    editor.currentScale = 1.5
    console.log("currentScale", editor.currentScale);
}

import { localeType } from "@/i18n";
const setLocale = () => {
    if (localeType.value === 'zh-CN') {
        localeType.value = 'en-US'
    } else {
        localeType.value = "zh-CN"
    }
}
</script>

<style lang="less" scoped></style>
