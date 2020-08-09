"use strict";
//Includes Code from km200-api Copyright (c) 2020 Jens Zech
//Includes Code from iobroker.km200 Copyright (c) 2016-2019 Frank Joke (frankjoke@hotmail.com)
//Includes communications and crypto routines copyright (c) 2014 Andreas Hahn (km200@andreashahn.info)
//Rest is (c) 2020 Pascâl Hartmann (lopablo@protonmail.com)
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Api = void 0;
const crypto = __importStar(require("crypto"));
const request = __importStar(require("request-promise-native"));
const rijndael_js_1 = __importDefault(require("rijndael-js"));
const jsonResponse_1 = require("./jsonResponse");
const Deffered_1 = __importDefault(require("./Deffered"));
const km200_crypt_md5_salt = new Uint8Array([
    0x86, 0x78, 0x45, 0xe9, 0x7c, 0x4e, 0x29, 0xdc,
    0xe5, 0x22, 0xb9, 0xa7, 0xd3, 0xa3, 0xe0, 0x7b,
    0x15, 0x2b, 0xff, 0xad, 0xdd, 0xbe, 0xd7, 0xf5,
    0xff, 0xd8, 0x42, 0xe9, 0x89, 0x5a, 0xd1, 0xe4
]);
class Api {
    constructor(log, host, gatewaypassword, privatepassword) {
        this.log = log;
        this._manufacturer = "";
        this._model = "";
        this._firmwareRevision = "";
        this._serialNumber = "";
        this._aesKey = this.getAccesskey(gatewaypassword, privatepassword);
        this._host = host;
        this._key = Buffer.from(this._aesKey, 'hex');
        this._iv = crypto.randomBytes(32);
        this._cipher = new rijndael_js_1.default(this._key, 'ecb');
        this._promiseQueue = [];
    }
    get manufacturer() {
        return this._manufacturer;
    }
    get model() {
        return this._model;
    }
    get firmwareRevision() {
        return this._firmwareRevision;
    }
    get serialNumber() {
        return this._serialNumber;
    }
    initApi() {
        return new Promise((resolve, reject) => {
            this.get('/system/brand').then((data) => {
                if (data.value && data.type && data.type == 'stringValue') {
                    this._manufacturer = data.value;
                }
                this.log.info('Manufacturer: %s', this._manufacturer);
                this.get('/gateway/versionHardware').then((data) => {
                    if (data.value && data.type && data.type == 'stringValue') {
                        this._model = data.value;
                    }
                    this.log.info('Model: %s', this._model);
                    this.get('/gateway/versionFirmware').then((data) => {
                        if (data.value && data.type && data.type == 'stringValue') {
                            this._firmwareRevision = data.value;
                        }
                        this.log.info('Firmware Revision: %s', this._firmwareRevision);
                        this.get('/gateway/uuid').then((data) => {
                            if (data.value && data.type && data.type == 'stringValue') {
                                this._serialNumber = data.value;
                            }
                            this.log.info('Gateway Serial UUID: %s', this._serialNumber);
                            resolve();
                        }).catch((error) => {
                            reject(error);
                        });
                    }).catch((error) => {
                        reject(error);
                    });
                }).catch((error) => {
                    reject(error);
                });
            }).catch((error) => {
                console.log(error);
                reject();
            });
        });
    }
    set(service, value) {
        let post = JSON.stringify({
            value: value
        });
        let postArray = Array.from(Buffer.from(post, 'utf8'));
        //postArray = mcrypt.encrypt(post, null, this._aesKey, 'rijndael-128', 'ecb');
        let postBuffer = Buffer.from(postArray);
        post = postBuffer.toString('base64');
        let setOptions = {
            uri: 'http://' + this._host + service,
            timeout: 5000,
            headers: {
                'agent': 'TeleHeater/2.2.3',
                'User-Agent': 'TeleHeater/2.2.3',
                'Content-Type': "application/json"
            }
        };
        return new Promise((resolve, reject) => {
        });
    }
    runNext() {
        if (this._promiseQueue.length > 0) {
            let frontDefferedResult = this._promiseQueue[0];
            frontDefferedResult.execute();
        }
    }
    enqueueGet(service) {
        let defferedResult = new Deffered_1.default((resolve, reject) => {
            this.get(service).then((value) => {
                resolve(value);
            }).catch((error) => {
                reject(error);
            });
            setTimeout(() => {
                this._promiseQueue.shift();
                this.runNext();
            }, 100);
        }, false);
        if (this._promiseQueue.length == 0) {
            this._promiseQueue.push(defferedResult);
            this.runNext();
        }
        else {
            this._promiseQueue.push(defferedResult);
        }
        return defferedResult;
    }
    get(service) {
        return new Promise((resolve, reject) => {
            if (!service || service.length < 2 || service[0] !== '/') {
                reject('Get service parameter wrong');
            }
            let getOptions = {
                uri: 'http://' + this._host + service,
                timeout: 10000,
                headers: {
                    'agent': 'TeleHeater/2.2.3',
                    'User-Agent': 'TeleHeater/2.2.3',
                    'Accept': 'application/json',
                }
            };
            request.get(getOptions).then((response) => {
                let s = this.decrypt(response);
                resolve(jsonResponse_1.JsonResponse.fromJSONString(this.removeNonValidChars(s)));
            }).catch((error) => {
                this.log("Request %s had error: %s", service, error);
                reject(error);
            });
        });
    }
    decrypt(body) {
        var enc = Buffer.from(body, 'base64');
        var plaintext = Buffer.from(this._cipher.decrypt(enc, '128', this._iv));
        return plaintext.toString();
    }
    ;
    removeNonValidChars(data) {
        return data
            .replace(/\\n/g, '\\n')
            .replace(/\\"/g, '\\"')
            .replace(/\\&/g, '\\&')
            .replace(/\\r/g, '\\r')
            .replace(/\\t/g, '\\t')
            .replace(/\\b/g, '\\b')
            .replace(/\\f/g, '\\f')
            .replace(/[\u0000-\u0019]+/g, '');
    }
    ;
    md5(text) {
        return crypto.createHash('md5').update(text).digest("hex");
    }
    str2ab(str) {
        let buf = new ArrayBuffer(str.length * 1); // 2 bytes for each char
        let bufView = new Uint8Array(buf);
        for (let i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return bufView;
    }
    concatUint8Array(array1, array2) {
        const array3 = new Uint8Array(array1.length + array2.length);
        for (let i = 0; i < array1.length; i++) {
            array3[i] = array1[i];
        }
        for (let i = 0; i < array2.length; i++) {
            array3[array1.length + i] = array2[i];
        }
        return array3;
    }
    getAccesskey(gatewaypassword, privatepassword) {
        gatewaypassword = gatewaypassword.replace(/-/g, '');
        let km200_gateway_password = this.str2ab(gatewaypassword);
        let km200_private_password = this.str2ab(privatepassword);
        // Erste Hälfte des Schlüssels: MD5 von ( Gerätepasswort . Salt )
        let key_1 = this.md5(this.concatUint8Array(km200_gateway_password, km200_crypt_md5_salt));
        // Zweite Hälfte des Schlüssels - initial: MD5 von ( Salt )
        //            let key_2_initial = md5(km200_crypt_md5_salt);
        // Zweite Hälfte des Schlüssels - privat: MD5 von ( Salt . privates Passwort )
        let key_2_private = this.md5(this.concatUint8Array(km200_crypt_md5_salt, km200_private_password));
        //            let km200_crypt_key_initial = key_1 + key_2_initial;
        let km200_crypt_key_private = key_1 + key_2_private;
        return km200_crypt_key_private.trim().toLowerCase();
    }
}
exports.Api = Api;
//# sourceMappingURL=api.js.map