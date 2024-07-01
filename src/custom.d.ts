interface Timeout {
    ref(): void;
    unref(): void;
}

declare namespace NodeJS {
    interface Global {
        clearInterval(intervalId: Timeout): void;
        setInterval(callback: (...args: any[]) => void, ms: number, ...args: any[]): Timeout;
    }
}
