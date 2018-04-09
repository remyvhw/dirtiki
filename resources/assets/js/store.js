import Vue from 'vue'
import Vuex from 'vuex'

/**
 * We add vuex to vue. We'll mostly use Vuex in this application
 * as a global state and localized strings store.
 */
Vue.use(Vuex)

/**
 * Initialize global store.
 */
export default new Vuex.Store({
    state: {
        maps: {
            provider: null
        },
        captcha: {
            provider: null
        },
        strings: {},
        parsed: {
            headers: {}
        }
    },
    mutations: {
        setMapsProvider(state, provider) {
            state.maps.provider = provider;
        },
        setLocalizedStrings(state, strings) {
            state.strings = strings;
        },
        setParsedHeader(state, payload) {
            Vue.set(state.parsed.headers, payload.key, payload.header);
        },
        unsetParsedHeader(state, key, header) {
            Vue.delete(state.parsed.headers, key);
        },
        setCaptchaProvider(state, provider) {
            state.captcha.provider = provider;
        }
    }
});