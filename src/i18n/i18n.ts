import { createI18n } from "vue-i18n";
import { computed } from "vue";

import { arcolocaleOptions } from "./arcoI18n";
import { zh_CN, en_US, ja_JP } from "./consts";

import zh from "../locales/zh-CN.json"
import en from "../locales/en-US.json"
// 定义语言包
const messages = {
    [en_US]: en,
    [zh_CN]: zh,
};

// const messages = {}

export const langOptions = computed(()=>{
    const msgKeys = Object.keys(messages);
    // 取 arcolocaleOptions 和 msgKeys 共同的部分
    const options = arcolocaleOptions.value.filter(item => msgKeys.includes(item));
    return options;
})

const i18n = createI18n({
    legacy: false, // 使用 composition API 模式
    locale: zh_CN, // 默认语言
    fallbackLocale: zh_CN, // 回退语言
    globalInjection: true, // 全局注入 $t 方法
    messages,
});

// 注册语言包
export default i18n
