"use strict";
const burderus_outdoor_temperatur_1 = require("./burderus-outdoor-temperatur");
const api_1 = require("./api");
const PLATFORM_NAME = "BuderusKM100Gateway";
let hap;
class BuderusKM100Gateway {
    constructor(log, config, api) {
        this.log = log;
        this.config = config;
        log.info("Burderus KM100 Gateway - Plattform");
        log.info("Version 0.1 PHartmann");
        this.accessoriesStore = new Array();
    }
    accessories(callback) {
        if (this.config.host) {
            if (this.config.gatewaypassword && this.config.userpassword) {
                this.buderusApi = new api_1.Api(this.log, this.config.host, this.config.gatewaypassword, this.config.userpassword);
                this.buderusApi.initApi().then(() => {
                    this.accessoriesStore.push(new burderus_outdoor_temperatur_1.BuderusOutdoorTemp(hap, this.log, "Außentemperatur", this.buderusApi));
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