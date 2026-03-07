<template>
    <!-- 纯色选择器 -->
    <div class="upload-box" style="height: 100%;width: 260px;">
        <div class="p-20px">
            <Upload :upload-image-callback="handleUpload" :size="100" @upload-success="onSuccess"
                @upload-error="onError" @delete="onRemove" :previewUrl="previewUrl" :accept="accept"
                :maxImageSize="maxImageSize" />
        </div>
        <a-row>
            <a-col>
                <a-select v-model="fit" :options="options" style="width: 100%" @change="onChange">
                    <template #prefix>
                        {{ t('components.fillPicker.panel.imageSelector.fillMode') }}
                    </template>
                </a-select>
            </a-col>
        </a-row>
        <a-row>
            <a-col>
                <swipeNumber size="small" v-model="newOpacity" :min="0" :max="100" :step="1" style="padding: 0 12px"
                    label-width="68px">
                    <template #label>
                        <div style="text-align: right;padding-right: 12px">
                            <icon-mosaic style="margin-right: 2px" />
                            {{ t('components.fillPicker.panel.imageSelector.opacity') }}
                        </div>
                    </template>
                    <template #suffix>
                        <div>%</div>
                    </template>
                </swipeNumber>
            </a-col>
        </a-row>
    </div>
</template>

<script setup lang="ts">
import { computed, inject, reactive, ref, watch } from 'vue'
import { defaultValueKey, type imageType } from "../interface";
import swipeNumber from "../../swipeNumber.vue";
import Upload from "../../upload.vue";
import { readFileAsDataURL } from '../../../../core/utils/file';
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

interface UploadResult {
    url: string
    width: number
    height: number
    name?: string
}

const props = defineProps<{
    uploadImageCallback?: (file: File) => Promise<UploadResult>
    accept?: string
    maxImageSize?: number
    // modelValue?: imageType
}>()

const emit = defineEmits([
    'format-data',
    'update:modelValue',
    'upload-success',
    'upload-error',
    'delete',
])

const defaultValue = inject(defaultValueKey) as () => imageType

let defaultVal = defaultValue()
if (defaultVal.type !== 'image') {
    defaultVal = {
        type: 'image',
        mode: 'fit',
        url: '',
        opacity: 1,
    }
    emit('format-data', defaultVal)
}

const accept = ref(props.accept || 'image/*')
const maxImageSize = ref(props.maxImageSize || 10 * 1024 * 1024)
const previewUrl = ref(defaultVal.url)
const options = computed(() => [
    { value: 'cover', label: t('components.fillPicker.panel.imageSelector.options.cover') },
    { value: 'fit', label: t('components.fillPicker.panel.imageSelector.options.fit') },
    { value: 'stretch', label: t('components.fillPicker.panel.imageSelector.options.stretch') },
    { value: 'clip', label: t('components.fillPicker.panel.imageSelector.options.clip') },
    { value: 'repeat', label: t('components.fillPicker.panel.imageSelector.options.repeat') },
])
const fit = ref(defaultVal.mode)
const opacity = ref(defaultVal.opacity || 1)
const newOpacity = ref(opacity.value * 100)

watch(newOpacity, (val) => {
    opacity.value = val / 100
    onChange()
})
const handleUpload = async (file: File): Promise<UploadResult> => {
    if (props.uploadImageCallback) {
        const res = await props.uploadImageCallback(file)
        return res
    } else {
        const res = await readFileAsDataURL(file)
        return res
    }
}

const onChange = () => {
    const data = {
        type: 'image' as const,
        mode: fit.value,
        url: defaultVal.url,
        opacity: opacity.value,
    }
    defaultVal = data
    emit('format-data', data)
    emit('update:modelValue', data)
}
const onSuccess = (res: UploadResult) => {
    defaultVal.url = res.url
    onChange()
    emit('upload-success', res)
}

const onError = (err: Error) => {
    emit('upload-error', err)
}
const onRemove = () => {
    emit('delete')
}
</script>

<style scoped>
.upload-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
}

:deep(.arco-row) {
    width: 100%;
}
</style>