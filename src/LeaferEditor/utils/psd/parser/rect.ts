/**
 * 分组
 */
import { Rect } from "leafer-ui";
import { getCommonOptions, type LayerInfo } from "./common";

/**
 * 转换Group元素
 * @param layer 图层信息
 * @param options 额外属性
 */
export function parseRect(layer: LayerInfo, options = {}) {
    //  打组
    const rect = new Rect({
        name: layer.name,
        zIndex: layer.zIndex,
        draggable: true,
        hitChildren: false,
        ...getCommonOptions(layer)
    })
    if (layer.vectorFill && layer.vectorFill.type === "color") {
        // @ts-ignore
        const r = layer.vectorFill.color.r
        // @ts-ignore
        const g = layer.vectorFill.color.g
        // @ts-ignore
        const b = layer.vectorFill.color.b
        rect.fill = [{
            type: 'solid',
            color: `rgba(${r}, ${g}, ${b}, 1)`
        }]
    }
    return rect
}

export const rectUtil = {}
