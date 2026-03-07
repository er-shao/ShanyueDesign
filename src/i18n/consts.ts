import { ref } from "vue";

export const zh_CN = "zh-CN";
export const en_US = "en-US";
export const es_ES = "es-ES";
export const ja_JP = "ja-JP";
export const id_ID = "id-ID";
export const fr_FR = "fr-FR";
export const pt_PT = "pt-PT";
export const de_DE = "de-DE";
export const ko_KR = "ko-KR";
export const it_IT = "it-IT";
export const th_TH = "th-TH";
export const vi_VN = "vi-VN";
export const ru_RU = "ru-RU";

const languageLabels: Record<string, string> = {
    [zh_CN]: "中文",
    [en_US]: "English",
    [es_ES]: "Español",
    [ja_JP]: "日本語",
    [id_ID]: "Bahasa Indonesia",
    [fr_FR]: "Français",
    [pt_PT]: "Português",
    [de_DE]: "Deutsch",
    [ko_KR]: "한국어",
    [it_IT]: "Italiano",
    [th_TH]: "ภาษาไทย",
    [vi_VN]: "Tiếng Việt",
    [ru_RU]: "Русский",
};
export const getLanguageLabel = (language: string) => {
    return languageLabels[language] || language;
};
export const localeType = ref(zh_CN);
