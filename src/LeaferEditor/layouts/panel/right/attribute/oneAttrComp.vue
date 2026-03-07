<template>
    <template v-for="(com, index) in componentList" :key="com.name">
        <template v-if="com.show()">
            <a-divider v-if="index !== 0" :margin="0" />
            <component :is="com.component" />
        </template>
    </template>
    <br>
</template>

<script setup lang="ts">
import alignTool from "./attrs/alignTool.vue";
import baseAttr from "./attrs/baseAttr.vue";
import originAttr from "./attrs/originAttr.vue";
import layerAttr from "./attrs/layerAttr.vue";
import layerNameAttr from "./attrs/layerNameAttr.vue";
import groupAttr from "./attrs/groupAttr.vue";
import ungroupAttr from "./attrs/ungroupAttr.vue";
import imageAttr from "./attrs/imageAttr.vue";
import textAttr from "./attrs/textAttr.vue";
import fillAttr from "./attrs/fillAttr.vue";
import strokeAttr from "./attrs/strokeAttr.vue";
import shadowAttr from "./attrs/shadowAttr.vue";
import barcodeAttr from "./attrs/barcodeAttr.vue";
import qrcodeAttr from "./attrs/qrcodeAttr.vue";
import lineAttr from "./attrs/lineAttr.vue";
import arrowAttr from "./attrs/arrowAttr.vue";
import rectAttr from "./attrs/rectAttr.vue";
import ellipseAttr from "./attrs/ellipseAttr.vue";
import polygonAttr from "./attrs/polygonAttr.vue";
import starAttr from "./attrs/starAttr.vue";

import { computed } from "vue";
import { Tag } from "../../../../core/interfaces";
import { selectedProxyData } from '../../../../proxyData';

type IAttrComp = {
    name: string
    component: any
    show: () => boolean
}
const tag = selectedProxyData('tag')
const componentList = computed((): IAttrComp[] => {
    return [
        {
            name: "baseAttr",
            component: baseAttr,
            show: () => true,
        },
        {
            name: "originAttr",
            component: originAttr,
            show: () => false,
        },
        {
            name: "ungroupAttr",
            component: ungroupAttr,
            show: () => tag.value.modelValue === Tag.Group,
        },
        {
            name: "alignTool",
            component: alignTool,
            show: () => tag.value.modelValue === Tag.Group,
        },
        {
            name: "layerAttr",
            component: layerAttr,
            show: () => true,
        },
        {
            name: "layerNameAttr",
            component: layerNameAttr,
            show: () => true,
        },
        {
            name: "groupAttr",
            component: groupAttr,
            show: () => tag.value.modelValue === Tag.Group,
        },
        {
            name: "textAttr",
            component: textAttr,
            show: () => tag.value.modelValue === Tag.Text,
        },
        {
            name: "imageAttr",
            component: imageAttr,
            show: () => tag.value.modelValue === Tag.Image,
        },
        {
            name: "barcodeAttr",
            component: barcodeAttr,
            show: () => tag.value.modelValue === Tag.BarCode,
        },
        {
            name: "qrcodeAttr",
            component: qrcodeAttr,
            show: () => tag.value.modelValue === Tag.QrCode,
        },
        {
            name: "lineAttr",
            component: lineAttr,
            show: () => tag.value.modelValue === Tag.Line,
        },
        {
            name: "arrowAttr",
            component: arrowAttr,
            show: () => tag.value.modelValue === Tag.Arrow,
        },
        {
            name: "rectAttr",
            component: rectAttr,
            show: () => tag.value.modelValue === Tag.Rect,
        },
        {
            name: "ellipseAttr",
            component: ellipseAttr,
            show: () => tag.value.modelValue === Tag.Ellipse,
        },
        {
            name: "polygonAttr",
            component: polygonAttr,
            show: () => tag.value.modelValue === Tag.Polygon,
        },
        {
            name: "starAttr",
            component: starAttr,
            show: () => tag.value.modelValue === Tag.Star,
        },
        {
            name: "fillAttr",
            component: fillAttr,
            show: () => {
                return !(([Tag.Image, Tag.Pen, Tag.Group, Tag.Line, Tag.QrCode, Tag.BarCode, Tag.Arrow]).includes(tag.value.modelValue))
            },
        },
        {
            name: "strokeAttr",
            component: strokeAttr,
            show: () => {
                return !(([Tag.Pen, Tag.Group]).includes(tag.value.modelValue))
            },
        },
        {
            name: "shadowAttr",
            component: shadowAttr,
            show: () => {
                return !(([Tag.Pen, Tag.Group]).includes(tag.value.modelValue))
            },
        },
    ]
})

</script>

<style scoped></style>