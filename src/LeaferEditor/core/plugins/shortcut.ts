import mousetrap from "mousetrap"

import type { IPlugin, IPluginHost } from "../interfaces";
import type { LeaferEditor } from "../editor";
import type { IGridLinePluginService } from "./gridLine";
import { GridLinePluginServiceName } from "./gridLine";
import type { IUI } from "leafer-ui";

export const ShortcutPluginName = "shortcut"
export const ShortcutPluginServiceName = "shortcut"

export interface IShortcutPluginService {
    bindShortcut(keys: string | string[], callback: (e: mousetrap.ExtendedKeyboardEvent, combo: string) => boolean | void): void
}

export class ShortcutPlugin implements IPlugin<LeaferEditor> {
    name: string = ShortcutPluginName

    _editor: LeaferEditor | null = null

    public get editor(): LeaferEditor {
        if (!this._editor) {
            throw new Error("Plugin not installed")
        }
        return this._editor as LeaferEditor
    }

    install(host: IPluginHost<LeaferEditor>) {
        this._editor = host.getInstance()
        this.bindShortcuts()
        host.registerService({
            name: ShortcutPluginServiceName,
            service: this,
            description: "Shortcut plugin",
            plugin: this,
        })
    }
    public bindShortcut(keys: string | string[], callback: (e: mousetrap.ExtendedKeyboardEvent, combo: string) => boolean | void) {
        mousetrap.bind(keys, callback)
    }
    private bindShortcuts() {
        // const that = this
        mousetrap.bind('mod+z', () => {
            this.editor.historyUndo()
            return false
        })
        mousetrap.bind(['mod+y', 'mod+shift+z'], () => {
            this.editor.historyRedo()
            return false
        })
        // 选择所有 没有锁定的元素
        mousetrap.bind('mod+a', (e) => {
            this.editor.select(this.editor.currentChildren.filter((ui) => {
                return !ui.locked
            }))
            return false
        })
        // 全选； 这里的全选所有的元素
        // mousetrap.bind('mod+shift+a', (e) => {
        //     this.editor.select(this.editor.currentChildren)
        //     return false
        // })
        mousetrap.bind('esc', () => {
            this.editor.cancel()
            return false
        })
        mousetrap.bind(['del', 'backspace'], (e) => {
            if (this.editor.selected.length > 0) {
                this.editor.remove()
            }
            return false
        })

        mousetrap.bind('mod+left', () => {
            this.editor.pagePrev()
            return false
        })
        mousetrap.bind('mod+right', () => {
            this.editor.pageNext()
            return false
        })

        mousetrap.bind('mod+0', () => {
            this.editor.zoom('fit')
            return false
        })
        mousetrap.bind('mod+1', () => {
            this.editor.zoom(1)
            return false
        })
        mousetrap.bind('-', () => {
            this.editor.zoom('out')
            return false
        })
        mousetrap.bind('+', () => {
            this.editor.zoom('in')
            return false
        })
        mousetrap.bind('0 0', () => {
            this.editor.zoom(.5)
            return false
        })

        mousetrap.bind('[', () => {
            if (this.editor.selected.length === 1) {
                // @ts-ignore
                this.editor.zIndexMoveDown(this.editor.selected[0])
            }
            return false
        })
        mousetrap.bind(']', () => {
            if (this.editor.selected.length === 1) {
                // @ts-ignore
                this.editor.zIndexMoveUp(this.editor.selected[0])
            }
            return false
        })
        mousetrap.bind('mod+[', () => {
            if (this.editor.selected.length === 1) {
                // @ts-ignore
                this.editor.zIndexMoveToBottom(this.editor.selected[0])
            }
            return false
        })
        mousetrap.bind('mod+]', () => {
            if (this.editor.selected.length === 1) {
                // @ts-ignore
                this.editor.zIndexMoveToTop(this.editor.selected[0])
            }
            return false
        })

        mousetrap.bind('mod+g', () => {
            this.editor.group()
            return false
        })
        mousetrap.bind('mod+shift+g', () => {
            this.editor.ungroup()
            return false
        })

        mousetrap.bind('h', () => {
            // 这里依赖于gridLine插件，如果没有安装，也不影响使用；所以没有添加到依赖（dependencies）列表中
            const gridLineService = this.editor.getService<IGridLinePluginService>(GridLinePluginServiceName)
            if (!gridLineService) return false

            if (gridLineService.gridLinesIsShow()) {
                gridLineService.gridLinesHide()
            } else {
                gridLineService.gridLinesShow()
            }
            return false
        })
        mousetrap.bind('mod+h', () => {
            const gridLineService = this.editor.getService<IGridLinePluginService>(GridLinePluginServiceName)
            if (!gridLineService) return false

            if (gridLineService.isEnableGridLineDraggable) {
                gridLineService.disableGridLineDraggable()
            } else {
                gridLineService.enableGridLineDraggable()
            }
            return false
        })

        mousetrap.bind('mod+c', (e) => {
            if (!this.editor.selected) return false
            this.editor.copyingData = []
            this.editor.selected.forEach((ui) => {
                const cloneUI = ui.clone()
                this.editor.setNormalizeAttr(cloneUI)
                cloneUI.x = cloneUI.x || 0
                cloneUI.y = cloneUI.y || 0
                cloneUI.zIndex = 0
                cloneUI.name = cloneUI.name + '_copy'
                this.editor.copyingData.push(cloneUI)
            })
            this.editor.cancel()
            return false
        })
        mousetrap.bind('mod+x', (e) => {
            if (!this.editor.selected) return false
            this.editor.copyingData = []
            this.editor.selected.forEach((ui) => {
                const cloneUI = ui.clone()
                this.editor.setNormalizeAttr(cloneUI)
                cloneUI.x = cloneUI.x || 0
                cloneUI.y = cloneUI.y || 0
                cloneUI.zIndex = 0
                this.editor.copyingData.push(cloneUI)
            })
            this.editor.remove()
            this.editor.cancel()
            return false
        })
        mousetrap.bind('mod+v', (e) => {
            if (this.editor.copyingData.length === 0) return
            if (!this.editor.copyingData) return
            this.editor.copyingData.sort((a, b) => {
                // @ts-ignore
                return a.zIndex - b.zIndex
            })
            this.editor.addMany(this.editor.copyingData)
            this.editor.select(this.editor.copyingData)
            this.editor.copyingData = []
        })

        mousetrap.bind('w', () => {
            if (this.editor.selected.length <= 0) {
                return
            }
            this.editor.selected.forEach((ui) => {
                // @ts-ignore
                ui.y -= 1
            })
            this.editor.select(this.editor.selected)
            return false
        })
        mousetrap.bind('shift+w', () => {
            if (this.editor.selected.length <= 0) {
                return
            }
            this.editor.selected.forEach((ui) => {
                // @ts-ignore
                ui.y -= 10
            })
            this.editor.select(this.editor.selected)
            return false
        })
        mousetrap.bind('s', () => {
            if (this.editor.selected.length <= 0) {
                return
            }
            this.editor.selected.forEach((ui) => {
                // @ts-ignore
                ui.y += 1
            })
            this.editor.select(this.editor.selected)
            return false
        })
        mousetrap.bind('shift+s', () => {
            if (this.editor.selected.length <= 0) {
                return
            }
            this.editor.selected.forEach((ui) => {
                // @ts-ignore
                ui.y += 10
            })
            this.editor.select(this.editor.selected)
            return false
        })
        mousetrap.bind('a', () => {
            if (this.editor.selected.length <= 0) {
                return
            }
            this.editor.selected.forEach((ui) => {
                // @ts-ignore
                ui.x -= 1
            })
            this.editor.select(this.editor.selected)
            return false
        })
        mousetrap.bind('shift+a', () => {
            if (this.editor.selected.length <= 0) {
                return
            }
            this.editor.selected.forEach((ui) => {
                // @ts-ignore
                ui.x -= 10
            })
            this.editor.select(this.editor.selected)
            return false
        })
        mousetrap.bind('d', () => {
            if (this.editor.selected.length || 0 <= 0) {
                return
            }
            this.editor.selected.forEach((ui) => {
                // @ts-ignore
                ui.x += 1
            })
            this.editor.select(this.editor.selected)
            return false
        })
        mousetrap.bind('shift+d', () => {
            if (this.editor.selected.length <= 0) {
                return
            }
            this.editor.selected.forEach((ui) => {
                // @ts-ignore
                ui.x += 10
            })
            this.editor.select(this.editor.selected)
            return false
        })
        const _saveState = () => {
            this.editor.historySaveState()
            return false
        }
        mousetrap.bind('w', _saveState, 'keyup')
        mousetrap.bind('s', _saveState, 'keyup')
        mousetrap.bind('a', _saveState, 'keyup')
        mousetrap.bind('d', _saveState, 'keyup')
        mousetrap.bind('shift+w', _saveState, 'keyup')
        mousetrap.bind('shift+s', _saveState, 'keyup')
        mousetrap.bind('shift+a', _saveState, 'keyup')
        mousetrap.bind('shift+d', _saveState, 'keyup')
        mousetrap.bind('left', _saveState, 'keyup')
        mousetrap.bind('right', _saveState, 'keyup')
        mousetrap.bind('up', _saveState, 'keyup')
        mousetrap.bind('down', _saveState, 'keyup')
        mousetrap.bind('shift+left', _saveState, 'keyup')
        mousetrap.bind('shift+right', _saveState, 'keyup')
        mousetrap.bind('shift+up', _saveState, 'keyup')
        mousetrap.bind('shift+down', _saveState, 'keyup')

        // 水平翻转
        mousetrap.bind('shift+h', () => {
            let activeObject
            if (this.editor.selected.length === 0) {
                return false
            } else if (this.editor.selected.length === 1) {
                activeObject = this.editor.selected[0]
            } else {
                activeObject = this.editor.app.editor.element
            }
            if (!activeObject) return
            activeObject.flip("x")
            this.editor.historySaveState()
            return false
        })

        // 垂直翻转
        mousetrap.bind('shift+v', () => {
            let activeObject
            if (this.editor.selected.length === 0) {
                return false
            } else if (this.editor.selected.length === 1) {
                activeObject = this.editor.selected[0]
            } else {
                activeObject = this.editor.app.editor.element
            }
            if (!activeObject) return
            activeObject.flip("y")
            this.editor.historySaveState()
            return false
        })

        mousetrap.bind('m', (e) => {
            this.editor.setModePreview()
            return false
        })
        mousetrap.bind('v', (e) => {
            this.editor.setModeNormal()
            return false
        })
        mousetrap.bind('p', (e) => {
            this.editor.setModeDraw()
            return false
        })

        mousetrap.bind('l', (e) => {
            let isLocked = false
            this.editor.selected.forEach((ui) => {
                if (ui.locked) {
                    isLocked = true
                }
            })
            if (isLocked) {
                this.editor.selected.forEach((ui) => {
                    ui.locked = false
                })
            } else {
                this.editor.selected.forEach((ui) => {
                    ui.locked = true
                })
                this.editor.cancel()
            }
            this.editor.historySaveState()
            return false
        })
    }
}