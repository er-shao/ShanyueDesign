<template>
    <div class="wrap">
        <search-header :cateList="cateList" v-model="keyword" @changeCate="changeCate" @search="onSearch" />
        <div class="other-text-wrap">
            <comp-list-wrap @fetchData="fetchData" :data="page.dataList" :noMore="page.noMore"
                max-height="calc(100vh - 115px)">
                <template #item="{ item, url, index }">
                    <a-card hoverable @click="handleClick(item)" class="cursor-pointer drop-shadow"
                        :style="{ margin: '3px' }" :body-style="{ padding: '0px', margin: '0px' }">
                        <div class="">
                            <LazyImg :url="url" class="img" :title="item.title!" />
                        </div>
                        <div class="p5px text-center text-gray-500 text-title">
                            <span class="name truncated">{{ item.title }}</span>
                        </div>
                    </a-card>
                </template>
            </comp-list-wrap>
        </div>
        <a-modal v-model:visible="saveAsMaterialVisible" :title="t('panelRight.material.saveAs.modalTitle')" @ok="handleSave()"
            width="550px" :align-center="true">
            <a-form :model="saveAsMaterialForm">
                <a-form-item field="title" :label="t('panelRight.material.saveAs.form.title')"
                    :extra="t('panelRight.material.saveAs.form.titleExtra')">
                    <a-input v-model="saveAsMaterialForm.title" hide-button allow-clear style="width: 240px"></a-input>
                </a-form-item>
                <a-form-item field="isRecordPosition" :label="t('panelRight.material.saveAs.form.recordPosition')">
                    <a-switch type="round" v-model="saveAsMaterialForm.isRecordPosition">
                        <template #checked>
                            {{ t('panelRight.material.saveAs.form.switchYes') }}
                        </template>
                        <template #unchecked>
                            {{ t('panelRight.material.saveAs.form.switchNo') }}
                        </template>
                    </a-switch>
                </a-form-item>
                <a-form-item field="category" :label="t('panelRight.material.saveAs.form.category')">
                    <a-select v-model="saveAsMaterialForm.category" :options="categoryOptions"
                        style="width: 240px"></a-select>
                </a-form-item>
                <a-form-item field="cover" :label="t('panelRight.material.saveAs.form.cover')">
                    <Upload :upload-image-callback="handleUpload" :size="80" :previewUrl="previewUrl" :accept="accept"
                        :maxImageSize="maxImageSize" />
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script lang="ts" setup>
import { LazyImg } from '../../../components/vue-waterfall-plugin-next'

import { Group, Image, type IUI, type IUIJSONData } from "leafer-ui";

import CompListWrap from "./CompListWrap.vue";
import usePageMixin from "./mixins/pageMixin";
import { queryMaterialList } from "../../../api/materials";

import SearchHeader from "../../../components/searchHeader.vue";
import Upload from "../../../components/upload.vue";
import { reactive, ref } from 'vue';
import { useLeaferEditor, useLeaferEditorContextMenuPluginService } from '../../../../index';
import { onBeforeUnmount } from "vue";
import { useI18n } from "vue-i18n";
import { base64toFile } from '../../../../utils';
import { uploadMaterial } from '../../../api/upload';
const { t } = useI18n();

const editor = useLeaferEditor()
const contextMenuService = useLeaferEditorContextMenuPluginService();
const keyword = ref();
const cateList = reactive([
    { label: '全部', value: '-1' },
    { label: '风景图片', value: '1111' },
    { label: '插画图片', value: '1111' },
]);
const saveAsMaterial = "saveAsMaterial";
if (contextMenuService) {
    contextMenuService.registerContextMenu(() => ({
        key: saveAsMaterial,
        title: t("panelRight.material.saveAs.saveAsMaterial"),
        type: "ONE",
        disableCallback: () => editor.selected[0]!.tag !== "Group",
        callback: () => {
            const selected = editor.selected[0];
            if (selected) {
                defaultSaveAsMaterialForm()
                saveAsMaterialForm.title = selected.name || ""
                saveAsMaterialVisible.value = true

                const ui = selected.clone()
                editor.currentPage.recursiveNormalizeZIndexes(ui.children || [])
                const data = ui.toJSON()
                data.zIndex = 0

                // 删除ID
                const _removeId = (obj: any) => {
                    if (obj.id) {
                        delete obj.id
                    }
                    if (obj.children) {
                        obj.children.forEach((child: any) => {
                            _removeId(child)
                        })
                    }
                }
                _removeId(data)
                // @ts-ignore
                saveAsMaterialForm.data = data

                previewUrl.value = ui.syncExport('png', { quality: 0.8 }).data
            }
        }
    }))
}
onBeforeUnmount(() => {
    if (contextMenuService) {
        contextMenuService.unRegisterContextMenu(saveAsMaterial)
    }
})

const changeCate = (e: {
    label: string;
    value: string;
}) => {
    console.log('e=', e)
}
const onSearch = (value: string, ev: PointerEvent) => {
    console.log('value=', value)
    console.log('keyword=', keyword.value)
    console.log('ev=', ev)
}
const { page } = usePageMixin()
page.pageSize = 20
const fetchData = () => {
    queryMaterialList(page).then(res => {
        if (res.code === 200) {
            const newDataList: any[] = res.data
            if (newDataList.length > 0) {
                page.dataList!.push(...newDataList)
                page.pageNum += 1
            }
            if (page.dataList!.length >= res.data.total) {
                page.noMore = true
            } else {
                page.noMore = false
            }
        }
    })
}
const handleClick = (item: Image) => {
    console.log('item=', item);
    const group = new Group()
    // @ts-ignore
    group.set(item.json)
    editor.setNormalizeAttr(group)
    editor.add(group)
    editor.select(group)
}

const saveAsMaterialVisible = ref(false)
const saveAsMaterialForm = reactive({
    title: "",
    category: "default",
    isRecordPosition: false,
    data: null as unknown as IUIJSONData,
    cover: "",
})
const defaultSaveAsMaterialForm = () => {
    saveAsMaterialForm.title = ""
    saveAsMaterialForm.category = "default"
    saveAsMaterialForm.isRecordPosition = false
    saveAsMaterialForm.data = null as unknown as IUIJSONData
    saveAsMaterialForm.cover = ""
}
const categoryOptions = [
    { label: '默认', value: 'default' },
    { label: '风景图片', value: '11111' },
    { label: '插画图片', value: '1111' },
]
const thumbnailSync = (ui: IUI) => {
    const max = ui.width! > ui.height! ? 'width' : 'height'
    const size = 200
    return ui.syncExport("png", { size: { [max]: size } })
}
const handleSave = async () => {
    const data = saveAsMaterialForm.data
    if (!saveAsMaterialForm.isRecordPosition) {
        delete data.x
        delete data.y
    }
    if (!saveAsMaterialForm.cover) {
        const group = new Group()
        // @ts-ignore
        group.set(data)
        const res = await handleUpload(base64toFile(thumbnailSync(group).data, `${data.name}_cover.png`)!)
        saveAsMaterialForm.cover = res.url
        // saveAsMaterialForm.cover =  thumbnailSync(group).data
    }
    if (saveAsMaterialForm.title === "") {
        saveAsMaterialForm.title = data.name || ""
    } else {
        data.name = saveAsMaterialForm.title
    }
    const res = {
        title: saveAsMaterialForm.title, // 标题
        category: saveAsMaterialForm.category, // 分类
        json: data, // 内容
        url: saveAsMaterialForm.cover, // 封面 cover
    }

    // 上传素材
    console.log(res);
    uploadMaterial(res).then(resp => {
        console.log(resp);
        // 添加到 page.dataList
        page.dataList!.unshift(res)
        // 关闭弹窗
        defaultSaveAsMaterialForm()
        saveAsMaterialVisible.value = false
    })
}

const accept = ref(editor.options.imageFileTypes?.join(',') || 'image/*')
const maxImageSize = ref(editor.options.maxImageSize || 10 * 1024 * 1024)
const previewUrl = ref('')
interface UploadResult {
    url: string
    width: number
    height: number
    name?: string
}
const handleUpload = async (file: File): Promise<UploadResult> => {
    const res = await editor.options.uploadImageCallback!(file, "Material")
    saveAsMaterialForm.cover = res.url
    return res
}
</script>

<style lang="less" scoped>
.search__wrap {
    padding: 1.4rem 1rem 0.8rem 0rem;
}

.text-title {
    // background-color: #f5f5f5;
    border-top: 1px solid #e8e8e8;
    user-select: none;
}
</style>
