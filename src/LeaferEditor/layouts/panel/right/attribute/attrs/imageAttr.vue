<script setup lang="ts">
import Panel from './panel.vue'
import strInput from '../../../../components/strInput.vue';
import { selectedProxyData } from '../../../../../proxyData';
import { useLeaferEditor } from '../../../../../index';
import { selectFiles } from "../../../../../utils/file";
import { readFileAsDataURL } from "../../../../../core/utils/file";
import { Message } from '@arco-design/web-vue';
import { ref } from 'vue';
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const editor = useLeaferEditor();
const url = selectedProxyData('url')
const loading = ref(false)

const upload = () => {
    let accepts = editor.options.imageFileTypes || []
    if (!accepts || accepts.length === 0) {
        accepts = ['.png', '.jpg', '.jpeg']
    }
    selectFiles({
        accept: accepts.join(','),
        multiple: false
    }).then(async files => {
        if (files && files.length > 0) {
            const file = files[0]!;
            if (editor.options.maxImageSize && file.size > editor.options.maxImageSize) {
                Message.error(t('panelRight.attribute.image.errorImageSize', { size: editor.options.maxImageSize / 1024 / 1024 }))
                return
            }
            let res: any = null;
            if (editor.options.uploadImageCallback) {
                loading.value = true
                res = await editor.options.uploadImageCallback(file, "OpenImage")
            } else {
                res = await readFileAsDataURL(file)
            }
            if (res) {
                url.value.onChange(res.url)
                url.value.onEnd()
            }
            loading.value = false
        }
    })
}
</script>

<template>
    <Panel :title="t('panelRight.attribute.image.title')" hidden-add>
        <a-spin :loading="loading" :tip="t('panelRight.attribute.image.uploadingTip')">
            <a-row :gutter="[8, 4]" align="center">
                <a-col :span="6">
                    <a-button @click="upload">{{ t('panelRight.attribute.image.uploadButton') }}</a-button>
                </a-col>
                <a-col :span="18">
                    <strInput v-bind="url" />
                </a-col>
            </a-row>
        </a-spin>
    </Panel>
</template>

<style lang="less" scoped>
.attr-panel {
    --color-secondary: #f2f3f5;
}
</style>