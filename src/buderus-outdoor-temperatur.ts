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

export class BuderusOutdoorTemp implements AccessoryPlugin, apiValueDelegate {

  private readonly log: Logging;
  private readonly hap : HAP;
  name: string;

  private readonly informationService: Service;
  private readonly temperatureService : Service;
  private readonly buderusApi : Api;

  constructor(hap: HAP, log: Logging, name: string, buderusApi : Api, refreshInterval : number) {
    this.log = log;
    this.hap = hap;
    this.name = name;
    this.buderusApi = buderusApi;
    this.temperatureService = new this.hap.Service.TemperatureSensor(name);
    this.temperatureService.getCharacteristic(this.hap.Characteristic.CurrentTemperature)
        .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
          buderusApi.enqueueGet('/system/sensors/temperatures/outdoor_t1').then((data)=>{
            if (data.value && data.type && data.type == 'floatValue') {
              callback(undefined,data.value);
              log.debug('New Outdoor Temp: %s', data.value);
            }else{
              callback(new Error("Missing JSON Values"));
              log.debug('Missing JSON Values');
            }
          }).catch((error)=>{
            callback(error);
          })
        });


    this.informationService = new this.hap.Service.AccessoryInformation()
        .setCharacteristic(this.hap.Characteristic.Manufacturer, buderusApi.manufacturer)
        .setCharacteristic(this.hap.Characteristic.Model, buderusApi.model)
        .setCharacteristic(this.hap.Characteristic.FirmwareRevision,buderusApi.firmwareRevision)
        .setCharacteristic(this.hap.Characteristic.SerialNumber,buderusApi.serialNumber)

    log.info("%s created!", name);

    this.buderusApi.registerValueListener('/system/sensors/temperatures/outdoor_t1',refreshInterval,this);
  }

  identify(): void {
    this.log("Identify!");
  }

  hasNewValue(data : JsonResponse) {
    if (data && data.id) {
      this.log.debug('New Value arrived for: %s',data.id);
          if ((data.value || data.value==0) && data.id == '/system/sensors/temperatures/outdoor_t1' && data.type && data.type == 'floatValue') {
            this.temperatureService.updateCharacteristic(this.hap.Characteristic.CurrentTemperature, data.value);
            this.log.debug('New DHW CurrentTemperature: %s', data.value);
          }else{
            this.log.debug('Missing JSON Values');
          }
    }
  }

  hadNewValueError(error: any) {
    this.log.debug(error);
  }

  getServices(): Service[] {
    return [
      this.informationService,
      this.temperatureService
    ];
  }

}
