//Deffered.ts

export default class Deferred<T> implements Promise<T> {

    [Symbol.toStringTag]: 'Promise'
    private _resolveSelf : any;
    private _rejectSelf : any;
    private _promise: Promise<T>;
    private _timeout?: ReturnType<typeof setTimeout>;
    private _executor : (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void;

    constructor(executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void, runExecutor : boolean) {
        this._promise = new Promise((resolve, reject) => {
                this._resolveSelf = resolve
                this._rejectSelf = reject
            }
        )
        this._executor = executor;
        if (runExecutor){
            this._timeout = setTimeout(() => {
                this.reject("timeout")
            }, 5000)
            console.log("ran ex");
            this._executor.call(this, this._resolveSelf, this._rejectSelf)
        }
    }

    public then<TResult1 = T, TResult2 = never>(
        onfulfilled?: ((value: T) =>
            TResult1 | PromiseLike<TResult1>) | undefined | null,
        onrejected?: ((reason: any) =>
            TResult2 | PromiseLike<TResult2>) | undefined | null
    ): Promise<TResult1 | TResult2> {
        return this._promise.then(onfulfilled, onrejected)
    }

    public catch<TResult = never>(
        onrejected?: ((reason: any) =>
            TResult | PromiseLike<TResult>) | undefined | null
    ): Promise<T | TResult> {
        return this._promise.then(onrejected)
    }

    public finally(onfinally?: () => void): Promise<T> {
        return this._promise.finally(onfinally)
    }

    public resolve(val: T) {
        if (this._timeout){
            clearTimeout(this._timeout)
        }
        this._resolveSelf(val)
    }

    public reject(reason: any) {
        if (this._timeout){
            clearTimeout(this._timeout)
        }
        this._rejectSelf(reason)
    }

    public execute(){
        console.log("ran ex on command");
        this._timeout = setTimeout(() => {
            this.reject("timeout")
        }, 5000)
        this._executor.call(this, this._resolveSelf, this._rejectSelf);
    }

}