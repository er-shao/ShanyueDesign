/**
 * 判断是否为普通对象（纯对象，不是数组、Date、RegExp 等）
 */
function isPlainObject(value: any): value is object {
    return (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        (Object.getPrototypeOf(value) === Object.prototype ||
        Object.getPrototypeOf(value) === null)
    );
}

/**
 * 默认的空值判断函数
 * 规则：null、undefined、空字符串、空数组、无自有属性的普通对象 视为空值；
 * 布尔值 false 不被视为空值。
 */
function defaultIsEmptyValue(value: any): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === "string") return value === "";
    if (Array.isArray(value)) return value.length === 0;
    if (isPlainObject(value)) return Object.keys(value).length === 0;
    return false; // 其他类型（Date、RegExp、number、boolean 等）均不视为空值
}

/**
 * 递归清理对象中的空值属性，支持自定义空值判断
 * @param obj 输入的对象（可以是任何类型，但通常为对象）
 * @param isEmptyValue 可选的自定义判断函数，接收 (key, value, parent, defaultIsEmpty)，
 *                     返回 true 表示该属性应被删除。
 *                     - key: 当前属性的键名（数组索引为 number，对象属性为 string）
 *                     - value: 递归清理后的属性值
 *                     - parent: 原始父对象（数组或对象）
 *                     - defaultIsEmpty: 默认空值判断函数，可用于组合判断
 * @returns 清理后的新对象（不修改原对象）
 */
export function cleanEmptyValues<T>(
    obj: T,
    isEmptyValue?: (
        key: string | number | symbol,
        value: any,
        parent: any,
        defaultIsEmpty: typeof defaultIsEmptyValue,
    ) => boolean,
    ): T {
    const shouldRemove = isEmptyValue ?? ((_key, value, _parent, defaultFn) => defaultFn(value));

    // 内部递归清理函数
    function clean(
        value: any,
        key?: string | number | symbol,
        parent?: any,
    ): any {
        // 处理 null/undefined（根节点直接返回，不调用 shouldRemove）
        if (value === null || value === undefined) return value;

        // 处理数组：递归清理每个元素，然后过滤掉满足 shouldRemove 的元素
        if (Array.isArray(value)) {
            const cleanedArray = value
            .map((item, index) => clean(item, index, value))
            .filter((item, index) => !shouldRemove(index, item, value, defaultIsEmptyValue));
            return cleanedArray;
        }

        // 处理普通对象：递归清理每个属性，删除满足 shouldRemove 的属性
        if (isPlainObject(value)) {
        const cleanedObject: any = {};
        for (const prop in value) {
            if (Object.prototype.hasOwnProperty.call(value, prop)) {
                // @ts-ignore 
                const propValue = value[prop];
                const cleanedPropValue = clean(propValue, prop, value);
            if (!shouldRemove(prop, cleanedPropValue, value, defaultIsEmptyValue)) {
                cleanedObject[prop] = cleanedPropValue;
            }
            }
        }
        return cleanedObject;
        }

        // 其他类型（原始值、Date、RegExp 等）直接返回
        return value;
    }

    return clean(obj);
}
