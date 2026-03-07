type DebounceOptions = {
    leading?: boolean;
};

type DebouncedFunction<T extends (...args: any[]) => any> = {
    (...args: Parameters<T>): ReturnType<T> | undefined;
    cancel: () => void;
    flush: () => ReturnType<T> | undefined;
};

/**
 * 创建防抖函数
 * @param func 需要防抖的函数
 * @param wait 防抖间隔时间（毫秒）
 * @param options 配置选项
 * @returns 防抖函数及其控制方法
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    options: DebounceOptions = {},
): DebouncedFunction<T> {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let lastArgs: Parameters<T> | undefined;
    let lastThis: any;
    let result: ReturnType<T> | undefined;
    let lastCallTime: number | undefined;

    const { leading = false } = options;

    // 定时器回调函数
    const later = () => {
        const now = Date.now();
        const last = lastCallTime || now;
        const remaining = wait - (now - last);

        // 如果剩余时间大于0，继续等待
        if (remaining > 0 && remaining <= wait) {
            timeoutId = setTimeout(later, remaining);
        } else {
            // 执行函数
            timeoutId = undefined;
            if (lastArgs) {
                result = func.apply(lastThis, lastArgs);
                if (!timeoutId) {
                    lastArgs = lastThis = undefined;
                }
            }
        }
    };

    // 防抖函数主体
    const debounced = function (this: any, ...args: Parameters<T>) {
        const now = Date.now();

        // 如果是第一次调用且设置了leading为true，立即执行
        const isInvoking = leading && !timeoutId;

        lastCallTime = now;
        lastArgs = args;
        lastThis = this;

        // 清除现有定时器
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        // 设置新的定时器
        timeoutId = setTimeout(later, wait);

        // 如果设置了leading且是首次调用，立即执行
        if (isInvoking) {
            result = func.apply(this, args);
        }

        return result;
    } as DebouncedFunction<T>;

    // 取消方法
    debounced.cancel = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = undefined;
        }
        lastArgs = undefined;
        lastThis = undefined;
        lastCallTime = undefined;
    };

    // 立即执行并取消后续调用
    debounced.flush = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = undefined;
        }

        if (lastArgs) {
            result = func.apply(lastThis, lastArgs);
            lastArgs = undefined;
            lastThis = undefined;
            return result;
        }

        return undefined;
    };

    return debounced;
}
