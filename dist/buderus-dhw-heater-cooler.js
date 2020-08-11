"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuderusDhwHeaterCooler = void 0;
class BuderusDhwHeaterCooler {
    constructor(hap, log, name, buderusApi, refreshInterval) {
        this.log = log;
        this.hap = hap;
        this.name = name;
        this.buderusApi = buderusApi;
        this.heaterCoolerService = new hap.Service.HeaterCooler(name + " Einstelungen");
        this.waterFlowService = new hap.Service.MotionSensor(name + " Wasserfluss");
        this.waterFlowService.getCharacteristic(this.hap.Characteristic.MotionDetected)
            .on('get', this.handleMotionDetectedGet.bind(this));
        this.heaterCoolerService.getCharacteristic(this.hap.Characteristic.Active)
            .on('get', this.handleActiveGet.bind(this))
            .on('set', this.handleActiveSet.bind(this));
        this.heaterCoolerService.getCharacteristic(this.hap.Characteristic.CurrentHeaterCoolerState)
            .on('get', this.handleCurrentHeaterCoolerStateGet.bind(this));
        this.heaterCoolerService.getCharacteristic(this.hap.Characteristic.HeatingThresholdTemperature)
            .on('get', this.handleHeatingThresholdTemperatureGet.bind(this))
            .on('set', this.handleHeatingThresholdTemperatureSet.bind(this));
        this.heaterCoolerService.getCharacteristic(this.hap.Characteristic.HeatingThresholdTemperature).props.maxValue = 70;
        this.heaterCoolerService.getCharacteristic(this.hap.Characteristic.HeatingThresholdTemperature).props.minValue = 30;
        this.heaterCoolerService.getCharacteristic(this.hap.Characteristic.TargetHeaterCoolerState)
            .on('get', this.handleTargetHeaterCoolerStateGet.bind(this))
            .on('set', this.handleTargetHeaterCoolerStateSet.bind(this))
            .props.validValues = [1];
        this.heaterCoolerService.getCharacteristic(this.hap.Characteristic.TargetHeaterCoolerState);
        //.props.perms = [hap.Perms.PAIRED_READ, hap.Perms.EVENTS];
        this.heaterCoolerService.getCharacteristic(this.hap.Characteristic.CurrentTemperature)
            .on('get', this.handleCurrentTemperatureGet.bind(this));
        this.informationService = new this.hap.Service.AccessoryInformation()
            .setCharacteristic(this.hap.Characteristic.Manufacturer, buderusApi.manufacturer)
            .setCharacteristic(this.hap.Characteristic.Model, buderusApi.model)
            .setCharacteristic(this.hap.Characteristic.FirmwareRevision, buderusApi.firmwareRevision)
            .setCharacteristic(this.hap.Characteristic.SerialNumber, buderusApi.serialNumber);
        log.info("%s created!", name);
        this.buderusApi.registerValueListener('/dhwCircuits/dhw1/actualTemp', refreshInterval, this);
        this.buderusApi.registerValueListener('/heatSources/actualDHWPower', refreshInterval, this);
        this.buderusApi.registerValueListener('/dhwCircuits/dhw1/operationMode', refreshInterval, this);
        this.buderusApi.registerValueListener('/dhwCircuits/dhw1/temperatureLevels/high', refreshInterval, this);
    }
    handleMotionDetectedGet(callback) {
        this.log.debug('Triggered GET MotionDetected');
        this.buderusApi.enqueueGet('/dhwCircuits/dhw1/waterFlow').then((data) => {
            if ((data.value || data.value == 0) && data.type && data.type == 'floatValue') {
                if (data.value > 0) {
                    callback(undefined, 1);
                    this.log.debug('New MotionDetected: %s', data.value);
                }
                else {
                    callback(undefined, 0);
                    this.log.debug('New MotionDetected %s', data.value);
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
    hasNewValue(data) {
        if (data && data.id) {
            this.log.debug('New Value arrived for: %s', data.id);
            switch (data.id) {
                case '/dhwCircuits/dhw1/actualTemp':
                    if ((data.value || data.value == 0) && data.type && data.type == 'floatValue') {
                        this.heaterCoolerService.updateCharacteristic(this.hap.Characteristic.CurrentTemperature, data.value);
                        this.log.debug('New DHW CurrentTemperature: %s', data.value);
                    }
                    else {
                        this.log.debug('Missing JSON Values');
                    }
                    break;
                case '/heatSources/actualDHWPower':
                    if ((data.value || data.value == 0) && data.type && data.type == 'floatValue') {
                        if (data.value > 0) {
                            this.heaterCoolerService.updateCharacteristic(this.hap.Characteristic.CurrentHeaterCoolerState, 2);
                            this.log.debug('New Heater Cooler Power: %s', data.value);
                        }
                        else {
                            this.heaterCoolerService.updateCharacteristic(this.hap.Characteristic.CurrentHeaterCoolerState, 0);
                            this.log.debug('New Heater Cooler Power: %s', data.value);
                        }
                    }
                    else {
                        this.log.debug('Missing HeaterCoolerState JSON Values ');
                    }
                    break;
                case '/dhwCircuits/dhw1/operationMode':
                    if (data.value && data.type && data.type == 'stringValue') {
                        if (data.value == 'ownprogram') {
                            this.heaterCoolerService.updateCharacteristic(this.hap.Characteristic.Active, 1);
                            this.log.debug('New Active: %s', data.value);
                        }
                        else if (data.value == 'Off') {
                            this.heaterCoolerService.updateCharacteristic(this.hap.Characteristic.Active, 0);
                            this.log.debug('New Active: %s', data.value);
                        }
                        else {
                            this.log.debug('Not Usable Value %s', data.value);
                        }
                    }
                    else {
                        this.log.debug('Missing JSON Values');
                    }
                    break;
                case '/dhwCircuits/dhw1/temperatureLevels/high':
                    if (data.value && data.type && data.type == 'floatValue') {
                        this.heaterCoolerService.updateCharacteristic(this.hap.Characteristic.HeatingThresholdTemperature, data.value);
                        this.log.debug('New DHW HeatingThreshold: %s', data.value);
                    }
                    else {
                        this.log.debug('Missing JSON Values');
                    }
                    break;
            }
        }
    }
    ;
    hadNewValueError(error) {
        this.log.debug(error);
    }
    getServices() {
        return [
            this.informationService,
            this.heaterCoolerService,
        ];
    }
}
exports.BuderusDhwHeaterCooler = BuderusDhwHeaterCooler;
//# sourceMappingURL=buderus-dhw-heater-cooler.js.map