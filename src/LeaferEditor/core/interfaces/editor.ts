import type { App, Frame, IExportFileType, IExportOptions, IFindCondition, IFindUIMethod, IGroup, IPathInputData, IUI, IZoomType, Image as LeaferImage } from "leafer-ui";

import type { EventTypes, MittBus } from "../events";
import type { Canvas } from "../canvas";
import type { IPluginHost } from "../pluginHost";

export interface LeaferEditorOptions {
    width?: number;
    height?: number;
    fill?: string;
    lockRatio?: boolean | "corner" | undefined

    // 是否禁用平移视图交互，默认为 false。
    disabledMove?: boolean;
    // 是否禁用 wheel 事件，默认为 false。
    disabledWheel?: boolean;
    // 是否开启鼠标滚动直接缩放视图， 默认为 false。
    zoomMode?: boolean | 'mouse'

    rulerEnabled?: boolean;
    rulerUnit?: string;
    // rulerDPI 单位 n像素 == 1英寸； 只会影响标尺显示，不会影响导出图片的分辨率
    rulerDPI?: number;

    gridStrokeColor?: string;
    gridStrokeDragColor?: string;

    changePageZoomFit?: boolean;
    historyMaxSize?: number;
    pageAddable?: boolean;
    // 是否在移动元素时隐藏编辑框，默认为 false
    hideOnMove?: boolean;

    // 在没有UploadImageCallback时，是否允许使用本地加载图片，默认为true
    //  没有UploadImageCallback时，图片会以 base64 格式保存到JSON中，并在导出时直接使用
    //  如果设置了UploadImageCallback，图片会先 base64 格式保存到JSON中 待到 回调完成后再修改为远程URL
    openImageEnableLocalLoader?: boolean;
    imageFileTypes?: string[];
    // 图片最大尺寸，单位字节，默认10MB
    maxImageSize?: number; // 10 * 1024 * 1024; // 10MB
    uploadImageCallback?: (file: File, sourceTag: string) => Promise<{
        url: string,
        width: number,
        height: number,
        name?: string,
    }>
}

export interface ILeaferEditor extends IPluginHost {
    // 属性
    readonly options: LeaferEditorOptions
    readonly currentScale: number;
    readonly currentRulerUnit: string;
    readonly eventBus: MittBus;
    readonly Events: typeof EventTypes;
    readonly app: App;
    readonly currentChildren: IUI[];
    readonly contentFrame: Frame;
    readonly skyFrame: Frame;
    readonly groundFrame: Frame;
    readonly currentPage: Canvas;
    readonly selected: IUI[];
    readonly mode: string;
    readonly currentPageID: string;

    // 缩放与视图控制
    zoom(type: IZoomType): void;
    resize(width: number, height: number): void;

    // 选择与操作
    select(target: IUI | IUI[]): void;
    cancel(): void;

    // 序列化与反序列化
    toJSON(): object;
    reLoadFromJSON(json: object): void;
    appendPagesFromJSON(json: object): void;

    // 画布操作
    canvasResize(width: number, height: number): void;
    changeRulerUnit(unit: string): void;

    // 图片处理
    openImage(
        enableLocalLoader?: boolean
    ): Promise<LeaferImage>;

    // 元素操作
    add(_child: IUI, _index?: number): void;
    addMany(children: IUI[]): void;
    remove(_child?: string | number | IUI | IFindCondition | IFindUIMethod | undefined, _destroy?: boolean): void;
    removeEmptyGroup(): void;

    // 分组操作
    group(): boolean;
    ungroup(): void;

    // 模式控制
    setModePreview(): void;
    setModeNormal(): void;
    setDrawPenStyle(style?: IPathInputData): void;
    setModeDraw(): void;
    setNormalizeAttr(child: IUI): void;

    // 页面管理
    pageSetCurrent(id: string): void;
    pages(): Array<Canvas>;
    pageAdd(id?: string, isSetCurrentPage?: boolean): string;
    pageRemove(id: string): void;
    pageNext(): void;
    pagePrev(): void;

    // 历史记录
    historyUndo(): void;
    historyRedo(): void;
    historyClear(): void;
    historyDisable(): void;
    historyEnable(): void;
    historyIsEnabled(): boolean;
    historySaveState(): void;
    historyGetCurrentState(): any;
    historyCanUndo(): boolean;
    historyCanRedo(): boolean;
    historyInfo(): any;

    // 层级管理
    zIndexMoveUp(ui: IUI): boolean;
    zIndexMoveDown(ui: IUI): boolean;
    zIndexMoveToTop(ui: IUI): boolean;
    zIndexMoveToBottom(ui: IUI): boolean;
    zIndexMoveIntoGroup(element: IUI, targetGroup: IGroup, index?: number): boolean;
    zIndeMoveOutOfGroup(element: IUI, index?: number): boolean;
    zIndexMoveBefore(element: IUI, targetElement: IUI): boolean;
    zIndexMoveAfter(element: IUI, targetElement: IUI): boolean;

    // 导出功能
    export(_filename: string, _options?: number | boolean | IExportOptions | undefined): void;
    exportSync(_filename: IExportFileType | string, _options?: IExportOptions | number | boolean): any;
    thumbnail(size?: number): any;
    thumbnailSync(size?: number): any;
    get thumbnailDataURL(): any;
}
