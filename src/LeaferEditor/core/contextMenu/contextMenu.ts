import { Rect, PointerEvent, Group, ZoomEvent, Line, Pen, ResizeEvent, MoveEvent, RotateEvent } from 'leafer-ui'
import type { IEventListenerId, Leafer } from "leafer-ui";

import "./style.css"

import { LazyString } from '../utils/lazyString';


type MenuType = 'ALL' | 'ONE' | 'SOME' | 'ZERO'

/**
 * 菜单项配置
 */
export interface MenuOptions {
    // 菜单项key
    key: string | LazyString
    // 菜单项名称
    title: string | LazyString

    // 类型，作用是区分当前选择项在什么情况下出现
    // (ALL：所有情况下出现，ONE：单选情况下出现，SOME：多选情况下出现，ZREO：没有选中情况下出现)
    type: MenuType | MenuType[]

    // 菜单项描述
    desc?: string | LazyString

    // 子菜单
    children?: Array<MenuOptions>

    // 回调函数; 如果返回boolean，则表示 执行回调函数后 是否隐藏菜单 默认隐藏
    callback?: (e: {
        pointerEvent: PointerEvent,
        mouseEvent: MouseEvent,
        type: MenuType,
        key: string,
    }) => void | boolean

    // 回调函数; 在什么情况下显示菜单
    showCallback?: () => boolean

    // 回调函数; 在什么情况下禁用菜单 (返回true则禁用)
    disableCallback?: () => boolean
}

export interface ContextMenuOptions {
    // 菜单项配置
    menuList: Array<MenuOptions | MenuFuncOptions>

    // 菜单宽度
    // menuWidth?: number

    // 设置 MenuType 的回调函数; 会影响菜单项的显示与隐藏
    setMenuType?: () => MenuType
}
export type MenuFuncOptions = () => MenuOptions


export class ContextMenu {
    /**
   * leafer实例
   */
    private readonly app: Leafer

    private readonly options: ContextMenuOptions

    /**
     * 菜单容器
     */
    private contextMenu: HTMLElement | null = null
    private contextMenuContainer = document.createElement('div')

    private isInitialized = false
    private bindEvents: Array<IEventListenerId> = []

    constructor(app: Leafer, options: ContextMenuOptions) {
        this.app = app
        this.options = options
        this.init()
    }

    private init() {
        if (this.isInitialized) {
            console.warn('ContextMenu has been initialized')
            return
        }
        this.initEvent()
        this.isInitialized = true
    }

    private initEvent() {
        const menuEventId = this.app.on_(
            PointerEvent.MENU,
            this.leaferMenuEvent,
            this
        )

        const clickEventId = this.app.on_(
            [
                PointerEvent.CLICK,
                PointerEvent.DOUBLE_CLICK,
                ResizeEvent.RESIZE,
                MoveEvent.MOVE,
                ZoomEvent.ZOOM,
                RotateEvent.ROTATE,
            ],
            this.hideMenuEvent,
            this
        )

        this.bindEvents.push(menuEventId, clickEventId)
    }

    private _currentMenuListStat = {
        maxDepth: 1,
        maxLength: 1
    }
    private _leaferMenuEvent: PointerEvent | null = null
    private leaferMenuEvent(e: PointerEvent) {
        this._leaferMenuEvent = e
        this.contextMenu?.remove()
        this.contextMenuContainer?.remove()

        let menuList = this.getMenuList(this.options.menuList)
        if (menuList.length === 0) {
            return
        }
        this._currentMenuListStat = this.calculateTreeStats(menuList)
        this.contextMenu = this.createMenu(menuList)
        this.contextMenuContainer = document.createElement('div')
        this.contextMenuContainer.classList.add('context-menu-container')
        this.contextMenuContainer.appendChild(this.contextMenu)
        document.body.appendChild(this.contextMenuContainer)

        let menuW = this.contextMenu.offsetWidth
        let menuH = this.contextMenu.offsetHeight

        const { width = 0, height = 0 } = e.current
        let x = e.origin.x
        let y = e.origin.y

        let inner = e.getInnerPoint()
        // 如果鼠标靠近画布右侧，菜单就出现在鼠标左侧
        if (width - inner.x <= menuW) {
            x -= menuW
        }
        // 如果鼠标靠近画布底部，菜单就出现在鼠标上方
        if (height - inner.y <= menuH) {
            y -= menuH
        }
        this.showMenu(x, y)
        this.contextMenu.addEventListener('click', this.menuClick.bind(this))
        this.contextMenu.addEventListener('contextmenu', (e) => {
            e.preventDefault()
        });
    }

    private menuClick(e: MouseEvent) {
        // 获取被点击的元素
        let target = e.target as HTMLElement
        let clickKey = ''
        let menuList = this.getMenuList(this.options.menuList)

        // 向上遍历直到找到带有'key'属性的元素或到达菜单容器
        while (target && target !== this.contextMenu) {
            if (target.getAttribute('key')) {
                // 找到带有'key'属性的元素
                clickKey = target.getAttribute('key') || ''
                // 找到后退出循环
                break
            }
            // 向上移动到父元素
            target = target.parentElement as HTMLElement
        }

        if (!clickKey) {
            return
        }
        function _find(menuList: Array<MenuOptions>, clickKey: string): MenuOptions | null {
            for (let i = 0; i < menuList.length; i++) {
                const item = menuList[i] as MenuOptions
                if (item.key === clickKey) {
                    return item
                }
                if (item.children && item.children.length) {
                    const result = _find(item.children, clickKey)
                    if (result) {
                        return result
                    }
                }
            }
            return null
        }
        const menuInfo = _find(menuList, clickKey)

        // 有回调函数，且没有禁用，则执行回调函数
        if (menuInfo?.callback && !(menuInfo.disableCallback && menuInfo.disableCallback())) {
            const result = menuInfo.callback({
                pointerEvent: this._leaferMenuEvent as PointerEvent,
                mouseEvent: e,
                type: this.getMenuType(),
                key: clickKey,
            })
            if (result === false) {
                return
            }
        }
        this.hideMenu()
    }

    private hideMenuEvent(e: PointerEvent) {
        this.hideMenu()
    }

    private getMenuType(): MenuType {
        const { setMenuType } = this.options
        if (setMenuType) {
            return setMenuType()
        } else {
            let type = 'ALL'
            if (this.app.editor.single) {
                type = 'ONE'
            } else if (this.app.editor.multiple) {
                type = 'SOME'
            } else {
                type = 'ZERO'
            }
            return type as MenuType
        }
    }
    public getMenuList(list: (MenuOptions|MenuFuncOptions)[]): Array<MenuOptions> {
        const type = this.getMenuType()
        const menuList = list.filter((item) => {
            if (typeof item === 'function') {
                item = item()
            }
            if (item.showCallback && !item.showCallback()) {
                return false
            }
            if (item.type === 'ALL') {
                return true
            }
            if (Array.isArray(item.type)) {
                return item.type.includes(type)
            }
            return item.type === type
        })

        // 遍历 menuList，如果有子菜单，则递归筛选
        const result: MenuOptions[] = []
        menuList.forEach((item) => {
            if (typeof item === 'function') {
                item = item()
            }
            if (item.children && item.children.length) {
                const children = this.getMenuList(item.children)
                if (children.length) {
                    result.push({ ...item, children })
                }
            } else {
                result.push(item)
            }
        })
        return result
    }

    /**
   * 创建菜单
   */
    private createMenu(menuList: MenuOptions[]) {
        const menu = document.createElement('ul')
        menu.classList.add('context-menu')
        menuList.forEach((item, index) => {
            const li = document.createElement('li')
            const h4 = document.createElement('p')
            h4.innerText = item.title.toString()
            h4.title = item.title.toString()
            li.appendChild(h4)
            h4.classList.add('context-menu-title')

            if (item?.desc) {
                const p = document.createElement('p')
                p.innerText = item?.desc.toString()
                p.title = item?.desc.toString()
                p.classList.add('context-menu-desc')
                li.appendChild(p)
            }
            if (item.children && item.children.length) {
                const submenu = this.createMenu(item.children);
                submenu.className = 'submenu';
                submenu.style.position = 'absolute'
                submenu.style.top = `${index * (100 / menuList.length)}%`

                li.classList.add('has-children');
                li.appendChild(submenu)
                li.addEventListener('mouseover', (e) => {
                    submenu.classList.add('show');
                    // 展开子菜单，如果大于菜单宽度，则显示在右侧
                    // const origin = this._leaferMenuEvent?.origin
                    const inner = this._leaferMenuEvent?.getInnerPoint()
                    let menuW = this.contextMenu!.offsetWidth
                    let menuH = this.contextMenu!.offsetHeight
                    menuW = (menuW * this._currentMenuListStat.maxDepth) * .8
                    menuH = (30 * this._currentMenuListStat.maxLength)
                    const { width = 0, height = 0 } = this._leaferMenuEvent!.current
                    if (width - inner!.x <= menuW) {
                        submenu.style.left = `-70%`
                    }
                    // if (height - inner!.y <= menuH) {
                    // }
                });
                li.addEventListener('mouseout', (e) => {
                    submenu.classList.remove('show');
                });
            }

            li.classList.add('context-menu-item')
            if (item.disableCallback && item.disableCallback()) {
                li.classList.add('disabled')
            }
            li.setAttribute('key', item.key.toString())
            menu.appendChild(li)
        })
        return menu
    }

    /**
     * 显示菜单
     */
    public showMenu(x: number, y: number) {
        if (!this.contextMenu) {
            return
        }
        this.contextMenu.style.visibility = 'visible'
        this.contextMenu.style.position = 'absolute'
        this.contextMenu.style.left = `${x}px`
        this.contextMenu.style.top = `${y}px`

        this.contextMenuContainer.style.visibility = 'visible'
        this.contextMenuContainer.style.display = 'block'
    }
    public hideMenu() {
        if (this.contextMenu) {
            this.contextMenu.style.visibility = 'hidden'
        }
        this.contextMenuContainer?.remove()
    }
    public isShow() {
        return this.contextMenu?.style.visibility === 'visible'
    }

    public addMenu(menu: MenuOptions | Array<MenuOptions> | MenuFuncOptions) {
        this.options.menuList.push(...(Array.isArray(menu) ? menu : [menu]))
    }
    public removeMenu(key: string) {
        this.options.menuList = this.options.menuList.filter((item) => {
            if (typeof item === 'function') {
                item = item()
            }
            return item.key !== key
        })
    }
    public destroy() {
        this.bindEvents.forEach((id) => {
            this.app.off_(id)
        })
        this.contextMenu?.remove()
        this.isInitialized = false
    }

    /**
     * 计算树形结构的最深层数和最长数组长度
     * @param data 树形数组，第一层为数组元素
     * @returns TreeStats 包含最大深度和最长数组长度的对象
     */
    private calculateTreeStats(data: Array<MenuOptions>) {
        let maxDepth = 1; // 最大深度
        let maxLength = 1; // 最长数组长度

        /**
         * 递归遍历树节点
         * @param node 当前节点
         * @param currentDepth 当前节点的深度（从1开始）
         */
        const traverse = (node: MenuOptions, currentDepth: number) => {
            // 更新最大深度
            maxDepth = Math.max(maxDepth, currentDepth);

            // 如果有子节点，递归遍历
            if (node.children && Array.isArray(node.children)) {
                // 更新最长数组长度
                maxLength = Math.max(maxLength, node.children.length);

                // 遍历所有子节点
                node.children.forEach(child => {
                    traverse(child, currentDepth + 1);
                });
            }
        }

        // 从第一层开始遍历所有节点
        data.forEach(node => {
            traverse(node, 1); // 第一层深度为1
        });

        // 如果第一层数组长度比子节点数组长度更长，更新maxLength
        maxLength = Math.max(maxLength, data.length);
        return { maxDepth, maxLength };
    }

    public static example(app: Leafer) {
        const t = new LazyString('删除', (k) => {
            return `|${k}|`
        })
        return new ContextMenu(app, {
            menuList: [
                {
                    title: '新增',
                    key: 'add',
                    desc: "add item",
                    type: 'ALL',
                    callback: () => {
                        console.log("exaple add");
                    }
                },
                {
                    title: t,
                    key: 'del',
                    desc: "del",
                    type: 'ALL',
                    callback: () => {
                        console.log("exaple del");
                    }
                }
            ]
        })
    }
}