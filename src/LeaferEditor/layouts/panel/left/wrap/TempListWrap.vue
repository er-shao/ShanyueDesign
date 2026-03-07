<template>
    <div class="wrap">
        <search-header :cateList="cateList" v-model="keyword" @changeCate="changeCate" @search="onSearch" />
        <div class="temp-wrap">
            <comp-list-wrap @fetchData="fetchData" :data="page.dataList" :config="config" :noMore="page.noMore"
                max-height="calc(100vh - 115px)">
                <template #item="{ item }">
                    <a-card hoverable @click="handleClick(item)" class="cursor-pointer drop-shadow"
                        :body-style="{ padding: '0px' }">
                        <div class="">
                            <div class="tags">
                                <div class="tag">VIP</div>
                            </div>
                            <LazyImg :url="item.pages[item.currentCanvas].metaData.cover" class="img" />
                        </div>
                        <!-- <div class="p5px">
                            <span class="name truncated">{{ item.name }}</span>
                        </div> -->
                    </a-card>
                </template>
            </comp-list-wrap>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { LazyImg } from '../../../components/vue-waterfall-plugin-next'
import searchHeader from "../../../components/searchHeader.vue";

import CompListWrap from "./CompListWrap.vue";
import usePageMixin from "./mixins/pageMixin";
import { queryTemplateList } from "../../../api/materials";
import { reactive, ref } from 'vue';
import { useLeaferEditor } from '../../../../index';

const editor = useLeaferEditor()

const config = {
    imgSelector: 'cover',
}


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
    queryTemplateList(page).then(res => {
        if (res.code === 200) {
            const newDataList = res.data
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
const handleClick = (item: any) => {
    console.log('item=', item);
    // const { cover, title, json } = item
    // const { width, height, children } = json
    // editor.historyClear()
    // editor.historyDisable()
    // editor.clear()
    // editor.canvasResize(width, height)
    // children.forEach((child: any) => {
    //     editor.currentPage.add(child)
    // })
    // editor.currentPage.metaData.cover = cover
    // editor.currentPage.metaData.title = title
    // editor.historyEnable()
    // editor.historySaveState()
    // editor.zoom('fit')

    console.log(editor.reLoadFromJSON(item));

}
</script>

<style lang="less" scoped>
.search__wrap {
    padding: 1.4rem 1rem 0.8rem 0rem;
}

.temp-wrap .tags {
    .tag {
        background-color: rgba(0, 0, 0, .6);
        //background-color:  rgb(var(--primary-6));
        border-radius: 8px;
        top: 6px;
        box-shadow: 0 1px 4px 0 rgba(0, 0, 0, .16);
        color: #fff;
        font-size: 12px;
        height: 16px;
        line-height: 16px;
        padding: 0 6px;
        position: absolute;
        left: 6px;
        z-index: 11;
    }
}
</style>
