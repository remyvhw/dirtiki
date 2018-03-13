/*
 ______    ________  ______   _________  ________  ___   ___   ________     
/_____/\  /_______/\/_____/\ /________/\/_______/\/___/\/__/\ /_______/\    
\:::_ \ \ \__.::._\/\:::_ \ \\__.::.__\/\__.::._\/\::.\ \\ \ \\__.::._\/    
 \:\ \ \ \   \::\ \  \:(_) ) )_ \::\ \     \::\ \  \:: \/_) \ \  \::\ \     
  \:\ \ \ \  _\::\ \__\: __ `\ \ \::\ \    _\::\ \__\:. __  ( (  _\::\ \__  
   \:\/.:| |/__\::\__/\\ \ `\ \ \ \::\ \  /__\::\__/\\: \ )  \ \/__\::\__/\ 
    \____/_/\________\/ \_\/ \_\/  \__\/  \________\/ \__\/\__\/\________\/ 
                                                                            
 */

/**
 * First we will load all of this project's JavaScript dependencies which
 * includes Vue and other libraries. It is a great starting point when
 * building robust, powerful web applications using Vue and Laravel.
 */

require('./bootstrap');

window.Vue = require('vue');
import Vuex from 'vuex'

/**
 * We add vuex to vue. We'll mostly use Vuex in this application
 * as a global state and localized strings store.
 */
Vue.use(Vuex)

/**
 * Initialize global store.
 */
const store = new Vuex.Store({
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
})

/**
 * Next, registrer Axios on the Vue object so we can just call this.$http like
 * we did with vue-resource. Idiot proofing future debugging.
 */
Vue.prototype.$http = window.axios;

Vue.component('dirtiki-input', require('./components/dirtiki-input.vue'));
Vue.component('loading-indicator', require('./components/loading-indicator.vue'));
Vue.component('folding-panel', require('./components/folding-panel.vue'));
Vue.component('basic-paginator', require('./components/basic-paginator.vue'));

const app = new Vue({
    el: '#app',
    store,
    data: {
        query: ""
    },
    components: {
        searchModal: require("./components/search-modal.vue"),
        pageViewer: require("./components/page-viewer.vue"),
        pageEditor: require("./components/page-editor.vue"),
        pageCreator: require("./components/page-creator.vue"),
        pageHistory: require("./components/page-history.vue")
    }
});


/**
 * Maps handling
 */


/**
 * Handle maps callback
 */
window.initGoogleMap = function initGoogleMap() {
    store.commit("setMapsProvider", "google");
}

if (typeof mapboxgl !== "undefined") {
    mapboxgl.accessToken = document.getElementById("dirtiki-mapbox-key").content;
    store.commit("setMapsProvider", "mapbox");
}

