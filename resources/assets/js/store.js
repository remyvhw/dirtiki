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
        }
    },
    mutations: {
        setMapsProvider(state, provider) {
            state.maps.provider = provider;
        }
    }
});