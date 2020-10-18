"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuderusDhw = void 0;
class BuderusDhw {
    constructor(hap, log, name, buderusApi, refreshInterval) {
        this.log = log;
        this.hap = hap;
        this.name = name;
        this.buderusApi = buderusApi;
        this.dhwThermostatService = new hap.Service.Thermostat(name + ' Einstelungen');
        this.waterFlowService = new hap.Service.MotionSensor(name + ' Wasserfluss');
        this.waterFlowService.getCharacteristic(this.hap.Characteristic.MotionDetected)
            .on('get', this.handleMotionDetectedGet.bind(this));
        this.dhwThermostatService.getCharacteristic(this.hap.Characteristic.CurrentHeatingCoolingState)
            .on('get', this.handleCurrentHeatingCoolingStateGet.bind(this));
        this.dhwThermostatService.getCharacteristic(this.hap.Characteristic.TargetTemperature)
            .on('get', this.handleTargetTemperatureGet.bind(this))
            .on('set', this.handleTargetTemperatureSet.bind(this));
        this.dhwThermostatService.getCharacteristic(this.hap.Characteristic.TargetTemperature).props.maxValue = 70;
        this.dhwThermostatService.getCharacteristic(this.hap.Characteristic.TargetTemperature).props.minValue = 0;
        this.dhwThermostatService.getCharacteristic(this.hap.Characteristic.TargetHeatingCoolingState)
            .on('get', this.handleTargetHeatingCoolingStateGet.bind(this))
            .on('set', this.handleTargetHeatingCoolingStateSet.bind(this))
            .props.validValues = [1];
        this.dhwThermostatService.getCharacteristic(this.hap.Characteristic.CurrentTemperature)
            .on('get', this.handleCurrentTemperatureGet.bind(this));
        this.informationService = new this.hap.Service.AccessoryInformation()
            .setCharacteristic(this.hap.Characteristic.Manufacturer, buderusApi.manufacturer)
            .setCharacteristic(this.hap.Characteristic.Model, buderusApi.model)
            .setCharacteristic(this.hap.Characteristic.FirmwareRevision, buderusApi.firmwareRevision)
            .setCharacteristic(this.hap.Characteristic.SerialNumber, buderusApi.serialNumber);
        log.info('%s created!', name);
        this.buderusApi.registerValueListener('/dhwCircuits/dhw1/actualTemp', refreshInterval, this);
        this.buderusApi.registerValueListener('/heatSources/actualDHWPower', refreshInterval, this);
        this.buderusApi.registerValueListener('/dhwCircuits/dhw1/operationMode', refreshInterval, this);
        this.buderusApi.registerValueListener('/dhwCircuits/dhw1/temperatureLevels/high', refreshInterval, this);
        this.buderusApi.registerValueListener('/dhwCircuits/dhw1/waterFlow', refreshInterval, this);
    }
    handleMotionDetectedGet(callback) {
        this.log.debug('%s: Triggered GET MotionDetected', this.name);
        this.buderusApi.enqueueGet('/dhwCircuits/dhw1/waterFlow').then((data) => {
            if ((data.value || data.value == 0) && data.type && data.type == 'floatValue') {
                if (data.value > 0) {
                    callback(undefined, 1);
                    this.log.debug('%s: New MotionDetected: %s', this.name, data.value);
                }
                else {
                    callback(undefined, 0);
                    this.log.debug('%s: New MotionDetected %s', this.name, data.value);
                }
            }
            else {
                callback(new Error(this.name + ': Missing MotionDetected JSON Values'));
                this.log.debug('%s: Missing MotionDetected JSON Values', this.name);
            }
        }).catch((error) => {
            this.log.debug('%s: Active request error MotionDeteected', this.name);
            callback(error);
        });
    }
    handleCurrentHeatingCoolingStateGet(callback) {
        this.log.debug('%s: Triggered GET CurrentHeatingCoolingState', this.name);
        this.buderusApi.enqueueGet('/heatSources/actualDHWPower').then((data) => {
            if ((data.value || data.value == 0) && data.type && data.type == 'floatValue') {
                if (data.value > 0) {
                    callback(undefined, 1);
                }
                else {
                    callback(undefined, 0);
                }
                this.log.debug('%s: New Heater Cooler Power: %s', this.name, data.value);
            }
            else {
                callback(new Error(this.name + ': Missing HeatingCoolingState JSON Values'));
                this.log.debug('%s: Missing HeatingCoolingState JSON Values', this.name);
            }
        }).catch((error) => {
            callback(error);
        });
    }
    handleTargetHeatingCoolingStateGet(callback) {
        this.log.debug('%s: Triggered GET TargetHeatingCoolingState', this.name);
        this.buderusApi.enqueueGet('/dhwCircuits/dhw1/operationMode').then((data) => {
            if (data.value && data.type && data.type == 'stringValue') {
                if (data.value == 'ownprogram') {
                    callback(undefined, 1);
                    this.log.debug('%s: New HeatingCoolingState: %s', this.name, data.value);
                }
                else if (data.value == 'Off') {
                    callback(undefined, 0);
                    this.log.debug('%s: New HeatingCoolingState: %s', this.name, data.value);
                }
                else {
                    callback(new Error(this.name + ': Not Usable Value HeatingCoolingState'));
                    this.log.debug('%s: Not Usable Value HeatingCoolingState %s', this.name, data.value);
                }
            }
            else {
                callback(new Error(this.name + ': Missing HeatingCoolingState JSON Values'));
                this.log.debug('%s: Missing HeatingCoolingState JSON Values', this.name);
            }
        }).catch((error) => {
            this.log.debug('%s: Active request error HeatingCoolingState', this.name);
            callback(error);
        });
    }
    handleTargetHeatingCoolingStateSet(value, callback) {
        this.log.debug('%s: Triggered SET TargetHeatingCoolingState with %s', this.name, value.toString());
        callback(null);
    }
    handleCurrentTemperatureGet(callback) {
        this.log.debug('%s: Triggered GET CurrentTemperature', this.name);
        this.buderusApi.enqueueGet('/dhwCircuits/dhw1/actualTemp').then((data) => {
            if (data.value && data.type && data.type == 'floatValue') {
                callback(undefined, data.value);
                this.log.debug('%s: New CurrentTemperature: %s', this.name, data.value);
            }
            else {
                callback(new Error(this.name + ': Missing JSON Values'));
                this.log.debug('%s: Missing CurrentTemperature JSON Values', this.name);
            }
        }).catch((error) => {
            callback(error);
        });
    }
    handleTargetTemperatureGet(callback) {
        this.log.debug('%s: Triggered GET HeatingThreshold', this.name);
        this.buderusApi.enqueueGet('/dhwCircuits/dhw1/temperatureLevels/high').then((data) => {
            if (data.value && data.type && data.type == 'floatValue') {
                callback(undefined, data.value);
                this.log.debug('%s: New HeatingThreshold: %s', this.name, data.value);
            }
            else {
                callback(new Error(this.name + ': Missing New HeatingThreshold JSON Values'));
                this.log.debug('%s: Missing New HeatingThreshold JSON Values', this.name);
            }
        }).catch((error) => {
            callback(error);
        });
    }
    handleTargetTemperatureSet(value, callback) {
        this.log.debug('%s: Triggered SET HeatingThreshold with %s', this.name, value.toString());
        callback(null);
    }
    identify() {
        this.log('%s: Identify!', this.name);
    }
    hasNewValue(data) {
        if (data && data.id) {
            this.log.debug('%s: New Value arrived for: %s', this.name, data.id);
            switch (data.id) {
                case '/dhwCircuits/dhw1/actualTemp':
                    if ((data.value || data.value == 0) && data.type && data.type == 'floatValue') {
                        this.dhwThermostatService.updateCharacteristic(this.hap.Characteristic.CurrentTemperature, data.value);
                        this.log.debug('%s: New CurrentTemperature: %s', this.name, data.value);
                    }
                    else {
                        this.log.debug('%s: Missing CurrentTemperature JSON Values', this.name);
                    }
                    break;
                case '/dhwCircuits/dhw1/waterFlow':
                    if ((data.value || data.value == 0) && data.type && data.type == 'floatValue') {
                        if (data.value > 0) {
                            this.waterFlowService.updateCharacteristic(this.hap.Characteristic.MotionDetected, 1);
                        }
                        else {
                            this.waterFlowService.updateCharacteristic(this.hap.Characteristic.MotionDetected, 0);
                        }
                        this.log.debug('%s: New MotionDetected %s', this.name, data.value);
                    }
                    else {
                        this.log.debug('%s: Missing MotionDetected JSON Values', this.name);
                    }
                    break;
                case '/heatSources/actualDHWPower':
                    if ((data.value || data.value == 0) && data.type && data.type == 'floatValue') {
                        if (data.value > 0) {
                            this.dhwThermostatService.updateCharacteristic(this.hap.Characteristic.CurrentHeatingCoolingState, 1);
                        }
                        else {
                            this.dhwThermostatService.updateCharacteristic(this.hap.Characteristic.CurrentHeatingCoolingState, 0);
                        }
                        this.log.debug('%s: New Heater Cooler Power: %s', this.name, data.value);
                    }
                    else {
                        this.log.debug('%s: Missing HeatingCoolingState JSON Values', this.name);
                    }
                    break;
                case '/dhwCircuits/dhw1/operationMode':
                    if (data.value && data.type && data.type == 'stringValue') {
                        if (data.value == 'ownprogram') {
                            this.dhwThermostatService.updateCharacteristic(this.hap.Characteristic.TargetHeatingCoolingState, 1);
                            this.log.debug('%s: New TargetHeatingCoolingState: %s', this.name, data.value);
                        }
                        else if (data.value == 'Off') {
                            this.dhwThermostatService.updateCharacteristic(this.hap.Characteristic.TargetHeatingCoolingState, 0);
                            this.log.debug('%s: New TargetHeatingCoolingState: %s', this.name, data.value);
                        }
                        else {
                            this.log.debug('%s: Not Usable TargetHeatingCoolingState Value %s', this.name, data.value);
                        }
                    }
                    else {
                        this.log.debug('%s: Missing TargetHeatingCoolingState JSON Values', this.name);
                    }
                    break;
                case '/dhwCircuits/dhw1/temperatureLevels/high':
                    if (data.value && data.type && data.type == 'floatValue') {
                        this.dhwThermostatService.updateCharacteristic(this.hap.Characteristic.HeatingThresholdTemperature, data.value);
                        this.log.debug('%s: New HeatingThreshold: %s', this.name, data.value);
                    }
                    else {
                        this.log.debug('%s: Missing HeatingThreshold JSON Values', this.name);
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
            this.dhwThermostatService,
            this.waterFlowService
        ];
    }
}
exports.BuderusDhw = BuderusDhw;
//# sourceMappingURL=buderus-dhw.js.map