import { computed } from "vue";
import zhCN from "@arco-design/web-vue/es/locale/lang/zh-cn";
import enUS from "@arco-design/web-vue/es/locale/lang/en-us";
import esES from "@arco-design/web-vue/es/locale/lang/es-es";
import jaJP from "@arco-design/web-vue/es/locale/lang/ja-jp";
import idID from "@arco-design/web-vue/es/locale/lang/id-id";
import frFR from "@arco-design/web-vue/es/locale/lang/fr-fr";
import ptPT from "@arco-design/web-vue/es/locale/lang/pt-pt";
import deDE from "@arco-design/web-vue/es/locale/lang/de-de";
import koKR from "@arco-design/web-vue/es/locale/lang/ko-kr";
import itIT from "@arco-design/web-vue/es/locale/lang/it-it";
import thTH from "@arco-design/web-vue/es/locale/lang/th-th";
import viVN from "@arco-design/web-vue/es/locale/lang/vi-vn";

import {zh_CN, en_US, es_ES, ja_JP, id_ID, fr_FR, pt_PT, de_DE, ko_KR, it_IT, th_TH, vi_VN, localeType} from "./consts"

const locales: Record<string, any> = {};
locales[zh_CN] = zhCN;
locales[en_US] = enUS;
locales[es_ES] = esES;
locales[ja_JP] = jaJP;
locales[id_ID] = idID;
locales[fr_FR] = frFR;
locales[pt_PT] = ptPT;
locales[de_DE] = deDE;
locales[ko_KR] = koKR;
locales[it_IT] = itIT;
locales[th_TH] = thTH;
locales[vi_VN] = viVN;


export const arcolocale = computed(() => {
    return locales[localeType.value] || zhCN;
});

export const arcolocaleOptions = computed(() => {
    return Object.keys(locales);
});