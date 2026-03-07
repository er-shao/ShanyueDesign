import { LazyString } from "../utils/lazyString"

import zh from './locales/zh-CN.json';
import en from './locales/en-US.json';

class I18n {
    private defaultLocale: string = 'zh-CN';
    private locale: string;
    private messages: any;

    constructor(messages: any, locale?: string) {
        this.locale = locale || 'zh-CN';
        this.messages = messages;
    }
    setLocale(locale: string) {
        this.locale = locale;
    }
    getLocale() {
        return this.locale;
    }
    translate(key: string) {
        const locale = this._getLocale(this.locale)
        if (!locale) {
            return key;
        }
        const message = locale[key];
        if (message) {
            return message;
        }
        return key;
    }
    private _getLocale(local: string) {
        const locale = this.messages[local];
        if (!locale) {
            return this.messages[this.defaultLocale]
        }
        return locale;
    }
}

const i18n = new I18n({
    'zh-CN': zh,
    'en-US': en,
});

export const t = (key: string) => {
    return new LazyString(key, () => i18n.translate(key));
}
export const setLocale = (locale: string) => {
    i18n.setLocale(locale);
}
export const getLocale = () => {
    return i18n.getLocale();
}