"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuderusOutdoorTemp = void 0;
class BuderusOutdoorTemp {
    constructor(hap, log, name, buderusApi, refreshInterval) {
        this.log = log;
        this.hap = hap;
        this.name = name;
        this.buderusApi = buderusApi;
        this.temperatureService = new this.hap.Service.TemperatureSensor(name);
        this.temperatureService.getCharacteristic(this.hap.Characteristic.CurrentTemperature)
            .on("get" /* GET */, (callback) => {
            buderusApi.enqueueGet('/system/sensors/temperatures/outdoor_t1').then((data) => {
                if (data.value && data.type && data.type == 'floatValue') {
                    callback(undefined, data.value);
                    log.debug('%s: New CurrentTemperature: %s', this.name, data.value);
                }
                else {
                    callback(new Error(this.name + ': Missing CurrentTemperature JSON Values'));
                    log.debug('%s: Missing CurrentTemperature JSON Values', this.name);
                }
            }).catch((error) => {
                callback(error);
            });
        });
        this.informationService = new this.hap.Service.AccessoryInformation()
            .setCharacteristic(this.hap.Characteristic.Manufacturer, buderusApi.manufacturer)
            .setCharacteristic(this.hap.Characteristic.Model, buderusApi.model)
            .setCharacteristic(this.hap.Characteristic.FirmwareRevision, buderusApi.firmwareRevision)
            .setCharacteristic(this.hap.Characteristic.SerialNumber, buderusApi.serialNumber);
        log.info("%s created!", name);
        this.buderusApi.registerValueListener('/system/sensors/temperatures/outdoor_t1', refreshInterval, this);
    }
    identify() {
        this.log('%s: Identify!', this.name);
    }
    hasNewValue(data) {
        if (data && data.id) {
            this.log.debug('%s: New Value arrived for: %s', this.name, data.id);
            if ((data.value || data.value == 0) && data.id == '/system/sensors/temperatures/outdoor_t1' && data.type && data.type == 'floatValue') {
                this.temperatureService.updateCharacteristic(this.hap.Characteristic.CurrentTemperature, data.value);
                this.log.debug('%s: New CurrentTemperature: %s', this.name, data.value);
            }
            else {
                this.log.debug('%s: Missing CurrentTemperatur JSON Values', this.name);
            }
        }
    }
    hadNewValueError(error) {
        this.log.debug(error);
    }
    getServices() {
        return [
            this.informationService,
            this.temperatureService
        ];
    }
}
exports.BuderusOutdoorTemp = BuderusOutdoorTemp;
//# sourceMappingURL=buderus-outdoor-temperatur.js.map