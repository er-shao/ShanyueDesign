<template>
    <div class="wrap w100% h100% ">
        <div class="w100% h100% overflow-auto scrollbar">
            <div class="p-20px flex flex-col">
                <div v-for="item in dataList">
                    <a-divider orientation="left">{{ item.label }}</a-divider>
                    <a-button v-for="item2 in item.items" :key="item2.label" @click="item2.onClick"
                        style="width: 80px;height: 80px" class="flex-col m-6px">
                        <i :class="item2.icon" style="width: 80px;height: 80px;margin: 8px;"></i>
                        <span>
                            {{ item2.label ? item2.label : item.label }}
                        </span>
                    </a-button>
                </div>
            </div>
            <br>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { Rect, Text, Line, Ellipse, Polygon, Star } from "leafer-ui";
import { Arrow } from '@leafer-in/arrow'
import { computed, getCurrentInstance, h } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLeaferEditor } from '../../../../index';
import BarCode from "../../../../core/shapes/BarCode";
import QrCode from "../../../../core/shapes/QrCode";
import addGridlines from "./_addGridlines.vue";
import Dialog from "../../../components/dialog";

const { t } = useI18n();
const editor = useLeaferEditor()
let _addGridlinesDialog: any = null

const dataList = computed(() => [
    {
        label: t('panelLeft.add.divider.referenceLine'),
        items: [
            {
                icon: 'i-svg:gridlines',
                label: t('panelLeft.add.button.newReferenceLine'),
                onClick: (e: MouseEvent) => {
                    if (_addGridlinesDialog) {
                        _addGridlinesDialog.close()
                    }
                    _addGridlinesDialog = Dialog.open({
                        title: t('panelLeft.add.divider.referenceLine'),
                        width: 300,
                        height: 200,
                        top: 120,
                        left: 140,
                        body: () => { return h(addGridlines) }
                    })
                }
            }
        ]
    },
    {
        label: t('panelLeft.add.divider.text'),
        items: [
            {
                icon: 'i-svg:title',
                label: t('panelLeft.add.button.addTitle'),
                onClick: () => {
                    const tObj = new Text({
                        fill: '#66CCFF',
                        text: t('panelLeft.add.default.titleText'), // 建议也提取默认文本
                        x: 0,
                        y: 0,
                        resizeFontSize: true,
                        fontSize: 36,
                        editable: true,
                        fontWeight: 'bold',
                        lineHeight: {
                            type: 'percent',
                            value: 1.5
                        },
                    })
                    tObj.name = tObj.text as string
                    editor.add(tObj)
                    editor.select(tObj)
                }
            },
            {
                icon: 'i-svg:text',
                label: t('panelLeft.add.button.addBody'),
                onClick: () => {
                    const tObj = new Text({
                        fill: '#66CCFF',
                        text: t('panelLeft.add.default.bodyText'),
                        x: 0,
                        y: 0,
                        fontSize: 18,
                        editable: true,
                        lineHeight: {
                            type: 'percent',
                            value: 1.5
                        },
                    })
                    tObj.name = tObj.text as string
                    editor.add(tObj)
                    editor.select(tObj)
                }
            },
            {
                icon: 'i-svg:paragraph',
                label: t('panelLeft.add.button.addParagraph'),
                onClick: () => {
                    const tObj = new Text({
                        fill: '#66CCFF',
                        text: t('panelLeft.add.default.paragraphText'),
                        x: 0,
                        y: 0,
                        width: 500,
                        height: 200,
                        fontSize: 16,
                        editable: true,
                    })
                    tObj.name = tObj.text as string
                    editor.add(tObj)
                    editor.select(tObj)
                }
            }
        ]
    },
    {
        label: t('panelLeft.add.divider.element'),
        items: [
            {
                icon: 'i-svg:line',
                label: t('panelLeft.add.button.line'),
                onClick: () => {
                    const line = new Line({
                        width: 100,
                        strokeWidth: 5,
                        stroke: '#66CCFF',
                        rotation: 45,
                    })
                    editor.setNormalizeAttr(line)
                    editor.add(line)
                    editor.select(line)
                }
            },
            {
                icon: 'i-svg:arrow',
                label: t('panelLeft.add.button.arrow'),
                onClick: () => {
                    const arrow = new Arrow({
                        width: 100,
                        strokeWidth: 5,
                        stroke: '#66CCFF',
                        rotation: 45,
                    })
                    editor.setNormalizeAttr(arrow)
                    editor.add(arrow)
                    editor.select(arrow)
                }
            }
        ]
    },
    {
        label: t('panelLeft.add.divider.shape'),
        items: [
            {
                icon: 'i-svg:rectangle',
                label: t('panelLeft.add.button.rectangle'),
                onClick: () => {
                    const rect = new Rect({
                        width: 100,
                        height: 100,
                        fill: '#66CCFF',
                        stroke: '#66CCFF',
                        strokeWidth: 5,
                    })
                    editor.setNormalizeAttr(rect)
                    editor.add(rect)
                    editor.select(rect)
                }
            },
            {
                icon: 'i-svg:circle',
                label: t('panelLeft.add.button.circle'),
                onClick: () => {
                    const ellipse = new Ellipse({
                        width: 100,
                        height: 100,
                        fill: "#66CCFF"
                    })
                    editor.setNormalizeAttr(ellipse)
                    editor.add(ellipse)
                    editor.select(ellipse)
                }
            },
            {
                icon: 'i-svg:ellipse',
                label: t('panelLeft.add.button.ellipse'),
                onClick: () => {
                    const ellipse = new Ellipse({
                        width: 100,
                        height: 100,
                        innerRadius: 0.5,
                        fill: "#66CCFF"
                    })
                    editor.setNormalizeAttr(ellipse)
                    editor.add(ellipse)
                    editor.select(ellipse)
                }
            },
            {
                icon: 'i-svg:polygon',
                label: t('panelLeft.add.button.polygon'),
                onClick: () => {
                    const polygon = new Polygon({
                        width: 100,
                        height: 100,
                        sides: 5,
                        fill: '#66CCFF'
                    })
                    editor.setNormalizeAttr(polygon)
                    editor.add(polygon)
                    editor.select(polygon)
                }
            },
            {
                icon: 'i-svg:star',
                label: t('panelLeft.add.button.star'),
                onClick: () => {
                    const star = new Star({
                        width: 100,
                        height: 100,
                        corners: 5,
                        fill: '#66CCFF'
                    })
                    editor.setNormalizeAttr(star)
                    editor.add(star)
                    editor.select(star)
                }
            },
        ]
    },
    {
        label: t('panelLeft.add.divider.barcodeTool'),
        items: [
            {
                icon: 'i-svg:barcode',
                label: t('panelLeft.add.button.barcode'),
                onClick: () => {
                    const code = new BarCode({
                        editable: true,
                        x: 0,
                        y: 0,
                        text: '123456789',
                        codeHeight: 100,
                    })
                    editor.add(code)
                    editor.select(code)
                }
            },
            {
                icon: 'i-svg:qrcode',
                label: t('panelLeft.add.button.qrcode'),
                onClick: () => {
                    const code = new QrCode({
                        editable: true,
                        x: 0,
                        y: 0,
                        text: 'qrcode text',
                        size: 100,
                    })
                    editor.add(code)
                    editor.select(code)
                }
            }
        ]
    },
])

</script>

<style lang="less" scoped>
// 滚动条
.scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

.scrollbar::-webkit-scrollbar-thumb {
    background-color: rgb(201, 205, 212);
    border-radius: 4px;
}

.scrollbar::-webkit-scrollbar-track {
    background-color: transparent;
}

.wrap {
    padding-right: 5px;
}
</style>