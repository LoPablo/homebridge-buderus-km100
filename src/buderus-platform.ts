import {AccessoryPlugin, API, HAP, Logging, PlatformConfig, StaticPlatformPlugin,} from "homebridge";
import {BuderusOutdoorTemp} from "./buderus-outdoor-temperatur";
import {Api} from "./api";
import {BuderusDhwHeaterCooler} from "./buderus-dhw-heater-cooler";

const PLATFORM_NAME = "BuderusKM100Gateway";

let hap: HAP;

export = (api: API) => {
  hap = api.hap;
  api.registerPlatform(PLATFORM_NAME, BuderusKM100Gateway);
};

class BuderusKM100Gateway implements StaticPlatformPlugin {

  private readonly log: Logging;
  private readonly accessoriesStore : AccessoryPlugin[];
  private readonly config : PlatformConfig;

  private buderusApi? : Api;
  constructor(log: Logging, config: PlatformConfig, api: API) {
    this.log = log;
    this.config = config;
    log.info("Burderus KM100 Gateway - Plattform");
    log.info("Version 0.1 PHartmann")
    this.accessoriesStore = new Array();
  }

  accessories(callback: (foundAccessories: AccessoryPlugin[]) => void): void {
    if (this.config.host){
      if (this.config.gatewaypassword && this.config.userpassword){
        this.buderusApi = new Api(this.log, this.config.host,this.config.gatewaypassword, this.config.userpassword);
        this.buderusApi.initApi().then(()=>{
          this.accessoriesStore.push(new BuderusOutdoorTemp(hap, this.log, "Außentemperatur",this.buderusApi!,(this.config.pollingInterval * 3) || 30000));
          this.accessoriesStore.push(new BuderusDhwHeaterCooler(hap, this.log, "Heißwasser",this.buderusApi!, this.config.pollingInterval || 10000));
          callback(this.accessoriesStore);
        }).catch((error)=>{
          this.log.error("Error initializing Buderus Api: %s", error)
          callback([]);
        });
      } else{
        this.log.error("Key is required in config.")
        callback([]);
      }
    } else {
      this.log.error("Host is required in config.")
      callback([]);
    }

  }

}
