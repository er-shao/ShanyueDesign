import type { IUI } from "@leafer-ui/interface";
import { parseImage } from './image'
import { Group } from "leafer-ui";
import { generateID } from "../../../core/utils";
import { parseMask } from "./mask";
import type { LayerInfo } from "./common";

/**
 * 蒙版
 */

/**
 * 打组，创建蒙版数据
 * @param index 层级
 * @param groups 组数组
 */
export function parseClipping(index: number, groups: LayerInfo[], width: number, height: number) {
    // 反向执行，由下到上执行，下面作为蒙版页，上面依托下面剪切蒙版
    let layerMask = parseImage(groups[groups.length - 1]!)
    const group = new Group({
        id: generateID(),
        zIndex: index,
        name: (layerMask.name || layerMask.innerId),
        editable: true,
        hitChildren: false,
        // locked: true,
    })
    const groupContent = new Group({
        // name: (layerMask.name || layerMask.innerId) + "-" + "Content",
        id: generateID(),
        name: "Clippings",
        editable: true,
        hitChildren: false,
        zIndex: 1
    })
    layerMask.mask = 'clipping'
    layerMask.name = "BaseLayer"
    // layerMask.name = (layerMask.name || layerMask.innerId) + "-" + "Clipping"
    layerMask.zIndex = 0
    group.add(layerMask)

    for (let i = groups.length - 2; i >= 0; i--) {
        let layer = groups[i]
        if (layer) {
            let layerFill = parseImage(layer)
            groupContent.add(parseMask(layer, layerFill, width, height))
        }
    }
    group.add(groupContent)
    return group
}

export const clippingUtil = {}
