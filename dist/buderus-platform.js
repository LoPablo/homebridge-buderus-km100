"use strict";
const buderus_outdoor_temperatur_1 = require("./buderus-outdoor-temperatur");
const api_1 = require("./api");
const buderus_dhw_1 = require("./buderus-dhw");
const buderus_hc1_1 = require("./buderus-hc1");
const PLATFORM_NAME = "BuderusKM100Gateway";
let hap;
class BuderusKM100Gateway {
    constructor(log, config, api) {
        this.log = log;
        this.config = config;
        log.info("Burderus KM100 Gateway - Plattform");
        log.info("Version 0.3 PHartmann");
        this.accessoriesStore = new Array();
    }
    accessories(callback) {
        if (this.config.host) {
            if (this.config.gatewaypassword && this.config.userpassword) {
                this.buderusApi = new api_1.Api(this.log, this.config.host, this.config.gatewaypassword, this.config.userpassword);
                this.buderusApi.initApi().then(() => {
                    this.accessoriesStore.push(new buderus_outdoor_temperatur_1.BuderusOutdoorTemp(hap, this.log, "Außentemperatur", this.buderusApi, (this.config.pollingInterval * 3) || 30000));
                    this.accessoriesStore.push(new buderus_dhw_1.BuderusDhw(hap, this.log, "Heißwasser", this.buderusApi, this.config.pollingInterval || 10000));
                    this.accessoriesStore.push(new buderus_hc1_1.BuderusHC1(hap, this.log, "Heizkreislauf", this.buderusApi, this.config.pollingInterval || 10000));
                    this.buderusApi.enqueueGet('/heatingCircuits/hc1/operationMode').then((data) => {
                        if (data) {
                            console.log(data);
                        }
                    }).catch((error) => {
                        this.log.debug('Active request error');
                        callback(error);
                    });
                    callback(this.accessoriesStore);
                }).catch((error) => {
                    this.log.error("Error initializing Buderus Api: %s", error);
                    callback([]);
                });
            }
            else {
                this.log.error("Key is required in config.");
                callback([]);
            }
        }
        else {
            this.log.error("Host is required in config.");
            callback([]);
        }
    }
}
module.exports = (api) => {
    hap = api.hap;
    api.registerPlatform(PLATFORM_NAME, BuderusKM100Gateway);
};
//# sourceMappingURL=buderus-platform.js.map