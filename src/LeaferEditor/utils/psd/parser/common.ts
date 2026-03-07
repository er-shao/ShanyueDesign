import type { Layer } from "ag-psd";
import { generateID } from "../../../core/utils";

type CommonFields = {
    id: string,
    editable: boolean,
    visible: boolean,
    x?: number,
    y?: number,
    opacity: number,
    name?: string,
    zIndex?: number,
}

export interface LayerInfo extends Layer {
    zIndex?: number
}

/**
 * 获取公共属性
 */
export function getCommonOptions(layer: LayerInfo): CommonFields {
    return {
        id: generateID(),
        editable: true,
        name: layer.name,
        visible: !layer.hidden,
        x: layer.left,
        y: layer.top,
        opacity: layer.opacity || 1,
        zIndex: layer.zIndex
    }
}
