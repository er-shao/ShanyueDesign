import { computed, ref } from 'vue'
import { useLeaferEditor } from '../../../../index';

const editor = useLeaferEditor();

export const useActiveObjectModel = <T>(defaultValue: T, updateCallback?: (value: T) => void, onEndCallback?: () => void) => {
    const modelValue = ref<T>(defaultValue)
    const callback = (value: T) => {
        if (updateCallback) {
            updateCallback(value);
        }
    }
    const onChange = (value: T, isrunCallback: boolean = true) => {
        modelValue.value = value;
        if (isrunCallback && updateCallback) callback(value);
    }

    return computed(() => ({
        modelValue: modelValue.value as T,
        defaultValue: defaultValue,
        onChange: onChange,
        onEnd: onEndCallback || (() => {
            editor.historySaveState();
        })
    }))
}