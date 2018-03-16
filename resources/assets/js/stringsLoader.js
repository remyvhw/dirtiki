window.axios = require('axios');

const stringsUrl = "/strings";

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
        return new Promise((resolve, reject) => {
            caches.open(this.cacheNamePrefix + this.cacheVersionSuffix).then((cache) => {

                cache.match(stringsUrl).then(function (response) {
                    return response.json();
                }).then((response) => {
                    if (!response) {
                        reject();
                    }
                    resolve(response);
                }, () => {
                    reject();
                });

            });
        });
    }

    cleanupStringsCache() {
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName.startsWith(this.cacheNamePrefix) && !cacheName.endsWith(this.cacheVersionSuffix)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        });
    }

    fetchStrings() {

        if (this.canUseCache) {
            return new Promise((resolve, reject) => {
                caches.open(this.cacheNamePrefix + this.cacheVersionSuffix).then((cache) => {
                    cache.add(stringsUrl).then(() => {
                        cache.match(stringsUrl).then((response) => {
                            return response.json();
                        }).then((response) => {
                            if (!response) {
                                reject();
                            }
                            this.cleanupStringsCache();
                            resolve(response);
                        }, () => {
                            reject();
                        });
                    });
                });
            });
        } else {
            return new Promise((resolve, reject) => {
                axios.get("/strings").then(({ data }) => {
                    resolve(data);
                }, () => {
                    alert("Localizations cannot be loaded.");
                    reject();
                });
            });
        }


    }


    get loadStrings() {
        return new Promise((resolve, reject) => {
            if (this.canUseCache) {
                this.retrieveCachedStrings().then((strings) => {
                    resolve(strings);
                }, () => {
                    this.fetchStrings().then((strings) => {
                        resolve(strings);
                    })
                });
            } else {
                this.fetchStrings().then((strings) => {
                    resolve(strings);
                });

            }
        });
    }

};