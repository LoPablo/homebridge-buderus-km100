"use strict";
const burderus_outdoor_temperatur_1 = require("./burderus-outdoor-temperatur");
const apiWrapper_1 = require("./apiWrapper");
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
            if (this.config.key) {
                this.buderusApi = new apiWrapper_1.ApiWrapper(this.log, this.config.host, this.config.key);
                this.buderusApi.initApi().then(() => {
                    this.accessoriesStore.push(new burderus_outdoor_temperatur_1.BuderusOutdoorTemp(hap, this.log, "Außentemperatur", this.buderusApi));
                    callback(this.accessoriesStore);
                }).catch(() => {
                    this.log.error("Error initializing Buderus Api");
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