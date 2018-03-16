window.axios = require('axios');

/**
 * Initialize global store.
 */
export default class {
    constructor(language) {
        this.locale = language ? language : document.documentElement.lang;
        let scriptName = document.currentScript ? document.currentScript.src : null;

        if (scriptName) {
            const scriptUrl = new URL(scriptName);
            this.cacheVersionSuffix = scriptUrl.searchParams.get("id");
            this.cacheNamePrefix = "strings-" + this.locale + "-";
        } else {
            this.cacheVersionSuffix = null;
        }

        this.canUseCache = 'caches' in window && this.cacheVersionSuffix;

    }

    retrieveCachedStrings(callback) {
        throw "No strings cached";
    }

    fetchStrings(callback) {

        axios.get("/strings").then(({ data }) => {
            callback(data);
        }, () => {
            alert("Localizations cannot be loaded.");
        });

    }


    get loadStrings() {
        return new Promise((resolve, reject) => {
            if (this.canUseCache) {
                try {
                    this.retrieveCachedStrings((strings) => {
                        resolve(strings);
                    });
                } catch (e) {
                    this.fetchStrings((strings) => {
                        resolve(strings);
                    })
                }
            } else {
                this.fetchStrings((strings) => {
                    resolve(strings);
                })
            }
        });
    }

};