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

/**
 * Next, registrer Axios on the Vue object so we can just call this.$http like
 * we did with vue-resource. Idiot proofing future debugging.
 */
Vue.prototype.$http = axios;



Vue.component('dirtiki-input', require('./components/dirtiki-input.vue'));

const app = new Vue({
    el: '#app',
    data() {
        return {
            myVar: "This is my var",
        }
    }
});
