<template>
    <div class="upload-image" :style="{ width: size + 'px' }">
        <!-- 上传按钮区域：无预览时点击触发选择；有预览后点击无效（仅操作按钮生效） -->
        <div class="upload-button" :class="{
            'has-preview': previewUrl,
            loading: loading,
        }" :style="buttonStyle" @click="handleButtonClick">
            <!-- 隐藏的 file input -->
            <input ref="fileInput" type="file" :accept="accept" :disabled="loading" @change="handleFileChange"
                tabindex="-1" />
            <!-- 无预览时显示加号 -->
            <span v-if="!previewUrl" class="plus-icon">+</span>
            <!-- 上传中遮罩和加载动画 -->
            <div v-if="loading" class="loading-overlay">
                <div class="spinner"></div>
            </div>
            <!-- 预览状态下的操作栏：垂直水平居中 + 鼠标悬浮显示 -->
            <div v-if="previewUrl && !loading" class="action-bar" @click.stop>
                <button class="action-btn reupload-btn"
                    :style="{ width: (size / 3) + 'px', height: (size / 3) + 'px', fontSize: (size / 4.5) + 'px' }"
                    :title="t('components.upload.reupload')" @click.stop="handleReupload">
                    ↻
                </button>
                <button class="action-btn delete-btn"
                    :style="{ width: (size / 3) + 'px', height: (size / 3) + 'px', fontSize: (size / 4.5) + 'px' }"
                    :title="t('components.upload.delete')" @click.stop="handleDelete">
                    ×
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount, watch } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

interface UploadResult {
    url: string
    width: number
    height: number
    name?: string
}

const props = withDefaults(
    defineProps<{
        uploadImageCallback?: (file: File) => Promise<UploadResult>
        size?: number
        accept?: string
        maxImageSize?: number
        previewUrl?: string
    }>(),
    {
        size: 120,
        accept: 'image/*',
        maxImageSize: 5 * 1024 * 1024,
    }
)

const emit = defineEmits<{
    (e: 'uploadSuccess', result: UploadResult): void
    (e: 'uploadError', error: Error): void
    (e: 'delete'): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref<string | null>(props.previewUrl || null)
const loading = ref(false)
const currentTaskId = ref(0)

watch(() => props.previewUrl, () => {
    previewUrl.value = props.previewUrl || null
})

const buttonStyle = computed(() => {
    const style: Record<string, string> = {
        width: props.size + 'px',
        height: props.size + 'px',
    }
    if (previewUrl.value) {
        style.backgroundImage = `url(${previewUrl.value})`
        style.backgroundSize = 'contain'
        style.backgroundRepeat = 'no-repeat'
    }
    return style
})

/**
 * 按钮点击处理：无预览时触发文件选择；有预览后不再响应点击
 */
function handleButtonClick() {
    // 有预览且未处于上传中 → 阻止任何点击行为
    if (previewUrl.value && !loading.value) {
        return
    }
    triggerFileSelect()
}

/**
 * 触发文件选择（仅内部调用）
 */
function triggerFileSelect() {
    if (loading.value) {
        return
    }
    fileInput.value?.click()
}

/**
 * 重新上传：直接打开文件选择器，不受预览状态影响
 */
function handleReupload() {
    if (loading.value) {
        return
    }
    // 直接调用 input 点击，绕过 triggerFileSelect 的预览判断
    fileInput.value?.click()
}

/**
 * 删除图片
 */
function handleDelete() {
    revokePreview()
    previewUrl.value = null
    clearInput()
    emit('delete')
}

function revokePreview() {
    if (previewUrl.value?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl.value)
    }
}

function clearInput() {
    if (fileInput.value) {
        fileInput.value.value = ''
    }
}

async function handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
        clearInput()
        return
    }
    if (file.size > props.maxImageSize) {
        clearInput()
        const error = new Error(
            t('components.upload.error.sizeExceed', { size: props.maxImageSize / 1024 / 1024 })
        )
        emit('uploadError', error)
        revokePreview()
        previewUrl.value = null
        clearInput()
        return
    }

    if (loading.value) {
        clearInput()
        return
    }

    revokePreview()

    const objectUrl = URL.createObjectURL(file)
    previewUrl.value = objectUrl

    loading.value = true
    const taskId = ++currentTaskId.value

    try {
        if (props.uploadImageCallback) {
            const result = await props.uploadImageCallback(file)
            if (taskId === currentTaskId.value) {
                emit('uploadSuccess', result)
            }
        }
    } catch (err) {
        if (taskId === currentTaskId.value) {
            const error = err instanceof Error ? err : new Error(t('components.upload.error.uploadFailed'))
            emit('uploadError', error)
            revokePreview()
            previewUrl.value = null
            clearInput()
        }
    } finally {
        if (taskId === currentTaskId.value) {
            loading.value = false
        }
        clearInput()
    }
}

function clearPreview() {
    revokePreview()
    previewUrl.value = null
    clearInput()
}

defineExpose({ clearPreview })

onBeforeUnmount(() => {
    revokePreview()
})
</script>

<style scoped>
.upload-image {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    font-family: system-ui, -apple-system, sans-serif;
}

.upload-button {
    background-color: #f7f7f7;
    border: 1px dashed #d9d9d9;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    cursor: pointer;
    overflow: hidden;
    background-size: cover;
    background-position: center;
    transition:
        border-color 0.2s,
        background-color 0.2s;
}

.upload-button:hover {
    border-color: #409eff;
    background-color: #f0f0f0;
}

.upload-button.has-preview {
    border-style: solid;
    border-color: #e0e0e0;
}

.upload-button.loading {
    cursor: wait;
    opacity: 0.8;
}

.upload-button input {
    display: none;
}

.plus-icon {
    font-size: 48px;
    font-weight: 300;
    color: #999;
    line-height: 1;
    user-select: none;
}

.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(2px);
}

.spinner {
    width: 30px;
    height: 30px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* ---------- 操作栏：垂直水平居中 ---------- */
.action-bar {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    gap: 16px;
    opacity: 0;
    transition: opacity 0.2s;
    pointer-events: none;
    /* 让父级点击穿透，按钮自身可点 */
}

.upload-button:hover .action-bar {
    opacity: 1;
    pointer-events: auto;
}

.action-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition:
        background-color 0.2s,
        transform 0.1s;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    padding: 0;
    line-height: 1;
}

.action-btn:hover {
    transform: scale(1.15);
}

.action-btn:active {
    transform: scale(0.95);
}

.reupload-btn {
    background: rgba(64, 158, 255, 0.9);
}

.reupload-btn:hover {
    background: rgb(64, 158, 255);
}

.delete-btn {
    background: rgba(245, 108, 108, 0.9);
}

.delete-btn:hover {
    background: rgb(245, 108, 108);
}
</style>