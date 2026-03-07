<template>
    <a-space class="save-oper">
        <a-button href="#" target="_blank" type="text" class="!underline underline-offset-5 p-l-5px p-r-5px">
            <!-- <ali-icon type="icon-gitee" class="mr4px text-size-18px" /> -->
            Gitee
        </a-button>
        <a-button href="#" target="_blank" type="text" class="!underline underline-offset-5 p-l-5px p-r-5px">
            <!-- <ali-icon type="icon-github" class="mr3px text-size-18px" /> -->
            GitHub
        </a-button>

        <help>
            <icon-question-circle class="icon" />
            <!-- <span class="title">帮助</span> -->
        </help>

        <a-divider direction="vertical" />

        <a-button @click="preview()">
            <template #icon>
                <icon-eye />
            </template>
            {{ t('header.saveOper.preview') }}
        </a-button>
        <a-button type="primary" @click="saveJSON()">
            <template #icon>
                <icon-save />
            </template>
            {{ t('header.saveOper.save') }}
        </a-button>
        <a-dropdown-button class="m-r-0!" type="primary" @select="handleSelect" @click="handleDownload()">
            <icon-download class="m-r-8px" />{{ t('header.saveOper.download') }}
            <template #icon>
                <icon-down />
            </template>
            <template #content>
                <a-doption value="png">{{ t('header.saveOper.saveAsPng') }}</a-doption>
                <a-doption value="json">{{ t('header.saveOper.contentSaveAsJSON') }}</a-doption>
                <a-doption value="currentCanvas">{{ t('header.saveOper.currentPageSaveAsJSON') }}</a-doption>
            </template>
        </a-dropdown-button>
    </a-space>
    <a-image-preview :src="previewUrl" v-model:visible="visiblePreview" />
    <a-modal v-model:visible="exportVisible" :title="t('header.saveOper.downloadOption')" @ok="handleExport()"
        width="600px" :top="50" :align-center="false">
        <a-form ref="formRef" :model="exportForm" :rules="rules">
            <a-form-item field="fileType" :label="t('header.saveOper.exportType')">
                <a-radio-group v-model="exportForm.fileType" type="button" :options="exportFileTypes"></a-radio-group>
            </a-form-item>
            <a-form-item field="quality" :label="t('header.saveOper.quality')"
                v-if="['jpg', 'webp'].includes(exportForm.fileType)">
                <a-space>
                    <a-radio-group v-model="exportForm.quality" type="button" :options="scQtaRate"></a-radio-group>
                    <a-input-number v-model="exportForm.quality" mode="button" style="width: 120px" :max="1" :step="0.1"
                        :min="0.1" placeholder="1"></a-input-number>
                </a-space>
            </a-form-item>
            <a-form-item field="scale" :label="t('header.saveOper.scale')" :extra="t('header.saveOper.scaleExtra')">
                <a-space>
                    <a-radio-group v-model="exportForm.scale" type="button" :options="scQtaRate"></a-radio-group>
                    <a-input-number v-model="exportForm.scale" mode="button" style="width: 120px" :max="1" :step="0.1"
                        :min="0.1" placeholder="1"></a-input-number>
                </a-space>
            </a-form-item>
            <a-form-item field="pixelRatio" :label="t('header.saveOper.pixelRatio')"
                :extra="t('header.saveOper.pixelRatioExtra')">
                <a-input-number v-model="exportForm.pixelRatio" allow-clear hide-button style="width: 200px"
                    :placeholder="t('header.saveOper.pixelRatioPlaceholder')">
                    <template #suffix>
                        {{ t('header.saveOper.pixelRatioUnit') }}
                    </template>
                </a-input-number>
            </a-form-item>
            <a-form-item field="trim" :label="t('header.saveOper.trim')">
                <a-switch type="round" v-model="exportForm.trim">
                    <template #checked>
                        {{ t('header.saveOper.yes') }}
                    </template>
                    <template #unchecked>
                        {{ t('header.saveOper.no') }}
                    </template>
                </a-switch>
            </a-form-item>
            <a-form-item field="exportType" :label="t('header.saveOper.export')">
                <a-radio-group v-model="exportForm.exportType" type="button" :options="exportTypes"></a-radio-group>
            </a-form-item>
        </a-form>
    </a-modal>
</template>

<script setup lang="ts">
import { Notification } from "@arco-design/web-vue";
import { computed, reactive, ref } from "vue";
import JsZip from "jszip";

import { useLeaferEditor } from '../../../index';
import { downFile } from "../../../utils/file";
import { generateID } from "../../../core/utils";
import help from "./help.vue";
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const editor = useLeaferEditor();

const visiblePreview = ref(false)
const previewUrl = ref()
const exportTypes = computed(() => [
    { value: 'currentPage', label:t('header.saveOper.currentPage') },
    { value: 'ALL', label: t('header.saveOper.all') },
])
const exportFileTypes = reactive([
    { value: 'jpg', label: 'JPG' },
    { value: 'png', label: 'PNG' },
    { value: 'webp', label: 'WEBP' },
])
const scQtaRate = computed(() => [
    { value: 1, label: t('header.saveOper.normal') },
    { value: 0.7, label: '0.7' + t('header.saveOper.pixelRatioUnit') },
    { value: 0.5, label: '0.5' + t('header.saveOper.pixelRatioUnit') },
    { value: 0.3, label: '0.3' + t('header.saveOper.pixelRatioUnit') },
    { value: 0.1, label: '0.1' + t('header.saveOper.pixelRatioUnit') },
])
const exportVisible = ref(false)
const exportForm = ref({
    fileType: 'jpg',
    quality: 1,
    scale: 1,
    pixelRatio: 1,
    trim: false,
    exportType: 'currentPage',
});
const rules = {

}
const resetForm = () => {
    exportForm.value = {
        fileType: 'jpg',
        quality: 1,
        scale: 1,
        pixelRatio: 1,
        trim: false,
        exportType: 'currentPage',
    }
}
const preview = async () => {
    const result = await editor.contentFrame.export('png', { blob: true })
    const url = URL.createObjectURL(result.data);
    previewUrl.value = url
    visiblePreview.value = true
}
const saveJSON = () => {
    Notification.info({
        closable: true,
        content: t('header.saveOper.saveAsJSON')
    })
    let json = editor.toJSON()
    const blob = new Blob([JSON.stringify(json)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const fileName = `${generateID()}-${editor.pages().length}P-${Date.now()}.json`;
    downFile(url, fileName)
}
const exportJSON = () => {
    const currentPage = editor.currentPage.toJSON()
    const json = editor.toJSON()
    // @ts-ignore
    json.pages = [currentPage]
    // @ts-ignore
    json.currentCanvas = currentPage.name

    const blob = new Blob([JSON.stringify(json)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${editor.currentPage.metaData.title || editor.currentPageID || generateID()}-${Date.now()}.json`;
    a.click();
}

const handleDownload = () => {
    resetForm()
    exportVisible.value = true
}

const handleExport = () => {
    const exportType = exportForm.value.exportType
    if (exportType === 'currentPage') {
        editor.export(`${generateID()}.${exportForm.value.fileType}`, exportForm.value)
    } else if (exportType === 'ALL') {
        const pages = editor.pages()
        const zip = new JsZip();
        pages.forEach((page, index) => {
            page.export(exportForm.value.fileType, { blob: true, ...exportForm.value }).then((res) => {
                const fn = `${index + 1}-page-${Date.now()}.${exportForm.value.fileType}`
                zip.file(fn, res.data)
                if (index === pages.length - 1) {
                    zip.generateAsync({ type: "blob" }).then((content) => {
                        const url = URL.createObjectURL(content);
                        const fileName = `${generateID()}-${editor.pages().length}P-${Date.now()}.zip`;
                        downFile(url, fileName)
                    })
                }
            })
        })
    }
}

const handleSelect = (v: string) => {
    let fileName = generateID()
    switch (v) {
        case 'png':
            editor.contentFrame.export(fileName + '.png')
            break
        case 'jpg':
            editor.contentFrame.export(fileName + '.jpg')
            break
        case 'webp':
            editor.contentFrame.export(fileName + '.webp')
            break
        case 'json':
            saveJSON()
            break
        case 'currentCanvas':
            exportJSON()
            break
        default:
            editor.contentFrame.export(fileName + '.jpg')
            break
    }
};
</script>

<style scoped lang="less"></style>
