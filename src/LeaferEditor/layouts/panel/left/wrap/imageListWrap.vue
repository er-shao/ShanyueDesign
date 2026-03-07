<template>
    <div class="wrap">
        <!-- <a-upload :custom-request="customRequest" /> -->
        <search-header :cateList="cateList" v-model="keyword" @changeCate="changeCate" @search="onSearch" />
        <div class="other-text-wrap">
            <comp-list-wrap @fetchData="fetchData" :data="page.dataList" :noMore="page.noMore"
                max-height="calc(100vh - 115px)">
                <template #item="{ item, url, index }">
                    <a-card hoverable @click="handleClick(item)" class="cursor-pointer drop-shadow"
                        :body-style="{ padding: '0px' }">
                        <div class="">
                            <LazyImg :url="url" class="img" />
                        </div>
                        <!-- <div class="p5px">
                            <span class="name truncated">{{ item.original }}</span>
                        </div> -->
                    </a-card>
                </template>
            </comp-list-wrap>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { LazyImg } from '../../../components/vue-waterfall-plugin-next'

import { Image } from "leafer-ui";

import CompListWrap from "./CompListWrap.vue";
import usePageMixin from "./mixins/pageMixin";
import { queryImageMaterialList } from "../../../api/materials";

import SearchHeader from "../../../components/searchHeader.vue";
import { reactive, ref } from 'vue';
import { useLeaferEditor } from '../../../../index';
import { uploadFile } from '../../../api/upload';

const editor = useLeaferEditor()
const keyword = ref();
const cateList = reactive([
    { label: '全部', value: '-1' },
    { label: '风景图片', value: '1111' },
    { label: '插画图片', value: '1111' },
]);
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
    queryImageMaterialList(page).then(res => {
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
    const image = new Image({
        editable: true,
        x: 0,
        y: 0,
        ...item,
    })
    console.log('image=', image.toString());

    image.load()
    editor.setNormalizeAttr(image)
    editor.cancel()
    editor.add(image)
    editor.select(image)
}
const customRequest = (option: any) => {
    // const { onProgress, onError, onSuccess, fileItem, name } = option
    // const xhr = new XMLHttpRequest();
    // if (xhr.upload) {
    //     xhr.upload.onprogress = function (event) {
    //         let percent;
    //         if (event.total > 0) {
    //             // 0 ~ 1
    //             percent = event.loaded / event.total;
    //         }
    //         onProgress(percent, event);
    //     };
    // }
    // xhr.onerror = function error(e) {
    //     onError(e);
    // };
    // xhr.onload = function onload() {
    //     if (xhr.status < 200 || xhr.status >= 300) {
    //         return onError(xhr.responseText);
    //     }
    //     onSuccess(xhr.response);
    // };
    // const formData = new FormData();
    // formData.append(name || 'file', fileItem.file);
    // xhr.open('post', '//upload-z2.qbox.me/', true);
    // xhr.send(formData);

    // return {
    //     abort() {
    //         xhr.abort()
    //     }
    // }
    // const file:File = option.fileItem.file
    // console.log(file);
    // editor.options.uploadImageCallback!(file, "OpenImage")
    // uploadFile(file).then(res => {
    //     console.log('uploadFile res=', res);

    // })
};
</script>

<style lang="less" scoped>
.search__wrap {
    padding: 1.4rem 1rem 0.8rem 0rem;
}
</style>
