import { isNumber } from "lodash"
import NP from 'number-precision'

/**
 * Clamps the given 'angle' between '-180' and '180'
 * @param angle
 * @returns The clamped angle
 */
export const clampAngle = (angle: number): number => {
    const normalizedAngle = ((angle % 360) + 360) % 360
    const clampedAngle = normalizedAngle > 180 ? normalizedAngle - 360 : normalizedAngle
    return clampedAngle
}


export const toFixed = (num: number, precision: number = 2) => {
    if (!num) return 0;
    else if (!isNumber(num)) num = parseFloat(num as any);

    return NP.round(num, precision);
}