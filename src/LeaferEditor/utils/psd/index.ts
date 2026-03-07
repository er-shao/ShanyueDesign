import { type Layer, type Psd, readPsd } from "ag-psd";

import {
    App,
    Frame,
    ResizeEvent,
    DragEvent,
    type IUI,
} from "leafer-ui";
import {
    parseClipping,
    parseGroup,
    parseImage,
    parseRect,
    parseText,
    maskUtil,
    parseMask,
} from "./parser";
import { downFile } from "../file";

/**
 * 解析psd文件
 * @param file
 * @param onProcess
 */
export async function parsePsdFile(file: File): Promise<Psd> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const arrayBuffer = reader.result;
            if (!arrayBuffer) {
                reject({ message: '文件读取失败' })
                return;
            }
            try {
                const psd = readPsd(arrayBuffer as ArrayBuffer);
                resolve(psd)
            } catch (e: any) {
                console.error(e)
                if (e.message.indexOf('Color mode not supported: CMYK') > -1) {
                    console.error('暂不支持CMYK色彩模式的文件，请先使用PS转换为RGB');
                }
                reject({ message: e.message })
            }
        };
        reader.readAsArrayBuffer(file);
    })
}

type ProcessCallback = ((totalLayers: number, process: number, layerName: string) => void) | undefined

export class ParsePsdFile {
    private _isParsed = false

    private isParsePsdFile: Promise<boolean>
    private _psd: Psd | null = null

    public get isParsed() {
        return this._isParsed
    }

    public get psd(): Psd {
        if (!this._psd) throw new Error('psd is null')
        return this._psd
    }

    public get layers(): Layer[] {
        return this.psd.children || []
    }
    public get width() {
        return this.psd.width
    }
    public get height() {
        return this.psd.height
    }

    constructor(file: File) {
        this.isParsePsdFile = this.parsePsdFile(file)
    }
    private async parsePsdFile(file: File): Promise<boolean> {
        this._isParsed = false
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const arrayBuffer = reader.result;
                if (!arrayBuffer) {
                    reject({ message: '文件读取失败' })
                    return;
                }
                try {
                    this._psd = readPsd(arrayBuffer as ArrayBuffer);
                    this._isParsed = true
                    resolve(true)
                } catch (e: any) {
                    // if (e.message.indexOf('Color mode not supported: CMYK') > -1) {
                    //     console.error('暂不支持CMYK色彩模式的文件，请先使用PS转换为RGB');
                    // }
                    reject({ message: e.message })
                }
            };
            reader.readAsArrayBuffer(file);
        })
    }

    public get parsed(): Promise<Psd> {
        return new Promise((resolve, reject) => {
            this.isParsePsdFile.then(() => {
                resolve(this.psd)
            }).catch((reason) => {
                reject(reason)
            })
        })
    }

    private _processCallback: ProcessCallback
    public async ParseToLeaferFrame(
        processCallback?: ProcessCallback,
        root?: Frame): Promise<Frame> {
        this._processCallback = processCallback
        return new Promise((resolve, reject) => {
            root = root || new Frame()
            console.log(this.layers);

            this.parseLayers(this.layers, root).then(() => {
                resolve(root!)
            }).catch((reason) => {
                reject(reason)
            })
        })
    }

    private parseLayers(layers: Layer[], parent: IUI) {
        return new Promise((resolve) => {
            layers.reverse();
            let group: Layer[] = [];
            let i = 0;
            let totalLayers = layers.length; // 总图层数量
            let processedLayers = 0; // 已解析的图层数量

            const processNextLayer = () => {
                if (i >= totalLayers) { // 使用 totalLayers 变量代替 layers.length
                    resolve(null); // 解析完成后 resolve Promise
                    return;
                }

                let layer = layers[i]!;
                // 层级：数值越大越靠前，与ps的层级相反
                let index = totalLayers - i; // 使用 totalLayers 变量代替 layers.length
                // console.log(`正在解析第${index + 1}层，共${totalLayers}层`);

                processedLayers++;
                let progress = Math.floor(processedLayers / totalLayers * 100);
                progress = progress / 100;
                if (this._processCallback) {
                    this._processCallback(totalLayers, progress, layer.name||'')
                }

                // @ts-ignore
                layer.zIndex = index;

                if (layer.children) {
                    const children = [...layer.children];
                    // 组
                    const parent2 = this.addGroup(layer, parent);
                    this.parseLayers(children, parent2)
                        .then(() => {
                            i++;
                            setTimeout(processNextLayer, 0); // 将下一层处理放入事件循环的下一个任务中
                        });
                } else {
                    if (layer.clipping) {
                        // 剪切蒙版
                        group.push(layer);
                    } else {
                        if (group.length > 0) {
                            group.push(layer);
                            // 打组，创建蒙版数据
                            this.addMask(layer, index, group, parent);
                            group = [];
                        } else {
                            const obj = this.addObj(layer, parent);
                        }
                    }

                    i++;
                    setTimeout(processNextLayer, 0); // 将下一层处理放入事件循环的下一个任务中
                }
                return

            };
            totalLayers = layers.length; // 将总图层数量赋值给 totalLayers 变量
            processNextLayer();
        });
    };

    private addObj(layer: Layer, parent: IUI) {
        let obj
        if (layer.text && 0) {
            // 文字
            obj = parseText(layer);
            if (layer.canvas) {
                const canvas = layer.canvas.toDataURL()
                downFile(canvas, 'image.png')
            }
        } else {
            // 图片
            obj = parseImage(layer)
        }
        parent.add(parseMask(layer, obj, this.width, this.height))
        return obj;
    }
    private addGroup(layer: Layer, parent: IUI) {
        let group = parseGroup(layer);
        parent.add(parseMask(layer, group, this.width, this.height))
        return group
    }
    private addMask(layer: Layer, index: number, groups: Layer[], parent: IUI) {
        const mask = parseClipping(index, groups, this.width, this.height)
        parent.add(parseMask(layer, mask, this.width, this.height))
        return mask
    }
}