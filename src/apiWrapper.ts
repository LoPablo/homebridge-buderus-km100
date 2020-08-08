import {Km200} from "km200-api";
import {Logging} from "homebridge";

export class ApiWrapper {


    private readonly log: Logging;
    private readonly api: Km200;
    private _manufacturer: string;
    private _model: string;
    private _firmwareRevision: string;
    private _serialNumber : string;

    constructor(log: Logging, host: string, key: string) {
        this.log = log;
        this.api = new Km200(host, 80, key);
        this._manufacturer = "";
        this._model = "";
        this._firmwareRevision = "";
        this._serialNumber ="";
    }

    initApi(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.api.getKM200('/system/brand').then((data: { value: string; }) => {
                this._manufacturer = data.value;
                console.log('Manufacturer: ' + data.value);
                return this.api.getKM200('/gateway/versionHardware');
            }).catch((error) => {
                reject();
            })
            .then((data: { value: string; }) => {
                this._model = data.value
                console.log('Model: ' + data.value);
                return this.api.getKM200('/gateway/versionFirmware');
            }).catch((error) => {
                reject();
            }).then((data: { value: string; }) => {
                this._firmwareRevision = data.value
                console.log('Firmware Revision: ' + data.value);
                return this.api.getKM200('/gateway/uuid');
            }).catch((error) => {
                reject();
            }).then((data: { value: string; }) => {
                this._serialNumber = data.value
                console.log('Gateway Serial UUID: ' + data.value);
                resolve();
            }).catch((error) => {
                reject();
            })
        });
    }

    request(command: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.api.getKM200(command).then((data: { value: string; }) => {
                resolve(data.value);
            }).catch((error) => {
                reject(error);
            });
        });
    }

    get firmwareRevision(): string {
        return this._firmwareRevision;
    }
    get model(): string {
        return this._model;
    }
    get manufacturer(): string {
        return this._manufacturer;
    }

    get serialNumber(): string {
        return this._serialNumber;
    }
}