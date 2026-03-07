import { Ellipse, Polygon, PropertyEvent, Rect, Star, Text, type IUIInputData } from "leafer-ui"

type Options = Partial<IUIInputData>

// 矩形
export const rect = (options?: Options) => {
    return Rect.one({
        ...{
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            fill: "red",
            editable: true,
        },
        ...options
    })
}

// 圆角矩形
export const roundedRect = (options?: Options) => {
    return new Rect({
        ...{
            width: 100,
            height: 100,
            fill: '#66CCFF',
            editable: true,
            cornerRadius: 20
        },
        ...options
    })
}

// 多边形
// 三角形
export const triangle = (options?: Options) => {
    return new Polygon({
        ...{
            width: 100,
            height: 100,
            editable: true,
            sides: 3,
            fill: '#66CCFF'
        },
        ...options
    })
}

// 五边形
export const pentagon = (options?: Options) => {
    return new Polygon({
        ...{
            width: 100,
            height: 100,
            sides: 5,
            editable: true,
            fill: '#66CCFF'
        },
        ...options
    })
}

// 圆角六边形
export const roundedPentagon = (options?: Options) => {
    return new Polygon({
        ...{
            width: 100,
            height: 100,
            sides: 6,
            fill: '#66CCFF',
            editable: true,
            cornerRadius: 20
        },
        ...options
    })
}

// Star 元素

// 三棱锥星
export const threeStar = (options?: Options) => {
    return new Star({
        ...{
            width: 100,
            height: 100,
            corners: 3,
            innerRadius: 0.15,
            editable: true,
            fill: '#66CCFF'
        },
        ...options
    })
}

// 五角星
export const pentagram = (options?: Options) => {
    return new Star({
        ...{
            width: 100,
            height: 100,
            corners: 5,
            innerRadius: 0.15,
            editable: true,
            fill: '#66CCFF'
        },
        ...options
    })
}

// 圆角星形
export const roundedStar = (options?: Options) => {
    return new Star({
        ...{
            width: 100,
            height: 100,
            innerRadius: 0.5,
            corners: 8,
            cornerRadius: 5,
            editable: true,
            fill: '#66CCFF'
        },
        ...options
    })
}

// 圆形
export const ellipse = (options?: Options) => {
    return new Ellipse({
        ...{
            width: 100,
            height: 100,
            editable: true,
            fill: "#66CCFF"
        },
        ...options
    })
}

// 圆环
export const ring = (options?: Options) => {
    return new Ellipse({
        ...{
            width: 100,
            height: 100,
            innerRadius: 0.5,
            editable: true,
            fill: "#66CCFF"
        },
        ...options
    })
}

// 扇形
export const sector = (options?: Options) => {
    return new Ellipse({
        ...{
            width: 100,
            height: 100,
            startAngle: -60,
            endAngle: 180,
            editable: true,
            // origin: 'center',
            fill: "#66CCFF"
        },
        ...options
    })
}

// 椭圆
export const ellipse2 = (options?: Options) => {
    return new Ellipse({
        ...{
            width: 50,
            height: 100,
            editable: true,
            fill: "#66CCFF"
        },
        ...options
    })
}


// 文字
export const text = (options?: Options) => {
    const t = new Text({
        fill: '#66CCFF',
        text: '山月设计-双击编辑',
        x: 0,
        y: 0,
        resizeFontSize: true,
        fontSize: 24,
        editable: true,
        ...options
    })
    t.name = t.text as string
    // t.on(PropertyEvent.CHANGE, (e:PropertyEvent) => {
    //     if (e.attrName === 'textEditing' && e.oldValue === true) {
    //         t.name = (t.text as string).replace(/\n/g, ' ')
    //     }
    // })
    return t
}