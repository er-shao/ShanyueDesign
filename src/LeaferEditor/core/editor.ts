import type {
    ICanvasContext2D,
    IExportFileType,
    IExportOptions,
    IFindCondition,
    IFindUIMethod,
    IFrame,
    IGroup,
    ILeaf,
    ILeafer,
    IPathInputData,
    IPointData,
    IRenderOptions,
    IUI,
    IUIInputData,
    IZoomType
} from "@leafer-ui/interface";
import { PointerEvent, Group, ZoomEvent, Pen, Image as LeaferImage, PropertyEvent } from 'leafer-ui'
import {
    App,
    Frame,
    ResizeEvent,
    DragEvent,
} from "leafer-ui";
import { Ruler } from 'leafer-x-ruler'

import '@leafer-in/editor'
import '@leafer-in/viewport'
import "@leafer-in/view"
import "@leafer-in/export"

import '@leafer-in/text-editor'
import '@leafer-in/find'
import '@leafer-in/state'
import '@leafer-in/arrow'
// import '@leafer-in/animate'

import { Canvas } from './canvas'
import { MittBus, EventTypes } from "./events";
import { Tag, type ILeaferEditor, type LeaferEditorOptions } from './interfaces'
import singleton from "./utils/singleton"
import { EditorEvent } from "@leafer-in/editor";
import { PluginHost } from "./pluginHost";

import { findLowestCommonAncestor } from "./utils/find";
import "./shapes"
import { generateID } from "./utils";
import { readFileAsDataURL } from "./utils/file";

/**
 * LeaferEditor
 */
export class LeaferEditor extends PluginHost implements ILeaferEditor {
    private _defaultOptions: LeaferEditorOptions = {
        width: 600,
        height: 600,
        rulerEnabled: true,
        rulerUnit: 'px',
        rulerDPI: 72,
        fill: "#FFF",
        disabledMove: false,
        disabledWheel: false,
        zoomMode: false,
        lockRatio: false,
        changePageZoomFit: true,
        historyMaxSize: 20,
        pageAddable: true,
        hideOnMove: false,
        openImageEnableLocalLoader: true,
        imageFileTypes: [],
        maxImageSize: 1024 * 1024 * 10, // 10M
        uploadImageCallback: (file: File) => {
            return readFileAsDataURL(file)
        }
    }
    private _width: number
    private _height: number
    // private _el: Window | HTMLCanvasElement | HTMLDivElement 

    private _app: App
    private _tree: ILeafer
    private _pages: Map<string, Canvas> = new Map()
    private _currentScale: number = 1

    private currentCanvas: Canvas

    public view: any
    public ruler: Ruler
    public rulerUnitList: string[] = ['px', 'cm', 'in', 'pt', 'pc', 'mm']
    public readonly options: LeaferEditorOptions
    public copyingData: IUI[] = []
    // 事件中心
    public eventBus: MittBus = new MittBus()
    public Events = EventTypes

    constructor(options?: LeaferEditorOptions) {
        super()
        this.options = options || {}
        this.options = { ...this._defaultOptions, ...this.options }

        this._width = this.options.width || 600
        this._height = this.options.height || 600

        const el = document.createElement('div')
        el.style.width = `${this._width}px`
        el.style.height = `${this._height}px`
        const app = new App({
            view: el,
            width: el.offsetWidth,
            height: el.offsetHeight,

            fill: this.options.fill || "#FFF",
            move: {
                disabled: this.options.disabledMove || false,
            },
            wheel: {
                disabled: this.options.disabledWheel || false,
                zoomSpeed: 0.1,
                moveSpeed: 0.5,
                zoomMode: this.options.zoomMode || false,
            },
            editor: {
                hideOnMove: this.options.hideOnMove || false,
                point: { cornerRadius: 0 },
                middlePoint: {},
                rotatePoint: { width: 16, height: 16 },
                // rect: { dashPattern: [3, 2] },
                buttonsDirection: 'top',
                // around: "center",
                rotateAround: "center",
                lockRatio: this.options.lockRatio || false,
                // 将独立旋转控制点改为移动控制点
                circle: { pointType: 'move', cursor: 'move', width: 16, height: 16, }
            },
        })
        // const _onScale = app.editor.onScale
        // app.editor.onScale = (e: any) => {
        //     e.shiftKey = !e.shiftKey // Leafer 默认是需要按下 shift 才会等比例缩放
        //     return _onScale.call(app.editor, e)
        // }
        this._app = app
        this._tree = app.tree

        this.view = app.canvas.view
        const rulerDPI = this.options.rulerDPI || 72
        this.ruler = new Ruler(app, {
            enabled: true,
            theme: 'light',
            conversionFactors: {
                // 像素
                px: {
                    px: 1,
                    gaps: [5000, 2500, 1000, 500, 200, 100, 50, 20, 10],
                    defaultGap: 10000
                },
                // 英寸
                in: {
                    px: rulerDPI,
                    gaps: [100, 50, 30, 20, 6, 1, 2, 0.8, 0.5],
                    defaultGap: 1000
                },
                // 厘米
                cm: {
                    px: rulerDPI / 2.54,
                    gaps: [100, 50, 30, 20, 6, 4, 2, 1, 0.5],
                    defaultGap: 1000
                },
                // 毫米
                mm: {
                    px: rulerDPI / 25.4,
                    gaps: [1000, 500, 200, 100, 50, 20, 10, 5, 2],
                    defaultGap: 2000
                },
                // 点
                pt: {
                    px: rulerDPI / 72,
                    gaps: [5000, 2500, 1000, 500, 200, 100, 50, 20, 10],
                    defaultGap: 10000
                },
                // 派卡
                pc: {
                    px: rulerDPI / 6,
                    gaps: [100, 80, 50, 30, 15, 12, 8, 6, 4],
                    defaultGap: 1000
                }
            }
        })
        this.ruler.changeEnabled(this.options.rulerEnabled!)
        this.changeRulerUnit(this.options.rulerUnit!)

        this.app.tree.zoom('fit')
        this.registerEvents()

        const currentPageID = 'DefaultCanvas'
        this.currentCanvas = new Canvas(currentPageID, this._width, this._height, 0, 0, this.options.historyMaxSize)
        this._pages.clear()
        this._pageAdd(currentPageID, this.currentCanvas)
        this.app.start()
        this.setCurrentCanvas(this.currentCanvas)
    }

    getInstance() {
        return this
    }

    public zoom(type: IZoomType) {
        // this._tree.zoom(type,  0, false, true)
        const boundsData = this._tree.zoom(type)
        // 计算缩放后的 currentScale
        const { width, height } = this._tree.boxBounds
        const { width: canvasWidth, height: canvasHeight } = boundsData

        const scaleX = canvasWidth / width
        const scaleY = canvasHeight / height
        this._currentScale = Math.min(scaleX, scaleY)
        this.eventBus.emit(EventTypes.canvasZoomChange, this._currentScale)
    }

    public get currentScale(): number {
        return this._currentScale
    }
    public set currentScale(value: number) {
        this._currentScale = value
        this._tree.zoom(value)
        this.eventBus.emit(EventTypes.canvasZoomChange, this._currentScale)
    }

    public clear() {
        this.groundFrame.removeAll()
        this.contentFrame.removeAll()
        this.skyFrame.removeAll()
        this.historySaveState()
    }
    public clearContent() {
        this.contentFrame.removeAll()
        this.historySaveState()
    }
    public clearGround() {
        this.groundFrame.removeAll()
        this.historySaveState()
    }
    public clearSky() {
        this.skyFrame.removeAll()
        this.historySaveState()
    }

    public resize(width: number, height: number) {
        this.app.resize({ width, height })
    }
    public select(target: IUI | IUI[]) {
        this.app.editor.select(target)
    }
    // 取消选中
    public cancel() {
        this.app.editor.cancel()
        // this.app.editor.target = undefined
        this.app.editor.hoverTarget = undefined
    }
    public toJSON(): object {
        const pages: any = {}
        for (const [id, canvas] of this._pages) {
            pages[id] = canvas.toJSON()
        }
        return {
            width: this._width,
            height: this._height,
            pages,
            currentCanvas: this.currentCanvas.name,
        }
    }
    public exportContentJSON(): object {
        const pages: any = {}
        for (const [id, canvas] of this._pages) {
            pages[id] = canvas.exportContentJSON()
        }
        return {
            width: this._width,
            height: this._height,
            pages,
            currentCanvas: this.currentCanvas.name,
        }
    }
    public reLoadFromJSON(json: object, isUploadBase64: boolean = false, sourceTag: string = "Base64"): boolean {
        // @ts-ignore
        const { width, height, pages, currentCanvas } = JSON.parse(JSON.stringify(json))
        if (!pages) return false
        this.clear()
        this._pages.clear()
        if (width)
            this._width = width
        if (height)
            this._height = height

        for (const id in pages) {
            const page = pages[id]
            const canvas = Canvas.fromJSON(
                page,
                this.options.historyMaxSize,
                isUploadBase64 ? (f) => {
                    return this.options.uploadImageCallback!(f, sourceTag)
                } : undefined
            )
            this._pageAdd(id, canvas)
            this.pageSetCurrent(id)
            this.app.start()
        }
        if (currentCanvas)
            this.pageSetCurrent(currentCanvas)
        return true
    }
    public appendPagesFromJSON(json: object, isUploadBase64: boolean = false, sourceTag: string = "Base64"): boolean {
        // @ts-ignore
        const { pages } = JSON.parse(JSON.stringify(json))
        if (!pages) return false

        this.historyDisable()
        for (let id in pages) {
            const page = pages[id]
            id = generateID()
            page['name'] = id
            const canvas = Canvas.fromJSON(
                page,
                this.options.historyMaxSize,
                isUploadBase64 ? (f) => {
                    return this.options.uploadImageCallback!(f, sourceTag)
                } : undefined
            )
            this._pageAdd(id, canvas)
            this.pageSetCurrent(id)
            this.app.start()
        }
        this.historyEnable()
        return true
    }
    public canvasResize(width: number, height: number) {
        this.currentCanvas.resize(width, height)
        this.eventBus.emit(EventTypes.canvasResize, { width, height })
        this.historySaveState()
    }
    private _currentRulerUnit: string = ''
    public changeRulerUnit(unit: string) {
        if (!this.ruler.enabled) return
        if (!this.rulerUnitList.includes(unit)) {
            console.warn(`The unit ${unit} is not supported`)
            return
        }
        if (this._currentRulerUnit === unit) {
            return
        }
        this._currentRulerUnit = unit
        this.ruler.changeUnit(unit)
    }

    public get currentRulerUnit(): string {
        return this._currentRulerUnit || this.rulerUnitList[0] as string
    }

    private selectImage() {
        return new Promise<File>((resolve, reject) => {
            // 创建文件输入元素
            const input = document.createElement('input');
            input.type = 'file';
            input.style.display = 'none';

            const imageFileTypes = this.options.imageFileTypes || [];
            if (imageFileTypes.length > 0) {
                input.accept = imageFileTypes.join(',');
            } else {
                input.accept = 'image/*';
            }
            // 添加事件监听器
            input.addEventListener('change', async (event: Event) => {
                const target = event.target as HTMLInputElement;
                const file = target.files?.[0];

                if (!file) {
                    // reject(new Error('no file selected'));
                    console.warn('no file selected');
                    return;
                }

                try {
                    // 验证文件类型
                    const fileType = file.type;
                    if (imageFileTypes.length > 0) {
                        if (!imageFileTypes.includes(fileType)) {
                            reject(new Error('Please select the image file In the following format: ' + imageFileTypes.join(',')));
                            return;
                        }
                    } else {
                        if (!fileType.startsWith('image/')) {
                            reject(new Error('Please select the image file'));
                            return;
                        }
                    }
                    const maxSize = this.options.maxImageSize || 10 * 1024 * 1024; // 10MB
                    if (file.size > maxSize) {
                        reject(new Error(`File size exceeds the limit of ${maxSize / 1024 / 1024}MB`));
                        return;
                    }
                    // 返回 文件
                    resolve(file);
                } catch (error) {
                    reject(error);
                } finally {
                    // 清理DOM
                    document.body.removeChild(input);
                }
            });

            // 监听取消选择
            input.addEventListener('cancel', () => {
                document.body.removeChild(input);
                reject(new Error('cancel'));
            });

            // 触发文件选择
            document.body.appendChild(input);
            input.click();
        });
    }

    /**
     * 添加图片方法
     * @param callback? 可选的回调函数，如果提供则调用回调并传入文件
     * @param enableLocalLoader? 是否允许本地加载图片; 默认为true 选择文件后加载图片到编辑器中，在 callback 完成后，图片会被替换为远程图片
     * @returns  Promise<LeaferImage> 
     */
    public async openImage(enableLocalLoader?: boolean): Promise<LeaferImage> {
        const file = await this.selectImage();
        const img = new LeaferImage({
            width: 300,
            editable: true,
            placeholderColor: 'rgba(120,120,120,0.4)',
            // url: '/load-image.png'
        });

        const useLocalLoader = enableLocalLoader ?? this.options.openImageEnableLocalLoader ?? true;
        const uploadCallback = this.options.uploadImageCallback;

        if (useLocalLoader) {
            // 启用本地加载：先加载本地图片
            const localData = await readFileAsDataURL(file);
            img.width = localData.width;
            img.height = localData.height;
            img.url = localData.url;
            img.name = file.name;

            // 异步执行上传（不阻塞）
            if (uploadCallback) {
                uploadCallback(file, "OpenImage").then((remoteData) => {
                    img.width = remoteData.width;
                    img.height = remoteData.height;
                    img.url = remoteData.url;
                    img.name = remoteData.name || file.name;
                    this.historySaveState();
                })
                    .catch((error) => {
                        console.error('Image upload failed:', error);
                        // 上传失败时保留本地图片
                    });
            }
            return img;
        } else {
            // 不使用本地加载：必须等待上传完成（阻塞）
            if (!uploadCallback) {
                throw new Error('You need to provide a callback function to handle the uploaded image');
            }

            const remoteData = await uploadCallback(file, "OpenImage");
            img.width = remoteData.width;
            img.height = remoteData.height;
            img.url = remoteData.url;
            img.name = remoteData.name || file.name;

            return img;
        }
    }

    public setNormalizeAttr(child: IUI) {
        child.id = generateID()
        child.name = child.name || ""
        child.zIndex = child.zIndex || 0
        child.editable = child.editable || true
        if (child.tag === Tag.Group) {
            child.hitChildren = false // 子元素不可 交互事件
            child.children?.forEach(this.setNormalizeAttr.bind(this))
        }
    }

    public add(_child: IUI, _index?: number) {
        this.eventBus.emit(EventTypes.canvasAddBefore, { _child: [_child], _index })
        this.currentCanvas.add(_child, _index)
        this.historySaveState()
        // this.select(_child)
        this.eventBus.emit(EventTypes.canvasAddAfter, { _child: [_child], _index })
    }
    public addMany(children: IUI[]) {
        this.eventBus.emit(EventTypes.canvasAddBefore, { _child: children, _index: 0 })
        children.forEach((child) => {
            this.currentCanvas.add(child)
        })
        this.historySaveState()
        this.select(children)
        this.eventBus.emit(EventTypes.canvasAddAfter, { _child: children, _index: 0 })
    }

    // 移除元素， 没有参数时移除选中的元素
    public remove(_child?: string | number | IUI | IFindCondition | IFindUIMethod | undefined, _destroy?: boolean) {
        this.eventBus.emit(EventTypes.canvasRemoveBefore, { _child, _destroy })
        if (_child === undefined) { // 移除选中的元素
            this.selected.forEach((ui) => {
                ui.remove()
            })
            this.cancel()
        } else {
            this.contentFrame.remove(_child, _destroy)
        }
        this.historySaveState()
        this.eventBus.emit(EventTypes.canvasRemoveAfter, { _child, _destroy })
    }

    /**
     * 移除所有空的分组（Group）
     */
    public removeEmptyGroup(): void {
        const __remove = (g: IUI[]) => {
            let removeList: IUI[] = []
            for (const ui of g) {
                if (ui.tag === 'Group' && ui.children?.length === 0) {
                    removeList.push(ui)
                } else if (ui.tag === 'Group') {
                    __remove(ui.children || [])
                }
            }
            removeList.forEach((ui) => {
                this.eventBus.emit(EventTypes.canvasRemoveBefore, { _child: ui, _destroy: true })
                ui.remove(undefined, true)
                this.eventBus.emit(EventTypes.canvasRemoveAfter, { _child: ui, _destroy: true })
            })
        }

        __remove(this.contentFrame.children)
    }
    public group(): boolean {
        if (this.selected.length <= 1) {
            return false
        }
        const index = Math.max(...this.selected.map((ui) => ui.zIndex || 0)) + .5
        const parent = findLowestCommonAncestor<IUI>(this.selected)
        const group = this.app.editor.group()
        // const parent = this.selected[0]?.parent || this.contentFrame
        this.currentPage.normalizeZIndexes(group.children)
        group.hitChildren = false
        this.currentCanvas.add(group, index, parent)
        this.historySaveState()
        return true
    }
    public ungroup() {
        if (this.selected.length <= 0) {
            return
        }
        if (this.selected.length === 1 && this.selected[0]!.tag === 'Group') {
            const groupZIndex = this.selected[0]!.zIndex || 0
            this.selected[0]!.children?.forEach((ui) => {
                ui.zIndex = groupZIndex + ((ui.zIndex || 1) * .0001)
            })
        }
        this.app.editor.ungroup()
        this.historySaveState()
    }

    // ====================================================================================================================
    // editor 模式相关
    // ====================================================================================================================
    public setModePreview() {
        if (this.mode === 'preview') {
            return
        }
        this.cancel()
        this.app.mode = 'preview'
        this.app.config.move!.drag = true
        this._offDrawModeEvents()
        this.eventBus.emit(EventTypes.changeMode, 'preview')
    }
    public setModeNormal() {
        if (this.mode === 'normal') {
            return
        }
        this.app.mode = 'normal'
        this.app.config.move!.drag = false
        this._offDrawModeEvents()
        this.eventBus.emit(EventTypes.changeMode, 'normal')
    }
    private get drawGroups(): IUI[] {
        // return this.contentFrame.children.filter((child) => child.className === 'draw-group') as IUI[]
        return this.contentFrame.find(".draw-group")
    }
    private drawModeEvents: any[] = []
    private _offDrawModeEvents() {
        if (!this.drawModeEvents) return
        this.app.off_(this.drawModeEvents)
        this.drawModeEvents = []
    }
    private _drawPenDefaultStyle: IPathInputData = {
        stroke: 'red',
        strokeWidth: 2,
    }
    private _drawPenStyle: IPathInputData = {}
    public get drawPenStyle(): IPathInputData {
        return this._drawPenStyle
    }
    public setDrawPenStyle(style?: IPathInputData) {
        this._drawPenStyle = {
            ...this._drawPenDefaultStyle,
            ...style
        }
    }
    public setModeDraw() {
        if (this.mode === 'draw') {
            return
        }
        this.cancel()
        this.app.mode = 'draw'  // 绘制模式
        this.app.config.move!.drag = false
        if (Object.keys(this._drawPenStyle).length === 0) this.setDrawPenStyle()
        let pen: Pen | null = null
        let group: Group | null = null
        let isAddGroup = false
        let index = 1
        this.drawModeEvents = [
            this.app.on_(DragEvent.START, (e: DragEvent) => {
                if (!group) {
                    group = new Group({ x: 0, y: 0, name: 'drawGroup-' + (this.drawGroups.length + 1), className: 'draw-group', hitChildren: false, editable: true })
                }
                pen = new Pen({
                    // 子元素是否响应交互事件
                    hitChildren: false,
                    editable: true,
                })
                pen.setStyle(this._drawPenStyle)
                const { x, y } = e.getLocalPoint(this.currentCanvas.contentFrame)
                pen.moveTo(x, y)

                if (!isAddGroup) {
                    this.currentCanvas.add(group)
                    isAddGroup = true
                }
                this.currentCanvas.add(pen, index)
                index++
                group.add(pen)
            }),
            this.app.on_(DragEvent.DRAG, (e: DragEvent) => {
                if (pen) {
                    const { x, y } = e.getLocalPoint(this.currentCanvas.contentFrame)
                    pen.lineTo(x, y)
                    pen.paint()
                }
            }),
            this.app.on_(DragEvent.END, (e: DragEvent) => {
                if (pen) {
                    this.historySaveState()
                    pen = null
                }
            }),
        ]
        this.eventBus.emit(EventTypes.changeMode, 'draw')
    }
    public get mode(): string {
        return this.app.mode
    }
    public set mode(value: string) {
        if (value === 'preview') {
            this.setModePreview()
        } else if (value === 'normal') {
            this.setModeNormal()
        } else if (value === 'draw') {
            this.setModeDraw()
        } else {
            console.warn(`The mode ${value} is not supported`)
            this.setModeNormal()
        }
    }


    // ====================================================================================================================
    // Page 相关
    // ====================================================================================================================
    public pageSetCurrent(id: string): boolean {
        // if (id === this.currentCanvas.name) {
        //     return true
        // }
        const canvas = this._pages.get(id)
        if (canvas) {
            this.setCurrentCanvas(canvas)
            return true
        }
        return false
    }
    public pages(): Array<Canvas> {
        return Array.from(this._pages.values())
    }
    public get currentPageID(): string {
        return this.currentCanvas.name
    }
    private _pageAdd(id: string, canvas: Canvas) {
        const param = {
            oldId: this.currentCanvas.name,
            newId: id,
        }
        this.eventBus.emit(EventTypes.pageAddBefore, param)
        this._pages.set(id, canvas)
        this.eventBus.emit(EventTypes.pageAddAfter, param)
    }
    public pageAdd(id?: string, isSetCurrentPage: boolean = true): string {
        if (this.options.pageAddable === false) {
            console.warn('Page add is not allowed')
            return ''
        }
        if (!id) {
            id = generateID()
        }
        if (this._pages.has(id)) {
            throw new Error(`Page ${id} already exists`)
        }
        const canvas = new Canvas(id, this._width, this._height, 0, 0, this.options.historyMaxSize)
        this._pageAdd(id, canvas)
        if (isSetCurrentPage) {
            this.pageSetCurrent(id)
        }
        return id
    }
    public pageRemove(id: string, force: boolean = false) {
        if (this.options.pageAddable === false && !force) {
            console.warn('Page add is not allowed')
            return ''
        }
        if (!id) {
            throw new Error('Page id is required')
        }
        if (this._pages.size === 1) {
            throw new Error('Cannot remove the last page')
        }
        const canvas = this._pages.get(id)
        if (canvas) {
            this.eventBus.emit(EventTypes.pageRemoveBefore, id)
            if (canvas === this.currentCanvas) {
                this.pageNext()
            }
            this._pages.delete(id)
            canvas.destroy()
            this.eventBus.emit(EventTypes.pageRemoveAfter, id)
        }
    }
    public pageNext() {
        if (this._pages.size <= 1) {
            return
        }
        const keys = Array.from(this._pages.keys())
        const index = keys.indexOf(this.currentCanvas.name)
        const nextIndex = (index + 1) % keys.length
        const nextId = keys[nextIndex] || this.currentCanvas.name
        this.pageSetCurrent(nextId)
    }
    public pagePrev() {
        if (this._pages.size <= 1) {
            return
        }
        const keys = Array.from(this._pages.keys())
        const index = keys.indexOf(this.currentCanvas.name)
        const prevIndex = (index - 1 + keys.length) % keys.length
        const prevId = keys[prevIndex] || this.currentCanvas.name
        this.pageSetCurrent(prevId)
    }
    private setCurrentCanvas(canvas: Canvas) {
        const param = {
            oldId: this.currentCanvas.name,
            newId: canvas.name,
        }
        this.setModeNormal()
        this.eventBus.emit(EventTypes.pageChangeBefore, param)
        this.cancel()
        this._tree.removeAll()
        this.currentCanvas = canvas
        this.bindCanvas(canvas)
        this.eventBus.emit(EventTypes.pageChangeAfter, param)
        if (this.options.changePageZoomFit)
            this.zoom('fit')
    }
    // 绑定 canvas
    private bindCanvas(canvas: Canvas) {
        this.app.tree.add(canvas.groundFrame)
        this.app.tree.add(canvas.contentFrame)
        this.app.tree.add(canvas.skyFrame)
    }

    // ====================================================================================================================
    // 历史记录
    // ====================================================================================================================
    public historyUndo() {
        this.setModeNormal()
        this.cancel()
        const state = this.currentCanvas.history.undo()
        this.eventBus.emit(EventTypes.undoRedoStackChange, state)
        this.app.start()
    }
    public historyRedo() {
        this.setModeNormal()
        this.cancel()
        const state = this.currentCanvas.history.redo()
        this.eventBus.emit(EventTypes.undoRedoStackChange, state)
        this.app.start()
    }
    public historyClear() {
        this.cancel()
        this.currentCanvas.history.clear()
    }
    public historyDisable() {
        this.currentCanvas.history.disabledHistory()
    }
    public historyEnable() {
        this.currentCanvas.history.enableHistory()
    }
    public historyIsEnabled() {
        return this.currentCanvas.history.isEnabled()
    }
    public historySaveState() {
        if (this.currentCanvas.history.saveState())
            this.eventBus.emit(this.Events.historyStateSavedAfter, this.currentCanvas.history.getCurrentState())
    }
    public historyGetCurrentState() {
        return this.currentCanvas.history.getCurrentState()
    }
    public historyCanUndo() {
        return this.currentCanvas.history.canUndo()
    }
    public historyCanRedo() {
        return this.currentCanvas.history.canRedo()
    }
    public historyInfo() {
        return this.currentCanvas.history.getHistoryInfo()
    }

    // ====================================================================================================================
    // zIndex 管理
    // ====================================================================================================================
    public zIndexMoveUp(ui: IUI): boolean {
        const ok = this.currentCanvas.moveUp(ui)
        if (ok) this.historySaveState()
        return ok
    }
    public zIndexMoveDown(ui: IUI): boolean {
        const ok = this.currentCanvas.moveDown(ui)
        if (ok) this.historySaveState()
        return ok
    }
    public zIndexMoveToTop(ui: IUI): boolean {
        const ok = this.currentCanvas.moveToTop(ui)
        if (ok) this.historySaveState()
        return ok
    }
    public zIndexMoveToBottom(ui: IUI): boolean {
        const ok = this.currentCanvas.moveToBottom(ui)
        if (ok) this.historySaveState()
        return ok
    }
    public zIndexMoveIntoGroup(element: IUI, targetGroup: IGroup, index?: number) {
        const ok = this.currentCanvas.moveIntoGroup(element, targetGroup, index)
        if (ok) this.historySaveState()
        return ok
    }
    public zIndeMoveOutOfGroup(element: IUI, index?: number): boolean {
        const ok = this.currentCanvas.moveOutOfGroup(element, index)
        if (ok) this.historySaveState()
        return ok
    }
    public zIndexMoveBefore(element: IUI, targetElement: IUI): boolean {
        const ok = this.currentCanvas.moveBefore(element, targetElement)
        if (ok) this.historySaveState()
        return ok
    }
    public zIndexMoveAfter(element: IUI, targetElement: IUI): boolean {
        const ok = this.currentCanvas.moveAfter(element, targetElement)
        if (ok) this.historySaveState()
        return ok
    }

    // ====================================================================================================================
    private registerEvents() {
        this.app.on(PointerEvent.UP, (e: PointerEvent) => {
            if (e.buttons !== 1) return
            this.historySaveState()
        })
        this._tree.on(DragEvent.END, (e: DragEvent) => {
            this.historySaveState()
        })
        this._tree.on(ResizeEvent.RESIZE, (e: ResizeEvent) => {
            this.zoom('fit')
        })

        this.app.editor.on(EditorEvent.BEFORE_SELECT, (e: EditorEvent) => {
            this.eventBus.emit(EventTypes.selectedBefore, e.editor.list)
        })

        this.app.editor.on(EditorEvent.SELECT, (e: EditorEvent) => {
            // 在选择元素时，取消掉其他 HTML 元素的焦点
            if (document.activeElement && document.activeElement !== document.body) {
                // @ts-ignore
                document.activeElement.blur();
            }
            const list = e.editor.list
            if (list.length === 0) {
                this.eventBus.emit(EventTypes.cancelSelected, null)
                return
            }
            this.eventBus.emit(EventTypes.selected, list)
        })

        // this.eventBus.on(this.Events.historyStateSavedAfter, () => {
        //     console.log("historyStateSavedAfter");
        // })

        this._tree.on(ZoomEvent.ZOOM, (e: ZoomEvent) => {
            const currentScale = this.currentScale * e.scale
            const min = this.app.config.zoom?.min || 1
            const max = this.app.config.zoom?.max || 1
            if (currentScale < min) {
                this.currentScale = min
            } else if (currentScale > max) {
                this.currentScale = max
            } else {
                this.currentScale = currentScale
            }
        })

        this._tree.on(PropertyEvent.CHANGE, (e: PropertyEvent) => {
            this.eventBus.emit(EventTypes.canvasChange, e)
        })
    }

    public export(_filename: string, _options?: number | boolean | IExportOptions | undefined) {
        return this.currentCanvas.export(_filename, _options)
    }
    public exportSync(_filename: IExportFileType | string, _options?: IExportOptions | number | boolean) {
        return this.currentCanvas.exportSync(_filename, _options)
    }
    // 缩略图
    public thumbnail(size?: number) {
        return this.currentCanvas.thumbnail(size)
    }
    public thumbnailSync(size?: number) {
        return this.currentCanvas.thumbnailSync(size)
    }
    public get thumbnailDataURL() {
        return this.currentCanvas.thumbnailDataURL
    }


    public get app() {
        return this._app
    }
    public get currentChildren(): IUI[] {
        return this.currentCanvas.contentFrame.children
    }
    public get contentFrame(): Frame {
        return this.currentCanvas.contentFrame
    }
    public get skyFrame(): Frame {
        return this.currentCanvas.skyFrame
    }
    public get groundFrame(): Frame {
        return this.currentCanvas.groundFrame
    }
    public get currentPage() {
        return this.currentCanvas
    }
    public get selected(): IUI[] {
        return this.app.editor.list
    }
}

// 导出单例
export const LeaferEditorSingleton = singleton(LeaferEditor)
