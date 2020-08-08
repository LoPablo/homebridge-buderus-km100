import {AccessoryPlugin, API, HAP, Logging, PlatformConfig, StaticPlatformPlugin,} from "homebridge";
import {BuderusOutdoorTemp} from "./burderus-outdoor-temperatur";
import {ApiWrapper} from "./apiWrapper";

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

  private buderusApi? : ApiWrapper;
  constructor(log: Logging, config: PlatformConfig, api: API) {
    this.log = log;
    this.config = config;
    log.info("Burderus KM100 Gateway - Plattform");
    log.info("Version 0.1 PHartmann")
    this.accessoriesStore = new Array();
  }

  accessories(callback: (foundAccessories: AccessoryPlugin[]) => void): void {
    if (this.config.host){
      if (this.config.key){
        this.buderusApi = new ApiWrapper(this.log,this.config.host,this.config.key);
        this.buderusApi.initApi().then(()=>{
          this.accessoriesStore.push(new BuderusOutdoorTemp(hap, this.log, "Außentemperatur",this.buderusApi!))
          callback(this.accessoriesStore);
        }).catch(()=>{
          this.log.error("Error initializing Buderus Api")
        });
      } else{
        this.log.error("Key is required in config.")
      }
    } else {
      this.log.error("Host is required in config.")
    }

  }

}
