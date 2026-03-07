export const defaultValueKey = 'fillPicker__defaultValue'

export type solidType = {
    type: 'solid'
    color: string
}

export type linearGradientType = {
    type: 'linear',
    stops: { offset: number, color: string }[],
    from: { x: number, y: number, type: 'percent' },
    to: { x: number, y: number, type: 'percent' },
}

export type radialGradientType = {
    type: 'radial',
    stops: { offset: number, color: string }[],
    from: { x: number, y: number, type: 'percent' },
    to: { x: number, y: number, type: 'percent' },
}
export type imageType = {
    type: 'image',
    mode: string,
    url: string,
    opacity: number,
}

export type fillTypes = 'solid' | 'linear' | 'radial' | 'image'

export type fillType = solidType | linearGradientType | radialGradientType | imageType