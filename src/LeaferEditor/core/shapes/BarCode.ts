import { boundsType, dataProcessor, Platform, Rect, registerUI, UIData } from "leafer-ui";
import type { IUIData, IUIInputData } from "@leafer-ui/interface";
import JsBarcode from 'jsbarcode'
// import {Message} from "@arco-design/web-vue";

// 定义数据

// 输入数据接口
interface ICustomInputData extends IUIInputData {
    text: string
    codeHeight: number
    codeUnitWidth?: number
    format?: string
    textPosition?: string
    textMargin?: number
    fontSize?: number
    background?: string
    lineColor?: string
    margin?: number
}

// 元素数据接口
interface ICustomData extends IUIData {

}

class CustomData extends UIData implements ICustomData {
    // 元素数据，负责元素的数据处理
    _format?: string
    _text?: string
    _codeHeight?: number
    _codeUnitWidth?: number
    _textAlign?: string
    _textPosition?: string
    _textMargin?: string
    _fontSize?: number
    _background?: string
    _lineColor?: string
    _margin?: number
}

/**
 * 一维码
 * https://github.com/lindell/JsBarcode#options
 */
@registerUI()
class BarCode extends Rect {
    public get __tag() {
        return 'BarCode'
    }

    // 使用自定义数据类，防止污染通用 UI 数据
    @dataProcessor(CustomData)
    declare public __: ICustomData

    @boundsType('CODE128')
    declare public format: string

    @boundsType('123456789')
    declare public text: string

    @boundsType('center')
    declare public textAlign: string

    @boundsType('bottom')
    declare public textPosition: string

    @boundsType(2)
    declare public textMargin: number

    @boundsType(20)
    declare public fontSize: number

    @boundsType('#ffffff')
    declare public background: string

    @boundsType('#000000')
    declare public lineColor: string

    @boundsType(10)
    declare public margin: number

    /**
     * 条码竖向间隔
     */
    @boundsType(2)
    declare public codeUnitWidth: number

    /**
     * 条码高度
     */
    @boundsType(100)
    declare public codeHeight: number

    @boundsType("")
    declare public error: string

    private _url: string = '';
    private _oldText = '';
    private _oldOptions = '';
    private get _options() {
        return JSON.stringify({
            format: this.format,
            text: this.text,
            codeHeight: this.codeHeight,
            codeUnitWidth: this.codeUnitWidth,
            textAlign: this.textAlign,
            textPosition: this.textPosition,
            textMargin: this.textMargin,
            fontSize: this.fontSize,
            background: this.background,
            lineColor: this.lineColor,
            margin: this.margin,
            error: this.error,
        } as any)
    }

    constructor(data: ICustomInputData) {
        data.lockRatio = true
        super(data)
        this._oldText = data.text
        this._oldOptions = this._options
        this.renderQr(true)
    }

    public __onUpdateSize() {
        if (this.text !== this._oldText || this._options !== this._oldOptions) {
            this.renderQr()
            this._oldText = this.text
            this._oldOptions = this._options
        }
        super.__onUpdateSize()
    }

    renderQr(syncChangeSize: boolean = false) {

        const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

        // var format = "CODE39";
        // var barcodeUnitWidth = this.calculateBarcodeWidth(this.text,this.width!, format);
        // console.log("每个码的间隔：" + barcodeUnitWidth);
        // console.log("条形码宽度：" + this.width!, "条形码高度：" + this.height!);
        // console.log("条形码格式：" + this.format, "条形码内容：" + this.text);
        // console.log(JSON.stringify(this._options));

        this.error = ''
        // this.width = undefined
        this.height = undefined // 将 高度设置为 undefined，将会自动根据内容调整高度
        try {
            JsBarcode(svgNode, this.text, {
                // xmlDocument: document,
                format: this.format,
                width: this.codeUnitWidth,
                textAlign: this.textAlign,
                textPosition: this.textPosition,
                fontSize: this.fontSize,
                textMargin: this.textMargin,
                lineColor: this.lineColor,
                background: this.background,
                margin: this.margin,
                height: this.codeHeight,
                // displayValue: true,
            });
        } catch (e: any) {
            if (typeof e === 'string') {
                this.error = e
            } else {
                const strErr = e.toString()
                this.error = strErr
            }
            // throw e
        }
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgNode);
        const svg = Platform.toURL(svgString, "svg")
        // const blob = new Blob([svgString], {type: "image/svg+xml"});
        // const url = URL.createObjectURL(blob);

        this.url = svg
    }

    get url(): string {
        return this._url;
    }

    set url(value: string) {
        this.fill = { type: 'image', url: value, opacity: 1, format: 'svg', mode: 'fit' }
        this._url = value;
    }

    // 定义函数来计算每个码的间隔
    public calculateBarcodeWidth(text: string, width: number, format: string) {
        // 设置静态参数
        var codeLength = text.length;
        var quietZone = 10;

        // 计算条形码宽度
        var barcodeWidth = (width - quietZone * 2);

        // 计算每个码的间隔
        var barcodeUnitWidth = barcodeWidth / codeLength;
        return barcodeUnitWidth;
    }
}

export default BarCode
