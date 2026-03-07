import { isDefined } from '@vueuse/core'
import { computed, ref, shallowRef, watchEffect } from "vue"
import { isArray, isNumber } from "lodash"

import "./proxyData"
import { useLeaferEditor } from "../index"
import { Tag } from "../core/interfaces";
import type { IUI } from "leafer-ui"

import { toFixed } from "../utils/math"

const editor = useLeaferEditor()
export const activeObject = shallowRef<IUI | null>()

const lockRatio = (selected: IUI[]) => {
    if (editor.options.lockRatio === true || selected.length === 0) {
        return false
    }
    for (let i = 0; i < selected.length; i++) {
        const item = selected[i]!
        if (item.tag === Tag.QrCode || item.lockRatio === true) {
            editor.app.editor.config.lockRatio = true
            return true
        } else if (item.tag === Tag.Group && item.children!.length > 0) {
            if (lockRatio(item.children!)) {
                return true
            }
        }
    }
    editor.app.editor.config.lockRatio = editor.options.lockRatio
    return false
}

editor.eventBus.on(editor.Events.selected, (selected: IUI[]) => {
    // console.log(activeObject.value?.name,activeObject.value?.clearProxyData());
    lockRatio(selected)
    if (selected.length === 1) {
        activeObject.value = selected[0]
    } else {
        activeObject.value = null
        // activeObject.value = editor.app.editor.element
    }
})
editor.eventBus.on(editor.Events.cancelSelected, () => {
    activeObject.value = editor.contentFrame
})
editor.eventBus.on(editor.Events.pageChangeAfter, () => {
    activeObject.value = editor.contentFrame
})

export const selectedProxyData = (key: string, defaultValue?: any, onChangeAndSave: boolean = false) => {
    const modelValue = ref()

    watchEffect(() => {
        if (!isDefined(activeObject.value)) {
            modelValue.value = undefined
            return
        }
        let value
        let orgValue = activeObject.value.proxyData![key]
        if ((!isDefined(orgValue) || orgValue === 0) && defaultValue) {
            value = defaultValue
        } else {
            value = orgValue
        }

        modelValue.value = isNumber(value) ? toFixed(value) : value
    })

    const setObjectValue = (obj: any, newValue: any) => {
        if (!obj) return
        if (obj[key] !== newValue) {
            modelValue.value = isNumber(newValue) ? toFixed(newValue) : newValue
            if (isArray(newValue)) {
                // @ts-ignore
                obj[key] = [].concat(newValue)
            } else {
                obj[key] = newValue
            }
        }
        // console.log("setObjectValue", obj[key], onChangeAndSave);
        if (onChangeAndSave) {
            editor.historySaveState()
        }
    }

    return computed(() => ({
        modelValue: modelValue.value,
        defaultValue: defaultValue,
        onChange: (newValue: any) => setObjectValue(activeObject.value!, newValue),
        onEnd: () => editor.historySaveState(),
    }))
}