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

export class BuderusOutdoorTemp implements AccessoryPlugin {

  private readonly log: Logging;
  name: string;

  private readonly informationService: Service;
  private readonly temperatureService : Service;
  private readonly buderusApi : Api;

  constructor(hap: HAP, log: Logging, name: string, buderusApi : Api) {
    this.log = log;
    this.name = name;
    this.buderusApi = buderusApi;
    this.temperatureService = new hap.Service.TemperatureSensor(name);
    this.temperatureService.getCharacteristic(hap.Characteristic.CurrentTemperature)
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


    this.informationService = new hap.Service.AccessoryInformation()
        .setCharacteristic(hap.Characteristic.Manufacturer, buderusApi.manufacturer)
        .setCharacteristic(hap.Characteristic.Model, buderusApi.model)
        .setCharacteristic(hap.Characteristic.FirmwareRevision,buderusApi.firmwareRevision)
        .setCharacteristic(hap.Characteristic.SerialNumber,buderusApi.serialNumber)

    log.info("%s created!", name);
  }

  identify(): void {
    this.log("Identify!");
  }

  getServices(): Service[] {
    return [
      this.informationService,
      this.temperatureService
    ];
  }

}
