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

import {Km200} from "km200-api";
import {ApiWrapper} from "./apiWrapper";
import {error} from "util";

export class BuderusOutdoorTemp implements AccessoryPlugin {

  private readonly log: Logging;
  name: string;

  private readonly informationService: Service;
  private readonly temperatureService : Service;
  private readonly buderusApi : ApiWrapper;

  constructor(hap: HAP, log: Logging, name: string, buderusApi : ApiWrapper) {
    this.log = log;
    this.name = name;
    this.buderusApi = buderusApi;
    this.temperatureService = new hap.Service.TemperatureSensor(name);
    this.temperatureService.getCharacteristic(hap.Characteristic.CurrentTemperature)
        .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
          buderusApi.request('/system/sensors/temperatures/outdoor_t1').then((data)=>{
            log.debug('New Outdoor Temp: %s', data);
            callback(undefined,data);
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
