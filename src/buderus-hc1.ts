import {
  AccessoryPlugin,
  CharacteristicEventTypes,
  CharacteristicGetCallback,
  CharacteristicSetCallback,
  CharacteristicValue,
  HAP,
  Logging,
  Service
} from "homebridge";

import {Api} from "./api";
import apiValueDelegate from "./apiValueDelegate";
import {JsonResponse} from "./jsonResponse";

export class BuderusHC1 implements AccessoryPlugin, apiValueDelegate {

  private readonly log: Logging;
  private readonly hap : HAP;
  name: string;

  private readonly informationService: Service;
  private readonly hc1ThermostatService : Service;
  private readonly hc1Pump : Service;
  private readonly buderusApi : Api;

  constructor(hap: HAP, log: Logging, name: string, buderusApi : Api, refreshInterval : number) {
    this.log = log;
    this.hap = hap;
    this.name = name;
    this.buderusApi = buderusApi;
    this.hc1ThermostatService = new hap.Service.Thermostat(name + ' Einstelungen');
    this.hc1Pump = new hap.Service.MotionSensor(name + ' Pumpe');

    this.hc1Pump.getCharacteristic(this.hap.Characteristic.ContactSensorState)
        .on('get', this.handleMotionDetectedGet.bind(this));

    this.hc1ThermostatService.getCharacteristic(this.hap.Characteristic.CurrentHeatingCoolingState)
        .on('get', this.handleCurrentHeatingCoolingStateGet.bind(this));

    this.hc1ThermostatService.getCharacteristic(this.hap.Characteristic.TargetTemperature)
        .on('get', this.handleTargetTemperatureGet.bind(this))
        .on('set', this.handleTargetTemperatureSet.bind(this))

    this.hc1ThermostatService.getCharacteristic(this.hap.Characteristic.TargetTemperature).props.maxValue = 70;
    this.hc1ThermostatService.getCharacteristic(this.hap.Characteristic.TargetTemperature).props.minValue = 0;

    this.hc1ThermostatService.getCharacteristic(this.hap.Characteristic.TargetHeatingCoolingState)
        .on('get', this.handleTargetHeatingCoolingStateGet.bind(this))
        .on('set', this.handleTargetHeatingCoolingStateSet.bind(this))
        .props.validValues=[1];

    this.hc1ThermostatService.getCharacteristic(this.hap.Characteristic.CurrentTemperature)
        .on('get', this.handleCurrentTemperatureGet.bind(this));


    this.informationService = new this.hap.Service.AccessoryInformation()
        .setCharacteristic(this.hap.Characteristic.Manufacturer, buderusApi.manufacturer)
        .setCharacteristic(this.hap.Characteristic.Model, buderusApi.model)
        .setCharacteristic(this.hap.Characteristic.FirmwareRevision,buderusApi.firmwareRevision)
        .setCharacteristic(this.hap.Characteristic.SerialNumber,buderusApi.serialNumber);

    log.info("%s created!", name);

    this.buderusApi.registerValueListener('/heatingCircuits/hc1/actualSupplyTemperature',refreshInterval,this);
    this.buderusApi.registerValueListener('/heatSources/actualCHPower',refreshInterval,this);
    this.buderusApi.registerValueListener('/heatingCircuits/hc1/supplyTemperatureSetpoint',refreshInterval,this);
    this.buderusApi.registerValueListener('/heatingCircuits/hc1/pumpModulation',refreshInterval,this);
    this.buderusApi.registerValueListener('/heatingCircuits/hc1/operationMode',refreshInterval,this);
  }

  handleMotionDetectedGet(callback : CharacteristicGetCallback) {
    this.log.debug('%s: Triggered GET MotionDetected', this.name);
    this.buderusApi.enqueueGet('/heatingCircuits/hc1/pumpModulation').then((data)=>{
      if ((data.value || data.value==0) && data.type && data.type == 'floatValue') {
        if (data.value > 0){
          callback(undefined,1);
        } else {
          callback(undefined,0);
        }
        this.log.debug('%s: New MotionDetected %s', this.name, data.value);
      }else{
        callback(new Error( this.name + ': Missing MotionDetected JSON Values'));
        this.log.debug('%s: Missing MotionDetected JSON Values', this.name);
      }
    }).catch((error)=>{
      this.log.debug('%s: Active request error MotionDetected', this.name);
      callback(error);
    })
  }

  handleCurrentHeatingCoolingStateGet(callback : CharacteristicGetCallback) {
    this.log.debug('%s: Triggered GET CurrentHeatingCoolingState', this.name);
    this.buderusApi.enqueueGet('/heatSources/actualCHPower').then((data)=>{
      if ((data.value || data.value==0) && data.type && data.type == 'floatValue') {
        if (data.value > 0){
          callback(undefined,1);
        } else {
          callback(undefined,0);
        }
        this.log.debug('%s: New Heater Cooler Power: %s', this.name, data.value);
      }else{
        callback(new Error( this.name + ': Missing HeatingCoolingState JSON Values'));
        this.log.debug('%s: Missing HeatingCoolingState JSON Values', this.name);
      }
    }).catch((error)=>{
      callback(error);
    })
  }

  handleTargetHeatingCoolingStateGet(callback : CharacteristicGetCallback) {
    this.log.debug('%s: Triggered GET TargetHeatingCoolingState', this.name);
    this.buderusApi.enqueueGet('/heatingCircuits/hc1/operationMode').then((data)=>{
      if (data.value && data.type && data.type == 'stringValue') {
        if (data.value ==  'auto'){
          callback(undefined,1);
        } else if (data.value == 'manual'){
          callback(undefined,0);
        }
        this.log.debug('%s: New TargetHeatingCoolingState: %s',this.name, data.value);
      }else{
        callback(new Error(this.name + ': Missing TargetHeatingCoolingState JSON Values'));
        this.log.debug('%s: Missing TargetHeatingCoolingState JSON Values', this.name);
      }
    }).catch((error)=>{
      this.log.debug('%s: Active request error TargetHeatingCoolingState', this.name);
      callback(error);
    })
  }

  handleTargetHeatingCoolingStateSet(value : CharacteristicValue, callback : CharacteristicSetCallback) {
    this.log.debug('%s: Triggered SET TargetHeatingCoolingState to %s', this.name, value.toString());
    callback(null);
  }

  handleCurrentTemperatureGet(callback : CharacteristicGetCallback) {
    this.log.debug('%s: Triggered GET CurrentTemperature', this.name);
    this.buderusApi.enqueueGet('/heatingCircuits/hc1/actualSupplyTemperature').then((data)=>{
      if ((data.value || data.value==0) && data.type && data.type == 'floatValue') {
        callback(undefined,data.value);
        this.log.debug('%s: New  CurrentTemperature: %s',this.name, data.value);
      }else{
        callback(new Error(this.name + ': Missing CurrentTemperature JSON Values'));
        this.log.debug('%s: Missing CurrentTemperature JSON Values', this.name);
      }
    }).catch((error)=>{
      callback(error);
    })
  }

  handleTargetTemperatureGet(callback : CharacteristicGetCallback) {
    this.log.debug('%s: Triggered GET HeatingThreshold', this.name);
     this.buderusApi.enqueueGet('/heatingCircuits/hc1/supplyTemperatureSetpoint').then((data)=>{
       if ((data.value || data.value==0) && data.type && data.type == 'floatValue') {
         callback(undefined,data.value);
         this.log.debug('%s: New HeatingThreshold: %s', this.name, data.value);
       }else{
         callback(new Error(this.name + ': Missing HeatingThreshold JSON Values'));
         this.log.debug('%s: Missing Heating Threshold JSON Values', this.name);
       }
     }).catch((error)=>{
       callback(error);
     });
  }

  handleTargetTemperatureSet(value : CharacteristicValue, callback : CharacteristicSetCallback) {
    this.log.debug('%s: Triggered SET HeatingThreshold with %s', this.name, value.toString());
    callback(null);
  }

  identify(): void {
    this.log('%s: Identify!', this.name);
  }

  hasNewValue(data : JsonResponse) {
    if (data && data.id) {
      this.log.debug('%s: New Value arrived for: %s',this.name, data.id);
      switch (data.id) {
        case '/heatingCircuits/hc1/actualSupplyTemperature':
          if ((data.value || data.value==0) && data.type && data.type == 'floatValue') {
            this.hc1ThermostatService.updateCharacteristic(this.hap.Characteristic.CurrentTemperature, data.value);
            this.log.debug('%s: New CurrentTemperature: %s', this.name, data.value);
          }else{
            this.log.debug('%s: Missing CurrentTemperature JSON Values', this.name);
          }
          break;

        case '/heatSources/actualCHPower':
          if ((data.value || data.value==0) && data.type && data.type == 'floatValue') {
            if (data.value > 0){
              this.hc1ThermostatService.updateCharacteristic(this.hap.Characteristic.CurrentHeatingCoolingState, 1);
              this.log.debug('%s: New Heater Cooler Power: %s', this.name, data.value);
            } else {
              this.hc1ThermostatService.updateCharacteristic(this.hap.Characteristic.CurrentHeatingCoolingState, 0);
              this.log.debug('%s: New Heater Cooler Power: %s', this.name, data.value);
            }
          }else{
            this.log.debug('%s: Missing HeatingCoolingState JSON Values', this.name);
          }
          break;

        case '/heatingCircuits/hc1/pumpModulation':
          if ((data.value || data.value==0) && data.type && data.type == 'floatValue') {
            if (data.value > 0) {
              this.hc1Pump.updateCharacteristic(this.hap.Characteristic.MotionDetected, 1);
              this.log.debug('%s: New MotionDetected: %s', this.name, data.value);
            } else {
              this.hc1Pump.updateCharacteristic(this.hap.Characteristic.MotionDetected, 0);
              this.log.debug('%s: New MotionDetected %s', this.name, data.value);
            }
          }
          break;

        case '/heatingCircuits/hc1/operationMode':
          if (data.value && data.type && data.type == 'stringValue') {
              if (data.value ==  'auto'){
                this.hc1ThermostatService.updateCharacteristic(this.hap.Characteristic.TargetHeatingCoolingState, 1);
              } else if (data.value == 'manual'){
                this.hc1ThermostatService.updateCharacteristic(this.hap.Characteristic.TargetHeatingCoolingState, 0);
              }
              this.log.debug('%s: New TargetHeatingCoolingState: %s',this.name, data.value);
          }else{
            this.log.debug('%s: Missing TargetHeatingCoolingState JSON Values', this.name);
          }
          break;

        case '/heatingCircuits/hc1/supplyTemperatureSetpoint':
          if ((data.value || data.value==0) && data.type && data.type == 'floatValue') {
            this.hc1ThermostatService.updateCharacteristic(this.hap.Characteristic.HeatingThresholdTemperature, data.value);
            this.log.debug('%s: New HeatingThreshold: %s', this.name, data.value);
          }else{
            this.log.debug('%s: Missing HeatingThreshold JSON Values', this.name);
          }
          break;

      }
    }
  };

  hadNewValueError(error: any) {
    this.log.debug(error);
  }

  getServices(): Service[] {
    return [
      this.informationService,
      this.hc1ThermostatService,
      this.hc1Pump
    ];
  }

}
