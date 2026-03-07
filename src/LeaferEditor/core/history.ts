export type HistoryType = 'save' | 'undo' | 'redo' | 'clear';

// type HistoryState =
//     | Record<string, any>
//     | any[]
//     | string
//     | number
//     | boolean
//     | object
//     | null;

type HistoryState = any;

export interface HistoryOptions<T = HistoryState> {
    historySavedData: () => T;
    maxSize?: number;
    onStateChange?: (state: T | null, type: HistoryType) => void;
    shouldSave?: (prevState: T | null, newState: T) => boolean;
}

export class History<T extends HistoryState = HistoryState> {
    private undoStack: T[] = [];
    private redoStack: T[] = [];
    private currentState: T | null = null;
    private onStateChange: ((state: T | null, type: HistoryType) => void) | null = null;
    private historySavedData: (() => T) | null = null;
    private shouldSave: ((prevState: T | null, newState: T) => boolean) | null = null;

    private maxSize: number;
    private isEnabledSaveHistory: boolean = true;

    constructor(options: HistoryOptions<T>) {
        this.maxSize = options.maxSize || 24;
        this.onStateChange = options.onStateChange || null;
        this.historySavedData = options.historySavedData || null;
        this.shouldSave = options.shouldSave || null;
        this.currentState = null;
        if (this.maxSize < 1) {
            throw new Error("History maxSize must be greater than 0");
        }
        if (this.historySavedData === null) {
            throw new Error("History historySavedData is not defined");
        }
    }

    public disabledHistory(): void {
        this.isEnabledSaveHistory = false;
    }
    public enableHistory(): void {
        this.isEnabledSaveHistory = true;
    }
    public isEnabled(): boolean {
        return this.isEnabledSaveHistory;
    }

    /**
     * 保存状态
     */
    public saveState(): boolean {
        if (!this.isEnabledSaveHistory) {
            // console.warn("history is closed");
            return false;
        }
        if (this.historySavedData === null) {
            console.warn("historySavedData is not defined");
            return false;
        }
        const data = this.historySavedData()

        if (this.shouldSave && !this.shouldSave(this.currentState, data)) {
            return false;
        }

        // 保存当前状态到撤销栈
        if (this.currentState !== null) {
            this.undoStack.push(this.currentState);

            // 限制栈大小
            if (this.undoStack.length > this.maxSize) {
                this.undoStack.shift();
            }
        }

        this.currentState = data;

        // 保存新状态后清空重做栈
        this.redoStack = [];
        this.notifyChange('save');
        return true;
    }

    /**
     * 撤销操作
     * @returns 返回撤销后的状态，如果无法撤销返回 null
     */
    public undo() {
        if (this.undoStack.length === 0) {
            return null;
        }

        // 保存当前状态到重做栈
        if (this.currentState !== null) {
            this.redoStack.push(this.currentState);
        }

        // 从撤销栈取出上一个状态
        this.currentState = this.undoStack.pop() || null;

        this.notifyChange('undo');
        return this.currentState;
    }

    /**
     * 重做操作
     * @returns 返回重做后的状态，如果无法重做返回 null
     */
    public redo() {
        if (this.redoStack.length === 0) {
            return null;
        }

        // 保存当前状态到撤销栈
        if (this.currentState !== null) {
            this.undoStack.push(this.currentState);
        }

        // 从重做栈取出下一个状态
        this.currentState = this.redoStack.pop() || null;

        this.notifyChange('redo');
        return this.currentState;
    }

    /**
     * 获取当前状态
     */
    public getCurrentState(): T | null {
        return this.currentState;
    }

    // 获取历史记录
    public getHistory(): T[] {
        const currentState = this.currentState || this.historySavedData!();
        return [...this.undoStack, currentState];
    }

    /**
     * 是否可以撤销
     */
    public canUndo(): boolean {
        return this.undoStack.length > 0;
    }

    /**
     * 是否可以重做
     */
    public canRedo(): boolean {
        return this.redoStack.length > 0;
    }

    /**
     * 清空历史记录
     */
    public clear(): void {
        this.undoStack = [];
        this.redoStack = [];
        this.notifyChange('clear');
        this.currentState = null;
    }

    /**
     * 获取历史记录数量信息
     */
    public getHistoryInfo(): { undoCount: number; redoCount: number } {
        return {
            undoCount: this.undoStack.length,
            redoCount: this.redoStack.length,
        };
    }

    private notifyChange(type: HistoryType) {
        if (this.onStateChange) {
            try {
                this.onStateChange(this.currentState, type);
            } catch (error) {
                console.error('Error in onStateChange callback:', error);
            }
        }
    }

    public destroy() {
        this.clear();
        this.onStateChange = null;
        this.historySavedData = null;
        this.shouldSave = null;
    }
}
