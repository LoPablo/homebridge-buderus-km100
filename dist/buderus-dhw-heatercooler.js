"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuderusDhwHeatercooler = void 0;
class BuderusDhwHeatercooler {
    constructor(hap, log, name, buderusApi) {
        this.log = log;
        this.name = name;
        this.buderusApi = buderusApi;
        this.heaterCoolerService = new hap.Service.HeaterCooler(name);
        this.heaterCoolerService.getCharacteristic(hap.Characteristic.Active)
            .on('get', this.handleActiveGet.bind(this))
            .on('set', this.handleActiveSet.bind(this));
        //.props.perms = [hap.Perms.PAIRED_READ];
        this.heaterCoolerService.getCharacteristic(hap.Characteristic.CurrentHeaterCoolerState)
            .on('get', this.handleCurrentHeaterCoolerStateGet.bind(this));
        this.heaterCoolerService.getCharacteristic(hap.Characteristic.HeatingThresholdTemperature)
            .on('get', this.handleHeatingThresholdTemperatureGet.bind(this))
            .on('set', this.handleHeatingThresholdTemperatureSet.bind(this));
        this.heaterCoolerService.getCharacteristic(hap.Characteristic.HeatingThresholdTemperature).props.maxValue = 70;
        this.heaterCoolerService.getCharacteristic(hap.Characteristic.HeatingThresholdTemperature).props.minValue = 30;
        this.heaterCoolerService.getCharacteristic(hap.Characteristic.TargetHeaterCoolerState)
            .on('get', this.handleTargetHeaterCoolerStateGet.bind(this))
            .on('set', this.handleTargetHeaterCoolerStateSet.bind(this))
            .props.validValues = [1];
        this.heaterCoolerService.getCharacteristic(hap.Characteristic.TargetHeaterCoolerState);
        //.props.perms = [hap.Perms.PAIRED_READ, hap.Perms.EVENTS];
        this.heaterCoolerService.getCharacteristic(hap.Characteristic.CurrentTemperature)
            .on('get', this.handleCurrentTemperatureGet.bind(this));
        // this.heaterCoolerService.getCharacteristic(hap.Characteristic.CurrentTemperature)
        //     .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        //       buderusApi.get('/dhwCircuits/dhw1/actualTemp').then((data)=>{
        //         if (data.value && data.type && data.type == 'floatValue') {
        //           callback(undefined,data.value);
        //           log.debug('New Outdoor Temp: %s', data.value);
        //         }else{
        //           callback(new Error("Missing JSON Values"));
        //           log.debug('Missing JSON Values');
        //         }
        //       }).catch((error)=>{
        //         callback(error);
        //       })
        //     });
        this.informationService = new hap.Service.AccessoryInformation()
            .setCharacteristic(hap.Characteristic.Manufacturer, buderusApi.manufacturer)
            .setCharacteristic(hap.Characteristic.Model, buderusApi.model)
            .setCharacteristic(hap.Characteristic.FirmwareRevision, buderusApi.firmwareRevision)
            .setCharacteristic(hap.Characteristic.SerialNumber, buderusApi.serialNumber);
        log.info("%s created!", name);
    }
    handleActiveGet(callback) {
        this.log.debug('Triggered GET Active');
        this.buderusApi.enqueueGet('/dhwCircuits/dhw1/operationMode').then((data) => {
            if (data.value && data.type && data.type == 'stringValue') {
                if (data.value == 'ownprogram') {
                    callback(undefined, 1);
                    this.log.debug('New Active: %s', data.value);
                }
                else if (data.value == 'Off') {
                    callback(undefined, 0);
                    this.log.debug('New Active: %s', data.value);
                }
                else {
                    callback(new Error("Not Usable Value"));
                    this.log.debug('Not Usable Value %s', data.value);
                }
            }
            else {
                callback(new Error("Missing JSON Values"));
                this.log.debug('Missing JSON Values');
            }
        }).catch((error) => {
            this.log.debug('Active request error');
            callback(error);
        });
    }
    handleActiveSet(value, callback) {
        this.log.debug('Triggered SET Active:' + value.toString());
        callback(null, 1);
    }
    handleCurrentHeaterCoolerStateGet(callback) {
        this.log.debug('Triggered GET CurrentHeaterCoolerState');
        this.buderusApi.enqueueGet('/heatSources/actualDHWPower').then((data) => {
            if ((data.value || data.value == 0) && data.type && data.type == 'floatValue') {
                if (data.value > 0) {
                    callback(undefined, 2);
                    this.log.debug('New Heater Cooler Power: %s', data.value);
                }
                else {
                    callback(undefined, 0);
                    this.log.debug('New Heater Cooler Power: %s', data.value);
                }
            }
            else {
                callback(new Error("Missing HeaterCoolerState JSON Values"));
                this.log.debug('Missing HeaterCoolerState JSON Values ');
            }
        }).catch((error) => {
            callback(error);
        });
    }
    handleTargetHeaterCoolerStateGet(callback) {
        this.log.debug('Triggered GET TargetHeaterCoolerState');
        const currentValue = 1;
        callback(null, currentValue);
    }
    handleTargetHeaterCoolerStateSet(value, callback) {
        this.log.debug('Triggered SET TargetHeaterCoolerState:' + value.toString());
        callback(null);
    }
    handleCurrentTemperatureGet(callback) {
        this.log.debug('Triggered GET CurrentTemperature');
        this.buderusApi.enqueueGet('/dhwCircuits/dhw1/actualTemp').then((data) => {
            if (data.value && data.type && data.type == 'floatValue') {
                callback(undefined, data.value);
                this.log.debug('New DHW CurrentTemperature: %s', data.value);
            }
            else {
                callback(new Error("Missing JSON Values"));
                this.log.debug('Missing JSON Values');
            }
        }).catch((error) => {
            callback(error);
        });
    }
    handleHeatingThresholdTemperatureGet(callback) {
        this.log.debug('Triggered GET HeatingThreshold');
        this.buderusApi.enqueueGet('/dhwCircuits/dhw1/temperatureLevels/high').then((data) => {
            if (data.value && data.type && data.type == 'floatValue') {
                callback(undefined, data.value);
                this.log.debug('New DHW HeatingThreshold: %s', data.value);
            }
            else {
                callback(new Error("Missing JSON Values"));
                this.log.debug('Missing JSON Values');
            }
        }).catch((error) => {
            callback(error);
        });
    }
    handleHeatingThresholdTemperatureSet(value, callback) {
        this.log.debug('Triggered SET HeatingThreshold:' + value.toString());
        callback(null);
    }
    identify() {
        this.log("Identify!");
    }
    getServices() {
        return [
            this.informationService,
            this.heaterCoolerService
        ];
    }
}
exports.BuderusDhwHeatercooler = BuderusDhwHeatercooler;
//# sourceMappingURL=buderus-dhw-heatercooler.js.map