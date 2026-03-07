import { v7 as uuidv7 } from "uuid";
export const generateID = () => {
    return uuidv7() + Math.random().toString(12).substring(2, 9);
};

export function isLocalStorageSupported() {
    if (typeof localStorage === 'undefined') {
        return false;
    }
    try {
        const testKey = '__test____test____test__';
        localStorage.setItem(testKey, '1');
        localStorage.removeItem(testKey);
        return true;
    } catch (e) {
        return false;
    }
}

export function djb2Hash(str: string) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 33) ^ str.charCodeAt(i);
        hash >>>= 0; // 转为无符号32位整数
    }
    return hash.toString(); // 转为字符串，适合localStorage键
}