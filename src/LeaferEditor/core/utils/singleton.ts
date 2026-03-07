/**
 * 单例模式
 * @param className 类名
 */
export default function singleton<T extends new (...args: any[]) => any>(className: T): T {
    let instance: InstanceType<T> | null = null;

    const proxy = new Proxy(className, {
        construct(target: T, args: any[]): InstanceType<T> {
            if (!instance) {
                instance = Reflect.construct(target, args);
            }
            return instance as InstanceType<T>;
        }
    }) as T;

    // 保持原型链
    proxy.prototype.constructor = proxy;

    return proxy;
}