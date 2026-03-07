import mousetrap from "mousetrap"

import { ContextMenu, type MenuFuncOptions, type MenuOptions } from "../contextMenu"
import { setLocale, t } from "../i18n"
import * as predefine from "../utils/predefine"

import type { IPlugin, IPluginHost, IService } from "../interfaces";
import type { LeaferEditor } from "../editor";
import { generateID } from "../utils"

export const ContextMenuPluginName = "ContextMenu"
export const ContextMenuPluginServiceName = ContextMenuPluginName

export interface IContextMenuPluginService extends IService<IContextMenuPluginService> {
    registerContextMenu: (menu: MenuOptions | Array<MenuOptions> | MenuFuncOptions) => void;
    unRegisterContextMenu: (key: string) => void;
}

export class ContextMenuPlugin implements IPlugin<LeaferEditor>, IContextMenuPluginService {
    name: string = ContextMenuPluginServiceName
    description: string = "context menu plugin"
    dependentPlugins = ["shortcut"]

    _editor: LeaferEditor | null = null

    public get plugin() {
        return this
    }
    public get service() {
        return this
    }

    public get editor(): LeaferEditor {
        if (!this._editor) {
            throw new Error("Plugin not installed")
        }
        return this._editor as LeaferEditor
    }
    private contextMenu: ContextMenu | null = null

    install(host: IPluginHost<LeaferEditor>) {
        this._editor = host.getInstance()
        this.contextMenu = new ContextMenu(this.editor.app, {
            menuList: [],
            // setMenuType: ()=>{return "SOME"}
        })
        this.registerContextMenus()
        host.registerService(this)
    }
    public registerContextMenu(menu: MenuOptions | Array<MenuOptions> | MenuFuncOptions) {
        this.contextMenu?.addMenu(menu)
    }
    public unRegisterContextMenu(key: string) {
        this.contextMenu?.removeMenu(key)
    }
    private registerContextMenus() {
        this.editor.eventBus.on(this.editor.Events.historyStateSavedAfter, () => {
            this.contextMenu?.hideMenu()
        })

        const _hideMenu = (e: any) => {
            if (!this.contextMenu?.isShow()) {
                return
            }
            const { top, left, width, height } = this.editor.view.getBoundingClientRect()
            // 判断是否在画布区域
            if (e.clientX < left || e.clientX > left + width || e.clientY < top || e.clientY > top + height) {
                this.contextMenu?.hideMenu()
            }
        }
        window.addEventListener('click', _hideMenu)  // 点击隐藏菜单
        window.addEventListener('contextmenu', _hideMenu)  // 右键隐藏菜单

        // 新增元素
        this.contextMenu?.addMenu({
            title: t("add"),
            key: 'add',
            desc: 'add element',
            type: 'ZERO',
            children: [
                {
                    title: t("add-rect"),
                    key: 'add-rect',
                    type: 'ALL',
                    desc: 'rect',
                    children: [
                        {
                            title: t("add-rect-rect"),
                            key: 'add-rect-rect',
                            type: 'ALL',
                            callback: (e) => {
                                const { x, y } = e.pointerEvent.getLocalPoint(this.editor.currentPage.contentFrame)
                                this.editor.add(predefine.rect({ x, y }))
                            }
                        },
                        {
                            title: t("add-rect-round"),
                            key: 'add-rect-round',
                            type: 'ALL',
                            callback: (e) => {
                                const { x, y } = e.pointerEvent.getLocalPoint(this.editor.currentPage.contentFrame)
                                this.editor.add(predefine.roundedRect({ x, y }))
                            }
                        },
                    ]
                },
                {
                    title: t("add-polygon"),
                    key: 'add-polygon',
                    desc: 'polygon',
                    type: 'ALL',
                    children: [
                        {
                            title: t("add-polygon-triangle"),
                            key: 'add-polygon-triangle',
                            type: 'ALL',
                            callback: (e) => {
                                const { x, y } = e.pointerEvent.getLocalPoint(this.editor.currentPage.contentFrame)
                                this.editor.add(predefine.triangle({ x, y }))
                            }
                        },
                        {
                            title: t("add-polygon-pentagon"),
                            key: 'add-polygon-pentagon',
                            type: 'ALL',
                            callback: (e) => {
                                const { x, y } = e.pointerEvent.getLocalPoint(this.editor.currentPage.contentFrame)
                                this.editor.add(predefine.pentagon({ x, y }))
                            }
                        },
                        {
                            title: t("add-polygon-roundedPentagon"),
                            key: 'add-polygon-roundedPentagon',
                            type: 'ALL',
                            callback: (e) => {
                                const { x, y } = e.pointerEvent.getLocalPoint(this.editor.currentPage.contentFrame)
                                this.editor.add(predefine.roundedPentagon({ x, y }))
                            }
                        },

                    ]
                },
                {
                    title: t("add-star"),
                    key: 'add-star',
                    desc: 'star',
                    type: 'ALL',
                    children: [
                        {
                            title: t("add-star-threeStar"),
                            key: 'add-star-threeStar',
                            type: 'ALL',
                            callback: (e) => {
                                const { x, y } = e.pointerEvent.getLocalPoint(this.editor.currentPage.contentFrame)
                                this.editor.add(predefine.threeStar({ x, y }))
                            }
                        },
                        {
                            title: t("add-star-pentagram"),
                            key: 'add-star-pentagram',
                            type: 'ALL',
                            callback: (e) => {
                                const { x, y } = e.pointerEvent.getLocalPoint(this.editor.currentPage.contentFrame)
                                this.editor.add(predefine.pentagram({ x, y }))
                            }
                        },
                        {
                            title: t("add-star-roundedStar"),
                            key: 'add-star-roundedStar',
                            type: 'ALL',
                            callback: (e) => {
                                const { x, y } = e.pointerEvent.getLocalPoint(this.editor.currentPage.contentFrame)
                                this.editor.add(predefine.roundedStar({ x, y }))
                            }
                        },
                    ]
                },
                {
                    title: t("add-ellipse"),
                    key: 'add-ellipse',
                    desc: 'ellipse',
                    type: 'ALL',
                    children: [
                        {
                            title: t("add-ellipse-ellipse"),
                            key: 'add-ellipse-ellipse',
                            type: 'ALL',
                            callback: (e) => {
                                const { x, y } = e.pointerEvent.getLocalPoint(this.editor.currentPage.contentFrame)
                                this.editor.add(predefine.ellipse({ x, y }))
                            }
                        },
                        {
                            title: t("add-ellipse-ring"),
                            key: 'add-ellipse-ring',
                            type: 'ALL',
                            callback: (e) => {
                                const { x, y } = e.pointerEvent.getLocalPoint(this.editor.currentPage.contentFrame)
                                this.editor.add(predefine.ring({ x, y }))
                            }
                        },
                        {
                            title: t("add-ellipse-sector"),
                            key: 'add-ellipse-sector',
                            type: 'ALL',
                            callback: (e) => {
                                const { x, y } = e.pointerEvent.getLocalPoint(this.editor.currentPage.contentFrame)
                                this.editor.add(predefine.sector({ x, y }))
                            }
                        },
                        {
                            title: t("add-ellipse-ellipse2"),
                            key: 'add-ellipse-ellipse2',
                            type: 'ALL',
                            callback: (e) => {
                                const { x, y } = e.pointerEvent.getLocalPoint(this.editor.currentPage.contentFrame)
                                this.editor.add(predefine.ellipse2({ x, y }))
                            }
                        },
                    ]
                },
                {
                    title: t("add-text"),
                    key: "add-text",
                    type: "ZERO",
                    callback: (e) => {
                        const { x, y } = e.pointerEvent.getLocalPoint(this.editor.currentPage.contentFrame)
                        this.editor.add(predefine.text({ x, y }))
                    }
                },
                {
                    title: t("add-image"),
                    key: "add-image",
                    type: "ZERO",
                    callback: () => {
                        // this.editor.openImage((file)=>{
                        //     return new Promise((resolve, reject) => {
                        //         setTimeout(() => {
                        //             const img = new Image();
                        //             // 创建对象URL
                        //             const url = URL.createObjectURL(file);
                        //             img.onload = () => {
                        //                 // 获取宽高
                        //                 const width = img.naturalWidth;
                        //                 const height = img.naturalHeight;
                        //                 // 释放对象URL
                        //                 // URL.revokeObjectURL(url);
                        //                 resolve({ url, width, height });
                        //             };
                        //             img.onerror = reject;
                        //             img.src = url;
                        //         }, 2000);
                        //     })
                        // }, true).then((img)=>{
                        //     this.editor.add(img)
                        // })
                        this.editor.openImage().then((img) => {
                            this.editor.add(img)
                        })
                    }
                }
            ]
        })

        // 全选
        this.contextMenu?.addMenu({
            title: t("select-all"),
            key: 'all-select',
            desc: 'mod+a',
            type: 'ZERO',
            callback: () => {
                mousetrap.trigger('mod+a')
            }
        })
        // 注册复制粘贴菜单
        const menuList: MenuOptions[] = [
            {
                title: t('copy'),
                desc: 'mod+c',
                key: 'copy',
                type: ['ONE', 'SOME'],
                callback: () => {
                    mousetrap.trigger('mod+c')
                },
            },
            {
                title: t('cut'),
                desc: 'mod+x',
                key: 'cut',
                type: ['ONE', 'SOME'],
                callback: () => {
                    mousetrap.trigger('mod+x')
                },
            },
            {
                title: t('paste'),
                desc: 'paste',
                key: 'paste',
                type: 'ZERO',
                callback: () => {
                    mousetrap.trigger('mod+v')
                },
                showCallback: () => {
                    return this.editor.copyingData.length > 0
                }
            },
            {
                title: t('paste-to-current-position'),
                key: 'paste-to-current-position',
                type: 'ZERO',
                callback: (e) => {
                    mousetrap.trigger('mod+v')
                    const { pointerEvent } = e
                    const local = pointerEvent.getLocalPoint(this.editor.currentPage.contentFrame)
                    const { x, y } = local
                    let minX = Infinity
                    let minY = Infinity

                    this.editor.selected.forEach((ui) => {
                        if ((ui.x as number) < minX) {
                            minX = (ui.x as number)
                        }
                        if ((ui.y as number) < minY) {
                            minY = (ui.y as number)
                        }
                    })
                    // 计算偏移量
                    const offsetX = x - minX
                    const offsetY = y - minY

                    this.editor.selected.forEach((ui) => {
                        (ui.x as number) += offsetX;
                        (ui.y as number) += offsetY
                    })
                    this.editor.cancel()
                },
                showCallback: () => {
                    return this.editor.copyingData.length > 0
                }
            },
        ]
        this.contextMenu?.addMenu(menuList)

        // 层级调整
        this.contextMenu?.addMenu({
            title: t("z-index-adjustment"),
            key: "z-index-adjustment",
            type: "ONE",
            children: [
                {
                    title: t('z-index-up'),
                    key: 'z-index-up',
                    desc: ']',
                    type: 'ONE',
                    callback: () => {
                        mousetrap.trigger(']')
                    }
                },
                {
                    title: t('z-index-down'),
                    key: 'z-index-down',
                    desc: '[',
                    type: 'ONE',
                    callback: () => {
                        mousetrap.trigger('[')
                    }
                },
                {
                    title: t('z-index-top'),
                    key: 'z-index-top',
                    desc: 'mod+]',
                    type: 'ONE',
                    callback: () => {
                        mousetrap.trigger('mod+]')
                    }
                },
                {
                    title: t('z-index-bottom'),
                    key: 'z-index-bottom',
                    desc: 'mod+[',
                    type: 'ONE',
                    callback: () => {
                        mousetrap.trigger('mod+[')
                    }
                },
            ]
        })

        // 视图缩放
        this.contextMenu?.addMenu([
            {
                title: t('zoom-management'),
                key: 'zoom-management',
                type: 'ZERO',
                children: [
                    {
                        title: t('zoom-out'),
                        key: 'zoom-out',
                        desc: '-',
                        type: 'ZERO',
                        callback: () => {
                            mousetrap.trigger('-')
                        }
                    },
                    {
                        title: t('zoom-in'),
                        key: 'zoom-in',
                        desc: '+',
                        type: 'ZERO',
                        callback: () => {
                            mousetrap.trigger('+')
                        }
                    },
                    {
                        title: t('zoom-fit'),
                        key: 'zoom-fit',
                        desc: 'mod+0',
                        type: 'ZERO',
                        callback: () => {
                            mousetrap.trigger('mod+0')
                        }
                    },
                    {
                        title: t("zoom-100"),
                        key: "zoom-reset",
                        desc: 'mod+1',
                        type: 'ZERO',
                        callback: () => {
                            mousetrap.trigger('mod+1')
                        }
                    },
                ]
            },
            {
                title: t("show-or-hide-grid"),
                key: 'grid-lines-show',
                desc: 'h',
                type: 'ZERO',
                callback: () => {
                    mousetrap.trigger('h')
                }
            }
        ])

        // 操作元素
        this.contextMenu?.addMenu({
            title: t("operate"),
            key: "operate",
            type: ['ONE', 'SOME'],
            children: [
                // {
                //     title: t("rename"),
                //     key: 'rename',
                //     desc: 'rename',
                //     type: ['ONE'],
                //     callback: () => {
                //         const ui = this.editor.selected[0]!
                //         const name = window.prompt("rename:", ui.name)
                //         if (name) {
                //             ui.name = name
                //             this.editor.historySaveState()
                //         }
                //     }
                // },
                {
                    title: t("lock"),
                    key: 'lock',
                    desc: 'lock',
                    type: ['ONE', 'SOME'],
                    callback: () => {
                        this.editor.selected.forEach((ui) => {
                            ui.locked = true
                        })
                        this.editor.cancel()
                        this.editor.historySaveState()
                    },
                    disableCallback: () => {
                        let isLocked = false
                        this.editor.selected.forEach((ui) => {
                            if (ui.locked) {
                                isLocked = true
                            }
                        })
                        return isLocked
                    }
                },
                {
                    title: t("unlock"),
                    key: 'unlock',
                    desc: 'unlock',
                    type: ['ONE', 'SOME'],
                    callback: () => {
                        this.editor.selected.forEach((ui) => {
                            ui.locked = false
                        })
                        this.editor.historySaveState()
                    },
                    disableCallback: () => {
                        let isUnlocked = false
                        this.editor.selected.forEach((ui) => {
                            if (!ui.locked) {
                                isUnlocked = true
                            }
                        })
                        return isUnlocked
                    }
                },
                {
                    title: t("operate-fit-to-canvas"),
                    key: "operate-fit-to-canvas",
                    type: "ONE",
                    callback: () => {
                        if (this.editor.selected.length === 1) {
                            const ui = this.editor.selected[0]
                            ui!.x = 0
                            ui!.y = 0
                            ui!.width = this.editor.contentFrame.width
                            ui!.height = this.editor.contentFrame.height
                            this.editor.historySaveState()
                        }
                    },
                    disableCallback: () => {
                        if (this.editor.selected.length === 1 && this.editor.selected[0]!.tag === 'Group') {
                            return true
                        }
                        const ui = this.editor.selected[0]
                        if (ui!.x === 0 && ui!.y === 0 &&
                            ui!.width === this.editor.contentFrame.width &&
                            ui!.height === this.editor.contentFrame.height) {
                            return true
                        }
                        if (ui!.locked) return true
                        return false
                    }
                }
            ]
        })

        // 编组
        this.contextMenu?.addMenu([{
            title: t("group"),
            key: "group",
            type: "SOME",
            callback: () => {
                this.editor.group()
            }
        }, {
            title: t("ungroup"),
            key: "ungroup",
            type: "ONE",
            callback: () => {
                this.editor.ungroup()
            },
            showCallback: () => {
                if (this.editor.selected.length === 1 && this.editor.selected[0]!.tag === 'Group') {
                    return true
                }
                return false
            }
        }])

        // 删除元素
        this.contextMenu?.addMenu({
            title: t("remove"),
            key: 'remove',
            desc: 'del | backspace',
            type: ['ONE', 'SOME'],
            callback: () => {
                this.editor.remove()
            }
        })

        // 导出 PNG
        this.contextMenu?.addMenu({
            title: t("export-png"),
            key: "export-png",
            type: ["ZERO", "ONE"],
            callback: () => {
                let maxSize = 15000 // 最大尺寸
                if (this.editor.selected.length === 1) {
                    const max = this.editor.selected[0]!.width! > this.editor.selected[0]!.height! ? 'width' : 'height'
                    const size = this.editor.selected[0]![max]! > maxSize ? maxSize : this.editor.selected[0]![max]!
                    if (size === maxSize) {
                        console.warn(`The ${max} of the selected element is too large, it may cause performance issues.`)
                    }
                    this.editor.selected[0]?.export(`${this.editor.selected[0]!.name}-${this.editor.selected[0]!.id}.png`, { size: { [max]: size } })
                        .catch(console.error)
                } else {
                    const max = (this.editor.contentFrame.width as number) > (this.editor.contentFrame.height as number) ? 'width' : 'height'
                    const size = this.editor.contentFrame[max]! > maxSize ? maxSize : this.editor.contentFrame[max]!
                    if (size === maxSize) {
                        console.warn(`The ${max} of the canvas is too large, it may cause performance issues.`)
                    }
                    this.editor.export(`canvas-${generateID()}.png`, { size: { [max]: size } }).catch(console.error)
                }
            }
        })
    }

    uninstall() {
        this.contextMenu?.destroy()
        this.contextMenu = null
        this._editor = null
    }
}