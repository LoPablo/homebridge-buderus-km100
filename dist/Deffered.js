"use strict";
//Deffered.ts
Object.defineProperty(exports, "__esModule", { value: true });
class Deferred {
    constructor(executor, runExecutor) {
        this._promise = new Promise((resolve, reject) => {
            this._resolveSelf = resolve;
            this._rejectSelf = reject;
        });
        this._executor = executor;
        if (runExecutor) {
            this._timeout = setTimeout(() => {
                this.reject("timeout");
            }, 5000);
            this._executor.call(this, this._resolveSelf, this._rejectSelf);
        }
    }
    then(onfulfilled, onrejected) {
        return this._promise.then(onfulfilled, onrejected);
    }
    catch(onrejected) {
        return this._promise.then(onrejected);
    }
    finally(onfinally) {
        return this._promise.finally(onfinally);
    }
    resolve(val) {
        if (this._timeout) {
            clearTimeout(this._timeout);
        }
        this._resolveSelf(val);
    }
    reject(reason) {
        if (this._timeout) {
            clearTimeout(this._timeout);
        }
        this._rejectSelf(reason);
    }
    execute() {
        this._timeout = setTimeout(() => {
            this.reject("timeout");
        }, 5000);
        this._executor.call(this, this._resolveSelf, this._rejectSelf);
    }
}
exports.default = Deferred;
//# sourceMappingURL=Deffered.js.map