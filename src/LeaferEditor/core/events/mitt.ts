import type { EventsParam, EventType } from "./eventType";
// import { EventTypes } from "./eventType";

interface EventBusOptions {
    onError?: (error: Error, type: EventType, handler: Function, param: any) => void;
}

export class MittBus {
    private all: Map<EventType, Set<(param: any) => void>> = new Map();
    private options: EventBusOptions;
    private isOn: boolean = true;
    private isWaiting: boolean = true;

    constructor(options?: EventBusOptions) {
        this.options = options || {};
        if (!this.options.onError) {
            this.options.onError = this.defaultErrorHandler;
        }
    }
    stop() {
        this.isOn = false;
    }
    start() {
        this.isOn = true;
    }
    stopAndRun(func: () => void) {
        this.stop();
        this.isWaiting = false;
        func();
        this.start();
        this.isWaiting = true;
    }
    on<T extends EventType>(type: T, handler: (param: EventsParam[T]) => void) {
        if (!type || typeof handler !== 'function') {
            throw new Error('Invalid arguments: type must be defined and handler must be a function');
        }

        if (!this.all.has(type)) {
            this.all.set(type, new Set());
        }
        this.all.get(type)!.add(handler);
    }

    off<T extends EventType>(type: T, handler: (param: EventsParam[T]) => void) {
        if (!this.all.has(type)) {
            return;
        }
        this.all.get(type)!.delete(handler);
        // 清理空集合
        if (this.all.get(type)!.size === 0) {
            this.all.delete(type);
        }
    }

    once<T extends EventType>(type: T, handler: (param: EventsParam[T]) => void) {
        const _handler = (p: EventsParam[T]) => {
            try {
                handler(p);
            } finally {
                this.off(type, _handler);
            }
        }
        this.on(type, _handler)
    }

    emit<T extends EventType>(type: T, param: EventsParam[T]) {
        if (!this.isOn) {
            if (this.isWaiting) {
                console.warn(`Event bus is stopped, event "${type}" ignored`);
            }
            return
        };
        const handlers = this.all.get(type);
        if (!handlers) return;

        // 复制 handlers 避免在迭代过程中修改集合
        const handlersCopy = new Set(handlers);
        handlersCopy.forEach((handler) => {
            try {
                handler(param);
            } catch (error) {
                this.options.onError?.(error as Error, type, handler, param);
            }
        });
    }

    clear(type?: EventType) {
        if (type) {
            this.all.delete(type);
        } else {
            this.all.clear();
        }
    }
    private defaultErrorHandler = (error: Error, type: EventType, handler: Function, param: any) => {
        const handlerName = handler.name || 'anonymous';
        let paramStr;
        try {
            if (!param) {
                paramStr = 'undefined';
            } else {
                paramStr = typeof param === 'object'
                    ? JSON.stringify(param)
                    : String(param);
            }
        } catch {
            paramStr = '[Unstringifiable]';
        }
        console.error(`[MittBus] Handler "${handlerName}" error for event "${type}" (param: ${paramStr}):`, error);
        // console.error(`[MittBus] Handler error for event "${type}":`, error);
    };
}

// const m = new MittBus()
// m.on('addPage', (p) => {
//     console.log('addPage', p)
// })
// m.emit(EventTypes.addPage, 1)

// const m2 = new MittBus()
// m2.on(EventTypes.addPage, (p) => {
//     console.log('addPage', p)
// })
// m2.emit(EventTypes.addPage, 'page1')  
