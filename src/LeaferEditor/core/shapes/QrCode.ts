import { boundsType, dataProcessor, Platform, PropertyEvent, Rect, registerUI, UIData } from "leafer-ui";
import type { IUIData, IUIInputData } from "@leafer-ui/interface";

import QRCode, { type QRCodeSegment, type QRCodeToDataURLOptions } from 'qrcode';


// 定义数据

// 输入数据接口
interface ICustomInputData extends IUIInputData {
    text: string
    size: number
    options?: QRCodeToDataURLOptions
    logo?: string
    logoSize?: number
    logoPadding?: number
}

// 元素数据接口
interface ICustomData extends IUIData {

}

/*
    https://github.com/soldair/node-qrcode#qr-code-options
 */

class CustomData extends UIData implements ICustomData {
    protected _text: string = ""
    protected _size: number = 0
    protected _options?: QRCodeToDataURLOptions
    protected _logo?: string
    protected _logoSize?: number
    protected _logoPadding?: number

    protected setSize(value: number) {
        this._size = value
        this.__leaf.width = value
        this.__leaf.height = value;
    }
}

/**
 * 二维码
 */
@registerUI()
class QrCode extends Rect {
    private _oldText: string | QRCodeSegment[] = "";
    private _oldOptions: string = "";
    private _url: string = "";

    // 使用自定义数据类，防止污染通用 UI 数据
    @dataProcessor(CustomData)
    declare public __: ICustomData

    // 元素数据，负责元素的数据处理
    @boundsType("qrcode text")
    declare public text: string | QRCodeSegment[]

    @boundsType(100)
    declare public size: number

    @boundsType({
        errorCorrectionLevel: "H",
        margin: 4,
        scale: 4,
        color: {
            dark: '#000000ff',
            light: '#ffffffff',
        },
    })
    declare public options?: QRCodeToDataURLOptions
    @boundsType()
    declare public logo?: string
    @boundsType()
    declare public logoSize?: number
    @boundsType()
    declare public logoPadding?: number


    public get __tag() {
        return 'QrCode'
    }

    constructor(data: ICustomInputData) {
        data.lockRatio = true
        super(data)
        this._oldText = data.text
        this._oldOptions = JSON.stringify(data.options)
        this.renderQr()
        // this.on_(PropertyEvent.CHANGE, (e:PropertyEvent) => {
        //     console.log(e.target.app.editor.config.lockRatio = true);
        // })
    }

    public __onUpdateSize() {
        const options = JSON.stringify(this.options)
        if (this.text !== this._oldText || options !== this._oldOptions) {
            this._oldText = this.text
            this._oldOptions = options
            this.renderQr()
        }
        super.__onUpdateSize()
    }

    renderQr() {
        try {
            // @ts-ignore
            QRCode.toString(this.text, { ...this.options, width: this.width }, (err, value) => {
                if (err) throw err
                const svg = Platform.toURL(value, "svg")
                this.url = svg
            })
        } catch (e: any) {
            if (e.message.indexOf('nvalid hex color') > -1) {
                // 非标准的hex颜色格式
            } else {
                console.error(e)
            }
        }
    }

    get url(): string {
        return this._url;
    }

    set url(value: string) {
        this.fill = { type: 'image', url: value, opacity: 1, format: 'svg' }
        this._url = value;
    }
}

export default QrCode
