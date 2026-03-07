// myMixin.js
import { reactive, computed } from 'vue';
interface PageConfig {
    url: string,
    pageSize: number,
    pageNum: number,
    params: object
}
export default function usePageMixin<T = any>() {
    // 定义需要共享的数据
    const page = reactive<{
        dataList?: T[],
        pageSize: number,
        pageNum: number,
        noMore?: boolean,
        query: object,
    }>({
        dataList: [],
        pageSize: 10,
        pageNum: 1,
        noMore: false,
        query: {},
    });

    // 返回包含需要共享的数据、计算属性和方法的对象
    return {
        page
    };
}
