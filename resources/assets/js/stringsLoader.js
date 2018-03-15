/**
 * Initialize global store.
 */
export default class {
    constructor(language) {
        this.locale = language ? language : document.documentElement.lang;
        this.canUseCache = 'caches' in window;
    }

    retrieveCachedStrings(callback) {
        throw "No strings cached";
    }

    fetchStrings(callback) {
        callback({
            foo: "bar"
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