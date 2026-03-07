export class LazyString {

    private key: string;
    private getVal: (k: string) => string;

    constructor(key: string, value?: (k: string) => string) {
        this.key = key;
        this.getVal = value || (k => k);
    }

    get value(): string {
        return this.getVal(this.key);
    }

    toString(): string {
        return this.value;
    }

    valueOf(): string {
        return this.value;
    }

    // 为了方便使用，可以添加其他字符串方法
    get length(): number {
        return this.value.length;
    }

    // 可以代理其他字符串方法
    includes(searchString: string): boolean {
        return this.value.includes(searchString);
    }
}
