"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiWrapper = void 0;
const km200_api_1 = require("km200-api");
class ApiWrapper {
    constructor(log, host, key) {
        this.log = log;
        this.api = new km200_api_1.Km200(host, 80, key);
        this._manufacturer = "";
        this._model = "";
        this._firmwareRevision = "";
        this._serialNumber = "";
    }
    initApi() {
        return new Promise((resolve, reject) => {
            this.api.getKM200('/system/brand').then((data) => {
                this._manufacturer = data.value;
                console.log('Manufacturer: ' + data.value);
                return this.api.getKM200('/gateway/versionHardware');
            }).catch((error) => {
                reject(error);
            })
                .then((data) => {
                this._model = data.value;
                console.log('Model: ' + data.value);
                return this.api.getKM200('/gateway/versionFirmware');
            }).catch((error) => {
                reject(error);
            }).then((data) => {
                this._firmwareRevision = data.value;
                console.log('Firmware Revision: ' + data.value);
                return this.api.getKM200('/gateway/uuid');
            }).catch((error) => {
                reject(error);
            }).then((data) => {
                this._serialNumber = data.value;
                console.log('Gateway Serial UUID: ' + data.value);
                resolve();
            }).catch((error) => {
                reject(error);
            });
        });
    }
    request(command) {
        return new Promise((resolve, reject) => {
            this.api.getKM200(command).then((data) => {
                resolve(data.value);
            }).catch((error) => {
                reject(error);
            });
        });
    }
    get firmwareRevision() {
        return this._firmwareRevision;
    }
    get model() {
        return this._model;
    }
    get manufacturer() {
        return this._manufacturer;
    }
    get serialNumber() {
        return this._serialNumber;
    }
}
exports.ApiWrapper = ApiWrapper;
//# sourceMappingURL=apiWrapper.js.map