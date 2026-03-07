import {
    App,
    Frame,
    Line,
    PointerEvent,
    type IEventListenerId,
} from "leafer-ui";

import type { IPlugin, IPluginHost } from "../interfaces";
import type { LeaferEditor } from "../editor";
import { generateID } from "../utils";

export const GridLinePluginName = "GridLine"
export const GridLinePluginServiceName = "GridLine"

export interface IGridLinePluginService {
    readonly isEnableGridLineDraggable: boolean
    readonly gridLines: Line[]
    newGridLine(place: number, direction: 'h' | 'v',): Line
    addGridLine(line: Line): void
    removeGridLine(line: Line | string): void
    clearGridLines(): void
    gridLinesResize(scale: number): void
    gridLinesShow(): void
    gridLinesHide(): void
    gridLinesIsShow(): boolean
    enableGridLineDraggable(): boolean
    disableGridLineDraggable(): boolean
}

export class GridLinePlugin implements IPlugin<LeaferEditor>, IGridLinePluginService {
    name: string = GridLinePluginName
    private strokeWidth = .6
    _editor: LeaferEditor | null = null
    // _skyFrame = new Frame({
    //     x: 0, y: 0,
    //     width:0.1, height:0.1,overflow:'show',
    //     name: 'GridLine-skyFrame', hittable: true,
    // })
    public get editor(): LeaferEditor {
        if (!this._editor) {
            throw new Error("Plugin not installed")
        }
        return this._editor as LeaferEditor
    }
    private get skyFrame(): Frame {
        return this.editor.skyFrame
        // return this._skyFrame
    }
    private get app(): App {
        return this.editor.app
    }

    private options: any = {}
    install(host: IPluginHost<LeaferEditor>, options: any = {}) {
        this._editor = host.getInstance()
        this.options = { ...options }
        if (!this.options.strokeColor) {
            this.options.strokeColor = '#1d1dff'
        }
        if (!this.options.strokeDragColor) {
            this.options.strokeDragColor = '#ff0000'
        }

        if (!this.editor.ruler.enabled) {
            console.warn("Ruler is not enabled, please enable it first; GridLine plugin will not work");
            // 其实不开启 ruler 也能用，主要为了“美观”，不过还是建议开启
            this.editor.ruler.changeEnabled(true)
            console.warn("Ruler enabled");
        }
        // this.editor.app.tree.add(this._skyFrame)

        this.registerGridLines()

        host.registerService({
            name: GridLinePluginServiceName,
            service: this,
            description: "GridLine 插件 Service",
            plugin: this,
        })
    }

    private gridLineName = 'GridLine'
    public get gridLines(): Line[] {
        return this.skyFrame.children.filter(child => child.className === this.gridLineName) as Line[]
    }
    // direction: 'h' | 'v'
    //             h: Horizontal 横向
    //             v: Vertical 
    public newGridLine(place: number, direction: 'h' | 'v',): Line {
        let rotation = 0
        let x = -99999999
        let y = -99999999
        if (direction === 'h') {
            rotation = 0
            y = place
        } else {
            rotation = 90
            x = place
        }
        const id = generateID()
        const line = new Line({
            id,
            className: this.gridLineName,
            name: `GridLine-${this.gridLines.length + 1}`,
            width: 99999999 * 2,
            strokeWidth: this.strokeWidth / this.editor.currentScale,
            stroke: this.options.strokeColor || '#64ffff',
            rotation,
            x,
            y,
            zIndex: 999,
            cursor: direction === 'h' ? 'ns-resize' : 'ew-resize',
            draggable: true,
        })
        line.on(PointerEvent.DOWN, (e: PointerEvent) => {
            if (e.buttons !== 1) return
            line.stroke = this.options.strokeDragColor || '#ff0000'
        })
        line.on(PointerEvent.UP, (e: PointerEvent) => {
            if (e.buttons !== 1) return
            line.stroke = this.options.strokeColor || '#64ffff'
            const local = e.getLocal(this.app)
            if (local.x < 20 || local.y < 20) {
                if (line) {
                    line.remove()
                    line.destroy()
                }
            }
            if (this.gridLines.length === 0)
                this.disableGridLineDraggable()
        })
        return line
    }
    public addGridLine(line: Line) {
        if (!line) return
        if (line.id && this.gridLines.filter(l => l.id === line.id).length > 0) return
        if (line.className !== this.gridLineName) return
        if (line.parent) {
            line.parent.remove(line)
        }
        this.skyFrame.add(line)
    }
    public removeGridLine(line: Line | string) {
        if (typeof line === 'string') {
            line = this.gridLines.filter(l => l.id === line)[0] as Line
        } else {
            if (!line) return
            const index = this.gridLines.indexOf(line)
            if (index === -1) return
        }
        if (!line) return
        if (line.className !== this.gridLineName) return
        this.skyFrame.remove(line)
    }
    public clearGridLines() {
        this.gridLines.forEach(line => {
            this.skyFrame.remove(line)
        })
    }
    public gridLinesResize(scale: number) {
        this.gridLines.forEach(line => {
            line.strokeWidth = this.strokeWidth / scale
        })
    }
    public gridLinesShow() {
        this.gridLines.forEach(line => {
            line.visible = true
        })
    }
    public gridLinesHide() {
        this.gridLines.forEach(line => {
            line.visible = false
        })
        this.disableGridLineDraggable()
    }
    public gridLinesIsShow(): boolean {
        if (this.gridLines.length === 0) return true  // 没有网格线，直接返回 true
        let isShow = false
        this.gridLines.forEach(line => {
            if (line.visible) isShow = true
        })
        return isShow
    }
    public enableGridLineDraggable(): boolean {
        if (this.isEnableGridLineDraggable) return false
        if (this.gridLines.length === 0) return false

        this.editor.cancel()
        if (this.editor.mode !== 'normal'){
            this.editor.setModeNormal()
        }
        // this.app.editor.config.boxSelect = false
        // this.editor.contentFrame.hittable = false
        this.skyFrame.hittable = true
        // this.editor.contentFrame.hitSelf = false
        // this.skyFrame.hitSelf = false
        return true
    }
    public disableGridLineDraggable(): boolean {
        if (!this.isEnableGridLineDraggable) return false
        // this.app.editor.config.boxSelect = true
        // this.editor.contentFrame.hittable = true
        this.skyFrame.hittable = false
        // this.editor.contentFrame.hitSelf = true
        // this.skyFrame.hitSelf = false
        return true
    }
    public get isEnableGridLineDraggable(): boolean {
        return this.skyFrame.hittable || false
    }

    private events: IEventListenerId[] = []
    private registerGridLines() {
        let line: Line | null = null
        let direction: "h" | "v" | null = null

        const eventPointerDown = this.app.on_(PointerEvent.DOWN, (e: PointerEvent) => {
            if (e.buttons !== 1) return
            const point = e.getPagePoint()
            const local = e.getLocalPoint()

            if (local.x > 20 && local.y > 20) {
                if (!this.app.editor.config.boxSelect && !this.isEnableGridLineDraggable)
                    this.app.editor.config.boxSelect = true
                return
            }
            // if (this.editor.mode !== 'normal') return
            this.editor.cancel()
            if (this.editor.mode !== 'normal'){
                this.editor.setModeNormal()
            }
            let place = 0
            if (local.x < 20) {
                direction = "v"
                place = point.x
            } else if (local.y < 20) {
                direction = "h"
                place = point.y
            } else {
                return
            }
            this.app.editor.config.boxSelect = false
            line = this.newGridLine(place, direction)
            this.app.tree.add(line)
        })
        const eventPointerMove = this.app.on_(PointerEvent.MOVE, (e: PointerEvent) => {
            const local = e.getLocalPoint()
            if (local.x < 20) {
                this.app.cursor = "ew-resize"
            } else if (local.y < 20) {
                this.app.cursor = "ns-resize"
            } else {
                if (!line) this.app.cursor = "default"
            }

            if (line) {
                const point = e.getPagePoint()
                if (direction === "h") {
                    line.y = point.y
                } else if (direction === "v") {
                    line.x = point.x
                }
            }
        })
        const eventPointerUp = this.app.on_(PointerEvent.UP, (e: PointerEvent) => {
            if (!line && !direction) {
                return
            }
            const local = e.getLocalPoint()
            if (local.x < 20 || local.y < 20) {
                if (line) {
                    line.destroy()
                    line = null
                    direction = null
                }
                return
            }
            if (!this.isEnableGridLineDraggable) {
                this.app.editor.config.boxSelect = true
            }

            if (line) {
                line.remove()
                this.addGridLine(line)
                line = null
                direction = null
            }
        })
        this.events.push(eventPointerDown)
        this.events.push(eventPointerMove)
        this.events.push(eventPointerUp)

        this.editor.eventBus.on(this.editor.Events.canvasZoomChange, this.onCanvasZoomChange.bind(this))
        this.editor.eventBus.on(this.editor.Events.pageChangeAfter, this.onPageChangeAfter.bind(this))
        this.editor.eventBus.on(this.editor.Events.pageChangeBefore, this.onDisableGridLine.bind(this))
        this.editor.eventBus.on(this.editor.Events.selectedBefore, this.onDisableGridLine.bind(this))
    }
    private onCanvasZoomChange(scale: number) {
        this.gridLinesResize(scale)
    }
    private onPageChangeAfter() {
        this.gridLinesResize(this.editor.currentScale)
        this.disableGridLineDraggable()
    }
    private onDisableGridLine() {
        this.disableGridLineDraggable()

    }
    public destroy() {
        this.events.forEach(event => {
            this.app.off_(event)
        })
        this.clearGridLines()
        this.editor.eventBus.off(this.editor.Events.canvasZoomChange, this.onCanvasZoomChange.bind(this))
        this.editor.eventBus.off(this.editor.Events.pageChangeAfter, this.onPageChangeAfter.bind(this))
        this.editor.eventBus.off(this.editor.Events.pageChangeBefore, this.onDisableGridLine.bind(this))
        this.editor.eventBus.off(this.editor.Events.selected, this.onDisableGridLine.bind(this))
        const currentCanvas = this.editor.currentPageID
        this.editor.pages().forEach(page => {
            this.editor.pageSetCurrent(page.name)
            this.clearGridLines()
        })
        this.editor.pageSetCurrent(currentCanvas)
    }
    public uninstall(host: IPluginHost<LeaferEditor>) {
        this.destroy()
    }
}