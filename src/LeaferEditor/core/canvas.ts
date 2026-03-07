import type {
    IExportFileType,
    IExportOptions,
    IGroup,
    IUI,
} from "@leafer-ui/interface";
import {
    Frame,
    Line,
    Platform,
    type Image,
} from "leafer-ui";

import { Tag } from "./interfaces";
import { History, type HistoryType } from "./history";
import { djb2Hash, generateID } from "./utils";
import { base64toFile } from "../utils";

// 平铺的透明方格
const svg = Platform.toURL(
    `<svg width="10" height="10" xmlns="http://www.w3.org/2000/svg">
<rect x="0" y="0" width="5" height="5" fill="#FFF"/><rect x="5" y="0" width="5" height="5" fill="#CCC"/>
<rect x="0" y="5" width="5" height="5" fill="#CCC"/><rect x="5" y="5" width="5" height="5" fill="#FFF"/>
</svg>`, 'svg',)


interface MetaData {
    cover?: string
    title?: string
    author?: string
    description?: string
    [key: string]: any  // 其他自定义元数据
}

export class Canvas {
    public readonly name: string

    // 元数据: 用于存储一些额外的数据
    // 例如: 封面、 标题、 作者、 说明等
    public metaData: MetaData = {}

    private _groundFrame: Frame
    private _skyFrame: Frame
    private _contentFrame: Frame

    private _width: number
    private _height: number
    private x: number
    private y: number
    private childrenTotal: number = 0
    // 历史记录
    private _history: History

    public gridLines: Map<string, Line> = new Map()

    constructor(name: string, width: number, height: number, x?: number, y?: number, historyMaxSize?: number) {
        this.name = name
        this._width = width
        this._height = height
        this.x = x || 0
        this.y = y || 0

        this._groundFrame = this.newGroundFrame()
        this._contentFrame = this.newContentFrame()
        this._skyFrame = this.newSkyFrame()

        this._history = new History({
            maxSize: historyMaxSize,
            historySavedData: this.historySavedData.bind(this),
            onStateChange: this.onStateChange.bind(this),
            shouldSave: this.shouldSave.bind(this),
        })
        this._history.saveState()
    }

    // private _localStorageKeys: string[] = []
    private historySavedData() {
        // console.log("this.contentFrame.toJSON()", JSON.stringify(this.contentFrame.toJSON()));
        const data = JSON.stringify(this.contentFrame.toJSON())
        return data
        // const key = this.name + djb2Hash(data)
        // // 保存到本地
        // this._localStorageKeys.push(key)
        // localStorage.setItem(key, data)
        // console.log("save history", key);

        // return key
    }

    private shouldSave(prevState: any, newState: any) {
        if (prevState === null) {
            return true
        }
        return prevState !== newState
    }

    // private _canUndoRedo: boolean = false
    private onStateChange(state: any, type: HistoryType) {
        if (type === 'undo' || type === 'redo') {
            if (state) { // @ts-ignore
                // this._canUndoRedo = true
                // state = localStorage.getItem(state)
                this.contentFrame.set(JSON.parse(state))
                if (this.contentFrame.width !== this._width || this.contentFrame.height !== this._height) {
                    this.resize(this.contentFrame.width || this._width, this.contentFrame.height || this._height)
                }
            }
        }
        // else if (type === 'save' && state && this._canUndoRedo){
        //     this._canUndoRedo = false
        //     const history = this._history.getHistory()

        //     // 找出_localStorageKeys不在 history 中的元素
        //     const notInHistory = this._localStorageKeys.filter(key =>!history.includes(key))
        //     // 删除不在 history 中的元素
        //     notInHistory.forEach(key => {
        //         localStorage.removeItem(key)
        //     })
        //     this._localStorageKeys = history
        //     console.log(this._localStorageKeys);

        // }
    }

    private newContentFrame(): Frame {
        return new Frame({
            id: generateID(),
            name: this.name,
            x: this.x,
            y: this.y,
            width: this._width,
            height: this._height,
            fill: "Transparent",
            blendMode: "normal",
            draggable: false,
            hittable: true,
        })
    }
    private newSkyFrame(): Frame {
        return new Frame({
            id: generateID(),
            name: this.name,
            x: this.x,
            y: this.y,
            width: this._width,
            height: this._height,
            fill: "Transparent",
            hittable: false,
            draggable: false,
            overflow: "show", // 内容超出显示
            blendMode: "normal",
        })
    }
    private newGroundFrame(): Frame {
        return new Frame({
            id: generateID(),
            name: this.name,
            x: this.x,
            y: this.y,
            width: this._width,
            height: this._height,
            // fill: "Transparent",
            blendMode: "normal",
            fill: {
                type: 'image',
                url: svg,
                mode: 'repeat',
                scaleFixed: true // 固定平铺图比例，不随画布缩放  //
            },
            shadow: {
                x: 0,
                y: 3,
                blur: 15,
                color: '#0009',
                scaleFixed: 'zoom-in' // 固定阴影比例，不随画布放大 //
            },
            hittable: false,
            draggable: false,
        })
    }

    public resize(width: number, height: number) {
        this._width = width
        this._height = height
        // this.contentFrame.width = width
        // this.contentFrame.height = height
        // this.skyFrame.width = width
        // this.skyFrame.height = height
        // this.groundFrame.width = width
        // this.groundFrame.height = height
        this.contentFrame.resizeWidth(width)
        this.contentFrame.resizeHeight(height)
        this.skyFrame.resizeWidth(width)
        this.skyFrame.resizeHeight(height)
        this.groundFrame.resizeWidth(width)
        this.groundFrame.resizeHeight(height)
    }

    public get overflowShow() {
        return this.contentFrame.overflow === 'show'
    }

    public set overflowShow(v: boolean) {
        if (v) {
            this.contentFrame.overflow = 'show'
        } else {
            this.contentFrame.overflow = 'hide'
        }
    }

    public add(child: IUI, index?: number, parent?: IUI) {
        const _childAddAttr = (child: IUI) => {
            this.childrenTotal += 1
            child.id = child.id || generateID()
            child.name = child.name || this.defaultLayerName(child)
            child.zIndex = child.zIndex || 0
            if (child.tag === Tag.Group) {
                child.hitChildren = false // 子元素不可 交互事件
                child.children?.forEach(_childAddAttr)
            }
        }
        _childAddAttr(child)
        child.proxyData  // 访问 proxyData 后会自动创建响应式数据对象 __proxyData，注意合理使用，会增加内存开销。

        if (parent) {
            const range = this.getSiblingZIndexRange(parent.children || []);
            child.zIndex = index || range.max + 1
            parent.add(child, index)
        } else {
            const range = this.getSiblingZIndexRange(this.contentFrame.children);
            child.zIndex = index || range.max + 1
            this.contentFrame.add(child, index)
        }
    }

    public toJSON(): object {
        this.recursiveNormalizeZIndexes(this.contentFrame.children);

        return {
            name: this.name,
            width: this._width,
            height: this._height,
            x: this.x,
            y: this.y,
            groundFrame: this.groundFrame.toJSON(),
            contentFrame: this.contentFrame.toJSON(),
            skyFrame: this.skyFrame.toJSON(),
            metaData: this.metaData,
        }
    }
    // exportContentJSON 只导出内容层和元数据的JSON数据，不包括 groundFrame 和 skyFrame 
    public exportContentJSON(): object {
        this.recursiveNormalizeZIndexes(this.contentFrame.children);

        return {
            name: this.name,
            width: this._width,
            height: this._height,
            x: this.x,
            y: this.y,
            contentFrame: this.contentFrame.toJSON(),
            metaData: this.metaData,
        }
    }

    public static fromJSON(
        json: object,
        historyMaxSize?: number,
        uploadBase64Callback?: (file: File) => Promise<{
            url: string,
        }>): Canvas {
        // @ts-ignore
        const { name, width, height, x, y, groundFrame, contentFrame, skyFrame, metaData } = { ...json }
        const canvas = new Canvas(name, width, height, x, y, historyMaxSize)
        canvas.metaData = metaData
        canvas.contentFrame.set(contentFrame)
        if (groundFrame)
            canvas.groundFrame.set(groundFrame)
        if (skyFrame)
            canvas.skyFrame.set(skyFrame)

        const _setAttr = (children: IUI[]) => {
            let total = 0
            children.forEach(async (child) => {
                if (child.tag === Tag.Group) {
                    child.hitChildren = false
                    total += _setAttr(child.children || [])
                }
                if (child.tag === Tag.Image) {
                    // 是否为 base64 格式图片
                    if ((child as Image).url.startsWith('data:image/')) {
                        if (uploadBase64Callback) {
                            const f = base64toFile((child as Image).url, ((child as Image).name || 'image') + '.png')!
                            const res = await uploadBase64Callback(f)
                            // @ts-ignore
                            child.url = res.url
                        }
                    }
                }
                total += 1
            })
            return total
        }
        canvas.childrenTotal = _setAttr(canvas.contentFrame.children)

        const _setinfo = (child: IUI, index: number) => {
            child.id = child.id || generateID()
            child.name = child.name || `${child.tag || 'Layer'} ${index + 1}`
            child.proxyData  // 访问 proxyData 后会自动创建响应式数据对象 __proxyData，注意合理使用，会增加内存开销。
            if (child.tag === Tag.Group) {
                child.hitChildren = false // 子元素不可 交互事件
            }
            child.children?.forEach(_setinfo)
        }
        canvas.contentFrame.children.forEach(_setinfo)
        canvas._history.clear()
        canvas._history.saveState()
        return canvas
    }

    public async export(_filename: IExportFileType | string, _options?: IExportOptions | number | boolean) {
        return this.contentFrame.export(_filename, _options)
    }
    public exportSync(_filename: IExportFileType | string, _options?: IExportOptions | number | boolean) {
        return this.contentFrame.syncExport(_filename, _options)
    }

    // 缩略图
    public async thumbnail(size?: number) {
        const max = this._width > this._height ? 'width' : 'height'
        size = size || 150
        return this.export("png", { size: { [max]: size } })
    }
    public thumbnailSync(size?: number) {
        const max = this._width > this._height ? 'width' : 'height'
        size = size || 150
        return this.exportSync("png", { size: { [max]: size } })
    }

    public get thumbnailDataURL(): string | undefined {
        if (this.contentFrame.children.length === 0 &&
            (this.contentFrame.fill === 'Transparent' ||
                ((Array.isArray(this.contentFrame.fill) && this.contentFrame.fill.length === 0) ||
                    // @ts-ignore
                    (Array.isArray(this.contentFrame.fill) && this.contentFrame.fill.length === 1 && this.contentFrame.fill[0]!.color === 'Transparent')))) return undefined;
        const res = this.thumbnailSync()
        return res.data
    }

    public get contentFrame(): Frame {
        if (!this._contentFrame) {
            throw new Error('contentFrame is not initialized')
        }
        return this._contentFrame
    }

    public get skyFrame(): Frame {
        if (!this._skyFrame) {
            throw new Error('skyFrame is not initialized')
        }
        return this._skyFrame
    }

    public get groundFrame(): Frame {
        if (!this._groundFrame) {
            throw new Error('groundFrame is not initialized')
        }
        return this._groundFrame
    }

    public get history() {
        return this._history
    }

    public get width() {
        return this._width
    }
    public set width(value: number) {
        this.resize(value, this._height)
    }
    public get height() {
        return this._height
    }
    public set height(value: number) {
        this.resize(this._width, value)
    }

    public defaultLayerName(iui: IUI): string {
        return `${iui.tag || 'Layer'} ${this.childrenTotal}`
    }


    // ====================================================================================================================
    // zIndex 管理
    // ====================================================================================================================

    /**
     * 整理数组中对象的 z-index 属性，使其从1开始连续
     * 按照原始 index 值的大小顺序进行规范化，保持相对大小关系
     * @param array - 需要整理的对象数组
     */
    public normalizeZIndexes(array: IUI[]): void {
        if (array.length === 0) return;

        let isAlreadyNormalized = true;
        const currentZIndices = array.map(item => item.zIndex || 0);
        const sortedZIndices = currentZIndices.slice().sort((a, b) => a - b);
        for (let i = 0; i < array.length; i++) {
            if (sortedZIndices[i] !== i + 1) {
                isAlreadyNormalized = false;
                break;
            }
        }
        // 已经是连续的，不需要处理
        if (isAlreadyNormalized) return;

        // 1. 创建包含原始索引和数组索引的副本
        const itemsWithOriginalIndex = array.map((item, arrayIndex) => {
            return {
                originalItem: item,
                originalIndex: item.zIndex || 0,
                arrayIndex,
            }
        });

        // 2. 按照原始 index 值排序（从小到大）
        // 如果 index 相同，保持它们在数组中的原始相对顺序
        itemsWithOriginalIndex.sort((a, b) => {
            if (a.originalIndex !== b.originalIndex) {
                return a.originalIndex - b.originalIndex;
            }
            // index 相同时，按数组中的顺序排序
            return a.arrayIndex - b.arrayIndex;
        });

        // 3. 重新分配连续的 index 值
        itemsWithOriginalIndex.forEach((item, sortedIndex) => {
            // 从1开始连续分配
            item.originalItem.zIndex = sortedIndex + 1;
        });
    }

    // 递归处理 Group 的子元素，使其 zIndex 值从 1 开始连续
    public recursiveNormalizeZIndexes(array: IUI[]): void {
        this.normalizeZIndexes(array);
        for (const child of array) {
            if (child.tag === Tag.Group) {
                this.recursiveNormalizeZIndexes(child.children || [])
            }
        }
    }

    // 获取元素的父容器和兄弟数组
    private findElementContext(element: IUI): {
        parent: IUI;
        siblings: IUI[];
        index: number;
    } | null {
        const stack: Array<{ parent: IUI; children: IUI[] }> = [
            { parent: this.contentFrame, children: this.contentFrame.children || [] }
        ];

        while (stack.length > 0) {
            const current = stack.pop()!;

            // 在当前父元素的子元素中查找
            const index = current.children.indexOf(element);
            if (index !== -1) {
                this.normalizeZIndexes(this.contentFrame.children);
                return {
                    parent: current.parent,
                    siblings: current.children,
                    index
                };
            }

            // 将子 Group 加入堆栈继续查找
            for (const child of current.children) {
                if (child.tag === Tag.Group && child.children) {
                    stack.push({
                        parent: child,
                        children: child.children
                    });
                }
            }
        }

        return null;
        // this.recursiveNormalizeZIndexes(this.contentFrame.children);
        // return element.parent!.children.indexOf(element) === -1? null : {
        //     parent: element.parent!,
        //     siblings: element.parent!.children || [],
        //     index: element.parent!.children.indexOf(element)
        // }
    }
    // 检查两个元素是否在同一个容器内
    private areInSameContainer(element1: IUI, element2: IUI): boolean {
        const context1 = this.findElementContext(element1);
        const context2 = this.findElementContext(element2);
        if (!context1 || !context2) return false;

        // 检查是否在同一个兄弟数组中
        return context1.siblings === context2.siblings;
    }

    // 获取目标元素在兄弟数组中的相邻元素信息
    private getAdjacentElement(siblings: IUI[], index: number, l_or_s: "<" | ">"): { zIndex: number; elementIndex: number } | undefined {
        const currentZ = siblings[index]!.zIndex || 0;
        let adjacent: { zIndex: number; elementIndex: number } | undefined
        if (l_or_s === '<') {
            siblings.forEach((sibling, i) => {
                if (i === index) return;
                sibling.zIndex = sibling.zIndex || 0;
                if (sibling.zIndex < currentZ) {
                    if (!adjacent || sibling.zIndex > adjacent.zIndex) {
                        adjacent = { zIndex: sibling.zIndex, elementIndex: i };
                    }
                }
            });
        } else {
            siblings.forEach((sibling, i) => {
                if (i === index) return;
                sibling.zIndex = sibling.zIndex || 0;
                if (sibling.zIndex > currentZ) {
                    if (!adjacent || sibling.zIndex < adjacent.zIndex) {
                        adjacent = { zIndex: sibling.zIndex, elementIndex: i };
                    }
                }
            });
        }
        return adjacent
    }
    // 计算两个 zIndex 之间的中间值
    private getMiddleZIndex(z1: number, z2: number): number {
        // 如果两个 zIndex 相等，返回一个稍微调整的值
        if (z1 === z2) {
            return z1 - 0.5; // 减 0.5 确保在前面的元素显示在前面
        }

        return (z1 + z2) / 2;
    }

    // 获取兄弟元素中的最大/最小 zIndex
    private getSiblingZIndexRange(siblings: IUI[], excludeIndex?: number): { min: number; max: number } {
        let min = Infinity;
        let max = -Infinity;

        siblings.forEach((sibling, index) => {
            if (excludeIndex !== undefined && index === excludeIndex) return;
            min = Math.min(min, sibling.zIndex || 0);
            max = Math.max(max, sibling.zIndex || 0);
        });

        // 如果没有其他兄弟元素，返回默认值
        if (min === Infinity) min = 0;
        if (max === -Infinity) max = 0;

        return { min, max };
    }

    // 移动到上一层
    public moveUp(element: IUI): boolean {
        const context = this.findElementContext(element);
        if (!context) return false;

        const { siblings, index } = context;
        // 查找比当前 zIndex 大的最小 zIndex
        let nextLarger = this.getAdjacentElement(siblings, index, '>');
        if (!nextLarger) {
            return false;
        }
        // 交换 zIndex
        const temp = element.zIndex;
        element.zIndex = siblings[nextLarger.elementIndex]!.zIndex;
        siblings[nextLarger.elementIndex]!.zIndex = temp;
        return true;
    }

    // 移动到下一层
    public moveDown(element: IUI): boolean {
        const context = this.findElementContext(element);
        if (!context) return false;

        const { siblings, index } = context;
        // 查找比当前 zIndex 小的最大 zIndex
        let nextSmaller = this.getAdjacentElement(siblings, index, '<');
        if (!nextSmaller) {
            return false;
        }
        // 交换 zIndex
        const temp = element.zIndex;
        element.zIndex = siblings[nextSmaller.elementIndex]!.zIndex;
        siblings[nextSmaller.elementIndex]!.zIndex = temp;
        return true;
    }

    // 移动到顶层
    public moveToTop(element: IUI): boolean {
        const context = this.findElementContext(element);
        if (!context) return false;

        const { siblings, index } = context;
        const range = this.getSiblingZIndexRange(siblings, index);

        if (range.max <= (element.zIndex as number)) {
            // 已经在顶层
            return false;
        }

        // 设置 zIndex 为最大值 + 1，确保在顶层
        element.zIndex = range.max + 1;
        return true;
    }

    // 移动到底层
    public moveToBottom(element: IUI): boolean {
        const context = this.findElementContext(element);
        if (!context) return false;

        const { siblings, index } = context;
        const range = this.getSiblingZIndexRange(siblings, index);

        if (range.min >= (element.zIndex || 0)) {
            // 已经在底层
            return false;
        }

        // 设置 zIndex 为最小值 - 1，确保在底层
        element.zIndex = range.min - 1;
        return true;
    }
    // 将元素移入 Group
    public moveIntoGroup(element: IUI, targetGroup: IGroup, index?: number): boolean {
        // 确保 targetGroup 是有效的 Group
        if (targetGroup.tag !== Tag.Group) return false;

        const sourceContext = this.findElementContext(element);
        if (!sourceContext) return false;

        // 不能将自己移入自己（如果 element 是 Group）
        if (element === targetGroup) return false;

        // 确保 targetGroup 有 children 数组
        if (!targetGroup.children) {
            targetGroup.children = [];
        }

        // 计算在 Group 中的新 zIndex
        let newZIndex = 1;
        if (index) {
            newZIndex = index
        } else {
            if (targetGroup.children.length > 0) {
                const renge = this.getSiblingZIndexRange(targetGroup.children);
                newZIndex = renge.max + 1;
            }
        }
        element.zIndex = newZIndex;

        // 添加到目标 Group
        targetGroup.add(element)
        return true;
    }

    // 将元素移出 Group（到顶级）
    public moveOutOfGroup(element: IUI, index?: number): boolean {
        const context = this.findElementContext(element);
        if (!context || !context.parent) return false;

        // 只有在 Group 中的元素才能移出
        // const isInGroup = context.parent !== this._contentFrame;
        if (!(context.parent !== this._contentFrame)) return false;

        // 计算在顶级中的新 zIndex
        let newZIndex = 1;
        if (index) {
            newZIndex = index
        } else {
            if (this._contentFrame.children.length > 0) {
                const range = this.getSiblingZIndexRange(this._contentFrame.children);
                newZIndex = range.max + 1;
            }
        }
        element.zIndex = newZIndex;
        // 添加到顶级
        this._contentFrame.add(element)
        return true;
    }

    // 移动到指定元素的前面（zIndex 更大）
    public moveBefore(element: IUI, targetElement: IUI): boolean {
        // 检查两个元素是否在同一个容器内
        if (!this.areInSameContainer(element, targetElement)) {
            console.warn('Elements are not in the same container');
            return false;
        }
        // 不能移动到自己的前面
        if (element === targetElement) {
            return false;
        }
        this.normalizeZIndexes(element.parent!.children || []);

        const targetContext = this.findElementContext(targetElement)!;
        const { siblings, index: targetIndex } = targetContext;

        // 获取目标元素的相邻元素
        const next = this.getAdjacentElement(siblings, targetIndex, '>')
        if (next) {
            // 在目标元素和前一个元素之间插入
            element.zIndex = this.getMiddleZIndex(next.zIndex || 0, targetElement.zIndex || 0);
        } else {
            // 目标元素是第一个，移动到它的前面（成为第一个）
            element.zIndex = (targetElement.zIndex || 0) + 1;
        }
        return true;
    }

    // 移动到指定元素的后面（zIndex 更小）
    public moveAfter(element: IUI, targetElement: IUI): boolean {
        if (!this.areInSameContainer(element, targetElement)) {
            console.warn('Elements are not in the same container');
            return false;
        }
        if (element === targetElement) return false;
        this.normalizeZIndexes(element.parent!.children || []);

        const targetContext = this.findElementContext(targetElement)!;
        const { siblings, index: targetIndex } = targetContext;

        const prev = this.getAdjacentElement(siblings, targetIndex, '<')
        if (prev) {
            element.zIndex = this.getMiddleZIndex(prev.zIndex || 0, targetElement.zIndex || 0);
        } else {
            element.zIndex = (targetElement.zIndex || 0) - 1;
        }
        return true;
    }

    // 打印当前层级状态（用于调试）
    public printLayers(): void {
        const printElement = (element: IUI, indent: string = ''): void => {
            console.log(`${indent}${element.tag} (zIndex: ${element.zIndex}) name: ${element.name}`);
            if (element.tag === 'Group' && element.children) {
                element.children.forEach(child => printElement(child, indent + '  '));
            }
        };

        console.log('=== Current Layers ===');
        this._contentFrame.children.forEach(element => printElement(element));
        console.log('======================');
    }

    // 销毁
    public destroy() {
        this.skyFrame.destroy()
        this.contentFrame.destroy()
        this.groundFrame.destroy()

        this._width = 0
        this._height = 0
        this.x = 0
        this.y = 0
        this.childrenTotal = 0

        this.history.destroy()
    }
}

