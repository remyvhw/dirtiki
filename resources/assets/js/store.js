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
        setParsedHeaders(state, key, header) {
            Vue.set(state.parsed.headers, key, header);
        }
    }
});