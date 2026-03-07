import type { IUI } from "@leafer-ui/interface";
import { parseImage } from './image'
import { Group, Image } from "leafer-ui";
import type { LayerInfo } from "./common";
import { base64toFile } from "../../file";
import { generateID } from "../../../core/utils";

/**
 * 蒙版
 * 兼容ps的蒙版和矢量蒙版
 * 
 */

/**
 * 打组，创建蒙版数据
 * @param index 层级
 * @param groups 组数组
 */
export function parseMask(
    layer: LayerInfo,
    ui: IUI,
    width: number,
    height: number): IUI {
    const maskCanvas = maskUtil.drawMask(layer, width, height)
    const realMaskCanvas = maskUtil.drawRealMask(layer, width, height)
    if (!maskCanvas && !realMaskCanvas) return ui
    const group = new Group({
        id: generateID(),
        zIndex: ui.zIndex,
        name: ui.name,
        editable: true,
        hitChildren: false,
    })
    ui.name = "Content"
    ui.zIndex = 1
    group.add(ui)
    if (maskCanvas) {
        let dataUrl = maskCanvas.toDataURL()
        const maskLayer = new Image({
            id: generateID(),
            url: dataUrl,
            zIndex: 0,
            name: "Mask",
            x: 0,
            y: 0,
            width: width,
            height: height,
            mask: true,
            editable: true,
            // editable: false,
            // locked: true,
        })
        group.addAt(maskLayer, 0)
    }
    if (realMaskCanvas) {
        const newGroup = new Group({
            id: generateID(),
            zIndex: group.zIndex,
            name: group.name,
            editable: true,
            hitChildren: false,
        })
        group.name = "Content-Group"
        group.zIndex = 1
        newGroup.add(group)
        let dataUrl = realMaskCanvas.toDataURL()
        const realMaskLayer = new Image({
            id: generateID(),
            url: dataUrl,
            zIndex: 0,
            name: "RealMask",
            x: 0,
            y: 0,
            width: width,
            height: height,
            mask: true,
            editable: true,
            // editable: false,
            // locked: true,
        })
        newGroup.addAt(realMaskLayer, 0)
        return newGroup
    }
    return group
}

export const maskUtil = {
    drawMask(layer: LayerInfo, width: number, height: number) {
        if (layer.mask && layer.mask.canvas) {
            const maskCanvas = layer.mask.canvas
            const defaultColor = layer.mask.defaultColor || 0
            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')!

            ctx.fillStyle = `rgba(${defaultColor}, ${defaultColor}, ${defaultColor}, 1)`
            ctx.fillRect(0, 0, width, height)
            const mx = layer.mask.left!
            const my = layer.mask.top!
            const mw = layer.mask.right! - layer.mask.left!
            const mh = layer.mask.bottom! - layer.mask.top!
            ctx.drawImage(maskCanvas, mx, my, mw, mh)

            // 将蒙版黑色部分变成透明；在Leafer中，mask属性默认我pixel；
            // 如果使用 grayscale 属性就可以直接使用蒙版的灰度值作为蒙版
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const data = imageData.data
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i]!
                const g = data[i + 1]!
                const b = data[i + 2]!
                const gray = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b)
                data[i] = 255
                data[i + 1] = 255
                data[i + 2] = 255
                data[i + 3] = gray
            }
            ctx.putImageData(imageData, 0, 0)
            return canvas
        }
    },
    drawRealMask(layer: LayerInfo, width: number, height: number) {
        if (layer.realMask && layer.realMask.canvas) {
            const maskCanvas = layer.realMask.canvas
            const defaultColor = layer.realMask.defaultColor || 0
            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')!

            ctx.fillStyle = `rgba(${defaultColor}, ${defaultColor}, ${defaultColor}, 1)`
            ctx.fillRect(0, 0, width, height)
            const mx = layer.realMask.left!
            const my = layer.realMask.top!
            const mw = layer.realMask.right! - layer.realMask.left!
            const mh = layer.realMask.bottom! - layer.realMask.top!
            ctx.drawImage(maskCanvas, mx, my, mw, mh)
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const data = imageData.data
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i]!
                const g = data[i + 1]!
                const b = data[i + 2]!
                const gray = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b)
                data[i] = 255
                data[i + 1] = 255
                data[i + 2] = 255
                data[i + 3] = gray
            }
            ctx.putImageData(imageData, 0, 0)
            return canvas
        }
    },
}
