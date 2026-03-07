// 服务接口
export interface IService<S = any> {
    readonly name: string;
    readonly description?: string;
    readonly plugin: IPlugin; // 注册服务的插件
    readonly service: S; // 服务对象
}

export enum PluginEvent {
    // 插件安装事件
    install = "install",
    // 插件卸载事件
    uninstall = "uninstall",
    // 服务注册事件
    serviceRegistered = "serviceRegistered",
    // 服务注销事件
    serviceUnregistered = "serviceUnregistered"
}

export interface PluginEventPayload<T = any> {
    plugin: IPlugin<T>;
    service?: IService; // service 事件时提供
    options?: any; // 安装选项
    error?: Error; // 错误信息
}

export interface IPlugin<T = any> {
    // 插件唯一标识
    readonly name: string;
    // 插件描述信息
    readonly description?: string;
    // 插件版本
    readonly version?: string;
    // 插件作者
    readonly author?: string;

    // 插件依赖的插件
    readonly dependentPlugins?: string[];
    // 插件依赖 插件声明自己需要的服务，插件安装时会检查依赖
    readonly dependentServices?: string[];

    // // 插件提供的服务 插件声明自己提供的服务
    // readonly providedServices?: string[];

    // 插件安装方法，必须实现
    install: (host: IPluginHost<T>, options?: any) => void;
    // 插件卸载方法，可选
    uninstall?: (host: IPluginHost<T>) => void;
}

export enum PluginState {
    pending = 'pending',      // 等待安装
    installing = 'installing',
    installed = 'installed',
    uninstalling = 'uninstalling',
    uninstalled = 'uninstalled',
    error = 'error'
}

export interface IPluginInfo<T = any> {
    plugin: IPlugin<T>;
    state?: PluginState; // 插件状态
    options?: any;
    error?: Error; // 安装/卸载错误信息
}

export interface IPluginHost<T = any> {
    getInstance: () => T;
    use: (plugin: IPlugin<T>, options?: any) => void;
    unuse: (pluginName: string, autoCleanupServices?: boolean) => void;
    registerService: (service: IService) => void;
    unregisterService: (name: string) => void;
    getPluginInfo: (name: string) => IPluginInfo<T> | undefined;
    getPluginInfos: () => IPluginInfo<T>[];
    getService: <S>(name: string) => S | undefined;
    getServices: () => IService[];
    hasPlugin: (name: string) => boolean;
    hasService: (name: string) => boolean;
    hook: (event: PluginEvent, listener: (payload: PluginEventPayload<T>) => void) => void;
    unhook: (event: PluginEvent, listener: (payload: PluginEventPayload<T>) => void) => void
}