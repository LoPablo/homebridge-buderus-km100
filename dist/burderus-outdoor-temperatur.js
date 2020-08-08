"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BuderusOutdoorTemp {
    constructor(hap, log, name, buderusApi) {
        this.log = log;
        this.name = name;
        this.buderusApi = buderusApi;
        this.temperatureService = new hap.Service.TemperatureSensor(name);
        this.temperatureService.getCharacteristic(hap.Characteristic.CurrentTemperature)
            .on("get" /* GET */, (callback) => {
            buderusApi.request('/system/sensors/temperatures/outdoor_t1').then((data) => {
                log.debug('New Outdoor Temp: %s', data);
                callback(undefined, data);
            }).catch((error) => {
                callback(error);
            });
        });
        this.informationService = new hap.Service.AccessoryInformation()
            .setCharacteristic(hap.Characteristic.Manufacturer, buderusApi.manufacturer)
            .setCharacteristic(hap.Characteristic.Model, buderusApi.model)
            .setCharacteristic(hap.Characteristic.FirmwareRevision, buderusApi.firmwareRevision)
            .setCharacteristic(hap.Characteristic.SerialNumber, buderusApi.serialNumber);
        log.info("%s created!", name);
    }
    identify() {
        this.log("Identify!");
    }
    getServices() {
        return [
            this.informationService,
            this.temperatureService
        ];
    }
}
exports.BuderusOutdoorTemp = BuderusOutdoorTemp;
//# sourceMappingURL=burderus-outdoor-temperatur.js.map