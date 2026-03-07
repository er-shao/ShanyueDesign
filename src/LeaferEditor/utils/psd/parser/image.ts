/**
 * 图片
 */
import { getCommonOptions, type LayerInfo } from "./common";
import type { IBlendMode } from "@leafer-ui/interface";
import { Image, Rect } from "leafer-ui";
import { base64toFile } from "../../file";
/**
 * 转换Image元素
 * @param layer 图层信息
 * @param uploadCallback 上传回调函数
 */
export function parseImage(
    layer: LayerInfo) {
    const image = new Image({
        ...getCommonOptions(layer),
        // 混合模式
        blendMode: <IBlendMode>layer.blendMode,
    })
    if (layer.canvas) {
        let url = layer.canvas.toDataURL("image/png")
        image.url = url
        image.opacity = layer.opacity
        image.width = layer.canvas.width
        image.height = layer.canvas.height
    }
    return image
}

export const imageUtil = {}
