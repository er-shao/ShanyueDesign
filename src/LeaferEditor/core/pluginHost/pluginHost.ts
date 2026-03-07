import { PluginEvent, PluginState } from "./interfaces";
import type {
    IPluginHost,
    IPlugin,
    IPluginInfo,
    IService,
    PluginEventPayload
} from "./interfaces";

export class PluginHost<T = any> implements IPluginHost<T> {
    private pluginInfos: Map<string, IPluginInfo<T>> = new Map();
    private services: Map<string, IService> = new Map();
    private eventListeners: Map<PluginEvent, Set<(payload: PluginEventPayload<T>) => void>> = new Map();

    getInstance(): T {
        throw new Error("Method not implemented.");
    }
    use(plugin: IPlugin<T>, options?: any): void {
        const pluginName = plugin.name;
        // 检查插件是否已安装
        if (this.pluginInfos.has(pluginName)) {
            const pluginInfo = this.pluginInfos.get(pluginName)!;
            if (pluginInfo.state === PluginState.installed) {
                console.warn(`Plugin ${pluginName} is already installed.`);
                return;
            }
            if (pluginInfo.state === PluginState.uninstalled) {
                console.warn(`Plugin ${pluginName} is in uninstalled state, but it is being used again.`);
            }
            if (pluginInfo.state === PluginState.error) {
                console.warn(`Plugin ${pluginName} is in error state, but it is being used again.`);
                // 如果之前安装失败，可以重新安装
                this.pluginInfos.delete(pluginName);
            }
        }

        // 检查依赖是否满足（如果有）
        if (!this.checkDependencies(plugin)) {
            return;
        }

        // 记录插件信息
        const pluginInfo: IPluginInfo<T> = {
            plugin,
            state: PluginState.pending,
            options,
            error: undefined
        };
        this.pluginInfos.set(pluginName, pluginInfo);
        pluginInfo.state = PluginState.installing;
        try {
            // 执行插件安装
            plugin.install(this, options);
            pluginInfo.state = PluginState.installed;
            // 触发安装事件
            this.emit(PluginEvent.install, { plugin, options });
            console.log(`Plugin ${pluginName} installed successfully.`);
        } catch (error) {
            console.error(`Failed to install plugin ${pluginName}:`, error);
            pluginInfo.state = PluginState.error;
            pluginInfo.error = error as Error;
            this.emit(PluginEvent.install, { plugin, options, error: pluginInfo.error });
            throw error;
        }
        return
    }
    unuse(pluginName: string, autoCleanupServices: boolean = true): void {
        const pluginInfo = this.pluginInfos.get(pluginName);
        if (!pluginInfo) {
            console.warn(`Plugin ${pluginName} not found.`);
            return
        }
        if (pluginInfo.state !== PluginState.installed) {
            console.warn(`Plugin ${pluginName} is not installed.`);
            return
        }
        const plugin = pluginInfo.plugin;
        pluginInfo.state = PluginState.uninstalling;
        try {
            if (plugin.uninstall) {
                plugin.uninstall(this);
            }
            this.pluginInfos.delete(pluginName);
            if (autoCleanupServices) {
                for (const service of this.services.values()) {
                    if (service.plugin.name === pluginName) {
                        this.unregisterService(service.name);
                    }
                }
            }
            pluginInfo.state = PluginState.uninstalled;
            this.emit(PluginEvent.uninstall, { plugin, options: pluginInfo.options });
            console.log(`Plugin ${pluginName} uninstalled successfully.`);
            return
        } catch (error) {
            console.error(`Failed to uninstall plugin ${pluginName}:`, error);
            pluginInfo.state = PluginState.error;
            pluginInfo.error = error as Error;
            this.emit(PluginEvent.uninstall, { plugin, options: pluginInfo.options, error: pluginInfo.error });
            throw error;
        }
    }

    registerService(service: IService): void {
        if (this.services.has(service.name)) {
            console.warn(`Service ${service.name} is already registered.`);
            return;
        }
        this.services.set(service.name, service);
        this.emit(PluginEvent.serviceRegistered, { plugin: service.plugin, service });
    }
    unregisterService(name: string): void {
        const service = this.services.get(name);
        if (!service) {
            console.warn(`Service ${name} not found.`);
            return;
        }
        this.services.delete(name);
        this.emit(PluginEvent.serviceUnregistered, { plugin: service.plugin, service });
    }

    getPluginInfo(name: string): IPluginInfo<T> | undefined {
        return this.pluginInfos.get(name)
    }
    getPluginInfos(): IPluginInfo<T>[] {
        return Array.from(this.pluginInfos.values());
    }
    getService<S>(name: string): S | undefined {
        const service = this.services.get(name);
        return service?.service as S;
    }
    getServices(): IService[] {
        return Array.from(this.services.values());
    }

    hasPlugin(pluginName: string): boolean {
        return this.pluginInfos.has(pluginName);
    }
    hasService(serviceName: string): boolean {
        return this.services.has(serviceName);
    }
    hook(event: PluginEvent, listener: (payload: PluginEventPayload<T>) => void): void {
        let listeners = this.eventListeners.get(event);
        if (!listeners) {
            listeners = new Set();
            this.eventListeners.set(event, listeners);
        }
        listeners.add(listener);
    }
    unhook(event: PluginEvent, listener: (payload: PluginEventPayload<T>) => void): void {
        const listeners = this.eventListeners.get(event);
        if (!listeners) {
            return;
        }
        listeners.delete(listener);
    }

    private emit(event: PluginEvent, payload: PluginEventPayload<T>): void {
        const listeners = this.eventListeners.get(event);
        if (!listeners) {
            return
        }
        listeners.forEach(listener => {
            try {
                listener(payload);
            } catch (error) {
                console.error(`Failed to call listener for event ${event}:`, error);
            }
        });
    }

    private checkDependencies(plugin: IPlugin<T>): boolean {
        const dependentPlugins = plugin.dependentPlugins;
        if (dependentPlugins) {
            for (const depName of dependentPlugins) {
                if (!this.hasPlugin(depName)) {
                    console.warn(`Plugin ${plugin.name} depends on plugin ${depName}, which is not installed.`);
                    return false;
                }
            }
        }
        const dependentServices = plugin.dependentServices;
        if (dependentServices) {
            for (const depName of dependentServices) {
                if (!this.hasService(depName)) {
                    console.warn(`Plugin ${plugin.name} depends on service ${depName}, which is not registered.`);
                    return false;
                }
            }
        }
        return true;
    }
}

