webpackJsonp([1],[
/* 0 */
/***/ (function(module, exports) {

/* globals __VUE_SSR_CONTEXT__ */

// IMPORTANT: Do NOT use ES2015 features in this file.
// This module is a runtime utility for cleaner component module output and will
// be included in the final webpack user bundle.

module.exports = function normalizeComponent (
  rawScriptExports,
  compiledTemplate,
  functionalTemplate,
  injectStyles,
  scopeId,
  moduleIdentifier /* server only */
) {
  var esModule
  var scriptExports = rawScriptExports = rawScriptExports || {}

  // ES6 modules interop
  var type = typeof rawScriptExports.default
  if (type === 'object' || type === 'function') {
    esModule = rawScriptExports
    scriptExports = rawScriptExports.default
  }

  // Vue.extend constructor export interop
  var options = typeof scriptExports === 'function'
    ? scriptExports.options
    : scriptExports

  // render functions
  if (compiledTemplate) {
    options.render = compiledTemplate.render
    options.staticRenderFns = compiledTemplate.staticRenderFns
    options._compiled = true
  }

  // functional template
  if (functionalTemplate) {
    options.functional = true
  }

  // scopedId
  if (scopeId) {
    options._scopeId = scopeId
  }

  var hook
  if (moduleIdentifier) { // server build
    hook = function (context) {
      // 2.3 injection
      context =
        context || // cached call
        (this.$vnode && this.$vnode.ssrContext) || // stateful
        (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional
      // 2.2 with runInNewContext: true
      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__
      }
      // inject component styles
      if (injectStyles) {
        injectStyles.call(this, context)
      }
      // register component module identifier for async chunk inferrence
      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier)
      }
    }
    // used by ssr in case component is cached and beforeCreate
    // never gets called
    options._ssrRegister = hook
  } else if (injectStyles) {
    hook = injectStyles
  }

  if (hook) {
    var functional = options.functional
    var existing = functional
      ? options.render
      : options.beforeCreate

    if (!functional) {
      // inject component registration as beforeCreate hook
      options.beforeCreate = existing
        ? [].concat(existing, hook)
        : [hook]
    } else {
      // for template-only hot-reload because in that case the render fn doesn't
      // go through the normalizer
      options._injectStyles = hook
      // register for functioal component in vue file
      options.render = function renderWithStyleInjection (h, context) {
        hook.call(context)
        return existing(h, context)
      }
    }
  }

  return {
    esModule: esModule,
    exports: scriptExports,
    options: options
  }
}


/***/ }),
/* 1 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
  Modified by Evan You @yyx990803
*/

var hasDocument = typeof document !== 'undefined'

if (typeof DEBUG !== 'undefined' && DEBUG) {
  if (!hasDocument) {
    throw new Error(
    'vue-style-loader cannot be used in a non-browser environment. ' +
    "Use { target: 'node' } in your Webpack config to indicate a server-rendering environment."
  ) }
}

var listToStyles = __webpack_require__(161)

/*
type StyleObject = {
  id: number;
  parts: Array<StyleObjectPart>
}

type StyleObjectPart = {
  css: string;
  media: string;
  sourceMap: ?string
}
*/

var stylesInDom = {/*
  [id: number]: {
    id: number,
    refs: number,
    parts: Array<(obj?: StyleObjectPart) => void>
  }
*/}

var head = hasDocument && (document.head || document.getElementsByTagName('head')[0])
var singletonElement = null
var singletonCounter = 0
var isProduction = false
var noop = function () {}
var options = null
var ssrIdKey = 'data-vue-ssr-id'

// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
// tags it will allow on a page
var isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\b/.test(navigator.userAgent.toLowerCase())

module.exports = function (parentId, list, _isProduction, _options) {
  isProduction = _isProduction

  options = _options || {}

  var styles = listToStyles(parentId, list)
  addStylesToDom(styles)

  return function update (newList) {
    var mayRemove = []
    for (var i = 0; i < styles.length; i++) {
      var item = styles[i]
      var domStyle = stylesInDom[item.id]
      domStyle.refs--
      mayRemove.push(domStyle)
    }
    if (newList) {
      styles = listToStyles(parentId, newList)
      addStylesToDom(styles)
    } else {
      styles = []
    }
    for (var i = 0; i < mayRemove.length; i++) {
      var domStyle = mayRemove[i]
      if (domStyle.refs === 0) {
        for (var j = 0; j < domStyle.parts.length; j++) {
          domStyle.parts[j]()
        }
        delete stylesInDom[domStyle.id]
      }
    }
  }
}

function addStylesToDom (styles /* Array<StyleObject> */) {
  for (var i = 0; i < styles.length; i++) {
    var item = styles[i]
    var domStyle = stylesInDom[item.id]
    if (domStyle) {
      domStyle.refs++
      for (var j = 0; j < domStyle.parts.length; j++) {
        domStyle.parts[j](item.parts[j])
      }
      for (; j < item.parts.length; j++) {
        domStyle.parts.push(addStyle(item.parts[j]))
      }
      if (domStyle.parts.length > item.parts.length) {
        domStyle.parts.length = item.parts.length
      }
    } else {
      var parts = []
      for (var j = 0; j < item.parts.length; j++) {
        parts.push(addStyle(item.parts[j]))
      }
      stylesInDom[item.id] = { id: item.id, refs: 1, parts: parts }
    }
  }
}

function createStyleElement () {
  var styleElement = document.createElement('style')
  styleElement.type = 'text/css'
  head.appendChild(styleElement)
  return styleElement
}

function addStyle (obj /* StyleObjectPart */) {
  var update, remove
  var styleElement = document.querySelector('style[' + ssrIdKey + '~="' + obj.id + '"]')

  if (styleElement) {
    if (isProduction) {
      // has SSR styles and in production mode.
      // simply do nothing.
      return noop
    } else {
      // has SSR styles but in dev mode.
      // for some reason Chrome can't handle source map in server-rendered
      // style tags - source maps in <style> only works if the style tag is
      // created and inserted dynamically. So we remove the server rendered
      // styles and inject new ones.
      styleElement.parentNode.removeChild(styleElement)
    }
  }

  if (isOldIE) {
    // use singleton mode for IE9.
    var styleIndex = singletonCounter++
    styleElement = singletonElement || (singletonElement = createStyleElement())
    update = applyToSingletonTag.bind(null, styleElement, styleIndex, false)
    remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true)
  } else {
    // use multi-style-tag mode in all other cases
    styleElement = createStyleElement()
    update = applyToTag.bind(null, styleElement)
    remove = function () {
      styleElement.parentNode.removeChild(styleElement)
    }
  }

  update(obj)

  return function updateStyle (newObj /* StyleObjectPart */) {
    if (newObj) {
      if (newObj.css === obj.css &&
          newObj.media === obj.media &&
          newObj.sourceMap === obj.sourceMap) {
        return
      }
      update(obj = newObj)
    } else {
      remove()
    }
  }
}

var replaceText = (function () {
  var textStore = []

  return function (index, replacement) {
    textStore[index] = replacement
    return textStore.filter(Boolean).join('\n')
  }
})()

function applyToSingletonTag (styleElement, index, remove, obj) {
  var css = remove ? '' : obj.css

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = replaceText(index, css)
  } else {
    var cssNode = document.createTextNode(css)
    var childNodes = styleElement.childNodes
    if (childNodes[index]) styleElement.removeChild(childNodes[index])
    if (childNodes.length) {
      styleElement.insertBefore(cssNode, childNodes[index])
    } else {
      styleElement.appendChild(cssNode)
    }
  }
}

function applyToTag (styleElement, obj) {
  var css = obj.css
  var media = obj.media
  var sourceMap = obj.sourceMap

  if (media) {
    styleElement.setAttribute('media', media)
  }
  if (options.ssrId) {
    styleElement.setAttribute(ssrIdKey, obj.id)
  }

  if (sourceMap) {
    // https://developer.chrome.com/devtools/docs/javascript-debugging
    // this makes source maps inside style tags work properly in Chrome
    css += '\n/*# sourceURL=' + sourceMap.sources[0] + ' */'
    // http://stackoverflow.com/a/26603875
    css += '\n/*# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + ' */'
  }

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild)
    }
    styleElement.appendChild(document.createTextNode(css))
  }
}


/***/ }),
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */,
/* 12 */,
/* 13 */,
/* 14 */,
/* 15 */,
/* 16 */,
/* 17 */,
/* 18 */,
/* 19 */,
/* 20 */,
/* 21 */,
/* 22 */,
/* 23 */,
/* 24 */,
/* 25 */,
/* 26 */,
/* 27 */,
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(216)
/* template */
var __vue_template__ = __webpack_require__(217)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/metadata-editor.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-17c95384", Component.options)
  } else {
    hotAPI.reload("data-v-17c95384", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(218)
}
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(220)
/* template */
var __vue_template__ = __webpack_require__(241)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-8aa2d09e"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/body-editor.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-8aa2d09e", Component.options)
  } else {
    hotAPI.reload("data-v-8aa2d09e", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(256)
/* template */
var __vue_template__ = __webpack_require__(257)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/history-metadata.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-c8785b42", Component.options)
  } else {
    hotAPI.reload("data-v-c8785b42", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 31 */,
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(33);
module.exports = __webpack_require__(274);


/***/ }),
/* 33 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__store__ = __webpack_require__(145);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__stringsLoader__ = __webpack_require__(149);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__marker__ = __webpack_require__(151);
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

__webpack_require__(34);




window.Vue = __webpack_require__(10);

/**
 * Next, registrer Axios on the Vue object so we can just call this.$http like
 * we did with vue-resource. Idiot proofing future debugging.
 */
Vue.prototype.$http = window.axios;

/**
 * Registrer `marker`, our marked.js customizer.
 */
window.marked = __webpack_require__(150);

var marker = new __WEBPACK_IMPORTED_MODULE_2__marker__["a" /* default */]();

Vue.component('dirtiki-input', __webpack_require__(152));
Vue.component('loading-indicator', __webpack_require__(155));
Vue.component('folding-panel', __webpack_require__(158));
Vue.component('basic-paginator', __webpack_require__(164));

var app = new Vue({
  el: '#app',
  store: __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */],
  data: {
    query: ""
  },
  mounted: function mounted() {
    var stringsLoader = new __WEBPACK_IMPORTED_MODULE_1__stringsLoader__["a" /* default */]();
    stringsLoader.loadStrings.then(function (strings) {
      __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].commit("setLocalizedStrings", strings);
    });
  },

  components: {
    searchModal: __webpack_require__(169),
    pageViewer: __webpack_require__(175),
    pageEditor: __webpack_require__(214),
    pageCreator: __webpack_require__(243),
    pageHistory: __webpack_require__(246),
    registerForm: __webpack_require__(279)
  }
});

/**
 * Maps handling
 */

/**
 * Handle maps callback
 */
window.initGoogleMap = function initGoogleMap() {
  __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].commit("setMapsProvider", "google");
};

if (typeof mapboxgl !== "undefined") {
  mapboxgl.accessToken = document.getElementById("dirtiki-mapbox-key").content;
  __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].commit("setMapsProvider", "mapbox");
}

window.recaptchaOnloadCallback = function () {
  __WEBPACK_IMPORTED_MODULE_0__store__["a" /* default */].commit("setCaptchaProvider", "recaptcha");
};

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

window.collect = __webpack_require__(11);

/**
 * We'll load the axios HTTP library which allows us to easily issue requests
 * to our Laravel back-end. This library automatically handles sending the
 * CSRF token as a header based on the value of the "XSRF" token cookie.
 */

window.axios = __webpack_require__(8);

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

/**
 * Next we will register the CSRF Token as a common header with Axios so that
 * all outgoing HTTP requests automatically have it attached. This is just
 * a simple convenience so we don't have to attach every token manually.
 */

var token = document.head.querySelector('meta[name="csrf-token"]');

if (token) {
  window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
} else {
  console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token');
}

/**
 * Echo exposes an expressive API for subscribing to channels and listening
 * for events that are broadcast by Laravel. Echo and event broadcasting
 * allows your team to easily build robust real-time web applications.
 */

// import Echo from 'laravel-echo'

// window.Pusher = require('pusher-js');

// window.Echo = new Echo({
//     broadcaster: 'pusher',
//     key: process.env.MIX_PUSHER_APP_KEY,
//     cluster: process.env.MIX_PUSHER_APP_CLUSTER,
//     encrypted: true
// });

/***/ }),
/* 35 */,
/* 36 */,
/* 37 */,
/* 38 */,
/* 39 */,
/* 40 */,
/* 41 */,
/* 42 */,
/* 43 */,
/* 44 */,
/* 45 */,
/* 46 */,
/* 47 */,
/* 48 */,
/* 49 */,
/* 50 */,
/* 51 */,
/* 52 */,
/* 53 */,
/* 54 */,
/* 55 */,
/* 56 */,
/* 57 */,
/* 58 */,
/* 59 */,
/* 60 */,
/* 61 */,
/* 62 */,
/* 63 */,
/* 64 */,
/* 65 */,
/* 66 */,
/* 67 */,
/* 68 */,
/* 69 */,
/* 70 */,
/* 71 */,
/* 72 */,
/* 73 */,
/* 74 */,
/* 75 */,
/* 76 */,
/* 77 */,
/* 78 */,
/* 79 */,
/* 80 */,
/* 81 */,
/* 82 */,
/* 83 */,
/* 84 */,
/* 85 */,
/* 86 */,
/* 87 */,
/* 88 */,
/* 89 */,
/* 90 */,
/* 91 */,
/* 92 */,
/* 93 */,
/* 94 */,
/* 95 */,
/* 96 */,
/* 97 */,
/* 98 */,
/* 99 */,
/* 100 */,
/* 101 */,
/* 102 */,
/* 103 */,
/* 104 */,
/* 105 */,
/* 106 */,
/* 107 */,
/* 108 */,
/* 109 */,
/* 110 */,
/* 111 */,
/* 112 */,
/* 113 */,
/* 114 */,
/* 115 */,
/* 116 */,
/* 117 */,
/* 118 */,
/* 119 */,
/* 120 */,
/* 121 */,
/* 122 */,
/* 123 */,
/* 124 */,
/* 125 */,
/* 126 */,
/* 127 */,
/* 128 */,
/* 129 */,
/* 130 */,
/* 131 */,
/* 132 */,
/* 133 */,
/* 134 */,
/* 135 */,
/* 136 */,
/* 137 */,
/* 138 */,
/* 139 */,
/* 140 */,
/* 141 */,
/* 142 */,
/* 143 */,
/* 144 */,
/* 145 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vuex__ = __webpack_require__(148);



/**
 * We add vuex to vue. We'll mostly use Vuex in this application
 * as a global state and localized strings store.
 */
__WEBPACK_IMPORTED_MODULE_0_vue___default.a.use(__WEBPACK_IMPORTED_MODULE_1_vuex__["a" /* default */]);

/**
 * Initialize global store.
 */
/* harmony default export */ __webpack_exports__["a"] = (new __WEBPACK_IMPORTED_MODULE_1_vuex__["a" /* default */].Store({
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
        setMapsProvider: function setMapsProvider(state, provider) {
            state.maps.provider = provider;
        },
        setLocalizedStrings: function setLocalizedStrings(state, strings) {
            state.strings = strings;
        },
        setParsedHeader: function setParsedHeader(state, payload) {
            __WEBPACK_IMPORTED_MODULE_0_vue___default.a.set(state.parsed.headers, payload.key, payload.header);
        },
        unsetParsedHeader: function unsetParsedHeader(state, key, header) {
            __WEBPACK_IMPORTED_MODULE_0_vue___default.a.delete(state.parsed.headers, key);
        },
        setCaptchaProvider: function setCaptchaProvider(state, provider) {
            state.captcha.provider = provider;
        }
    }
}));

/***/ }),
/* 146 */,
/* 147 */,
/* 148 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export Store */
/* unused harmony export install */
/* unused harmony export mapState */
/* unused harmony export mapMutations */
/* unused harmony export mapGetters */
/* unused harmony export mapActions */
/* unused harmony export createNamespacedHelpers */
/**
 * vuex v3.0.1
 * (c) 2017 Evan You
 * @license MIT
 */
var applyMixin = function (Vue) {
  var version = Number(Vue.version.split('.')[0]);

  if (version >= 2) {
    Vue.mixin({ beforeCreate: vuexInit });
  } else {
    // override init and inject vuex init procedure
    // for 1.x backwards compatibility.
    var _init = Vue.prototype._init;
    Vue.prototype._init = function (options) {
      if ( options === void 0 ) options = {};

      options.init = options.init
        ? [vuexInit].concat(options.init)
        : vuexInit;
      _init.call(this, options);
    };
  }

  /**
   * Vuex init hook, injected into each instances init hooks list.
   */

  function vuexInit () {
    var options = this.$options;
    // store injection
    if (options.store) {
      this.$store = typeof options.store === 'function'
        ? options.store()
        : options.store;
    } else if (options.parent && options.parent.$store) {
      this.$store = options.parent.$store;
    }
  }
};

var devtoolHook =
  typeof window !== 'undefined' &&
  window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

function devtoolPlugin (store) {
  if (!devtoolHook) { return }

  store._devtoolHook = devtoolHook;

  devtoolHook.emit('vuex:init', store);

  devtoolHook.on('vuex:travel-to-state', function (targetState) {
    store.replaceState(targetState);
  });

  store.subscribe(function (mutation, state) {
    devtoolHook.emit('vuex:mutation', mutation, state);
  });
}

/**
 * Get the first item that pass the test
 * by second argument function
 *
 * @param {Array} list
 * @param {Function} f
 * @return {*}
 */
/**
 * Deep copy the given object considering circular structure.
 * This function caches all nested objects and its copies.
 * If it detects circular structure, use cached copy to avoid infinite loop.
 *
 * @param {*} obj
 * @param {Array<Object>} cache
 * @return {*}
 */


/**
 * forEach for object
 */
function forEachValue (obj, fn) {
  Object.keys(obj).forEach(function (key) { return fn(obj[key], key); });
}

function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

function isPromise (val) {
  return val && typeof val.then === 'function'
}

function assert (condition, msg) {
  if (!condition) { throw new Error(("[vuex] " + msg)) }
}

var Module = function Module (rawModule, runtime) {
  this.runtime = runtime;
  this._children = Object.create(null);
  this._rawModule = rawModule;
  var rawState = rawModule.state;
  this.state = (typeof rawState === 'function' ? rawState() : rawState) || {};
};

var prototypeAccessors$1 = { namespaced: { configurable: true } };

prototypeAccessors$1.namespaced.get = function () {
  return !!this._rawModule.namespaced
};

Module.prototype.addChild = function addChild (key, module) {
  this._children[key] = module;
};

Module.prototype.removeChild = function removeChild (key) {
  delete this._children[key];
};

Module.prototype.getChild = function getChild (key) {
  return this._children[key]
};

Module.prototype.update = function update (rawModule) {
  this._rawModule.namespaced = rawModule.namespaced;
  if (rawModule.actions) {
    this._rawModule.actions = rawModule.actions;
  }
  if (rawModule.mutations) {
    this._rawModule.mutations = rawModule.mutations;
  }
  if (rawModule.getters) {
    this._rawModule.getters = rawModule.getters;
  }
};

Module.prototype.forEachChild = function forEachChild (fn) {
  forEachValue(this._children, fn);
};

Module.prototype.forEachGetter = function forEachGetter (fn) {
  if (this._rawModule.getters) {
    forEachValue(this._rawModule.getters, fn);
  }
};

Module.prototype.forEachAction = function forEachAction (fn) {
  if (this._rawModule.actions) {
    forEachValue(this._rawModule.actions, fn);
  }
};

Module.prototype.forEachMutation = function forEachMutation (fn) {
  if (this._rawModule.mutations) {
    forEachValue(this._rawModule.mutations, fn);
  }
};

Object.defineProperties( Module.prototype, prototypeAccessors$1 );

var ModuleCollection = function ModuleCollection (rawRootModule) {
  // register root module (Vuex.Store options)
  this.register([], rawRootModule, false);
};

ModuleCollection.prototype.get = function get (path) {
  return path.reduce(function (module, key) {
    return module.getChild(key)
  }, this.root)
};

ModuleCollection.prototype.getNamespace = function getNamespace (path) {
  var module = this.root;
  return path.reduce(function (namespace, key) {
    module = module.getChild(key);
    return namespace + (module.namespaced ? key + '/' : '')
  }, '')
};

ModuleCollection.prototype.update = function update$1 (rawRootModule) {
  update([], this.root, rawRootModule);
};

ModuleCollection.prototype.register = function register (path, rawModule, runtime) {
    var this$1 = this;
    if ( runtime === void 0 ) runtime = true;

  if (true) {
    assertRawModule(path, rawModule);
  }

  var newModule = new Module(rawModule, runtime);
  if (path.length === 0) {
    this.root = newModule;
  } else {
    var parent = this.get(path.slice(0, -1));
    parent.addChild(path[path.length - 1], newModule);
  }

  // register nested modules
  if (rawModule.modules) {
    forEachValue(rawModule.modules, function (rawChildModule, key) {
      this$1.register(path.concat(key), rawChildModule, runtime);
    });
  }
};

ModuleCollection.prototype.unregister = function unregister (path) {
  var parent = this.get(path.slice(0, -1));
  var key = path[path.length - 1];
  if (!parent.getChild(key).runtime) { return }

  parent.removeChild(key);
};

function update (path, targetModule, newModule) {
  if (true) {
    assertRawModule(path, newModule);
  }

  // update target module
  targetModule.update(newModule);

  // update nested modules
  if (newModule.modules) {
    for (var key in newModule.modules) {
      if (!targetModule.getChild(key)) {
        if (true) {
          console.warn(
            "[vuex] trying to add a new module '" + key + "' on hot reloading, " +
            'manual reload is needed'
          );
        }
        return
      }
      update(
        path.concat(key),
        targetModule.getChild(key),
        newModule.modules[key]
      );
    }
  }
}

var functionAssert = {
  assert: function (value) { return typeof value === 'function'; },
  expected: 'function'
};

var objectAssert = {
  assert: function (value) { return typeof value === 'function' ||
    (typeof value === 'object' && typeof value.handler === 'function'); },
  expected: 'function or object with "handler" function'
};

var assertTypes = {
  getters: functionAssert,
  mutations: functionAssert,
  actions: objectAssert
};

function assertRawModule (path, rawModule) {
  Object.keys(assertTypes).forEach(function (key) {
    if (!rawModule[key]) { return }

    var assertOptions = assertTypes[key];

    forEachValue(rawModule[key], function (value, type) {
      assert(
        assertOptions.assert(value),
        makeAssertionMessage(path, key, type, value, assertOptions.expected)
      );
    });
  });
}

function makeAssertionMessage (path, key, type, value, expected) {
  var buf = key + " should be " + expected + " but \"" + key + "." + type + "\"";
  if (path.length > 0) {
    buf += " in module \"" + (path.join('.')) + "\"";
  }
  buf += " is " + (JSON.stringify(value)) + ".";
  return buf
}

var Vue; // bind on install

var Store = function Store (options) {
  var this$1 = this;
  if ( options === void 0 ) options = {};

  // Auto install if it is not done yet and `window` has `Vue`.
  // To allow users to avoid auto-installation in some cases,
  // this code should be placed here. See #731
  if (!Vue && typeof window !== 'undefined' && window.Vue) {
    install(window.Vue);
  }

  if (true) {
    assert(Vue, "must call Vue.use(Vuex) before creating a store instance.");
    assert(typeof Promise !== 'undefined', "vuex requires a Promise polyfill in this browser.");
    assert(this instanceof Store, "Store must be called with the new operator.");
  }

  var plugins = options.plugins; if ( plugins === void 0 ) plugins = [];
  var strict = options.strict; if ( strict === void 0 ) strict = false;

  var state = options.state; if ( state === void 0 ) state = {};
  if (typeof state === 'function') {
    state = state() || {};
  }

  // store internal state
  this._committing = false;
  this._actions = Object.create(null);
  this._actionSubscribers = [];
  this._mutations = Object.create(null);
  this._wrappedGetters = Object.create(null);
  this._modules = new ModuleCollection(options);
  this._modulesNamespaceMap = Object.create(null);
  this._subscribers = [];
  this._watcherVM = new Vue();

  // bind commit and dispatch to self
  var store = this;
  var ref = this;
  var dispatch = ref.dispatch;
  var commit = ref.commit;
  this.dispatch = function boundDispatch (type, payload) {
    return dispatch.call(store, type, payload)
  };
  this.commit = function boundCommit (type, payload, options) {
    return commit.call(store, type, payload, options)
  };

  // strict mode
  this.strict = strict;

  // init root module.
  // this also recursively registers all sub-modules
  // and collects all module getters inside this._wrappedGetters
  installModule(this, state, [], this._modules.root);

  // initialize the store vm, which is responsible for the reactivity
  // (also registers _wrappedGetters as computed properties)
  resetStoreVM(this, state);

  // apply plugins
  plugins.forEach(function (plugin) { return plugin(this$1); });

  if (Vue.config.devtools) {
    devtoolPlugin(this);
  }
};

var prototypeAccessors = { state: { configurable: true } };

prototypeAccessors.state.get = function () {
  return this._vm._data.$$state
};

prototypeAccessors.state.set = function (v) {
  if (true) {
    assert(false, "Use store.replaceState() to explicit replace store state.");
  }
};

Store.prototype.commit = function commit (_type, _payload, _options) {
    var this$1 = this;

  // check object-style commit
  var ref = unifyObjectStyle(_type, _payload, _options);
    var type = ref.type;
    var payload = ref.payload;
    var options = ref.options;

  var mutation = { type: type, payload: payload };
  var entry = this._mutations[type];
  if (!entry) {
    if (true) {
      console.error(("[vuex] unknown mutation type: " + type));
    }
    return
  }
  this._withCommit(function () {
    entry.forEach(function commitIterator (handler) {
      handler(payload);
    });
  });
  this._subscribers.forEach(function (sub) { return sub(mutation, this$1.state); });

  if (
    "development" !== 'production' &&
    options && options.silent
  ) {
    console.warn(
      "[vuex] mutation type: " + type + ". Silent option has been removed. " +
      'Use the filter functionality in the vue-devtools'
    );
  }
};

Store.prototype.dispatch = function dispatch (_type, _payload) {
    var this$1 = this;

  // check object-style dispatch
  var ref = unifyObjectStyle(_type, _payload);
    var type = ref.type;
    var payload = ref.payload;

  var action = { type: type, payload: payload };
  var entry = this._actions[type];
  if (!entry) {
    if (true) {
      console.error(("[vuex] unknown action type: " + type));
    }
    return
  }

  this._actionSubscribers.forEach(function (sub) { return sub(action, this$1.state); });

  return entry.length > 1
    ? Promise.all(entry.map(function (handler) { return handler(payload); }))
    : entry[0](payload)
};

Store.prototype.subscribe = function subscribe (fn) {
  return genericSubscribe(fn, this._subscribers)
};

Store.prototype.subscribeAction = function subscribeAction (fn) {
  return genericSubscribe(fn, this._actionSubscribers)
};

Store.prototype.watch = function watch (getter, cb, options) {
    var this$1 = this;

  if (true) {
    assert(typeof getter === 'function', "store.watch only accepts a function.");
  }
  return this._watcherVM.$watch(function () { return getter(this$1.state, this$1.getters); }, cb, options)
};

Store.prototype.replaceState = function replaceState (state) {
    var this$1 = this;

  this._withCommit(function () {
    this$1._vm._data.$$state = state;
  });
};

Store.prototype.registerModule = function registerModule (path, rawModule, options) {
    if ( options === void 0 ) options = {};

  if (typeof path === 'string') { path = [path]; }

  if (true) {
    assert(Array.isArray(path), "module path must be a string or an Array.");
    assert(path.length > 0, 'cannot register the root module by using registerModule.');
  }

  this._modules.register(path, rawModule);
  installModule(this, this.state, path, this._modules.get(path), options.preserveState);
  // reset store to update getters...
  resetStoreVM(this, this.state);
};

Store.prototype.unregisterModule = function unregisterModule (path) {
    var this$1 = this;

  if (typeof path === 'string') { path = [path]; }

  if (true) {
    assert(Array.isArray(path), "module path must be a string or an Array.");
  }

  this._modules.unregister(path);
  this._withCommit(function () {
    var parentState = getNestedState(this$1.state, path.slice(0, -1));
    Vue.delete(parentState, path[path.length - 1]);
  });
  resetStore(this);
};

Store.prototype.hotUpdate = function hotUpdate (newOptions) {
  this._modules.update(newOptions);
  resetStore(this, true);
};

Store.prototype._withCommit = function _withCommit (fn) {
  var committing = this._committing;
  this._committing = true;
  fn();
  this._committing = committing;
};

Object.defineProperties( Store.prototype, prototypeAccessors );

function genericSubscribe (fn, subs) {
  if (subs.indexOf(fn) < 0) {
    subs.push(fn);
  }
  return function () {
    var i = subs.indexOf(fn);
    if (i > -1) {
      subs.splice(i, 1);
    }
  }
}

function resetStore (store, hot) {
  store._actions = Object.create(null);
  store._mutations = Object.create(null);
  store._wrappedGetters = Object.create(null);
  store._modulesNamespaceMap = Object.create(null);
  var state = store.state;
  // init all modules
  installModule(store, state, [], store._modules.root, true);
  // reset vm
  resetStoreVM(store, state, hot);
}

function resetStoreVM (store, state, hot) {
  var oldVm = store._vm;

  // bind store public getters
  store.getters = {};
  var wrappedGetters = store._wrappedGetters;
  var computed = {};
  forEachValue(wrappedGetters, function (fn, key) {
    // use computed to leverage its lazy-caching mechanism
    computed[key] = function () { return fn(store); };
    Object.defineProperty(store.getters, key, {
      get: function () { return store._vm[key]; },
      enumerable: true // for local getters
    });
  });

  // use a Vue instance to store the state tree
  // suppress warnings just in case the user has added
  // some funky global mixins
  var silent = Vue.config.silent;
  Vue.config.silent = true;
  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed: computed
  });
  Vue.config.silent = silent;

  // enable strict mode for new vm
  if (store.strict) {
    enableStrictMode(store);
  }

  if (oldVm) {
    if (hot) {
      // dispatch changes in all subscribed watchers
      // to force getter re-evaluation for hot reloading.
      store._withCommit(function () {
        oldVm._data.$$state = null;
      });
    }
    Vue.nextTick(function () { return oldVm.$destroy(); });
  }
}

function installModule (store, rootState, path, module, hot) {
  var isRoot = !path.length;
  var namespace = store._modules.getNamespace(path);

  // register in namespace map
  if (module.namespaced) {
    store._modulesNamespaceMap[namespace] = module;
  }

  // set state
  if (!isRoot && !hot) {
    var parentState = getNestedState(rootState, path.slice(0, -1));
    var moduleName = path[path.length - 1];
    store._withCommit(function () {
      Vue.set(parentState, moduleName, module.state);
    });
  }

  var local = module.context = makeLocalContext(store, namespace, path);

  module.forEachMutation(function (mutation, key) {
    var namespacedType = namespace + key;
    registerMutation(store, namespacedType, mutation, local);
  });

  module.forEachAction(function (action, key) {
    var type = action.root ? key : namespace + key;
    var handler = action.handler || action;
    registerAction(store, type, handler, local);
  });

  module.forEachGetter(function (getter, key) {
    var namespacedType = namespace + key;
    registerGetter(store, namespacedType, getter, local);
  });

  module.forEachChild(function (child, key) {
    installModule(store, rootState, path.concat(key), child, hot);
  });
}

/**
 * make localized dispatch, commit, getters and state
 * if there is no namespace, just use root ones
 */
function makeLocalContext (store, namespace, path) {
  var noNamespace = namespace === '';

  var local = {
    dispatch: noNamespace ? store.dispatch : function (_type, _payload, _options) {
      var args = unifyObjectStyle(_type, _payload, _options);
      var payload = args.payload;
      var options = args.options;
      var type = args.type;

      if (!options || !options.root) {
        type = namespace + type;
        if ("development" !== 'production' && !store._actions[type]) {
          console.error(("[vuex] unknown local action type: " + (args.type) + ", global type: " + type));
          return
        }
      }

      return store.dispatch(type, payload)
    },

    commit: noNamespace ? store.commit : function (_type, _payload, _options) {
      var args = unifyObjectStyle(_type, _payload, _options);
      var payload = args.payload;
      var options = args.options;
      var type = args.type;

      if (!options || !options.root) {
        type = namespace + type;
        if ("development" !== 'production' && !store._mutations[type]) {
          console.error(("[vuex] unknown local mutation type: " + (args.type) + ", global type: " + type));
          return
        }
      }

      store.commit(type, payload, options);
    }
  };

  // getters and state object must be gotten lazily
  // because they will be changed by vm update
  Object.defineProperties(local, {
    getters: {
      get: noNamespace
        ? function () { return store.getters; }
        : function () { return makeLocalGetters(store, namespace); }
    },
    state: {
      get: function () { return getNestedState(store.state, path); }
    }
  });

  return local
}

function makeLocalGetters (store, namespace) {
  var gettersProxy = {};

  var splitPos = namespace.length;
  Object.keys(store.getters).forEach(function (type) {
    // skip if the target getter is not match this namespace
    if (type.slice(0, splitPos) !== namespace) { return }

    // extract local getter type
    var localType = type.slice(splitPos);

    // Add a port to the getters proxy.
    // Define as getter property because
    // we do not want to evaluate the getters in this time.
    Object.defineProperty(gettersProxy, localType, {
      get: function () { return store.getters[type]; },
      enumerable: true
    });
  });

  return gettersProxy
}

function registerMutation (store, type, handler, local) {
  var entry = store._mutations[type] || (store._mutations[type] = []);
  entry.push(function wrappedMutationHandler (payload) {
    handler.call(store, local.state, payload);
  });
}

function registerAction (store, type, handler, local) {
  var entry = store._actions[type] || (store._actions[type] = []);
  entry.push(function wrappedActionHandler (payload, cb) {
    var res = handler.call(store, {
      dispatch: local.dispatch,
      commit: local.commit,
      getters: local.getters,
      state: local.state,
      rootGetters: store.getters,
      rootState: store.state
    }, payload, cb);
    if (!isPromise(res)) {
      res = Promise.resolve(res);
    }
    if (store._devtoolHook) {
      return res.catch(function (err) {
        store._devtoolHook.emit('vuex:error', err);
        throw err
      })
    } else {
      return res
    }
  });
}

function registerGetter (store, type, rawGetter, local) {
  if (store._wrappedGetters[type]) {
    if (true) {
      console.error(("[vuex] duplicate getter key: " + type));
    }
    return
  }
  store._wrappedGetters[type] = function wrappedGetter (store) {
    return rawGetter(
      local.state, // local state
      local.getters, // local getters
      store.state, // root state
      store.getters // root getters
    )
  };
}

function enableStrictMode (store) {
  store._vm.$watch(function () { return this._data.$$state }, function () {
    if (true) {
      assert(store._committing, "Do not mutate vuex store state outside mutation handlers.");
    }
  }, { deep: true, sync: true });
}

function getNestedState (state, path) {
  return path.length
    ? path.reduce(function (state, key) { return state[key]; }, state)
    : state
}

function unifyObjectStyle (type, payload, options) {
  if (isObject(type) && type.type) {
    options = payload;
    payload = type;
    type = type.type;
  }

  if (true) {
    assert(typeof type === 'string', ("Expects string as the type, but found " + (typeof type) + "."));
  }

  return { type: type, payload: payload, options: options }
}

function install (_Vue) {
  if (Vue && _Vue === Vue) {
    if (true) {
      console.error(
        '[vuex] already installed. Vue.use(Vuex) should be called only once.'
      );
    }
    return
  }
  Vue = _Vue;
  applyMixin(Vue);
}

var mapState = normalizeNamespace(function (namespace, states) {
  var res = {};
  normalizeMap(states).forEach(function (ref) {
    var key = ref.key;
    var val = ref.val;

    res[key] = function mappedState () {
      var state = this.$store.state;
      var getters = this.$store.getters;
      if (namespace) {
        var module = getModuleByNamespace(this.$store, 'mapState', namespace);
        if (!module) {
          return
        }
        state = module.context.state;
        getters = module.context.getters;
      }
      return typeof val === 'function'
        ? val.call(this, state, getters)
        : state[val]
    };
    // mark vuex getter for devtools
    res[key].vuex = true;
  });
  return res
});

var mapMutations = normalizeNamespace(function (namespace, mutations) {
  var res = {};
  normalizeMap(mutations).forEach(function (ref) {
    var key = ref.key;
    var val = ref.val;

    res[key] = function mappedMutation () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      var commit = this.$store.commit;
      if (namespace) {
        var module = getModuleByNamespace(this.$store, 'mapMutations', namespace);
        if (!module) {
          return
        }
        commit = module.context.commit;
      }
      return typeof val === 'function'
        ? val.apply(this, [commit].concat(args))
        : commit.apply(this.$store, [val].concat(args))
    };
  });
  return res
});

var mapGetters = normalizeNamespace(function (namespace, getters) {
  var res = {};
  normalizeMap(getters).forEach(function (ref) {
    var key = ref.key;
    var val = ref.val;

    val = namespace + val;
    res[key] = function mappedGetter () {
      if (namespace && !getModuleByNamespace(this.$store, 'mapGetters', namespace)) {
        return
      }
      if ("development" !== 'production' && !(val in this.$store.getters)) {
        console.error(("[vuex] unknown getter: " + val));
        return
      }
      return this.$store.getters[val]
    };
    // mark vuex getter for devtools
    res[key].vuex = true;
  });
  return res
});

var mapActions = normalizeNamespace(function (namespace, actions) {
  var res = {};
  normalizeMap(actions).forEach(function (ref) {
    var key = ref.key;
    var val = ref.val;

    res[key] = function mappedAction () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      var dispatch = this.$store.dispatch;
      if (namespace) {
        var module = getModuleByNamespace(this.$store, 'mapActions', namespace);
        if (!module) {
          return
        }
        dispatch = module.context.dispatch;
      }
      return typeof val === 'function'
        ? val.apply(this, [dispatch].concat(args))
        : dispatch.apply(this.$store, [val].concat(args))
    };
  });
  return res
});

var createNamespacedHelpers = function (namespace) { return ({
  mapState: mapState.bind(null, namespace),
  mapGetters: mapGetters.bind(null, namespace),
  mapMutations: mapMutations.bind(null, namespace),
  mapActions: mapActions.bind(null, namespace)
}); };

function normalizeMap (map) {
  return Array.isArray(map)
    ? map.map(function (key) { return ({ key: key, val: key }); })
    : Object.keys(map).map(function (key) { return ({ key: key, val: map[key] }); })
}

function normalizeNamespace (fn) {
  return function (namespace, map) {
    if (typeof namespace !== 'string') {
      map = namespace;
      namespace = '';
    } else if (namespace.charAt(namespace.length - 1) !== '/') {
      namespace += '/';
    }
    return fn(namespace, map)
  }
}

function getModuleByNamespace (store, helper, namespace) {
  var module = store._modulesNamespaceMap[namespace];
  if ("development" !== 'production' && !module) {
    console.error(("[vuex] module namespace not found in " + helper + "(): " + namespace));
  }
  return module
}

var index_esm = {
  Store: Store,
  install: install,
  version: '3.0.1',
  mapState: mapState,
  mapMutations: mapMutations,
  mapGetters: mapGetters,
  mapActions: mapActions,
  createNamespacedHelpers: createNamespacedHelpers
};


/* harmony default export */ __webpack_exports__["a"] = (index_esm);


/***/ }),
/* 149 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

window.axios = __webpack_require__(8);

var stringsUrl = "/strings";

/**
 * Initialize global store.
 */

var _class = function () {
    function _class(language) {
        _classCallCheck(this, _class);

        this.locale = language ? language : document.documentElement.lang;
        var scriptName = document.currentScript ? document.currentScript.src : null;

        if (scriptName) {
            var scriptUrl = new URL(scriptName);
            this.cacheVersionSuffix = scriptUrl.searchParams.get("id");
            this.cacheNamePrefix = "strings-" + this.locale + "-";
        } else {
            this.cacheVersionSuffix = null;
        }

        this.canUseCache = 'caches' in window && this.cacheVersionSuffix;
    }

    _createClass(_class, [{
        key: "retrieveCachedStrings",
        value: function retrieveCachedStrings(callback) {
            var _this = this;

            return new Promise(function (resolve, reject) {
                caches.open(_this.cacheNamePrefix + _this.cacheVersionSuffix).then(function (cache) {

                    cache.match(stringsUrl).then(function (response) {
                        return response.json();
                    }).then(function (response) {
                        if (!response) {
                            reject();
                        }
                        resolve(response);
                    }, function () {
                        reject();
                    });
                });
            });
        }
    }, {
        key: "cleanupStringsCache",
        value: function cleanupStringsCache() {
            var _this2 = this;

            caches.keys().then(function (cacheNames) {
                return Promise.all(cacheNames.map(function (cacheName) {
                    if (cacheName.startsWith(_this2.cacheNamePrefix) && !cacheName.endsWith(_this2.cacheVersionSuffix)) {
                        return caches.delete(cacheName);
                    }
                }));
            });
        }
    }, {
        key: "fetchStrings",
        value: function fetchStrings() {
            var _this3 = this;

            if (this.canUseCache) {
                return new Promise(function (resolve, reject) {
                    caches.open(_this3.cacheNamePrefix + _this3.cacheVersionSuffix).then(function (cache) {
                        cache.add(stringsUrl).then(function () {
                            cache.match(stringsUrl).then(function (response) {
                                return response.json();
                            }).then(function (response) {
                                if (!response) {
                                    reject();
                                }
                                _this3.cleanupStringsCache();
                                resolve(response);
                            }, function () {
                                reject();
                            });
                        });
                    });
                });
            } else {
                return new Promise(function (resolve, reject) {
                    axios.get("/strings").then(function (_ref) {
                        var data = _ref.data;

                        resolve(data);
                    }, function () {
                        alert("Localizations cannot be loaded.");
                        reject();
                    });
                });
            }
        }
    }, {
        key: "loadStrings",
        get: function get() {
            var _this4 = this;

            return new Promise(function (resolve, reject) {
                if (_this4.canUseCache) {
                    _this4.retrieveCachedStrings().then(function (strings) {
                        resolve(strings);
                    }, function () {
                        _this4.fetchStrings().then(function (strings) {
                            resolve(strings);
                        });
                    });
                } else {
                    _this4.fetchStrings().then(function (strings) {
                        resolve(strings);
                    });
                }
            });
        }
    }]);

    return _class;
}();

/* harmony default export */ __webpack_exports__["a"] = (_class);
;

/***/ }),
/* 150 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/**
 * marked - a markdown parser
 * Copyright (c) 2011-2014, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/chjj/marked
 */

;(function() {
'use strict';

/**
 * Block-Level Grammar
 */

var block = {
  newline: /^\n+/,
  code: /^( {4}[^\n]+\n*)+/,
  fences: noop,
  hr: /^ {0,3}((?:- *){3,}|(?:_ *){3,}|(?:\* *){3,})(?:\n+|$)/,
  heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
  nptable: noop,
  blockquote: /^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,
  list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
  html: /^ *(?:comment *(?:\n|\s*$)|closed *(?:\n{2,}|\s*$)|closing *(?:\n{2,}|\s*$))/,
  def: /^ {0,3}\[(label)\]: *\n? *<?([^\s>]+)>?(?:(?: +\n? *| *\n *)(title))? *(?:\n+|$)/,
  table: noop,
  lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
  paragraph: /^([^\n]+(?:\n?(?!hr|heading|lheading| {0,3}>|tag)[^\n]+)+)/,
  text: /^[^\n]+/
};

block._label = /(?:\\[\[\]]|[^\[\]])+/;
block._title = /(?:"(?:\\"|[^"]|"[^"\n]*")*"|'\n?(?:[^'\n]+\n?)*'|\([^()]*\))/;
block.def = replace(block.def)
  ('label', block._label)
  ('title', block._title)
  ();

block.bullet = /(?:[*+-]|\d+\.)/;
block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
block.item = replace(block.item, 'gm')
  (/bull/g, block.bullet)
  ();

block.list = replace(block.list)
  (/bull/g, block.bullet)
  ('hr', '\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))')
  ('def', '\\n+(?=' + block.def.source + ')')
  ();

block._tag = '(?!(?:'
  + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'
  + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'
  + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b';

block.html = replace(block.html)
  ('comment', /<!--[\s\S]*?-->/)
  ('closed', /<(tag)[\s\S]+?<\/\1>/)
  ('closing', /<tag(?:"[^"]*"|'[^']*'|\s[^'"\/>]*)*?\/?>/)
  (/tag/g, block._tag)
  ();

block.paragraph = replace(block.paragraph)
  ('hr', block.hr)
  ('heading', block.heading)
  ('lheading', block.lheading)
  ('tag', '<' + block._tag)
  ();

block.blockquote = replace(block.blockquote)
  ('paragraph', block.paragraph)
  ();

/**
 * Normal Block Grammar
 */

block.normal = merge({}, block);

/**
 * GFM Block Grammar
 */

block.gfm = merge({}, block.normal, {
  fences: /^ *(`{3,}|~{3,})[ \.]*(\S+)? *\n([\s\S]*?)\n? *\1 *(?:\n+|$)/,
  paragraph: /^/,
  heading: /^ *(#{1,6}) +([^\n]+?) *#* *(?:\n+|$)/
});

block.gfm.paragraph = replace(block.paragraph)
  ('(?!', '(?!'
    + block.gfm.fences.source.replace('\\1', '\\2') + '|'
    + block.list.source.replace('\\1', '\\3') + '|')
  ();

/**
 * GFM + Tables Block Grammar
 */

block.tables = merge({}, block.gfm, {
  nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
  table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
});

/**
 * Block Lexer
 */

function Lexer(options) {
  this.tokens = [];
  this.tokens.links = {};
  this.options = options || marked.defaults;
  this.rules = block.normal;

  if (this.options.gfm) {
    if (this.options.tables) {
      this.rules = block.tables;
    } else {
      this.rules = block.gfm;
    }
  }
}

/**
 * Expose Block Rules
 */

Lexer.rules = block;

/**
 * Static Lex Method
 */

Lexer.lex = function(src, options) {
  var lexer = new Lexer(options);
  return lexer.lex(src);
};

/**
 * Preprocessing
 */

Lexer.prototype.lex = function(src) {
  src = src
    .replace(/\r\n|\r/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/\u00a0/g, ' ')
    .replace(/\u2424/g, '\n');

  return this.token(src, true);
};

/**
 * Lexing
 */

Lexer.prototype.token = function(src, top) {
  var src = src.replace(/^ +$/gm, '')
    , next
    , loose
    , cap
    , bull
    , b
    , item
    , space
    , i
    , tag
    , l;

  while (src) {
    // newline
    if (cap = this.rules.newline.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[0].length > 1) {
        this.tokens.push({
          type: 'space'
        });
      }
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      cap = cap[0].replace(/^ {4}/gm, '');
      this.tokens.push({
        type: 'code',
        text: !this.options.pedantic
          ? cap.replace(/\n+$/, '')
          : cap
      });
      continue;
    }

    // fences (gfm)
    if (cap = this.rules.fences.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'code',
        lang: cap[2],
        text: cap[3] || ''
      });
      continue;
    }

    // heading
    if (cap = this.rules.heading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[1].length,
        text: cap[2]
      });
      continue;
    }

    // table no leading pipe (gfm)
    if (top && (cap = this.rules.nptable.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i].split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // hr
    if (cap = this.rules.hr.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'hr'
      });
      continue;
    }

    // blockquote
    if (cap = this.rules.blockquote.exec(src)) {
      src = src.substring(cap[0].length);

      this.tokens.push({
        type: 'blockquote_start'
      });

      cap = cap[0].replace(/^ *> ?/gm, '');

      // Pass `top` to keep the current
      // "toplevel" state. This is exactly
      // how markdown.pl works.
      this.token(cap, top);

      this.tokens.push({
        type: 'blockquote_end'
      });

      continue;
    }

    // list
    if (cap = this.rules.list.exec(src)) {
      src = src.substring(cap[0].length);
      bull = cap[2];

      this.tokens.push({
        type: 'list_start',
        ordered: bull.length > 1
      });

      // Get each top-level item.
      cap = cap[0].match(this.rules.item);

      next = false;
      l = cap.length;
      i = 0;

      for (; i < l; i++) {
        item = cap[i];

        // Remove the list item's bullet
        // so it is seen as the next token.
        space = item.length;
        item = item.replace(/^ *([*+-]|\d+\.) +/, '');

        // Outdent whatever the
        // list item contains. Hacky.
        if (~item.indexOf('\n ')) {
          space -= item.length;
          item = !this.options.pedantic
            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
            : item.replace(/^ {1,4}/gm, '');
        }

        // Determine whether the next list item belongs here.
        // Backpedal if it does not belong in this list.
        if (this.options.smartLists && i !== l - 1) {
          b = block.bullet.exec(cap[i + 1])[0];
          if (bull !== b && !(bull.length > 1 && b.length > 1)) {
            src = cap.slice(i + 1).join('\n') + src;
            i = l - 1;
          }
        }

        // Determine whether item is loose or not.
        // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
        // for discount behavior.
        loose = next || /\n\n(?!\s*$)/.test(item);
        if (i !== l - 1) {
          next = item.charAt(item.length - 1) === '\n';
          if (!loose) loose = next;
        }

        this.tokens.push({
          type: loose
            ? 'loose_item_start'
            : 'list_item_start'
        });

        // Recurse.
        this.token(item, false);

        this.tokens.push({
          type: 'list_item_end'
        });
      }

      this.tokens.push({
        type: 'list_end'
      });

      continue;
    }

    // html
    if (cap = this.rules.html.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: this.options.sanitize
          ? 'paragraph'
          : 'html',
        pre: !this.options.sanitizer
          && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
        text: cap[0]
      });
      continue;
    }

    // def
    if (top && (cap = this.rules.def.exec(src))) {
      src = src.substring(cap[0].length);
      if (cap[3]) cap[3] = cap[3].substring(1,cap[3].length-1);
      tag = cap[1].toLowerCase();
      if (!this.tokens.links[tag]) {
        this.tokens.links[tag] = {
          href: cap[2],
          title: cap[3]
        };
      }
      continue;
    }

    // table (gfm)
    if (top && (cap = this.rules.table.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i]
          .replace(/^ *\| *| *\| *$/g, '')
          .split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // lheading
    if (cap = this.rules.lheading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[2] === '=' ? 1 : 2,
        text: cap[1]
      });
      continue;
    }

    // top-level paragraph
    if (top && (cap = this.rules.paragraph.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'paragraph',
        text: cap[1].charAt(cap[1].length - 1) === '\n'
          ? cap[1].slice(0, -1)
          : cap[1]
      });
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      // Top-level should never reach here.
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'text',
        text: cap[0]
      });
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return this.tokens;
};

/**
 * Inline-Level Grammar
 */

var inline = {
  escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
  autolink: /^<(scheme:[^\s\x00-\x1f<>]*|email)>/,
  url: noop,
  tag: /^<!--[\s\S]*?-->|^<\/?[a-zA-Z0-9\-]+(?:"[^"]*"|'[^']*'|\s[^<'">\/]*)*?\/?>/,
  link: /^!?\[(inside)\]\(href\)/,
  reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
  nolink: /^!?\[((?:\[[^\]]*\]|\\[\[\]]|[^\[\]])*)\]/,
  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
  em: /^_([^\s_](?:[^_]|__)+?[^\s_])_\b|^\*((?:\*\*|[^*])+?)\*(?!\*)/,
  code: /^(`+)(\s*)([\s\S]*?[^`]?)\2\1(?!`)/,
  br: /^ {2,}\n(?!\s*$)/,
  del: noop,
  text: /^[\s\S]+?(?=[\\<!\[`*]|\b_| {2,}\n|$)/
};

inline._scheme = /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/;
inline._email = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/;

inline.autolink = replace(inline.autolink)
  ('scheme', inline._scheme)
  ('email', inline._email)
  ()

inline._inside = /(?:\[[^\]]*\]|\\[\[\]]|[^\[\]]|\](?=[^\[]*\]))*/;
inline._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

inline.link = replace(inline.link)
  ('inside', inline._inside)
  ('href', inline._href)
  ();

inline.reflink = replace(inline.reflink)
  ('inside', inline._inside)
  ();

/**
 * Normal Inline Grammar
 */

inline.normal = merge({}, inline);

/**
 * Pedantic Inline Grammar
 */

inline.pedantic = merge({}, inline.normal, {
  strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
  em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
});

/**
 * GFM Inline Grammar
 */

inline.gfm = merge({}, inline.normal, {
  escape: replace(inline.escape)('])', '~|])')(),
  url: replace(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/)
    ('email', inline._email)
    (),
  _backpedal: /(?:[^?!.,:;*_~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_~)]+(?!$))+/,
  del: /^~~(?=\S)([\s\S]*?\S)~~/,
  text: replace(inline.text)
    (']|', '~]|')
    ('|', '|https?://|ftp://|www\\.|[a-zA-Z0-9.!#$%&\'*+/=?^_`{\\|}~-]+@|')
    ()
});

/**
 * GFM + Line Breaks Inline Grammar
 */

inline.breaks = merge({}, inline.gfm, {
  br: replace(inline.br)('{2,}', '*')(),
  text: replace(inline.gfm.text)('{2,}', '*')()
});

/**
 * Inline Lexer & Compiler
 */

function InlineLexer(links, options) {
  this.options = options || marked.defaults;
  this.links = links;
  this.rules = inline.normal;
  this.renderer = this.options.renderer || new Renderer;
  this.renderer.options = this.options;

  if (!this.links) {
    throw new
      Error('Tokens array requires a `links` property.');
  }

  if (this.options.gfm) {
    if (this.options.breaks) {
      this.rules = inline.breaks;
    } else {
      this.rules = inline.gfm;
    }
  } else if (this.options.pedantic) {
    this.rules = inline.pedantic;
  }
}

/**
 * Expose Inline Rules
 */

InlineLexer.rules = inline;

/**
 * Static Lexing/Compiling Method
 */

InlineLexer.output = function(src, links, options) {
  var inline = new InlineLexer(links, options);
  return inline.output(src);
};

/**
 * Lexing/Compiling
 */

InlineLexer.prototype.output = function(src) {
  var out = ''
    , link
    , text
    , href
    , cap;

  while (src) {
    // escape
    if (cap = this.rules.escape.exec(src)) {
      src = src.substring(cap[0].length);
      out += cap[1];
      continue;
    }

    // autolink
    if (cap = this.rules.autolink.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[2] === '@') {
        text = escape(this.mangle(cap[1]));
        href = 'mailto:' + text;
      } else {
        text = escape(cap[1]);
        href = text;
      }
      out += this.renderer.link(href, null, text);
      continue;
    }

    // url (gfm)
    if (!this.inLink && (cap = this.rules.url.exec(src))) {
      cap[0] = this.rules._backpedal.exec(cap[0])[0];
      src = src.substring(cap[0].length);
      if (cap[2] === '@') {
        text = escape(cap[0]);
        href = 'mailto:' + text;
      } else {
        text = escape(cap[0]);
        if (cap[1] === 'www.') {
          href = 'http://' + text;
        } else {
          href = text;
        }
      }
      out += this.renderer.link(href, null, text);
      continue;
    }

    // tag
    if (cap = this.rules.tag.exec(src)) {
      if (!this.inLink && /^<a /i.test(cap[0])) {
        this.inLink = true;
      } else if (this.inLink && /^<\/a>/i.test(cap[0])) {
        this.inLink = false;
      }
      src = src.substring(cap[0].length);
      out += this.options.sanitize
        ? this.options.sanitizer
          ? this.options.sanitizer(cap[0])
          : escape(cap[0])
        : cap[0]
      continue;
    }

    // link
    if (cap = this.rules.link.exec(src)) {
      src = src.substring(cap[0].length);
      this.inLink = true;
      out += this.outputLink(cap, {
        href: cap[2],
        title: cap[3]
      });
      this.inLink = false;
      continue;
    }

    // reflink, nolink
    if ((cap = this.rules.reflink.exec(src))
        || (cap = this.rules.nolink.exec(src))) {
      src = src.substring(cap[0].length);
      link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
      link = this.links[link.toLowerCase()];
      if (!link || !link.href) {
        out += cap[0].charAt(0);
        src = cap[0].substring(1) + src;
        continue;
      }
      this.inLink = true;
      out += this.outputLink(cap, link);
      this.inLink = false;
      continue;
    }

    // strong
    if (cap = this.rules.strong.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.strong(this.output(cap[2] || cap[1]));
      continue;
    }

    // em
    if (cap = this.rules.em.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.em(this.output(cap[2] || cap[1]));
      continue;
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.codespan(escape(cap[3].trim(), true));
      continue;
    }

    // br
    if (cap = this.rules.br.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.br();
      continue;
    }

    // del (gfm)
    if (cap = this.rules.del.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.del(this.output(cap[1]));
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.text(escape(this.smartypants(cap[0])));
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return out;
};

/**
 * Compile Link
 */

InlineLexer.prototype.outputLink = function(cap, link) {
  var href = escape(link.href)
    , title = link.title ? escape(link.title) : null;

  return cap[0].charAt(0) !== '!'
    ? this.renderer.link(href, title, this.output(cap[1]))
    : this.renderer.image(href, title, escape(cap[1]));
};

/**
 * Smartypants Transformations
 */

InlineLexer.prototype.smartypants = function(text) {
  if (!this.options.smartypants) return text;
  return text
    // em-dashes
    .replace(/---/g, '\u2014')
    // en-dashes
    .replace(/--/g, '\u2013')
    // opening singles
    .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
    // closing singles & apostrophes
    .replace(/'/g, '\u2019')
    // opening doubles
    .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
    // closing doubles
    .replace(/"/g, '\u201d')
    // ellipses
    .replace(/\.{3}/g, '\u2026');
};

/**
 * Mangle Links
 */

InlineLexer.prototype.mangle = function(text) {
  if (!this.options.mangle) return text;
  var out = ''
    , l = text.length
    , i = 0
    , ch;

  for (; i < l; i++) {
    ch = text.charCodeAt(i);
    if (Math.random() > 0.5) {
      ch = 'x' + ch.toString(16);
    }
    out += '&#' + ch + ';';
  }

  return out;
};

/**
 * Renderer
 */

function Renderer(options) {
  this.options = options || {};
}

Renderer.prototype.code = function(code, lang, escaped) {
  if (this.options.highlight) {
    var out = this.options.highlight(code, lang);
    if (out != null && out !== code) {
      escaped = true;
      code = out;
    }
  }

  if (!lang) {
    return '<pre><code>'
      + (escaped ? code : escape(code, true))
      + '\n</code></pre>';
  }

  return '<pre><code class="'
    + this.options.langPrefix
    + escape(lang, true)
    + '">'
    + (escaped ? code : escape(code, true))
    + '\n</code></pre>\n';
};

Renderer.prototype.blockquote = function(quote) {
  return '<blockquote>\n' + quote + '</blockquote>\n';
};

Renderer.prototype.html = function(html) {
  return html;
};

Renderer.prototype.heading = function(text, level, raw) {
  return '<h'
    + level
    + ' id="'
    + this.options.headerPrefix
    + raw.toLowerCase().replace(/[^\w]+/g, '-')
    + '">'
    + text
    + '</h'
    + level
    + '>\n';
};

Renderer.prototype.hr = function() {
  return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
};

Renderer.prototype.list = function(body, ordered) {
  var type = ordered ? 'ol' : 'ul';
  return '<' + type + '>\n' + body + '</' + type + '>\n';
};

Renderer.prototype.listitem = function(text) {
  return '<li>' + text + '</li>\n';
};

Renderer.prototype.paragraph = function(text) {
  return '<p>' + text + '</p>\n';
};

Renderer.prototype.table = function(header, body) {
  return '<table>\n'
    + '<thead>\n'
    + header
    + '</thead>\n'
    + '<tbody>\n'
    + body
    + '</tbody>\n'
    + '</table>\n';
};

Renderer.prototype.tablerow = function(content) {
  return '<tr>\n' + content + '</tr>\n';
};

Renderer.prototype.tablecell = function(content, flags) {
  var type = flags.header ? 'th' : 'td';
  var tag = flags.align
    ? '<' + type + ' style="text-align:' + flags.align + '">'
    : '<' + type + '>';
  return tag + content + '</' + type + '>\n';
};

// span level renderer
Renderer.prototype.strong = function(text) {
  return '<strong>' + text + '</strong>';
};

Renderer.prototype.em = function(text) {
  return '<em>' + text + '</em>';
};

Renderer.prototype.codespan = function(text) {
  return '<code>' + text + '</code>';
};

Renderer.prototype.br = function() {
  return this.options.xhtml ? '<br/>' : '<br>';
};

Renderer.prototype.del = function(text) {
  return '<del>' + text + '</del>';
};

Renderer.prototype.link = function(href, title, text) {
  if (this.options.sanitize) {
    try {
      var prot = decodeURIComponent(unescape(href))
        .replace(/[^\w:]/g, '')
        .toLowerCase();
    } catch (e) {
      return text;
    }
    if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0 || prot.indexOf('data:') === 0) {
      return text;
    }
  }
  if (this.options.baseUrl && !originIndependentUrl.test(href)) {
    href = resolveUrl(this.options.baseUrl, href);
  }
  var out = '<a href="' + href + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += '>' + text + '</a>';
  return out;
};

Renderer.prototype.image = function(href, title, text) {
  if (this.options.baseUrl && !originIndependentUrl.test(href)) {
    href = resolveUrl(this.options.baseUrl, href);
  }
  var out = '<img src="' + href + '" alt="' + text + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += this.options.xhtml ? '/>' : '>';
  return out;
};

Renderer.prototype.text = function(text) {
  return text;
};

/**
 * TextRenderer
 * returns only the textual part of the token
 */

function TextRenderer() {}

// no need for block level renderers

TextRenderer.prototype.strong =
TextRenderer.prototype.em =
TextRenderer.prototype.codespan =
TextRenderer.prototype.del =
TextRenderer.prototype.text = function (text) {
  return text;
}

TextRenderer.prototype.link =
TextRenderer.prototype.image = function(href, title, text) {
  return '' + text;
}

TextRenderer.prototype.br = function() {
  return '';
}

/**
 * Parsing & Compiling
 */

function Parser(options) {
  this.tokens = [];
  this.token = null;
  this.options = options || marked.defaults;
  this.options.renderer = this.options.renderer || new Renderer;
  this.renderer = this.options.renderer;
  this.renderer.options = this.options;
}

/**
 * Static Parse Method
 */

Parser.parse = function(src, options) {
  var parser = new Parser(options);
  return parser.parse(src);
};

/**
 * Parse Loop
 */

Parser.prototype.parse = function(src) {
  this.inline = new InlineLexer(src.links, this.options);
  // use an InlineLexer with a TextRenderer to extract pure text
  this.inlineText = new InlineLexer(src.links, merge({}, this.options, {renderer: new TextRenderer}));
  this.tokens = src.reverse();

  var out = '';
  while (this.next()) {
    out += this.tok();
  }

  return out;
};

/**
 * Next Token
 */

Parser.prototype.next = function() {
  return this.token = this.tokens.pop();
};

/**
 * Preview Next Token
 */

Parser.prototype.peek = function() {
  return this.tokens[this.tokens.length - 1] || 0;
};

/**
 * Parse Text Tokens
 */

Parser.prototype.parseText = function() {
  var body = this.token.text;

  while (this.peek().type === 'text') {
    body += '\n' + this.next().text;
  }

  return this.inline.output(body);
};

/**
 * Parse Current Token
 */

Parser.prototype.tok = function() {
  switch (this.token.type) {
    case 'space': {
      return '';
    }
    case 'hr': {
      return this.renderer.hr();
    }
    case 'heading': {
      return this.renderer.heading(
        this.inline.output(this.token.text),
        this.token.depth,
        unescape(this.inlineText.output(this.token.text)));
    }
    case 'code': {
      return this.renderer.code(this.token.text,
        this.token.lang,
        this.token.escaped);
    }
    case 'table': {
      var header = ''
        , body = ''
        , i
        , row
        , cell
        , j;

      // header
      cell = '';
      for (i = 0; i < this.token.header.length; i++) {
        cell += this.renderer.tablecell(
          this.inline.output(this.token.header[i]),
          { header: true, align: this.token.align[i] }
        );
      }
      header += this.renderer.tablerow(cell);

      for (i = 0; i < this.token.cells.length; i++) {
        row = this.token.cells[i];

        cell = '';
        for (j = 0; j < row.length; j++) {
          cell += this.renderer.tablecell(
            this.inline.output(row[j]),
            { header: false, align: this.token.align[j] }
          );
        }

        body += this.renderer.tablerow(cell);
      }
      return this.renderer.table(header, body);
    }
    case 'blockquote_start': {
      var body = '';

      while (this.next().type !== 'blockquote_end') {
        body += this.tok();
      }

      return this.renderer.blockquote(body);
    }
    case 'list_start': {
      var body = ''
        , ordered = this.token.ordered;

      while (this.next().type !== 'list_end') {
        body += this.tok();
      }

      return this.renderer.list(body, ordered);
    }
    case 'list_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.token.type === 'text'
          ? this.parseText()
          : this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'loose_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'html': {
      var html = !this.token.pre && !this.options.pedantic
        ? this.inline.output(this.token.text)
        : this.token.text;
      return this.renderer.html(html);
    }
    case 'paragraph': {
      return this.renderer.paragraph(this.inline.output(this.token.text));
    }
    case 'text': {
      return this.renderer.paragraph(this.parseText());
    }
  }
};

/**
 * Helpers
 */

function escape(html, encode) {
  return html
    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function unescape(html) {
	// explicitly match decimal, hex, and named HTML entities
  return html.replace(/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig, function(_, n) {
    n = n.toLowerCase();
    if (n === 'colon') return ':';
    if (n.charAt(0) === '#') {
      return n.charAt(1) === 'x'
        ? String.fromCharCode(parseInt(n.substring(2), 16))
        : String.fromCharCode(+n.substring(1));
    }
    return '';
  });
}

function replace(regex, opt) {
  regex = regex.source;
  opt = opt || '';
  return function self(name, val) {
    if (!name) return new RegExp(regex, opt);
    val = val.source || val;
    val = val.replace(/(^|[^\[])\^/g, '$1');
    regex = regex.replace(name, val);
    return self;
  };
}

function resolveUrl(base, href) {
  if (!baseUrls[' ' + base]) {
    // we can ignore everything in base after the last slash of its path component,
    // but we might need to add _that_
    // https://tools.ietf.org/html/rfc3986#section-3
    if (/^[^:]+:\/*[^/]*$/.test(base)) {
      baseUrls[' ' + base] = base + '/';
    } else {
      baseUrls[' ' + base] = base.replace(/[^/]*$/, '');
    }
  }
  base = baseUrls[' ' + base];

  if (href.slice(0, 2) === '//') {
    return base.replace(/:[\s\S]*/, ':') + href;
  } else if (href.charAt(0) === '/') {
    return base.replace(/(:\/*[^/]*)[\s\S]*/, '$1') + href;
  } else {
    return base + href;
  }
}
var baseUrls = {};
var originIndependentUrl = /^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;

function noop() {}
noop.exec = noop;

function merge(obj) {
  var i = 1
    , target
    , key;

  for (; i < arguments.length; i++) {
    target = arguments[i];
    for (key in target) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        obj[key] = target[key];
      }
    }
  }

  return obj;
}


/**
 * Marked
 */

function marked(src, opt, callback) {
  // throw error in case of non string input
  if (typeof src == 'undefined' || src === null)
    throw new Error('marked(): input parameter is undefined or null');
  if (typeof src != 'string')
    throw new Error('marked(): input parameter is of type ' +
      Object.prototype.toString.call(src) + ', string expected');


  if (callback || typeof opt === 'function') {
    if (!callback) {
      callback = opt;
      opt = null;
    }

    opt = merge({}, marked.defaults, opt || {});

    var highlight = opt.highlight
      , tokens
      , pending
      , i = 0;

    try {
      tokens = Lexer.lex(src, opt)
    } catch (e) {
      return callback(e);
    }

    pending = tokens.length;

    var done = function(err) {
      if (err) {
        opt.highlight = highlight;
        return callback(err);
      }

      var out;

      try {
        out = Parser.parse(tokens, opt);
      } catch (e) {
        err = e;
      }

      opt.highlight = highlight;

      return err
        ? callback(err)
        : callback(null, out);
    };

    if (!highlight || highlight.length < 3) {
      return done();
    }

    delete opt.highlight;

    if (!pending) return done();

    for (; i < tokens.length; i++) {
      (function(token) {
        if (token.type !== 'code') {
          return --pending || done();
        }
        return highlight(token.text, token.lang, function(err, code) {
          if (err) return done(err);
          if (code == null || code === token.text) {
            return --pending || done();
          }
          token.text = code;
          token.escaped = true;
          --pending || done();
        });
      })(tokens[i]);
    }

    return;
  }
  try {
    if (opt) opt = merge({}, marked.defaults, opt);
    return Parser.parse(Lexer.lex(src, opt), opt);
  } catch (e) {
    e.message += '\nPlease report this to https://github.com/chjj/marked.';
    if ((opt || marked.defaults).silent) {
      return '<p>An error occurred:</p><pre>'
        + escape(e.message + '', true)
        + '</pre>';
    }
    throw e;
  }
}

/**
 * Options
 */

marked.options =
marked.setOptions = function(opt) {
  merge(marked.defaults, opt);
  return marked;
};

marked.defaults = {
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  sanitizer: null,
  mangle: true,
  smartLists: false,
  silent: false,
  highlight: null,
  langPrefix: 'lang-',
  smartypants: false,
  headerPrefix: '',
  renderer: new Renderer,
  xhtml: false,
  baseUrl: null
};

/**
 * Expose
 */

marked.Parser = Parser;
marked.parser = Parser.parse;

marked.Renderer = Renderer;
marked.TextRenderer = TextRenderer;

marked.Lexer = Lexer;
marked.lexer = Lexer.lex;

marked.InlineLexer = InlineLexer;
marked.inlineLexer = InlineLexer.output;

marked.parse = marked;

if (true) {
  module.exports = marked;
} else if (typeof define === 'function' && define.amd) {
  define(function() { return marked; });
} else {
  this.marked = marked;
}

}).call(function() {
  return this || (typeof window !== 'undefined' ? window : global);
}());

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ }),
/* 151 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function _class() {
    _classCallCheck(this, _class);

    var renderer = new window.marked.Renderer();

    // Override function
    renderer.heading = function (text, level) {
        return "<header-anchor :level='" + escape(level) + "'>" + escape(text) + "</header-anchor>";
    };

    renderer.code = function (code, language) {
        return "</div></section><code-presenter language='" + escape(language) + "'>" + escape(code) + "</code-presenter><section class=\"section\"><div class=\"container content\">";
    };

    window.marked.setOptions({
        gfm: true,
        tables: true,
        breaks: true,
        sanitize: true,
        renderer: renderer
    });
};

/* harmony default export */ __webpack_exports__["a"] = (_class);

/***/ }),
/* 152 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(153)
/* template */
var __vue_template__ = __webpack_require__(154)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/dirtiki-input.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-b32e8554", Component.options)
  } else {
    hotAPI.reload("data-v-b32e8554", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 153 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
  props: {
    /**
     * Type of the input. Basically mimics HTML input type but enhance it
     * with a couple supported types.
     *     - text: a standard text input. By default, no validation is applied.
     *     - email
     *     - tel
     *     - number
     *     - password
     *     - date
     *     - datetime
     *     - digits: not using the html 5 number field but preventing entry of non digit characters.
     */
    type: {
      type: String,
      default: "text"
    },

    /**
     * The input's value. Retrive it by using v-model on this component.
     */
    value: {
      type: String,
      default: ""
    },

    /**
     * A boolean, true if the field is mandatory.
     */
    required: {
      type: Boolean,
      default: false
    },

    /**
     * Minimum length of the entry
     */
    minLength: {
      type: Number
    },

    /**
     * Maximum length of the entry
     */
    maxLength: {
      type: Number
    },

    /**
     * A string that the input must match (e.g. the value of a nearby password field
     * for a password confirmation input). Type weak.
     */
    mustMatch: {
      type: String
    },

    /**
     * An array of strings the string must end with to validate.
     * Used on the registration form to validate an email address agains't
     * a list of preapproved domains.
     */
    mustEndWith: {
      type: Array
    },

    /**
     * In the case of a 'number' type, step between numbers.
     */
    step: {
      type: Number
    },

    /**
     * In the case of a 'number' type, minimum numeric value.
     */
    min: {
      type: Number
    },

    /**
     * In the case of a 'number' type, maximum numeric value.
     */
    max: {
      type: Number
    },

    /**
     * For textarea only, rows attribute.
     */
    rows: {
      type: Number
    },

    /**
     * For textarea only, cols attribute.
     */
    cols: {
      type: Number
    },

    /**
     * A label. Will be displayed outside of the field.
     */
    label: {
      type: String
    },

    /**
     * The value of the autocomplete html attribute. If no 'name' is
     * provided, this value will be used in the 'name' field as
     * well.
     */
    autocomplete: {
      type: String
    },

    /**
     * The value of the name attribute
     */
    name: {
      type: String
    },

    /**
     * An array of custom classes to add to the field div. (eg. ['eight', 'wide']).
     */

    divClasses: {
      type: Array
    },

    /**
     * An array of custom classes to add to the html input.
     */

    inputClasses: {
      type: Array,
      default: function _default() {
        return [];
      }
    },

    /**
     * When true, the field cannot be edited but a user can tab to it, highlight it, and copy the text from it
     */
    readonly: {
      type: Boolean
    },

    /**
     * When true, the field is completely disabled and will not be sent with a form
     */
    disabled: {
      type: Boolean
    },

    /**
     * A list of error messages to display next to the field.
     */
    errorMessages: {
      type: Array,
      default: function _default() {
        return [];
      }
    },

    /**
     * True if the field should present a red color.
     */
    error: {
      type: Boolean
    },

    /**
     * An icon to add to input (does not work on textareas). Can be any class name that will render an icon.
     * For example, for a font-awesome checkmark icon, use "fa fa-check".
     */
    icon: {
      type: String
    },

    /**
     * If true, the field will validate itself on blur but will also display error messages.
     */
    shouldHardValidateOnBlur: {
      Type: Boolean
    }
  },

  data: function data() {
    return {
      messages: [],
      trans: {
        accepted: "The :attribute must be accepted.",
        active_url: "The :attribute is not a valid URL.",
        after: "The :attribute must be a date after :date.",
        after_or_equal: "The :attribute must be a date after or equal to :date.",
        alpha: "The :attribute may only contain letters.",
        alpha_dash: "The :attribute may only contain letters, numbers, and dashes.",
        alpha_num: "The :attribute may only contain letters and numbers.",
        array: "The :attribute must be an array.",
        before: "The :attribute must be a date before :date.",
        before_or_equal: "The :attribute must be a date before or equal to :date.",
        between: {
          numeric: "The :attribute must be between :min and :max.",
          file: "The :attribute must be between :min and :max kilobytes.",
          string: "The :attribute must be between :min and :max characters.",
          array: "The :attribute must have between :min and :max items."
        },
        boolean: "The :attribute field must be true or false.",
        confirmed: "The :attribute confirmation does not match.",
        date: "The :attribute is not a valid date.",
        date_format: "The :attribute does not match the format :format.",
        different: "The :attribute and :other must be different.",
        digits: "The :attribute must be :digits digits.",
        digits_between: "The :attribute must be between :min and :max digits.",
        dimensions: "The :attribute has invalid image dimensions.",
        distinct: "The :attribute field has a duplicate value.",
        email: "The :attribute must be a valid email address.",
        exists: "The selected :attribute is invalid.",
        file: "The :attribute must be a file.",
        filled: "The :attribute field must have a value.",
        image: "The :attribute must be an image.",
        in: "The selected :attribute is invalid.",
        in_array: "The :attribute field does not exist in :other.",
        integer: "The :attribute must be an integer.",
        ip: "The :attribute must be a valid IP address.",
        ipv4: "The :attribute must be a valid IPv4 address.",
        ipv6: "The :attribute must be a valid IPv6 address.",
        json: "The :attribute must be a valid JSON string.",
        max: {
          numeric: "The :attribute may not be greater than :max.",
          file: "The :attribute may not be greater than :max kilobytes.",
          string: "The :attribute may not be greater than :max characters.",
          array: "The :attribute may not have more than :max items."
        },
        mimes: "The :attribute must be a file of type: :values.",
        mimetypes: "The :attribute must be a file of type: :values.",
        min: {
          numeric: "The :attribute must be at least :min.",
          file: "The :attribute must be at least :min kilobytes.",
          string: "The :attribute must be at least :min characters.",
          array: "The :attribute must have at least :min items."
        },
        not_in: "The selected :attribute is invalid.",
        numeric: "The :attribute must be a number.",
        present: "The :attribute field must be present.",
        regex: "The :attribute format is invalid.",
        required: "The :attribute field is required.",
        required_if: "The :attribute field is required when :other is :value.",
        required_unless: "The :attribute field is required unless :other is in :values.",
        required_with: "The :attribute field is required when :values is present.",
        required_with_all: "The :attribute field is required when :values is present.",
        required_without: "The :attribute field is required when :values is not present.",
        required_without_all: "The :attribute field is required when none of :values are present.",
        same: "The :attribute and :other must match.",
        size: {
          numeric: "The :attribute must be :size.",
          file: "The :attribute must be :size kilobytes.",
          string: "The :attribute must be :size characters.",
          array: "The :attribute must contain :size items."
        },
        string: "The :attribute must be a string.",
        timezone: "The :attribute must be a valid zone.",
        unique: "The :attribute has already been taken.",
        uploaded: "The :attribute failed to upload.",
        url: "The :attribute format is invalid.",
        must_end_with: "The :attribute must end with the following: :end"
      }
    };
  },


  computed: {
    htmlType: function htmlType() {
      switch (this.type) {
        case "textarea":
          return "textarea";
        case "email":
          return "email";
        case "password":
          return "password";
        case "number":
          return "number";
        case "digits":
        case "tel":
          return "tel";
        case "date":
        case "datetime":
          return "date";
      }
      return "text";
    },
    dynamicInputClasses: function dynamicInputClasses() {
      var classes = this.inputClasses.slice();
      if (this.error) classes.push("is-danger");
      return classes;
    },
    dynamicMessages: function dynamicMessages() {
      return this.messages.concat(this.errorMessages);
    }
  },

  methods: {
    methodOnKeyUp: function methodOnKeyUp(value) {
      this.$emit("keyup", value);
    },
    methodOnBlur: function methodOnBlur(value) {
      this.$emit("onBlurBeforeValidate", this);

      this.validate(this.shouldHardValidateOnBlur);

      this.$emit("onBlurAfterValidate", this);
    },
    methodOnChange: function methodOnChange() {
      this.$emit("onChange", this);
    },
    methodOnUpdateValue: function methodOnUpdateValue(value) {
      this.$emit("input", value);
      this.value = value;
    },


    /**
     * Validate a field's minimum length.
     * @return boolean false if the name is valid, true if invalid.
     */
    isMinLengthInvalid: function isMinLengthInvalid() {
      if (!this.required && this.value == "") return false;
      var invalid = this.minLength && this.value.length < this.minLength;
      return invalid;
    },


    /**
     * Validate a field's maximum length.
     * @return boolean false if the name is valid, true if invalid.
     */
    isMaxLengthInvalid: function isMaxLengthInvalid() {
      var invalid = this.maxLength && this.value.length > this.maxLength;
      return invalid;
    },


    /**
     * Validate the email field.
     * @return boolean true if the email is invalid, false if valid.
     */
    isEmailInvalid: function isEmailInvalid() {
      if (this.value === "") return false;

      var reg = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
      return !reg.test(this.value);
    },


    /**
     * Validate the number field. Unlike digits, number accepts decimals.
     * @return boolean true if the value is invalid, false if valid.
     */
    isNumberInvalid: function isNumberInvalid() {
      var reg = /^-?\d*\.?\d*$/;
      return !reg.test(this.value);
    },


    /**
     * Validate the number field. Unlike digits, number accepts decimals.
     * @return boolean true if the value is invalid, false if valid.
     */
    isDigitsInvalid: function isDigitsInvalid() {
      return !isNaN(parseFloat(this.value)) && isFinite(this.value);
    },


    /**
     * Triggering this function will check the value of the field and validate
     * it. If the trigger is set to hard, error messages will be set for the
     * field and be displayed next to it.
     * @param  boolean hard If true, error messages will be displayed next to the field.
     * @return boolean      True if valid.
     */
    validate: function validate(hard) {
      var valid = true;
      var messages = [];

      // Make sure that we at least have an empty string to work with
      // since we can't even check for length on undefined.
      if (this.value === null) {
        this.value = "";
      }

      if (typeof this.value == "undefined") {
        this.value = "";
      }

      // Check for required fields.
      if (this.required && this.value === "") {
        valid = false;
        messages.push(this.trans.required.replace(":attribute", this.label));
      }

      // Check length
      if (this.isMinLengthInvalid()) {
        valid = false;
        var message = messages.push(this.trans.min.string.replace(":min", this.minLength).replace(":attribute", this.label));
      }
      if (this.isMaxLengthInvalid()) {
        valid = false;
        messages.push(this.trans.max.string.replace(":max", this.maxLength).replace(":attribute", this.label));
      }

      // Check for min and max values for numeric fields
      if ((this.type == "number" || this.type == "digit") && this.min != null && this.value < this.min) {
        valid = false;
        messages.push(this.trans.min.numeric.replace(":min", this.min).replace(":attribute", this.label));
      } else if ((this.type == "number" || this.type == "digit") && this.max != null && this.value > this.max) {
        valid = false;
        messages.push(this.trans.max.numeric.replace(":max", this.max).replace(":attribute", this.label));
      }

      // Email validation
      if (this.type == "email" && this.isEmailInvalid()) {
        valid = false;
        messages.push(this.trans.email.replace(":attribute", this.label));
      }

      // MustEndWith validation
      if (this.mustEndWith && !RegExp(".+(" + this.mustEndWith.join("|") + ")$").test(this.value)) {
        valid = false;
        messages.push(this.trans.must_end_with.replace(":attribute", this.label).replace(":end", this.mustEndWith.join(", ")));
      }

      // Number validation (for decimal steps)
      if (this.type == "number" && this.step % 1 != 0 && this.isNumberInvalid()) {
        valid = false;
        messages.push(this.trans.numeric.replace(":attribute", this.label));
      }

      // Digit validation (or number with an integer step)
      if ((this.type == "digit" || this.type == "number" && this.step % 1 == 0) && this.isDigitsInvalid()) {
        valid = false;
        messages.push(this.trans.integer.replace(":attribute", this.label));
      }

      // Exact match validation
      if (this.mustMatch && this.mustMatch != this.value) {
        valid = false;
        messages.push(this.trans.confirmed.replace(":attribute", this.label));
      }

      this.error = !valid;

      if (hard) {
        this.messages = messages;
      } else {
        this.messages = [];
      }

      return valid;
    }
  }
});

/***/ }),
/* 154 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "field" }, [
    _vm.label
      ? _c(
          "label",
          { staticClass: "label", attrs: { for: "input_" + _vm._uid } },
          [_vm._v(_vm._s(_vm.label))]
        )
      : _vm._e(),
    _vm._v(" "),
    _c(
      "div",
      {
        staticClass: "control",
        class: {
          "has-icons-left": _vm.error || _vm.icon,
          "has-icon-right": _vm.dynamicMessages.length || _vm.icon
        }
      },
      [
        _vm.htmlType === "textarea"
          ? _c("textarea", {
              staticClass: "textarea",
              class: { "is-danger": _vm.error },
              attrs: {
                placeholder: _vm.label,
                name: _vm.name ? _vm.name : _vm.autocomplete,
                autocomplete: _vm.autocomplete,
                rows: _vm.rows,
                cols: _vm.cols,
                readonly: _vm.readonly,
                disabled: _vm.disabled
              },
              domProps: { value: _vm.value },
              on: {
                input: function($event) {
                  _vm.methodOnUpdateValue($event.target.value)
                },
                keyup: _vm.methodOnKeyUp,
                change: _vm.methodOnChange,
                blur: _vm.methodOnBlur
              }
            })
          : _c("input", {
              staticClass: "input",
              class: _vm.dynamicInputClasses,
              attrs: {
                id: "input_" + _vm._uid,
                type: _vm.htmlType,
                placeholder: _vm.label,
                name: _vm.name ? _vm.name : _vm.autocomplete,
                autocomplete: _vm.autocomplete,
                step: _vm.step,
                min: _vm.min,
                max: _vm.max,
                readonly: _vm.readonly,
                disabled: _vm.disabled
              },
              domProps: { value: _vm.value },
              on: {
                input: function($event) {
                  _vm.methodOnUpdateValue($event.target.value)
                },
                keyup: _vm.methodOnKeyUp,
                change: _vm.methodOnChange,
                blur: _vm.methodOnBlur
              }
            }),
        _vm._v(" "),
        _vm.error || _vm.icon
          ? _c("span", { staticClass: "icon is-small is-left" }, [
              _vm.error
                ? _c("i", { staticClass: "fas fa-exclamation-triangle" })
                : _vm._e(),
              _vm._v(" "),
              _vm.icon ? _c("i", { class: _vm.icon }) : _vm._e()
            ])
          : _vm._e(),
        _vm._v(" "),
        _vm.dynamicMessages.length
          ? _c(
              "span",
              { staticClass: "help is-danger" },
              _vm._l(_vm.dynamicMessages, function(message) {
                return _c("span", { key: message }, [
                  _vm._v(_vm._s(message)),
                  _c("br")
                ])
              })
            )
          : _vm._e()
      ]
    )
  ])
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-b32e8554", module.exports)
  }
}

/***/ }),
/* 155 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(156)
/* template */
var __vue_template__ = __webpack_require__(157)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/loading-indicator.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-688c36b7", Component.options)
  } else {
    hotAPI.reload("data-v-688c36b7", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 156 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
  props: {
    size: {
      Type: Number,
      Default: 2
    }
  },
  computed: {
    sizeClass: function sizeClass() {
      return "fa-" + this.size + "x";
    }
  }
});

/***/ }),
/* 157 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "has-text-centered" }, [
    _c("i", { staticClass: "fas fa-spinner fa-spin", class: _vm.sizeClass })
  ])
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-688c36b7", module.exports)
  }
}

/***/ }),
/* 158 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(159)
}
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(162)
/* template */
var __vue_template__ = __webpack_require__(163)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-f151b61e"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/folding-panel.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-f151b61e", Component.options)
  } else {
    hotAPI.reload("data-v-f151b61e", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 159 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(160);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(2)("6ba67fb2", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-f151b61e\",\"scoped\":true,\"hasInlineConfig\":true}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./folding-panel.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-f151b61e\",\"scoped\":true,\"hasInlineConfig\":true}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./folding-panel.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 160 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "\n.panel-heading[data-v-f151b61e] {\r\n  cursor: pointer;\n}\r\n", ""]);

// exports


/***/ }),
/* 161 */
/***/ (function(module, exports) {

/**
 * Translates the list format produced by css-loader into something
 * easier to manipulate.
 */
module.exports = function listToStyles (parentId, list) {
  var styles = []
  var newStyles = {}
  for (var i = 0; i < list.length; i++) {
    var item = list[i]
    var id = item[0]
    var css = item[1]
    var media = item[2]
    var sourceMap = item[3]
    var part = {
      id: parentId + ':' + i,
      css: css,
      media: media,
      sourceMap: sourceMap
    }
    if (!newStyles[id]) {
      styles.push(newStyles[id] = { id: id, parts: [part] })
    } else {
      newStyles[id].parts.push(part)
    }
  }
  return styles
}


/***/ }),
/* 162 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
  props: {
    deployed: { type: Boolean, default: undefined },
    title: { type: String, required: true }
  },
  computed: {
    shouldBeDeployed: {
      get: function get() {
        if (typeof this.deployed === "undefined") {
          return this.enclosedDeployed;
        }
        return this.deployed;
      },
      set: function set(newValue) {
        if (typeof this.deployed === "undefined") {
          this.enclosedDeployed = newValue;
        }
      }
    }
  },
  data: function data() {
    return {
      enclosedDeployed: true
    };
  },

  methods: {
    toggle: function toggle() {
      this.$emit("toggle", this);
      this.shouldBeDeployed = !this.shouldBeDeployed;
    }
  }
});

/***/ }),
/* 163 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "panel" }, [
    _c("p", { staticClass: "panel-heading", on: { click: _vm.toggle } }, [
      _vm._v("\n    " + _vm._s(_vm.title) + "\n    "),
      _c("span", { staticClass: "is-pulled-right" }, [
        !_vm.shouldBeDeployed
          ? _c("i", { staticClass: "fas fa-caret-right" })
          : _vm._e(),
        _vm._v(" "),
        _vm.shouldBeDeployed
          ? _c("i", { staticClass: "fas fa-caret-down" })
          : _vm._e()
      ])
    ]),
    _vm._v(" "),
    _vm.shouldBeDeployed
      ? _c("div", { staticClass: "panel-block" }, [_vm._t("default")], 2)
      : _vm._e()
  ])
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-f151b61e", module.exports)
  }
}

/***/ }),
/* 164 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(165)
}
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(167)
/* template */
var __vue_template__ = __webpack_require__(168)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-0eb9636b"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/basic-paginator.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-0eb9636b", Component.options)
  } else {
    hotAPI.reload("data-v-0eb9636b", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 165 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(166);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(2)("c53ce77e", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-0eb9636b\",\"scoped\":true,\"hasInlineConfig\":true}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./basic-paginator.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-0eb9636b\",\"scoped\":true,\"hasInlineConfig\":true}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./basic-paginator.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 166 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "\n\n", ""]);

// exports


/***/ }),
/* 167 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
  props: {
    links: { type: Object, required: true },
    meta: { type: Object, required: false }
  },
  methods: {
    handleLinkClick: function handleLinkClick(url) {
      this.$emit("select", url);
    }
  },
  computed: {
    isLastPage: function isLastPage() {
      return this.links.next;
    },
    currentPageNumber: function currentPageNumber() {
      return this.meta ? this.meta.current_page : 1;
    },
    lastPageNumber: function lastPageNumber() {
      return this.meta ? this.meta.last_page : 1;
    },
    shouldShowLeftEllipsis: function shouldShowLeftEllipsis() {
      return this.currentPageNumber > 2;
    },
    shouldShowRightEllipsis: function shouldShowRightEllipsis() {
      return this.lastPageNumber - this.currentPageNumber > 1;
    },
    shouldShowFirstPageLink: function shouldShowFirstPageLink() {
      return this.currentPageNumber > 1;
    },
    shouldShowLastPageLink: function shouldShowLastPageLink() {
      return this.currentPageNumber != this.lastPageNumber;
    }
  }
});

/***/ }),
/* 168 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "nav",
    {
      staticClass: "pagination",
      attrs: { role: "navigation", "aria-label": "pagination" }
    },
    [
      _c(
        "a",
        {
          staticClass: "pagination-previous",
          attrs: { disabled: !_vm.links.prev },
          on: {
            click: function($event) {
              _vm.handleLinkClick(_vm.links.prev)
            }
          }
        },
        [
          _vm._v(
            _vm._s(
              _vm.$store.state.strings
                ? _vm.$store.state.strings.pagination.previous
                : ""
            )
          )
        ]
      ),
      _vm._v(" "),
      _c(
        "a",
        {
          staticClass: "pagination-next",
          attrs: { disabled: !_vm.links.next },
          on: {
            click: function($event) {
              _vm.handleLinkClick(_vm.links.next)
            }
          }
        },
        [
          _vm._v(
            _vm._s(
              _vm.$store.state.strings
                ? _vm.$store.state.strings.pagination.next
                : ""
            )
          )
        ]
      ),
      _vm._v(" "),
      _vm.meta
        ? _c("ul", { staticClass: "pagination-list" }, [
            _vm.shouldShowFirstPageLink
              ? _c("li", [
                  _c(
                    "a",
                    {
                      staticClass: "pagination-link",
                      attrs: {
                        "aria-label": _vm.$store.state.strings
                          ? _vm.$store.state.strings.pagination.aria_go_to.replace(
                              ":page",
                              1
                            )
                          : ""
                      },
                      on: {
                        click: function($event) {
                          _vm.handleLinkClick(_vm.links.first)
                        }
                      }
                    },
                    [_vm._v("1")]
                  )
                ])
              : _vm._e(),
            _vm._v(" "),
            _vm.shouldShowLeftEllipsis
              ? _c("li", [
                  _c("span", { staticClass: "pagination-ellipsis" }, [
                    _vm._v("…")
                  ])
                ])
              : _vm._e(),
            _vm._v(" "),
            _c("li", [
              _c(
                "a",
                {
                  staticClass: "pagination-link is-current",
                  attrs: {
                    "aria-label": _vm.$store.state.strings
                      ? _vm.$store.state.strings.pagination.aria_current.replace(
                          ":page",
                          _vm.currentPageNumber
                        )
                      : "",
                    "aria-current": "page"
                  }
                },
                [_vm._v(_vm._s(_vm.currentPageNumber))]
              )
            ]),
            _vm._v(" "),
            _vm.shouldShowRightEllipsis
              ? _c("li", [
                  _c("span", { staticClass: "pagination-ellipsis" }, [
                    _vm._v("…")
                  ])
                ])
              : _vm._e(),
            _vm._v(" "),
            _vm.shouldShowLastPageLink
              ? _c("li", [
                  _c(
                    "a",
                    {
                      staticClass: "pagination-link",
                      attrs: {
                        "aria-label": _vm.$store.state.strings
                          ? _vm.$store.state.strings.pagination.aria_go_to.replace(
                              ":page",
                              _vm.lastPageNumber
                            )
                          : ""
                      },
                      on: {
                        click: function($event) {
                          _vm.handleLinkClick(_vm.links.last)
                        }
                      }
                    },
                    [_vm._v(_vm._s(_vm.lastPageNumber))]
                  )
                ])
              : _vm._e()
          ])
        : _vm._e()
    ]
  )
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-0eb9636b", module.exports)
  }
}

/***/ }),
/* 169 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(170)
}
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(172)
/* template */
var __vue_template__ = __webpack_require__(174)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-96fe0042"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/search-modal.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-96fe0042", Component.options)
  } else {
    hotAPI.reload("data-v-96fe0042", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 170 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(171);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(2)("107cecfc", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-96fe0042\",\"scoped\":true,\"hasInlineConfig\":true}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./search-modal.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-96fe0042\",\"scoped\":true,\"hasInlineConfig\":true}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./search-modal.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 171 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "\n.panel[data-v-96fe0042] {\r\n  background-color: white;\n}\r\n", ""]);

// exports


/***/ }),
/* 172 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var debounce = __webpack_require__(173);

/* harmony default export */ __webpack_exports__["default"] = ({
  components: {},
  props: {
    value: {
      type: String,
      required: true
    }
  },
  data: function data() {
    return {
      loading: false,
      results: [],
      initialSearchField: null,
      debouncer: function debouncer() {}
    };
  },
  mounted: function mounted() {
    this.debouncer = debounce(this.refreshResults, 250, {
      maxWait: 1000
    });

    /*
        Keep track of the element that presented the search field, so we can
        give it back the focus when dismissed.
    */
    this.initialSearchField = document.activeElement;

    /*
        Transfer focus to the search field at the forefront.
        We need to manually empty the field first (without triggering a change
        on the query model) so Firefox puts the cursor at the very end of the
        already typed in string.
    */
    var searchFieldId = "#search-field-" + this._uid;
    var searchField = this.$el.querySelector(searchFieldId);
    searchField.value = "";
    searchField.focus();
    searchField.value = this.value;
  },
  beforeDestroy: function beforeDestroy() {
    // Give focus to the element where user initially started typing
    // her request.
    if (this.initialSearchField) {
      this.initialSearchField.focus();
    }
  },

  methods: {
    handleInput: function handleInput(input) {
      this.$emit("input", input);
    },
    clear: function clear() {
      this.value = "";
      this.$emit("input", "");
    },
    refreshResults: function refreshResults() {
      var _this = this;

      this.loading = true;
      this.$http.get("api/pages/search", {
        params: {
          query: this.value
        }
      }).then(function (_ref) {
        var data = _ref.data;

        _this.results = data.data;
        _this.loading = false;
      });
    }
  }
});

/***/ }),
/* 173 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now = function() {
  return root.Date.now();
};

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        result = wait - timeSinceLastCall;

    return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

module.exports = debounce;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ }),
/* 174 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "modal is-active" }, [
    _c("div", { staticClass: "modal-background" }),
    _vm._v(" "),
    _c(
      "div",
      { staticClass: "modal-content panel" },
      [
        _c("div", { staticClass: "panel-block" }, [
          _c(
            "p",
            {
              staticClass: "control has-icons-left",
              class: { "is-loading": _vm.loading }
            },
            [
              _c("input", {
                staticClass: "input",
                attrs: {
                  id: "search-field-" + _vm._uid,
                  type: "text",
                  placeholder: "search"
                },
                on: {
                  input: function($event) {
                    _vm.handleInput($event.target.value)
                  },
                  keyup: _vm.debouncer
                }
              }),
              _vm._v(" "),
              _vm._m(0)
            ]
          )
        ]),
        _vm._v(" "),
        _vm._l(_vm.results, function(result) {
          return _c(
            "a",
            {
              key: result.id,
              staticClass: "panel-block",
              attrs: { href: result.permalink }
            },
            [_vm._v("\n            " + _vm._s(result.name) + "\n        ")]
          )
        })
      ],
      2
    ),
    _vm._v(" "),
    _c("button", {
      staticClass: "modal-close is-large",
      attrs: { "aria-label": "close" },
      on: { click: _vm.clear }
    })
  ])
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("span", { staticClass: "icon is-small is-left" }, [
      _c("i", { staticClass: "fas fa-search" })
    ])
  }
]
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-96fe0042", module.exports)
  }
}

/***/ }),
/* 175 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(176)
}
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(178)
/* template */
var __vue_template__ = __webpack_require__(213)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/page-viewer.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-eeec826e", Component.options)
  } else {
    hotAPI.reload("data-v-eeec826e", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 176 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(177);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(2)("0544e5be", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-eeec826e\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./page-viewer.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-eeec826e\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./page-viewer.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 177 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "\n.content img {\r\n  display: block;\r\n  margin-left: auto;\r\n  margin-right: auto;\r\n  max-width: 75%;\n}\r\n", ""]);

// exports


/***/ }),
/* 178 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
  components: {
    markdownRenderer: __webpack_require__(179)
  },
  props: {
    pageJson: { Type: String, Required: true }
  },
  data: function data() {
    return {
      page: null
    };
  },
  mounted: function mounted() {
    this.page = JSON.parse(this.pageJson);
  }
});

/***/ }),
/* 179 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(180)
/* template */
var __vue_template__ = null
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/markdown-renderer.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-6331aa5a", Component.options)
  } else {
    hotAPI.reload("data-v-6331aa5a", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 180 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//

/* harmony default export */ __webpack_exports__["default"] = ({
  props: {
    value: { Type: String, Required: true }
  },
  methods: {
    parseMarkdown: function parseMarkdown() {
      return window.marked(this.value);
    }
  },
  render: function render(createElement) {
    var template = this.parseMarkdown(this.value);
    var component = Vue.component("rendered-markdown", {
      template: "<article><section class='section'><div class='container content'>" + template + "</div></section></article>",
      components: {
        headerAnchor: __webpack_require__(181),
        codePresenter: __webpack_require__(190)
      }
    });

    return createElement("div", {}, [createElement(component)]);
  }
});

/***/ }),
/* 181 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(182)
}
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(184)
/* template */
var __vue_template__ = null
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-3f98b6ee"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/header-anchor.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-3f98b6ee", Component.options)
  } else {
    hotAPI.reload("data-v-3f98b6ee", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 182 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(183);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(2)("a4d87160", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-3f98b6ee\",\"scoped\":true,\"hasInlineConfig\":true}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./header-anchor.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-3f98b6ee\",\"scoped\":true,\"hasInlineConfig\":true}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./header-anchor.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 183 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "\nsmall[data-v-3f98b6ee] {\r\n  color: hsl(217, 71%, 53%);\r\n  font-size: 0.8em;\n}\nsmall i[data-v-3f98b6ee] {\r\n  position: relative;\r\n  top: -1em;\r\n  font-size: 0.8em;\n}\r\n", ""]);

// exports


/***/ }),
/* 184 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
  components: {
    tocBox: __webpack_require__(185)
  },
  props: {
    level: { Type: Number, Required: true }
  },
  data: function data() {
    return {
      showHelper: false,
      showLink: false,
      isFirst: null
    };
  },

  computed: {
    anchor: function anchor() {
      return this.$slots.default[0].text.toLowerCase().replace(/[^\w]+/g, "-");
    },
    safeAnchor: function safeAnchor() {
      return this.anchor + "-" + this._uid;
    },
    safeLinkUrl: function safeLinkUrl() {
      return document.location.href.substr(0, document.location.href.indexOf("#")) + "#" + this.safeAnchor;
    },
    linkUrl: function linkUrl() {
      return document.location.href.substr(0, document.location.href.indexOf("#")) + "#" + this.anchor;
    }
  },
  mounted: function mounted() {
    this.isFirst = !Object.keys(this.$store.state.parsed.headers).length;

    if (!this.$store.state.parsed.headers[this.anchor]) {
      this.$store.commit({
        type: "setParsedHeader",
        key: this.safeAnchor,
        header: {
          title: this.$slots.default[0].text,
          level: this.level,
          link: this.safeLinkUrl,
          chaining: Object.keys(this.$store.state.parsed.headers).length
        }
      });
    }
  },
  destroyed: function destroyed() {
    this.$store.unsetParsedHeader(this.anchor);
  },
  render: function render(createElement) {
    var self = this;

    var anchorA = createElement("a", {
      domProps: {
        name: this.anchor,
        href: "#" + this.anchor
      }
    });

    var safeAnchorA = createElement("a", {
      domProps: {
        name: this.safeAnchor,
        href: "#" + this.safeAnchor
      }
    });

    var helperSmall = createElement("small", [createElement("i", { class: ["fas", "fa-link"] })]);

    var mainSpanChildren = [this.$slots.default];
    if (this.showHelper && !this.showLink) mainSpanChildren.push(helperSmall);

    var mainSpan = createElement("span", {
      on: {
        mouseover: function mouseover() {
          self.showHelper = true;
        },
        mouseleave: function mouseleave() {
          self.showHelper = false;
        },
        click: function click(e) {
          self.showLink = true;
        }
      }
    }, mainSpanChildren);

    var linkSpan = createElement("span", [createElement("br"), createElement("small", [self.linkUrl])]);

    var headingContent = [anchorA, safeAnchorA, mainSpan];
    if (this.showLink) headingContent.push(linkSpan);

    var toc = void 0;
    if (this.isFirst) {
      toc = createElement("toc-box");
    }

    var header = createElement("h" + this.level, headingContent);

    return createElement("div", this.isFirst ? [toc, header] : [header]);
  }
});

/***/ }),
/* 185 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(186)
}
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(188)
/* template */
var __vue_template__ = __webpack_require__(189)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-429e1e02"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/toc-box.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-429e1e02", Component.options)
  } else {
    hotAPI.reload("data-v-429e1e02", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 186 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(187);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(2)("48ebdcb6", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-429e1e02\",\"scoped\":true,\"hasInlineConfig\":true}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./toc-box.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-429e1e02\",\"scoped\":true,\"hasInlineConfig\":true}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./toc-box.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 187 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "\n.toc[data-v-429e1e02] {\n  border: 1px solid #dbdbdb;\n  padding: 1em;\n  overflow: hidden;\n}\n.toc div.level2[data-v-429e1e02] {\n  font-size: 0.8em;\n  margin-left: 2em;\n}\n.toc div.level3[data-v-429e1e02] {\n  font-size: 0.8em;\n  margin-left: 3em;\n}\n.toc div.level4[data-v-429e1e02] {\n  font-size: 0.8em;\n  margin-left: 4em;\n}\n.toc div.level5[data-v-429e1e02] {\n  font-size: 0.8em;\n  margin-left: 5em;\n}\n.toc div.level6[data-v-429e1e02] {\n  font-size: 0.8em;\n  margin-left: 6em;\n}\n", ""]);

// exports


/***/ }),
/* 188 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
  computed: {
    headers: function headers() {
      var headers = Object.values(this.$store.state.parsed.headers);
      return headers.sort(function (a, b) {
        if (a.chaining < b.chaining) return -1;
        if (a.chaining > b.chaining) return 1;
        return 0;
      });
    }
  }
});

/***/ }),
/* 189 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "columns" }, [
    _c("div", { staticClass: "column is-one-third" }, [
      _c(
        "nav",
        { staticClass: "toc" },
        _vm._l(_vm.headers, function(header, key) {
          return _c("div", { key: key, class: "level" + header.level }, [
            _c("a", { attrs: { href: header.link } }, [
              _vm._v(
                "\n                    " +
                  _vm._s(header.title) +
                  "\n                "
              )
            ])
          ])
        })
      )
    ])
  ])
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-429e1e02", module.exports)
  }
}

/***/ }),
/* 190 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(191)
}
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(193)
/* template */
var __vue_template__ = __webpack_require__(212)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-75ef749f"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/code-presenter.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-75ef749f", Component.options)
  } else {
    hotAPI.reload("data-v-75ef749f", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 191 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(192);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(2)("71f76bd3", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-75ef749f\",\"scoped\":true,\"hasInlineConfig\":true}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./code-presenter.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-75ef749f\",\"scoped\":true,\"hasInlineConfig\":true}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./code-presenter.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 192 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "\naside[data-v-75ef749f] {\r\n  background-color: #fafafa;\n}\npre[data-v-75ef749f] {\r\n  background-color: initial;\r\n  font-size: 1em;\r\n  padding: 0;\n}\r\n", ""]);

// exports


/***/ }),
/* 193 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
  components: {
    codeHighlighter: __webpack_require__(194),
    geojsonRenderer: __webpack_require__(200)
  },
  props: {
    language: { type: String, required: false }
  },
  data: function data() {
    return {
      allowHighlights: true,
      allowMaps: true,
      selectedType: null
    };
  },

  watch: {
    "$store.state.maps.provider": function $storeStateMapsProvider() {
      this.selectDefaultPresentationType();
    }
  },
  computed: {
    code: function code() {
      var code = this.$slots.default[0].text;
      return code;
    },
    rawCode: function rawCode() {
      return unescape(this.code);
    },
    availablePresentations: function availablePresentations() {
      var presentations = [];

      if (this.allowMaps && this.language === "geojson" && this.$store.state.maps.provider) {
        presentations.push({
          type: "map",
          label: "Map"
        });
      }

      if (this.allowHighlights) {
        presentations.push({
          type: "highlighted",
          label: "Highlighted"
        });
      }

      presentations.push({
        type: "raw",
        label: "Raw"
      });

      return presentations;
    }
  },
  mounted: function mounted() {
    var _this = this;

    this.$nextTick(function () {
      _this.selectDefaultPresentationType();
    });
  },

  methods: {
    selectDefaultPresentationType: function selectDefaultPresentationType() {
      this.selectedType = this.availablePresentations[0].type;
    }
  }
});

/***/ }),
/* 194 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(195)
}
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(197)
/* template */
var __vue_template__ = __webpack_require__(199)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-44eb8e18"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/code-highlighter.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-44eb8e18", Component.options)
  } else {
    hotAPI.reload("data-v-44eb8e18", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 195 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(196);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(2)("cd00b406", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-44eb8e18\",\"scoped\":true,\"hasInlineConfig\":true}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./code-highlighter.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-44eb8e18\",\"scoped\":true,\"hasInlineConfig\":true}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./code-highlighter.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 196 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "\npre code[data-v-44eb8e18] .token.number {\r\n  font-size: 1em;\r\n  background-color: inherit;\r\n  border-radius: 0;\r\n  height: inherit;\r\n  margin: 0;\r\n  padding: 0;\n}\r\n", ""]);

// exports


/***/ }),
/* 197 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var Prism = __webpack_require__(18);
__webpack_require__(19);
__webpack_require__(20);
__webpack_require__(21);
__webpack_require__(22);
__webpack_require__(23);
__webpack_require__(24);
//require("prismjs/components/prism-cpp");
__webpack_require__(25);
__webpack_require__(26);
__webpack_require__(27);
//require("prismjs/components/prism-objectivec");
var beautify = __webpack_require__(198);

var prismLanguages = {
  html: Prism.languages.html,
  css: Prism.languages.css,
  clike: Prism.languages.clike,
  json: Prism.languages.json,
  javascript: Prism.languages.javascript,
  php: Prism.languages.php,
  sql: Prism.languages.sql,
  java: Prism.languages.java,
  csharp: Prism.languages.csharp,
  python: Prism.languages.python,
  cpp: Prism.languages.clike,
  c: Prism.languages.clike,
  typescript: Prism.languages.typescript,
  ruby: Prism.languages.ruby,
  swift: Prism.languages.swift,
  objectivec: Prism.languages.clike,
  geojson: Prism.languages.json
};

/* harmony default export */ __webpack_exports__["default"] = ({
  props: {
    language: { type: String, required: false }
  },
  computed: {
    code: function code() {
      var code = this.$slots.default[0].text;

      if (this.language === "json") {
        try {
          return beautify(JSON.parse(unescape(code)), null, 2, 100);
        } catch (e) {}
      }
      return code;
    },
    highlightedCode: function highlightedCode() {
      if (!this.code) {
        return "";
      }

      if (prismLanguages[this.language]) {
        try {
          return this.renderPrismHtml();
        } catch (e) {}
      }

      this.$emit("error");
      return null;
    }
  },
  methods: {
    renderPrismHtml: function renderPrismHtml() {
      return Prism.highlight(unescape(this.code), prismLanguages[this.language]);
    }
  }
});

/***/ }),
/* 198 */
/***/ (function(module, exports) {


var rx_escapable = /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

var gap,
    indent,
    meta = { // table of character substitutions
      '\b': '\\b',
      '\t': '\\t',
      '\n': '\\n',
      '\f': '\\f',
      '\r': '\\r',
      '"': '\\"',
      '\\': '\\\\'
    },
    rep;

function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

    rx_escapable.lastIndex = 0;
    return rx_escapable.test(string)
        ? '"' + string.replace(rx_escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"'
        : '"' + string + '"';
}


function str(key, holder, limit) {

// Produce a string from holder[key].

    var i,          // The loop counter.
        k,          // The member key.
        v,          // The member value.
        length,
        mind = gap,
        partial,
        value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

    if (value && typeof value === 'object' &&
            typeof value.toJSON === 'function') {
        value = value.toJSON(key);
    }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

    if (typeof rep === 'function') {
        value = rep.call(holder, key, value);
    }

// What happens next depends on the value's type.

    switch (typeof value) {
    case 'string':
        return quote(value);

    case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

        return isFinite(value)
            ? String(value)
            : 'null';

    case 'boolean':
    case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

        return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

    case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

        if (!value) {
            return 'null';
        }

// Make an array to hold the partial results of stringifying this object value.

        gap += indent;
        partial = [];

// Is the value an array?

        if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

            length = value.length;
            for (i = 0; i < length; i += 1) {
                partial[i] = str(i, value, limit) || 'null';
            }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

            v = partial.length === 0
                ? '[]'
                : gap
                    ? (
                      gap.length + partial.join(', ').length + 4 > limit ?
                      '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                      '[ ' + partial.join(', ') + ' ]'
                    )
                    : '[' + partial.join(',') + ']';
            gap = mind;
            return v;
        }

// If the replacer is an array, use it to select the members to be stringified.

        if (rep && typeof rep === 'object') {
            length = rep.length;
            for (i = 0; i < length; i += 1) {
                if (typeof rep[i] === 'string') {
                    k = rep[i];
                    v = str(k, value, limit);
                    if (v) {
                        partial.push(quote(k) + (
                            gap
                                ? ': '
                                : ':'
                        ) + v);
                    }
                }
            }
        } else {

// Otherwise, iterate through all of the keys in the object.

            for (k in value) {
                if (Object.prototype.hasOwnProperty.call(value, k)) {
                    v = str(k, value, limit);
                    if (v) {
                        partial.push(quote(k) + (
                            gap
                                ? ': '
                                : ':'
                        ) + v);
                    }
                }
            }
        }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

        v = partial.length === 0
            ? '{}'
            : gap
                ? (
                  gap.length + partial.join(', ').length + 4 > limit ?
                  '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
                  '{ ' + partial.join(', ') + ' }'
                )
                : '{' + partial.join(',') + '}';
        gap = mind;
        return v;
    }
}


function beautify (value, replacer, space, limit) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

  var i;
  gap = '';
  indent = '';

  if (!limit) limit = 0;

  if (typeof limit !== "number")
    throw new Error("beaufifier: limit must be a number");

// If the space parameter is a number, make an indent string containing that
// many spaces.

  if (typeof space === 'number') {
      for (i = 0; i < space; i += 1) {
          indent += ' ';
      }

// If the space parameter is a string, it will be used as the indent string.

  } else if (typeof space === 'string') {
      indent = space;
  }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

  rep = replacer;
  if (replacer && typeof replacer !== 'function' &&
          (typeof replacer !== 'object' ||
          typeof replacer.length !== 'number')) {
      throw new Error('beautifier: wrong replacer parameter');
  }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

  return str('', {'': value}, limit);
}

module.exports = beautify;


/***/ }),
/* 199 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("section", { staticClass: "section" }, [
    _c("div", { staticClass: "container" }, [
      _c("pre", { class: "language-" + _vm.language }, [
        _c("code", { domProps: { innerHTML: _vm._s(_vm.highlightedCode) } })
      ])
    ])
  ])
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-44eb8e18", module.exports)
  }
}

/***/ }),
/* 200 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(201)
}
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(203)
/* template */
var __vue_template__ = __webpack_require__(211)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-04caaaee"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/geojson-renderer.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-04caaaee", Component.options)
  } else {
    hotAPI.reload("data-v-04caaaee", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 201 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(202);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(2)("19716058", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-04caaaee\",\"scoped\":true,\"hasInlineConfig\":true}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./geojson-renderer.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-04caaaee\",\"scoped\":true,\"hasInlineConfig\":true}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./geojson-renderer.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 202 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "\n.map[data-v-04caaaee] {\r\n  height: 80vh;\n}\r\n", ""]);

// exports


/***/ }),
/* 203 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//

var geojsonExtent = __webpack_require__(204);

/* harmony default export */ __webpack_exports__["default"] = ({
  props: {},
  data: function data() {
    return {
      map: null
    };
  },

  computed: {
    geojson: function geojson() {
      var code = this.$slots.default[0].text;

      try {
        return JSON.parse(unescape(code));
      } catch (e) {
        this.$emit("error");
      }
    },
    bounds: function bounds() {
      if (!this.geojson) return [0, 0, 0, 0];
      return geojsonExtent(this.geojson);
    }
  },
  mounted: function mounted() {
    if (this.$store.state.maps.provider === "mapbox") {
      this.instanciateMapboxMap();
    } else if (this.$store.state.maps.provider === "google") {
      this.instanciateGoogleMap();
    }
  },

  methods: {
    instanciateGoogleMap: function instanciateGoogleMap() {
      var extent = geojsonExtent(this.geojson);
      var map = new google.maps.Map(document.getElementById("map_" + this._uid), {
        center: { lat: this.bounds[1], lng: this.bounds[0] },
        zoom: 4
      });
      map.data.addGeoJson(this.geojson);

      map.data.setStyle(function (feature) {
        var defaultColor = "hsl(0, 0%, 21%)";
        return (/** @type {google.maps.Data.StyleOptions} */{
            fillColor: feature.getProperty("fill") ? feature.getProperty("fill") : defaultColor,
            fillOpacity: feature.getProperty("fill-opacity") ? feature.getProperty("fill-opacity") : 0.5,
            strokeColor: feature.getProperty("stroke") ? feature.getProperty("stroke") : defaultColor,
            strokeWeight: feature.getProperty("stroke-width") ? feature.getProperty("stroke-width") : 1,
            strokeOpacity: feature.getProperty("stroke-opacity") ? feature.getProperty("stroke-opacity") : 1
          }
        );
      });

      var bounds = new google.maps.LatLngBounds();
      bounds.extend(new google.maps.LatLng(this.bounds[1], this.bounds[0]));
      bounds.extend(new google.maps.LatLng(this.bounds[3], this.bounds[2]));
      map.fitBounds(bounds);
      this.map = map;
    },
    instanciateMapboxMap: function instanciateMapboxMap() {
      var _this = this;

      var map = new mapboxgl.Map({
        container: "map_" + this._uid,
        style: "mapbox://styles/mapbox/streets-v9"
      });
      map.scrollZoom.disable();

      map.fitBounds(this.bounds, {
        padding: 20,
        duration: 0
      });

      map.on("load", function () {
        map.addSource("code-content", {
          type: "geojson",
          data: _this.geojson
        });

        map.addLayer({
          id: "geojson-shapes",
          type: "fill",
          source: "code-content",
          paint: {
            "fill-color": ["get", "fill"],
            "fill-opacity": 0.5
          },
          filter: ["==", "$type", "Polygon"]
        });

        map.addLayer({
          id: "code-points",
          type: "circle",
          source: "code-content",
          paint: {
            "circle-radius": 6,
            "circle-color": ["get", "marker-color"]
          },
          filter: ["==", "$type", "Point"]
        });

        map.addLayer({
          id: "code-lines",
          type: "line",
          source: "code-content",
          layout: {
            "line-join": "round",
            "line-cap": "round"
          },
          paint: {
            "line-color": ["get", "stroke"],
            "line-width": ["get", "stroke-width"]
          },
          filter: ["==", "$type", "LineString"]
        });
      });

      this.map = map;
    }
  }
});

/***/ }),
/* 204 */
/***/ (function(module, exports, __webpack_require__) {

var geojsonCoords = __webpack_require__(205),
    traverse = __webpack_require__(209),
    extent = __webpack_require__(210);

module.exports = function(_) {
    return getExtent(_).bbox();
};

module.exports.polygon = function(_) {
    return getExtent(_).polygon();
};

module.exports.bboxify = function(_) {
    return traverse(_).map(function(value) {
        if (value && typeof value.type === 'string') {
            value.bbox = getExtent(value).bbox();
            this.update(value);
        }
    });
};

function getExtent(_) {
    var bbox = [Infinity, Infinity, -Infinity, -Infinity],
        ext = extent(),
        coords = geojsonCoords(_);
    for (var i = 0; i < coords.length; i++) ext.include(coords[i]);
    return ext;
}


/***/ }),
/* 205 */
/***/ (function(module, exports, __webpack_require__) {

var geojsonNormalize = __webpack_require__(206),
    geojsonFlatten = __webpack_require__(207),
    flatten = __webpack_require__(208);

module.exports = function(_) {
    if (!_) return [];
    var normalized = geojsonFlatten(geojsonNormalize(_)),
        coordinates = [];
    normalized.features.forEach(function(feature) {
        if (!feature.geometry) return;
        coordinates = coordinates.concat(flatten(feature.geometry.coordinates));
    });
    return coordinates;
};


/***/ }),
/* 206 */
/***/ (function(module, exports) {

module.exports = normalize;

var types = {
    Point: 'geometry',
    MultiPoint: 'geometry',
    LineString: 'geometry',
    MultiLineString: 'geometry',
    Polygon: 'geometry',
    MultiPolygon: 'geometry',
    GeometryCollection: 'geometry',
    Feature: 'feature',
    FeatureCollection: 'featurecollection'
};

/**
 * Normalize a GeoJSON feature into a FeatureCollection.
 *
 * @param {object} gj geojson data
 * @returns {object} normalized geojson data
 */
function normalize(gj) {
    if (!gj || !gj.type) return null;
    var type = types[gj.type];
    if (!type) return null;

    if (type === 'geometry') {
        return {
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                properties: {},
                geometry: gj
            }]
        };
    } else if (type === 'feature') {
        return {
            type: 'FeatureCollection',
            features: [gj]
        };
    } else if (type === 'featurecollection') {
        return gj;
    }
}


/***/ }),
/* 207 */
/***/ (function(module, exports) {

module.exports = flatten;

function flatten(gj, up) {
    switch ((gj && gj.type) || null) {
        case 'FeatureCollection':
            gj.features = gj.features.reduce(function(mem, feature) {
                return mem.concat(flatten(feature));
            }, []);
            return gj;
        case 'Feature':
            return flatten(gj.geometry).map(function(geom) {
                return {
                    type: 'Feature',
                    properties: JSON.parse(JSON.stringify(gj.properties)),
                    geometry: geom
                };
            });
        case 'MultiPoint':
            return gj.coordinates.map(function(_) {
                return { type: 'Point', coordinates: _ };
            });
        case 'MultiPolygon':
            return gj.coordinates.map(function(_) {
                return { type: 'Polygon', coordinates: _ };
            });
        case 'MultiLineString':
            return gj.coordinates.map(function(_) {
                return { type: 'LineString', coordinates: _ };
            });
        case 'GeometryCollection':
            return gj.geometries;
        case 'Point':
        case 'Polygon':
        case 'LineString':
            return [gj];
        default:
            return gj;
    }
}


/***/ }),
/* 208 */
/***/ (function(module, exports) {

module.exports = function flatten(list, depth) {
    return _flatten(list);

    function _flatten(list) {
        if (Array.isArray(list) && list.length &&
            typeof list[0] === 'number') {
            return [list];
        }
        return list.reduce(function (acc, item) {
            if (Array.isArray(item) && Array.isArray(item[0])) {
                return acc.concat(_flatten(item));
            } else {
                acc.push(item);
                return acc;
            }
        }, []);
    }
};


/***/ }),
/* 209 */
/***/ (function(module, exports) {

var traverse = module.exports = function (obj) {
    return new Traverse(obj);
};

function Traverse (obj) {
    this.value = obj;
}

Traverse.prototype.get = function (ps) {
    var node = this.value;
    for (var i = 0; i < ps.length; i ++) {
        var key = ps[i];
        if (!node || !hasOwnProperty.call(node, key)) {
            node = undefined;
            break;
        }
        node = node[key];
    }
    return node;
};

Traverse.prototype.has = function (ps) {
    var node = this.value;
    for (var i = 0; i < ps.length; i ++) {
        var key = ps[i];
        if (!node || !hasOwnProperty.call(node, key)) {
            return false;
        }
        node = node[key];
    }
    return true;
};

Traverse.prototype.set = function (ps, value) {
    var node = this.value;
    for (var i = 0; i < ps.length - 1; i ++) {
        var key = ps[i];
        if (!hasOwnProperty.call(node, key)) node[key] = {};
        node = node[key];
    }
    node[ps[i]] = value;
    return value;
};

Traverse.prototype.map = function (cb) {
    return walk(this.value, cb, true);
};

Traverse.prototype.forEach = function (cb) {
    this.value = walk(this.value, cb, false);
    return this.value;
};

Traverse.prototype.reduce = function (cb, init) {
    var skip = arguments.length === 1;
    var acc = skip ? this.value : init;
    this.forEach(function (x) {
        if (!this.isRoot || !skip) {
            acc = cb.call(this, acc, x);
        }
    });
    return acc;
};

Traverse.prototype.paths = function () {
    var acc = [];
    this.forEach(function (x) {
        acc.push(this.path); 
    });
    return acc;
};

Traverse.prototype.nodes = function () {
    var acc = [];
    this.forEach(function (x) {
        acc.push(this.node);
    });
    return acc;
};

Traverse.prototype.clone = function () {
    var parents = [], nodes = [];
    
    return (function clone (src) {
        for (var i = 0; i < parents.length; i++) {
            if (parents[i] === src) {
                return nodes[i];
            }
        }
        
        if (typeof src === 'object' && src !== null) {
            var dst = copy(src);
            
            parents.push(src);
            nodes.push(dst);
            
            forEach(objectKeys(src), function (key) {
                dst[key] = clone(src[key]);
            });
            
            parents.pop();
            nodes.pop();
            return dst;
        }
        else {
            return src;
        }
    })(this.value);
};

function walk (root, cb, immutable) {
    var path = [];
    var parents = [];
    var alive = true;
    
    return (function walker (node_) {
        var node = immutable ? copy(node_) : node_;
        var modifiers = {};
        
        var keepGoing = true;
        
        var state = {
            node : node,
            node_ : node_,
            path : [].concat(path),
            parent : parents[parents.length - 1],
            parents : parents,
            key : path.slice(-1)[0],
            isRoot : path.length === 0,
            level : path.length,
            circular : null,
            update : function (x, stopHere) {
                if (!state.isRoot) {
                    state.parent.node[state.key] = x;
                }
                state.node = x;
                if (stopHere) keepGoing = false;
            },
            'delete' : function (stopHere) {
                delete state.parent.node[state.key];
                if (stopHere) keepGoing = false;
            },
            remove : function (stopHere) {
                if (isArray(state.parent.node)) {
                    state.parent.node.splice(state.key, 1);
                }
                else {
                    delete state.parent.node[state.key];
                }
                if (stopHere) keepGoing = false;
            },
            keys : null,
            before : function (f) { modifiers.before = f },
            after : function (f) { modifiers.after = f },
            pre : function (f) { modifiers.pre = f },
            post : function (f) { modifiers.post = f },
            stop : function () { alive = false },
            block : function () { keepGoing = false }
        };
        
        if (!alive) return state;
        
        function updateState() {
            if (typeof state.node === 'object' && state.node !== null) {
                if (!state.keys || state.node_ !== state.node) {
                    state.keys = objectKeys(state.node)
                }
                
                state.isLeaf = state.keys.length == 0;
                
                for (var i = 0; i < parents.length; i++) {
                    if (parents[i].node_ === node_) {
                        state.circular = parents[i];
                        break;
                    }
                }
            }
            else {
                state.isLeaf = true;
                state.keys = null;
            }
            
            state.notLeaf = !state.isLeaf;
            state.notRoot = !state.isRoot;
        }
        
        updateState();
        
        // use return values to update if defined
        var ret = cb.call(state, state.node);
        if (ret !== undefined && state.update) state.update(ret);
        
        if (modifiers.before) modifiers.before.call(state, state.node);
        
        if (!keepGoing) return state;
        
        if (typeof state.node == 'object'
        && state.node !== null && !state.circular) {
            parents.push(state);
            
            updateState();
            
            forEach(state.keys, function (key, i) {
                path.push(key);
                
                if (modifiers.pre) modifiers.pre.call(state, state.node[key], key);
                
                var child = walker(state.node[key]);
                if (immutable && hasOwnProperty.call(state.node, key)) {
                    state.node[key] = child.node;
                }
                
                child.isLast = i == state.keys.length - 1;
                child.isFirst = i == 0;
                
                if (modifiers.post) modifiers.post.call(state, child);
                
                path.pop();
            });
            parents.pop();
        }
        
        if (modifiers.after) modifiers.after.call(state, state.node);
        
        return state;
    })(root).node;
}

function copy (src) {
    if (typeof src === 'object' && src !== null) {
        var dst;
        
        if (isArray(src)) {
            dst = [];
        }
        else if (isDate(src)) {
            dst = new Date(src.getTime ? src.getTime() : src);
        }
        else if (isRegExp(src)) {
            dst = new RegExp(src);
        }
        else if (isError(src)) {
            dst = { message: src.message };
        }
        else if (isBoolean(src)) {
            dst = new Boolean(src);
        }
        else if (isNumber(src)) {
            dst = new Number(src);
        }
        else if (isString(src)) {
            dst = new String(src);
        }
        else if (Object.create && Object.getPrototypeOf) {
            dst = Object.create(Object.getPrototypeOf(src));
        }
        else if (src.constructor === Object) {
            dst = {};
        }
        else {
            var proto =
                (src.constructor && src.constructor.prototype)
                || src.__proto__
                || {}
            ;
            var T = function () {};
            T.prototype = proto;
            dst = new T;
        }
        
        forEach(objectKeys(src), function (key) {
            dst[key] = src[key];
        });
        return dst;
    }
    else return src;
}

var objectKeys = Object.keys || function keys (obj) {
    var res = [];
    for (var key in obj) res.push(key)
    return res;
};

function toS (obj) { return Object.prototype.toString.call(obj) }
function isDate (obj) { return toS(obj) === '[object Date]' }
function isRegExp (obj) { return toS(obj) === '[object RegExp]' }
function isError (obj) { return toS(obj) === '[object Error]' }
function isBoolean (obj) { return toS(obj) === '[object Boolean]' }
function isNumber (obj) { return toS(obj) === '[object Number]' }
function isString (obj) { return toS(obj) === '[object String]' }

var isArray = Array.isArray || function isArray (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]';
};

var forEach = function (xs, fn) {
    if (xs.forEach) return xs.forEach(fn)
    else for (var i = 0; i < xs.length; i++) {
        fn(xs[i], i, xs);
    }
};

forEach(objectKeys(Traverse.prototype), function (key) {
    traverse[key] = function (obj) {
        var args = [].slice.call(arguments, 1);
        var t = new Traverse(obj);
        return t[key].apply(t, args);
    };
});

var hasOwnProperty = Object.hasOwnProperty || function (obj, key) {
    return key in obj;
};


/***/ }),
/* 210 */
/***/ (function(module, exports) {

module.exports = Extent;

function Extent() {
    if (!(this instanceof Extent)) {
        return new Extent();
    }
    this._bbox = [Infinity, Infinity, -Infinity, -Infinity];
    this._valid = false;
}

Extent.prototype.include = function(ll) {
    this._valid = true;
    this._bbox[0] = Math.min(this._bbox[0], ll[0]);
    this._bbox[1] = Math.min(this._bbox[1], ll[1]);
    this._bbox[2] = Math.max(this._bbox[2], ll[0]);
    this._bbox[3] = Math.max(this._bbox[3], ll[1]);
    return this;
};

Extent.prototype.union = function(other) {
    this._valid = true;
    this._bbox[0] = Math.min(this._bbox[0], other[0]);
    this._bbox[1] = Math.min(this._bbox[1], other[1]);
    this._bbox[2] = Math.max(this._bbox[2], other[2]);
    this._bbox[3] = Math.max(this._bbox[3], other[3]);
    return this;
};

Extent.prototype.bbox = function() {
    if (!this._valid) return null;
    return this._bbox;
};

Extent.prototype.contains = function(ll) {
    if (!this._valid) return null;
    return this._bbox[0] <= ll[0] &&
        this._bbox[1] <= ll[1] &&
        this._bbox[2] >= ll[0] &&
        this._bbox[3] >= ll[1];
};

Extent.prototype.polygon = function() {
    if (!this._valid) return null;
    return {
        type: 'Polygon',
        coordinates: [
            [
                // W, S
                [this._bbox[0], this._bbox[1]],
                // E, S
                [this._bbox[2], this._bbox[1]],
                // E, N
                [this._bbox[2], this._bbox[3]],
                // W, N
                [this._bbox[0], this._bbox[3]],
                // W, S
                [this._bbox[0], this._bbox[1]]
            ]
        ]
    };
};


/***/ }),
/* 211 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", [
    _c("div", { staticClass: "map", attrs: { id: "map_" + _vm._uid } })
  ])
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-04caaaee", module.exports)
  }
}

/***/ }),
/* 212 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "aside",
    [
      _c(
        "section",
        { staticClass: "section" },
        [
          _vm.availablePresentations.length > 1
            ? _c(
                "div",
                {
                  staticClass:
                    "tabs is-small is-centered is-toggle is-toggle-rounded"
                },
                [
                  _c(
                    "ul",
                    _vm._l(_vm.availablePresentations, function(presentation) {
                      return _c(
                        "li",
                        {
                          key: presentation.type,
                          class: {
                            "is-active": presentation.type === _vm.selectedType
                          }
                        },
                        [
                          _c(
                            "a",
                            {
                              on: {
                                click: function($event) {
                                  _vm.selectedType = presentation.type
                                }
                              }
                            },
                            [_c("span", [_vm._v(_vm._s(presentation.label))])]
                          )
                        ]
                      )
                    })
                  )
                ]
              )
            : _vm._e(),
          _vm._v(" "),
          _vm.selectedType === "highlighted"
            ? _c(
                "code-highlighter",
                {
                  attrs: { language: _vm.language },
                  on: {
                    error: function($event) {
                      _vm.allowHighlights = false
                    }
                  }
                },
                [_vm._v(_vm._s(_vm.code))]
              )
            : _vm._e(),
          _vm._v(" "),
          _vm.selectedType === "raw"
            ? _c("div", { staticClass: "container" }, [
                _c("pre", [_c("code", [_vm._v(_vm._s(_vm.rawCode))])])
              ])
            : _vm._e()
        ],
        1
      ),
      _vm._v(" "),
      _vm.selectedType === "map"
        ? _c(
            "geojson-renderer",
            {
              on: {
                error: function($event) {
                  _vm.allowMaps = false
                }
              }
            },
            [_vm._v(_vm._s(_vm.code))]
          )
        : _vm._e()
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-75ef749f", module.exports)
  }
}

/***/ }),
/* 213 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "article",
    [
      _c("div", { staticClass: "section" }, [
        _c("div", { staticClass: " container " }, [
          _vm.page
            ? _c("h1", { staticClass: "title" }, [
                _vm._v(_vm._s(_vm.page.name))
              ])
            : _vm._e()
        ])
      ]),
      _vm._v(" "),
      _c("markdown-renderer", {
        model: {
          value: _vm.$slots.default[0].text,
          callback: function($$v) {
            _vm.$set(_vm.$slots.default[0], "text", $$v)
          },
          expression: "$slots.default[0].text"
        }
      })
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-eeec826e", module.exports)
  }
}

/***/ }),
/* 214 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(215)
/* template */
var __vue_template__ = __webpack_require__(242)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/page-editor.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-7c3588a4", Component.options)
  } else {
    hotAPI.reload("data-v-7c3588a4", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 215 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
  components: {
    metadataEditor: __webpack_require__(28),
    bodyEditor: __webpack_require__(29)
  },
  props: {
    pageSlug: { Type: String, Required: true }
  },
  data: function data() {
    return {
      page: null,
      activePanel: "body"
    };
  },
  mounted: function mounted() {
    this.loadPage();
  },

  methods: {
    loadPage: function loadPage() {
      var _this = this;

      this.$http.get("/api/pages/" + this.pageSlug).then(function (_ref) {
        var data = _ref.data;

        _this.page = data;
      });
    },
    reloadWithUpdatedMetadata: function reloadWithUpdatedMetadata(page) {
      document.location.href = "/pages/" + page.data.slug;
    },
    reloadWithUpdatedBody: function reloadWithUpdatedBody(body) {
      document.location.href = "/pages/" + this.page.data.slug;
    },
    toggleFolding: function toggleFolding(component) {
      if (component === this.$refs.metadata) {
        this.activePanel = "metadata";
      } else if (component === this.$refs.body) {
        this.activePanel = "body";
      }
    }
  }
});

/***/ }),
/* 216 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
  props: {
    value: { type: Object, required: true },
    canSave: { type: Boolean, default: true }
  },
  data: function data() {
    return {
      saving: false
    };
  },

  methods: {
    savePage: function savePage() {
      var _this = this;

      if (!this.validate()) return;
      this.saving = true;
      this.$http.put(this.value.links.self, this.value).then(function (_ref) {
        var data = _ref.data;

        _this.value = data;
        _this.saving = false;
        _this.emitInput();
        _this.$emit("save", _this.value);
      });
    },
    emitInput: function emitInput() {
      this.$emit("input", this.value);
    },

    /**
     * Check for valid and hard validate subcomponents. Part of the validation chain.
     * @param  boolean hard If true, error messages will be displayed next to the fields.
     * @return boolean      True if valid.
     */
    validate: function validate(hard) {
      var allValid = true;
      // Check for required fields.
      window.collect(this.$children).each(function (child) {
        if (typeof child.validate === "function") {
          allValid = child.validate(hard) ? allValid : false;
        }
      });

      return allValid;
    }
  }
});

/***/ }),
/* 217 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "control" },
    [
      _vm.value
        ? _c("dirtiki-input", {
            attrs: {
              type: "text",
              "should-hard-validate-on-blur": true,
              required: true,
              label: "Page Name",
              name: "page-name"
            },
            on: { input: _vm.emitInput },
            model: {
              value: _vm.value.data.name,
              callback: function($$v) {
                _vm.$set(_vm.value.data, "name", $$v)
              },
              expression: "value.data.name"
            }
          })
        : _vm._e(),
      _vm._v(" "),
      _vm.canSave
        ? _c("div", { staticClass: "field" }, [
            _c("p", { staticClass: "control" }, [
              _c(
                "button",
                {
                  staticClass: "button is-primary is-fullwidth",
                  class: { "is-loading": _vm.saving },
                  on: { click: _vm.savePage }
                },
                [_vm._v("\n        Save\n      ")]
              )
            ])
          ])
        : _vm._e()
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-17c95384", module.exports)
  }
}

/***/ }),
/* 218 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(219);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(2)("427a0c64", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-8aa2d09e\",\"scoped\":true,\"hasInlineConfig\":true}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./body-editor.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-8aa2d09e\",\"scoped\":true,\"hasInlineConfig\":true}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./body-editor.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 219 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "\n.textarea[data-v-8aa2d09e] {\n  min-height: 70vh;\n}\n", ""]);

// exports


/***/ }),
/* 220 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
  components: {
    imageSelector: __webpack_require__(221)
  },
  props: {
    value: { type: Object, required: true },
    canSave: { type: Boolean, default: true }
  },
  data: function data() {
    return {
      saving: false
    };
  },

  methods: {
    saveBody: function saveBody() {
      var _this = this;

      if (!this.validate()) return;
      this.saving = true;
      this.$http.put(this.value.links.self, this.value).then(function (_ref) {
        var data = _ref.data;

        _this.value = data;
        _this.saving = false;
        _this.emitInput();
        _this.$emit("save", _this.value);
      });
    },
    insertTextAtCursorPosition: function insertTextAtCursorPosition(text) {
      var startPosition = this.$refs.textarea.selectionStart;
      var endPosition = this.$refs.textarea.selectionEnd;
      this.value.data.content = this.value.data.content.substring(0, startPosition) + text + this.value.data.content.substring(endPosition, this.value.data.content.length);
    },
    imageSelected: function imageSelected(imageSelector, image) {
      var imageVariation = window.collect(image.variations).sortByDesc(function (variation) {
        return (variation.width ? variation.width : 1) + (variation.height ? variation.height : 1);
      }).first();
      if (!imageVariation) {
        return;
      }

      var altText = prompt("Alternative text");
      if (altText === null || altText === false) {
        // user canceled
        return;
      }
      var template = "\n![" + altText.replace(/\[|\]/g, "") + "](" + imageVariation.url + ")\n";
      this.insertTextAtCursorPosition(template);
    },
    emitInput: function emitInput() {
      this.$emit("input", this.value);
    },

    /**
     * Check for valid and hard validate subcomponents. Part of the validation chain.
     * @param  boolean hard If true, error messages will be displayed next to the fields.
     * @return boolean      True if valid.
     */
    validate: function validate(hard) {
      var allValid = true;
      // Check for required fields.
      window.collect(this.$children).each(function (child) {
        if (typeof child.validate === "function") {
          allValid = child.validate(hard) ? allValid : false;
        }
      });

      return allValid;
    }
  }
});

/***/ }),
/* 221 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(222)
}
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(224)
/* template */
var __vue_template__ = __webpack_require__(240)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-6f54bd68"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/image-selector.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-6f54bd68", Component.options)
  } else {
    hotAPI.reload("data-v-6f54bd68", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 222 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(223);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(2)("d2a5230a", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-6f54bd68\",\"scoped\":true,\"hasInlineConfig\":true}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./image-selector.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-6f54bd68\",\"scoped\":true,\"hasInlineConfig\":true}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./image-selector.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 223 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "\n.section.box.is-light[data-v-6f54bd68] {\n  margin-top: 1em;\n  margin-bottom: 1em;\n  background-color: #f5f5f5;\n  -webkit-animation-duration: 1.25s;\n          animation-duration: 1.25s;\n  -webkit-animation-fill-mode: both;\n          animation-fill-mode: both;\n  -webkit-animation-name: slideInDown;\n          animation-name: slideInDown;\n}\n", ""]);

// exports


/***/ }),
/* 224 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
  components: {
    imageTicker: __webpack_require__(225),
    imageSelectorUploader: __webpack_require__(235)
  },
  methods: {
    imageSelected: function imageSelected(ticker, image) {
      this.$emit("image-selected", this, image);
    }
  }
});

/***/ }),
/* 225 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(226)
}
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(228)
/* template */
var __vue_template__ = __webpack_require__(234)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-3ce88f53"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/image-ticker.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-3ce88f53", Component.options)
  } else {
    hotAPI.reload("data-v-3ce88f53", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 226 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(227);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(2)("6ed474d5", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-3ce88f53\",\"scoped\":true,\"hasInlineConfig\":true}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./image-ticker.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-3ce88f53\",\"scoped\":true,\"hasInlineConfig\":true}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./image-ticker.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 227 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "\n.ticker[data-v-3ce88f53] {\n  overflow-x: scroll;\n  -webkit-overflow-scrolling: touch;\n}\n", ""]);

// exports


/***/ }),
/* 228 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
  components: {
    imageTickerImage: __webpack_require__(229)
  },
  props: {},
  data: function data() {
    return {
      datas: [],
      loading: false
    };
  },
  mounted: function mounted() {
    this.retrieveImagesAtUrl("/api/images?");
  },

  computed: {
    images: function images() {
      return window.collect(this.datas).pluck("data").flatten(1).toArray();
    },
    nextPageUrl: function nextPageUrl() {
      var last = window.collect(this.datas).last();
      return last ? last.links.next : null;
    }
  },
  methods: {
    retrieveImagesAtUrl: function retrieveImagesAtUrl(url) {
      var _this = this;

      this.loading = true;
      this.$http.get(url + "&sort=-created_at").then(function (_ref) {
        var data = _ref.data;

        _this.loading = false;
        _this.datas.push(data);
      });
    },
    toggleSelection: function toggleSelection(imageTickerImage) {
      // Prevent defaults.
      imageTickerImage.selected = false;
      imageTickerImage.presentPressFeedback();
      this.$emit("image-selected", this, imageTickerImage.image);
    }
  }
});

/***/ }),
/* 229 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(230)
}
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(232)
/* template */
var __vue_template__ = __webpack_require__(233)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-50ab853e"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/image-ticker-image.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-50ab853e", Component.options)
  } else {
    hotAPI.reload("data-v-50ab853e", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 230 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(231);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(2)("07793596", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-50ab853e\",\"scoped\":true,\"hasInlineConfig\":true}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./image-ticker-image.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-50ab853e\",\"scoped\":true,\"hasInlineConfig\":true}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./image-ticker-image.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 231 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "\n.card[data-v-50ab853e] {\n  cursor: pointer;\n  -webkit-transition: border 0.2s ease-in;\n  transition: border 0.2s ease-in;\n}\n.card[selected][data-v-50ab853e] {\n  border: 3px solid hsl(171, 100%, 41%);\n}\n.display-press[data-v-50ab853e] {\n  -webkit-animation: pop-data-v-50ab853e 0.3s ease-out;\n          animation: pop-data-v-50ab853e 0.3s ease-out;\n}\n@-webkit-keyframes pop-data-v-50ab853e {\nfrom {\n    -webkit-transform: scale3d(1, 1, 1) translate3d(0, 0, 0);\n            transform: scale3d(1, 1, 1) translate3d(0, 0, 0);\n    -webkit-filter: brightness(100%);\n            filter: brightness(100%);\n}\n50% {\n    -webkit-transform: scale3d(1.05, 1.05, 1.05) translate3d(0, -5%, 0);\n            transform: scale3d(1.05, 1.05, 1.05) translate3d(0, -5%, 0);\n    -webkit-filter: brightness(75%);\n            filter: brightness(75%);\n}\nto {\n    -webkit-transform: scale3d(1, 1, 1) translate3d(0, 0, 0);\n            transform: scale3d(1, 1, 1) translate3d(0, 0, 0);\n    -webkit-filter: brightness(100%);\n            filter: brightness(100%);\n}\n}\n@keyframes pop-data-v-50ab853e {\nfrom {\n    -webkit-transform: scale3d(1, 1, 1) translate3d(0, 0, 0);\n            transform: scale3d(1, 1, 1) translate3d(0, 0, 0);\n    -webkit-filter: brightness(100%);\n            filter: brightness(100%);\n}\n50% {\n    -webkit-transform: scale3d(1.05, 1.05, 1.05) translate3d(0, -5%, 0);\n            transform: scale3d(1.05, 1.05, 1.05) translate3d(0, -5%, 0);\n    -webkit-filter: brightness(75%);\n            filter: brightness(75%);\n}\nto {\n    -webkit-transform: scale3d(1, 1, 1) translate3d(0, 0, 0);\n            transform: scale3d(1, 1, 1) translate3d(0, 0, 0);\n    -webkit-filter: brightness(100%);\n            filter: brightness(100%);\n}\n}\n", ""]);

// exports


/***/ }),
/* 232 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
  props: {
    image: {
      type: Object,
      required: true
    }
  },

  mounted: function mounted() {
    var _this = this;

    this.updateDisplay();
    this.$el.addEventListener("animationend", function () {
      _this.updateDisplay();
    }, false);
  },
  data: function data() {
    return {
      columnClasses: "is-2-desktop is-3-tablet is-5-mobile",
      selected: false
    };
  },

  computed: {
    isVector: function isVector() {
      return this.image.type === "image/svg+xml";
    },
    thumbnailUrl: function thumbnailUrl() {
      var _this2 = this;

      var variation = window.collect(this.image.variations).pipe(function (collection) {
        if (_this2.isVector) return collection;
        return collection.where("width", 250).where("height", 250);
      }).first();
      return variation ? variation.url : null;
    },
    thumbnailUrlSet: function thumbnailUrlSet() {
      if (this.isVector) {
        return null;
      }
      return this.thumbnailUrl + "&scale=3 3x," + this.thumbnailUrl + "&scale=2 2x," + this.thumbnailUrl + " 1x";
    }
  },
  methods: {
    updateDisplay: function updateDisplay() {
      this.updateColumnClasses();
    },
    updateColumnClasses: function updateColumnClasses() {
      var columnClasses = void 0;
      var parentElWidth = this.$el.parentElement.clientWidth;
      if (parentElWidth < 600) {
        columnClasses = "is-5";
      } else if (parentElWidth < 800) {
        columnClasses = "is-4";
      } else if (parentElWidth < 1023) {
        columnClasses = "is-2";
      } else {
        columnClasses = "is-2-desktop is-3-tablet is-5-mobile";
      }
      if (this.columnClasses != columnClasses) {
        this.columnClasses = columnClasses;
      }
    },
    toggleSelection: function toggleSelection() {
      this.selected = !this.selected;
      this.$emit("toggle-selection", this);
    },

    /**
     * When called, will slightly animated the card to display a subtle feedback.
     * Is better used following a tap or a click on the card, when the whole
     * card is used as a button.
     */
    presentPressFeedback: function presentPressFeedback() {
      this.$refs.card.classList.add("display-press");
      this.$refs.card.addEventListener("animationend", function handler() {
        this.classList.remove("display-press");
        this.removeEventListener(event.type, handler);
      });
    }
  }
});

/***/ }),
/* 233 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    {
      staticClass: "column",
      class: _vm.columnClasses,
      on: { click: _vm.toggleSelection }
    },
    [
      _c(
        "div",
        { ref: "card", staticClass: "card", attrs: { selected: _vm.selected } },
        [
          _c("div", { staticClass: "card-image" }, [
            _c("figure", { staticClass: "image is-square" }, [
              _c("img", {
                attrs: { src: _vm.thumbnailUrl, srcset: _vm.thumbnailUrlSet }
              })
            ])
          ])
        ]
      )
    ]
  )
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-50ab853e", module.exports)
  }
}

/***/ }),
/* 234 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "columns is-vcentered is-mobile ticker" },
    [
      _vm.loading && !_vm.datas.length
        ? _c("div", { staticClass: "column" }, [_c("loading-indicator")], 1)
        : _vm._e(),
      _vm._v(" "),
      _vm._l(_vm.images, function(image) {
        return _c("image-ticker-image", {
          key: image.id,
          attrs: { image: image },
          on: { "toggle-selection": _vm.toggleSelection }
        })
      }),
      _vm._v(" "),
      _vm.nextPageUrl
        ? _c(
            "div",
            { staticClass: "column is-1 has-text-centered" },
            [
              _vm.loading
                ? _c("loading-indicator", { attrs: { size: 3 } })
                : _c(
                    "button",
                    {
                      staticClass: "button is-light is-large",
                      on: {
                        click: function($event) {
                          _vm.retrieveImagesAtUrl(_vm.nextPageUrl)
                        }
                      }
                    },
                    [
                      _c("span", { staticClass: "icon is-medium" }, [
                        _c("i", { staticClass: "fas fa-ellipsis-h fa-2x" })
                      ])
                    ]
                  )
            ],
            1
          )
        : _vm._e()
    ],
    2
  )
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-3ce88f53", module.exports)
  }
}

/***/ }),
/* 235 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(236)
}
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(238)
/* template */
var __vue_template__ = __webpack_require__(239)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/image-selector-uploader.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-5100a43a", Component.options)
  } else {
    hotAPI.reload("data-v-5100a43a", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 236 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(237);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(2)("7c434f34", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-5100a43a\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./image-selector-uploader.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-5100a43a\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./image-selector-uploader.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 237 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "\n.active-dropzone {\n  border: 5px hsl(171, 100%, 41%) dashed !important;\n  padding: 43px 19px;\n}\n.active-dropzone img {\n  -webkit-filter: blur(4px);\n          filter: blur(4px);\n}\n.active-dropzone .is-dark {\n  -webkit-transition: -webkit-transform 0.2s;\n  transition: -webkit-transform 0.2s;\n  transition: transform 0.2s;\n  transition: transform 0.2s, -webkit-transform 0.2s;\n  -webkit-transform: scale3d(1.1, 1.1, 1.1);\n          transform: scale3d(1.1, 1.1, 1.1);\n}\n", ""]);

// exports


/***/ }),
/* 238 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
  data: function data() {
    return {
      dragging: false,
      acceptedMimeTypes: ["image/png", "image/jpeg", "image/svg+xml"],
      queue: [],
      uploading: false
    };
  },
  mounted: function mounted() {
    this.startListeningForDragover();
  },


  methods: {
    appendFilesToQueueThenProcessQueue: function appendFilesToQueueThenProcessQueue(files) {
      var _this2 = this;

      this.uploading = {
        uploaded: 0,
        total: window.collect(files).filter(function (file) {
          return _this2.acceptedMimeTypes.includes(file.type);
        }).each(function (file) {
          _this2.queue.push(_this2.uploadFile(file));
        }).reduce(function (carry, file) {
          return carry + file.size;
        }, 0)
      };
      Promise.all(this.queue).then(function (result) {
        _this2.uploading = false;
      });
    },
    uploadFile: function uploadFile(file) {
      var _this3 = this;

      var formData = new FormData();
      formData.append("image", file);
      return this.$http.post("/api/images", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
        onUploadProgress: function onUploadProgress(progressEvent) {
          _this3.uploading.uploaded += progressEvent.loaded;
        }
      }).then(function (_ref) {
        var data = _ref.data;

        _this3.$emit("uploaded", data);
      });
    },
    handleFileInputSelection: function handleFileInputSelection(event) {
      this.appendFilesToQueueThenProcessQueue(event.target.files);
      event.target.value = "";
    },
    exitDraggableMode: function exitDraggableMode() {
      this.dragging = false;
      this.$parent.$el.classList.remove("active-dropzone");

      this.startListeningForDragover();
    },
    startListeningForDragover: function startListeningForDragover() {
      var _this = this;
      _this.$parent.$el.addEventListener("dragover", function handler(event) {
        this.removeEventListener(event.type, handler);
        _this.startListeningForDragLeave();
        _this.startListeningForDrop();
        if (window.collect(event.dataTransfer.items).pluck("type").filter(function (item) {
          return _this.acceptedMimeTypes.includes(item);
        }).values().isEmpty()) {
          event.dataTransfer.dropEffect = "none";
          return;
        }
        event.dataTransfer.dropEffect = "copy";
        _this.$parent.$el.classList.add("active-dropzone");
        _this.dragging = true;
      });

      _this.$parent.$el.addEventListener("dragover", function handler(event) {
        event.preventDefault();
      });

      _this.$parent.$el.addEventListener("dragenter", function handler(event) {
        event.preventDefault();
      });
    },
    startListeningForDragLeave: function startListeningForDragLeave() {
      var _this = this;
      _this.$parent.$el.addEventListener("dragleave", function handler(event) {
        if (_this.$parent.$el.contains(event.relatedTarget)) return; // Ignore 'leaves' on child components.
        this.removeEventListener(event.type, handler);
        _this.exitDraggableMode();
      });
    },
    startListeningForDrop: function startListeningForDrop() {
      var _this = this;
      document.addEventListener("drop", function (event) {
        event.stopPropagation();
        event.preventDefault();
        var files = event.dataTransfer.files;
        _this.appendFilesToQueueThenProcessQueue(files);
        _this.exitDraggableMode();
      });
    }
  }
});

/***/ }),
/* 239 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "file is-fullwidth is-large is-boxed is-dark" },
    [
      !_vm.uploading
        ? _c("label", { staticClass: "file-label" }, [
            _c("input", {
              staticClass: "file-input",
              attrs: {
                type: "file",
                name: "resume",
                multiple: "",
                accept: _vm.acceptedMimeTypes.join(",")
              },
              on: { change: _vm.handleFileInputSelection }
            }),
            _vm._v(" "),
            _c("span", { staticClass: "file-cta" }, [
              _c("span", { staticClass: "file-icon" }, [
                _c("i", {
                  staticClass: "fas",
                  class: {
                    "fa-cloud-upload-alt": _vm.dragging,
                    "fa-plus": !_vm.dragging
                  }
                })
              ])
            ])
          ])
        : _c("progress", {
            staticClass: "progress is-info",
            attrs: { max: _vm.uploading.total },
            domProps: { value: _vm.uploading.uploaded }
          })
    ]
  )
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-5100a43a", module.exports)
  }
}

/***/ }),
/* 240 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("section", { staticClass: "section box is-light" }, [
    _c("div", { staticClass: "columns is-vcentered" }, [
      _c(
        "div",
        { staticClass: "column is-2" },
        [_c("image-selector-uploader")],
        1
      ),
      _vm._v(" "),
      _c(
        "div",
        { staticClass: "column" },
        [_c("image-ticker", { on: { "image-selected": _vm.imageSelected } })],
        1
      )
    ])
  ])
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-6f54bd68", module.exports)
  }
}

/***/ }),
/* 241 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "control" },
    [
      _vm.value
        ? _c("textarea", {
            directives: [
              {
                name: "model",
                rawName: "v-model",
                value: _vm.value.data.content,
                expression: "value.data.content"
              }
            ],
            ref: "textarea",
            staticClass: "textarea",
            domProps: { value: _vm.value.data.content },
            on: {
              input: [
                function($event) {
                  if ($event.target.composing) {
                    return
                  }
                  _vm.$set(_vm.value.data, "content", $event.target.value)
                },
                _vm.emitInput
              ]
            }
          })
        : _vm._e(),
      _vm._v(" "),
      _c("image-selector", { on: { "image-selected": _vm.imageSelected } }),
      _vm._v(" "),
      _vm.canSave
        ? _c("div", { staticClass: "field" }, [
            _c("p", { staticClass: "control" }, [
              _c(
                "button",
                {
                  staticClass: "button is-primary is-fullwidth",
                  class: { "is-loading": _vm.saving },
                  on: { click: _vm.saveBody }
                },
                [_vm._v("\n        Save\n      ")]
              )
            ])
          ])
        : _vm._e()
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-8aa2d09e", module.exports)
  }
}

/***/ }),
/* 242 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "article",
    [
      !_vm.page
        ? _c("loading-indicator")
        : _c(
            "div",
            [
              _c(
                "folding-panel",
                {
                  ref: "metadata",
                  attrs: {
                    deployed: _vm.activePanel === "metadata",
                    title: "Settings"
                  },
                  on: { toggle: _vm.toggleFolding }
                },
                [
                  _c("metadata-editor", {
                    attrs: { value: _vm.page },
                    on: { save: _vm.reloadWithUpdatedMetadata }
                  })
                ],
                1
              ),
              _vm._v(" "),
              _c(
                "folding-panel",
                {
                  ref: "body",
                  attrs: {
                    deployed: _vm.activePanel === "body",
                    title: "Body"
                  },
                  on: { toggle: _vm.toggleFolding }
                },
                [
                  _c("body-editor", {
                    attrs: { value: _vm.page.relationships.body },
                    on: { save: _vm.reloadWithUpdatedBody }
                  })
                ],
                1
              )
            ],
            1
          )
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-7c3588a4", module.exports)
  }
}

/***/ }),
/* 243 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(244)
/* template */
var __vue_template__ = __webpack_require__(245)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/page-creator.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-3cec6d85", Component.options)
  } else {
    hotAPI.reload("data-v-3cec6d85", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 244 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
  components: {
    metadataEditor: __webpack_require__(28),
    bodyEditor: __webpack_require__(29)
  },
  props: {
    canSave: { type: Boolean, default: true }
  },
  data: function data() {
    return {
      saving: false,
      value: {
        data: {
          name: ""
        },
        relationships: {
          body: {
            data: {
              content: ""
            }
          }
        }
      }
    };
  },
  mounted: function mounted() {},

  methods: {
    /**
     * Check for valid and hard validate subcomponents. Part of the validation chain.
     * @param  boolean hard If true, error messages will be displayed next to the fields.
     * @return boolean      True if valid.
     */
    validate: function validate(hard) {
      var allValid = true;
      // Check for required fields.
      window.collect(this.$children).each(function (child) {
        if (typeof child.validate === "function") {
          allValid = child.validate(hard) ? allValid : false;
        }
      });

      return allValid;
    },
    savePage: function savePage() {
      var _this = this;

      if (!this.validate()) return;
      this.saving = true;
      this.$http.post("/api/pages", this.value).then(function (_ref) {
        var data = _ref.data;

        _this.value = data;
        _this.saving = false;
        _this.emitInput();
        _this.$emit("save", _this.value);
        if (_this.canSave) {
          document.location.href = "/pages/" + data.data.slug;
        }
      });
    },
    emitInput: function emitInput() {
      this.$emit("input", this.value);
    }
  }
});

/***/ }),
/* 245 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("article", [
    _c("div", { staticClass: "columns" }, [
      _c(
        "div",
        { staticClass: "column" },
        [
          _c("h3", { staticClass: "title is-3" }, [_vm._v("Page Settings")]),
          _vm._v(" "),
          _c("metadata-editor", {
            attrs: { "can-save": false },
            model: {
              value: _vm.value,
              callback: function($$v) {
                _vm.value = $$v
              },
              expression: "value"
            }
          })
        ],
        1
      )
    ]),
    _vm._v(" "),
    _c("div", { staticClass: "columns" }, [
      _c(
        "div",
        { staticClass: "column" },
        [
          _c("h3", { staticClass: "title is-3" }, [_vm._v("Content")]),
          _vm._v(" "),
          _c("body-editor", {
            attrs: { "can-save": false },
            model: {
              value: _vm.value.relationships.body,
              callback: function($$v) {
                _vm.$set(_vm.value.relationships, "body", $$v)
              },
              expression: "value.relationships.body"
            }
          })
        ],
        1
      )
    ]),
    _vm._v(" "),
    _c("div", { staticClass: "columns" }, [
      _c("div", { staticClass: "column" }, [
        _c(
          "button",
          {
            staticClass: "button is-primary is-fullwidth",
            class: { "is-loading": _vm.saving },
            on: { click: _vm.savePage }
          },
          [_vm._v("\n                Save\n            ")]
        )
      ])
    ])
  ])
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-3cec6d85", module.exports)
  }
}

/***/ }),
/* 246 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(247)
/* template */
var __vue_template__ = __webpack_require__(273)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/page-history.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-5d455ded", Component.options)
  } else {
    hotAPI.reload("data-v-5d455ded", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 247 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
  components: {
    pageHistorySettings: __webpack_require__(248),
    pageHistoryBody: __webpack_require__(260)
  },
  props: {
    pageSlug: { Type: String, Required: true }
  },
  data: function data() {
    return {
      activePanel: "settings"
    };
  },
  mounted: function mounted() {},

  methods: {
    toggleFolding: function toggleFolding(component) {
      if (component === this.$refs.settings) {
        this.activePanel = "settings";
      } else if (component === this.$refs.body) {
        this.activePanel = "body";
      }
    }
  }
});

/***/ }),
/* 248 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(249)
}
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(251)
/* template */
var __vue_template__ = __webpack_require__(259)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-6355e39a"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/page-history-settings.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-6355e39a", Component.options)
  } else {
    hotAPI.reload("data-v-6355e39a", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 249 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(250);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(2)("674248e3", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-6355e39a\",\"scoped\":true,\"hasInlineConfig\":true}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./page-history-settings.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-6355e39a\",\"scoped\":true,\"hasInlineConfig\":true}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./page-history-settings.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 250 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "\n.diffs > .diff[data-v-6355e39a] {\r\n  padding: 1em 0 1em 0;\n}\n.diffs > .diff[data-v-6355e39a]:first-child {\r\n  padding: 0 0 1em 0;\n}\n.diffs[data-v-6355e39a] > :last-child {\r\n  padding: 1em 0 0 0;\n}\n.diffs > .diff[data-v-6355e39a]:not(:last-child) {\r\n  border-bottom: 2px solid hsl(0, 0%, 96%);\n}\r\n", ""]);

// exports


/***/ }),
/* 251 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
  components: {
    pageHistorySettingsDiff: __webpack_require__(252)
  },
  props: {
    pageSlug: { Type: String, Required: true }
  },
  data: function data() {
    return {
      loading: false,
      data: { data: null }
    };
  },
  mounted: function mounted() {
    this.loadHistory("/api/pages/" + this.pageSlug + "/history");
  },

  methods: {
    handlePaginationSelect: function handlePaginationSelect(url) {
      this.loadHistory(url);
    },
    loadHistory: function loadHistory(url) {
      var _this = this;

      this.loading = true;
      this.$http.get(url).then(function (_ref) {
        var data = _ref.data;

        _this.data = data;
        _this.loading = false;
      });
    }
  }
});

/***/ }),
/* 252 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(253)
}
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(255)
/* template */
var __vue_template__ = __webpack_require__(258)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-77a136e2"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/page-history-settings-diff.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-77a136e2", Component.options)
  } else {
    hotAPI.reload("data-v-77a136e2", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 253 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(254);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(2)("4d20d69c", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-77a136e2\",\"scoped\":true,\"hasInlineConfig\":true}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./page-history-settings-diff.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-77a136e2\",\"scoped\":true,\"hasInlineConfig\":true}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./page-history-settings-diff.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 254 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "\ntable[data-v-77a136e2] {\r\n  margin: 0;\n}\ntd[data-v-77a136e2],\r\nth[data-v-77a136e2] {\r\n  width: 33%;\n}\r\n", ""]);

// exports


/***/ }),
/* 255 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
  components: {
    historyMetadata: __webpack_require__(30)
  },
  props: {
    diff: {
      type: Object,
      required: true
    }
  },
  computed: {
    diffPairs: function diffPairs() {
      var _this = this;

      return window.collect().times(Object.values(this.diff.data.changes.after).length, function (counter) {
        var index = counter - 1;
        return {
          attribute: Object.keys(_this.diff.data.changes.after)[index],
          before: Object.values(_this.diff.data.changes.before)[index],
          after: Object.values(_this.diff.data.changes.after)[index]
        };
      }).toArray();
    }
  },
  data: function data() {
    return {};
  }
});

/***/ }),
/* 256 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
  props: {
    diff: {
      type: Object,
      required: true
    }
  },
  computed: {
    author: function author() {
      return this.diff.data.author.anonymous ? "Anonyme (" + this.diff.data.author.ip + ")" : this.diff.relationships.user.data.name;
    }
  }
});

/***/ }),
/* 257 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("header", { staticClass: "level" }, [
    _c("div", { staticClass: "level-left" }, [
      _c("div", { staticClass: "level-item" }, [
        _c("p", { staticClass: "subtitle is-5" }, [
          _vm._v(
            "\n                " +
              _vm._s(_vm.diff.data.created_at.date) +
              "\n            "
          )
        ])
      ])
    ]),
    _vm._v(" "),
    _c("div", { staticClass: "level-right" }, [
      _c("p", { staticClass: "level-item" }, [
        _vm._v("\n            " + _vm._s(_vm.author) + "\n        ")
      ])
    ])
  ])
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-c8785b42", module.exports)
  }
}

/***/ }),
/* 258 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "diff" },
    [
      _c("history-metadata", { attrs: { diff: _vm.diff } }),
      _vm._v(" "),
      _c(
        "table",
        { staticClass: "table is-striped is-narrow is-fullwidth" },
        _vm._l(_vm.diffPairs, function(pair) {
          return _c("tr", { key: pair.attribute }, [
            _c("th", [_vm._v(_vm._s(pair.attribute))]),
            _vm._v(" "),
            _c("td", [
              pair.before
                ? _c("span", [_vm._v(_vm._s(pair.before))])
                : _c("span", [_vm._v("—")])
            ]),
            _vm._v(" "),
            _c("td", [
              pair.after
                ? _c("span", [_vm._v(_vm._s(pair.after))])
                : _c("span", [_vm._v("—")])
            ])
          ])
        })
      )
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-77a136e2", module.exports)
  }
}

/***/ }),
/* 259 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticStyle: { width: "100%" } },
    [
      _vm.loading ? _c("loading-indicator", { attrs: { size: 2 } }) : _vm._e(),
      _vm._v(" "),
      _c(
        "div",
        { staticClass: "diffs", attrs: { else: "" } },
        [
          _vm._l(_vm.data.data, function(diff) {
            return _c("page-history-settings-diff", {
              key: diff.key,
              attrs: { diff: diff }
            })
          }),
          _vm._v(" "),
          _vm.data.links
            ? _c("basic-paginator", {
                attrs: { links: _vm.data.links, meta: _vm.data.meta },
                on: { select: _vm.handlePaginationSelect }
              })
            : _vm._e()
        ],
        2
      )
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-6355e39a", module.exports)
  }
}

/***/ }),
/* 260 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(261)
  __webpack_require__(263)
}
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(265)
/* template */
var __vue_template__ = __webpack_require__(272)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-fa7a1f9c"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/page-history-body.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-fa7a1f9c", Component.options)
  } else {
    hotAPI.reload("data-v-fa7a1f9c", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 261 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(262);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(2)("6a2634d2", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-fa7a1f9c\",\"scoped\":true,\"hasInlineConfig\":true}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./page-history-body.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-fa7a1f9c\",\"scoped\":true,\"hasInlineConfig\":true}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./page-history-body.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 262 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "\n.diffs > .diff[data-v-fa7a1f9c] {\r\n  padding: 1em 0 1em 0;\n}\n.diffs > .diff[data-v-fa7a1f9c]:first-child {\r\n  padding: 0 0 1em 0;\n}\n.diffs[data-v-fa7a1f9c] > :last-child {\r\n  padding: 1em 0 0 0;\n}\n.diffs > .diff[data-v-fa7a1f9c]:not(:last-child) {\r\n  border-bottom: 2px solid hsl(0, 0%, 96%);\n}\r\n", ""]);

// exports


/***/ }),
/* 263 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(264);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(2)("d4111d0c", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-fa7a1f9c\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=1!./page-history-body.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-fa7a1f9c\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=1!./page-history-body.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 264 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "\n.diff-regular {\r\n  border-left: 0.5em solid hsl(0, 0%, 96%);\n}\n.diff-original {\r\n  -webkit-text-decoration-line: line-through;\r\n          text-decoration-line: line-through;\r\n  -webkit-text-decoration-color: red;\r\n          text-decoration-color: red;\r\n  border-left: 0.5em solid hsl(348, 100%, 61%);\n}\n.diff-new {\r\n  border-left: 0.5em solid hsl(141, 71%, 48%);\n}\n.diff-updated {\r\n  border-left: 0.5em solid hsl(48, 100%, 67%);\n}\n.diff-fragment-added {\r\n  color: hsl(141, 71%, 48%);\n}\n.diff-fragment-added {\r\n  color: hsl(141, 71%, 48%);\n}\n.diff-fragment-removed {\r\n  -webkit-text-decoration-line: line-through;\r\n          text-decoration-line: line-through;\r\n  -webkit-text-decoration-color: red;\r\n          text-decoration-color: red;\r\n  color: hsl(348, 100%, 61%);\n}\r\n", ""]);

// exports


/***/ }),
/* 265 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
  components: {
    pageHistoryBodyDiff: __webpack_require__(266)
  },
  props: {
    pageSlug: { Type: String, Required: true }
  },
  data: function data() {
    return {
      loading: false,
      data: { data: null }
    };
  },
  mounted: function mounted() {
    this.loadHistory("/api/pages/" + this.pageSlug + "/body/history");
  },

  methods: {
    handlePaginationSelect: function handlePaginationSelect(url) {
      this.loadHistory(url);
    },
    loadHistory: function loadHistory(url) {
      var _this = this;

      this.loading = true;
      this.$http.get(url).then(function (_ref) {
        var data = _ref.data;

        _this.data = data;
        _this.loading = false;
      });
    }
  }
});

/***/ }),
/* 266 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(267)
/* template */
var __vue_template__ = __webpack_require__(271)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/page-history-body-diff.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-7169e9f0", Component.options)
  } else {
    hotAPI.reload("data-v-7169e9f0", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 267 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
  components: {
    historyMetadata: __webpack_require__(30),
    diffHighlighter: __webpack_require__(268)
  },
  props: {
    diff: {
      type: Object,
      required: true
    }
  },
  computed: {},
  data: function data() {
    return {
      selectedPresentation: "diff",
      availablePresentations: [{
        type: "diff",
        label: "Diff"
      }, {
        type: "raw",
        label: "Raw"
      }]
    };
  },

  methods: {}
});

/***/ }),
/* 268 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(269)
/* template */
var __vue_template__ = __webpack_require__(270)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/diff-highlighter.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-345cbc30", Component.options)
  } else {
    hotAPI.reload("data-v-345cbc30", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 269 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

//
//
//

var jsDiff = __webpack_require__(31);

/* harmony default export */ __webpack_exports__["default"] = ({
  props: {
    before: {
      type: String
    },
    after: {
      type: [String],
      required: true
    },
    diff: {
      type: String
    }
  },
  computed: {
    styledDiff: function styledDiff() {
      var _this = this;

      if (!this.before) {
        return this.createSpanNodeWithClass(this.after, "diff-new", "div");
      }

      var allLines = this.diff.split("\n");
      return window.collect(allLines).reject(function (line) {
        return ["--- Original", "+++ New", "@@ @@"].includes(line);
      }).pipe(function (lines) {
        allLines = lines.toArray();
        return window.collect(allLines);
      }).map(function (line, index) {
        if (line === " " || !line) {
          return index === 0 || index === allLines.length - 1 ? null : line;
        }
        return line;
      }).reject(function (line) {
        return line === null;
      }).pipe(function (lines) {
        allLines = lines.toArray();
        return window.collect(allLines);
      }).map(function (line, index) {
        var nextLine = allLines[index + 1];
        var previousLine = allLines[index - 1];
        if (line.startsWith("-") && nextLine.startsWith("+")) {
          return [line, nextLine];
        }
        if (line.startsWith("+") && previousLine.startsWith("-")) {
          return null;
        }
        return line;
      }).reject(function (line) {
        return line === null;
      }).map(function (line) {
        if ((typeof line === "undefined" ? "undefined" : _typeof(line)) === "object") {
          return _this.styleUpdatedLines(line);
        } else if (line.startsWith("+")) {
          return _this.styleAddedLine(line);
        } else if (line.startsWith("-")) {
          return _this.styleOriginalLine(line);
        }
        return _this.stylePlainLine(line);
      }).implode("\n");
    }
  },
  methods: {
    createSpanNodeWithClass: function createSpanNodeWithClass(text, className) {
      var element = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "span";

      var span = document.createElement(element);
      span.classList.add(className);
      span.appendChild(document.createTextNode(text));
      return span.outerHTML;
    },
    stylePlainLine: function stylePlainLine(line) {
      return this.createSpanNodeWithClass(line.substr(1), "diff-regular");
    },
    styleOriginalLine: function styleOriginalLine(line, nextLine) {
      return this.createSpanNodeWithClass(line.substr(1), "diff-original");
    },
    styleAddedLine: function styleAddedLine(line) {
      return this.createSpanNodeWithClass(line.substr(1), "diff-new");
    },
    styleUpdatedLines: function styleUpdatedLines(lines) {
      var before = lines[0].substr(1);
      var after = lines[1].substr(1);
      if (!after) {
        return this.styleOriginalLine(lines[0]);
      } else if (!before) {
        return this.styleAddedLine(lines[1]);
      }
      var diffs = jsDiff.diffChars(before, after);
      if (diffs.length === 1 && diffs[0].added) {
        return this.styleAddedLine("+" + diffs[0].value);
      } else if (diffs.length === 1 && diffs[0].removed) {
        return this.styleOriginalLine("-" + diffs[0].value);
      } else if (diffs.length === 1) {
        return this.stylePlainLine(" " + diffs[0].value);
      }

      var dummyNode = document.createElement("span");
      dummyNode.classList.add("diff-updated");
      diffs.forEach(function (part) {
        var partClass = part.added ? "diff-fragment-added" : part.removed ? "diff-fragment-removed" : "diff-fragment-regular";
        var span = document.createElement("span");
        span.classList.add(partClass);
        span.appendChild(document.createTextNode(part.value));
        dummyNode.appendChild(span);
      });

      return dummyNode.outerHTML;
    }
  }
});

/***/ }),
/* 270 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("pre", { domProps: { innerHTML: _vm._s(_vm.styledDiff) } })
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-345cbc30", module.exports)
  }
}

/***/ }),
/* 271 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "diff" },
    [
      _c("history-metadata", { attrs: { diff: _vm.diff } }),
      _vm._v(" "),
      _c(
        "div",
        {
          staticClass: "tabs is-small is-centered is-toggle is-toggle-rounded"
        },
        [
          _c(
            "ul",
            _vm._l(_vm.availablePresentations, function(presentation) {
              return _c(
                "li",
                {
                  key: presentation.type,
                  class: {
                    "is-active": presentation.type === _vm.selectedPresentation
                  }
                },
                [
                  _c(
                    "a",
                    {
                      on: {
                        click: function($event) {
                          _vm.selectedPresentation = presentation.type
                        }
                      }
                    },
                    [_c("span", [_vm._v(_vm._s(presentation.label))])]
                  )
                ]
              )
            })
          )
        ]
      ),
      _vm._v(" "),
      _vm.selectedPresentation === "diff"
        ? _c("diff-highlighter", {
            attrs: {
              before: _vm.diff.data.changes.before.content,
              after: _vm.diff.data.changes.after.content,
              diff: _vm.diff.data.changes.diff
            }
          })
        : _vm._e(),
      _vm._v(" "),
      _vm.selectedPresentation === "raw"
        ? _c("div", { staticClass: "columns" }, [
            _c("div", { staticClass: "column is-half" }, [
              _vm.diff.data.changes.before.content
                ? _c("pre", [
                    _vm._v(
                      "        " +
                        _vm._s(_vm.diff.data.changes.before.content) +
                        "\n      "
                    )
                  ])
                : _c("div", { staticClass: "has-text-centered" }, [
                    _vm._v("\n        —\n        "),
                    _c("em", [_vm._v("Empty")]),
                    _vm._v(" —\n      ")
                  ])
            ]),
            _vm._v(" "),
            _c("div", { staticClass: "column is-half" }, [
              _c("pre", [
                _vm._v(
                  "        " +
                    _vm._s(_vm.diff.data.changes.after.content) +
                    "\n      "
                )
              ])
            ])
          ])
        : _vm._e()
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-7169e9f0", module.exports)
  }
}

/***/ }),
/* 272 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticStyle: { width: "100%" } },
    [
      _vm.loading ? _c("loading-indicator", { attrs: { size: 2 } }) : _vm._e(),
      _vm._v(" "),
      _c(
        "div",
        { staticClass: "diffs", attrs: { else: "" } },
        [
          _vm._l(_vm.data.data, function(diff) {
            return _c("page-history-body-diff", {
              key: diff.key,
              attrs: { diff: diff }
            })
          }),
          _vm._v(" "),
          _vm.data.links
            ? _c("basic-paginator", {
                attrs: { links: _vm.data.links, meta: _vm.data.meta },
                on: { select: _vm.handlePaginationSelect }
              })
            : _vm._e()
        ],
        2
      )
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-fa7a1f9c", module.exports)
  }
}

/***/ }),
/* 273 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "section" }, [
    _c(
      "section",
      { staticClass: "container" },
      [
        _c(
          "folding-panel",
          {
            ref: "settings",
            attrs: {
              deployed: _vm.activePanel === "settings",
              title: "Settings"
            },
            on: { toggle: _vm.toggleFolding }
          },
          [
            _c("page-history-settings", {
              attrs: { "page-slug": _vm.pageSlug }
            })
          ],
          1
        ),
        _vm._v(" "),
        _c(
          "folding-panel",
          {
            ref: "body",
            attrs: { deployed: _vm.activePanel === "body", title: "Body" },
            on: { toggle: _vm.toggleFolding }
          },
          [_c("page-history-body", { attrs: { "page-slug": _vm.pageSlug } })],
          1
        )
      ],
      1
    )
  ])
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-5d455ded", module.exports)
  }
}

/***/ }),
/* 274 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 275 */,
/* 276 */,
/* 277 */,
/* 278 */,
/* 279 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(280)
/* template */
var __vue_template__ = null
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/register-form.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-4cddc3b2", Component.options)
  } else {
    hotAPI.reload("data-v-4cddc3b2", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 280 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });

/* harmony default export */ __webpack_exports__["default"] = ({
  components: {
    recaptchaButton: __webpack_require__(281)
  },
  methods: {
    /**
     * Check for valid and hard validate subcomponents. Part of the validation chain.
     * @param  boolean hard If true, error messages will be displayed next to the fields.
     * @return boolean      True if valid.
     */
    validate: function validate(hard) {
      var allValid = true;
      // Check for required fields.
      window.collect(this.$children).each(function (child) {
        if (typeof child.validate === "function") {
          allValid = child.validate(hard) ? allValid : false;
        }
      });

      return allValid;
    },
    submit: function submit() {
      if (!this.validate(true)) return;

      this.$el.submit();
    }
  }
});

/***/ }),
/* 281 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(282)
/* template */
var __vue_template__ = __webpack_require__(283)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/recaptcha-button.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-2d4af4ef", Component.options)
  } else {
    hotAPI.reload("data-v-2d4af4ef", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 282 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
  props: {
    publicKey: {
      type: String,
      required: true
    }
  },
  mounted: function mounted() {
    if (this.$store.state.captcha.provider === "recaptcha") {
      this.initializeCaptcha();
    }
  },

  watch: {
    "$store.state.captcha.provider": function $storeStateCaptchaProvider(newValue, oldValue) {
      if (!oldValue && newValue === "recaptcha") {
        this.initializeCaptcha();
      }
    }
  },
  computed: {
    buttonSelector: function buttonSelector() {
      return "grecaptcha-" + this._uid;
    }
  },
  methods: {
    initializeCaptcha: function initializeCaptcha() {
      var _this = this;

      grecaptcha.render(this.$el.querySelector("#" + this.buttonSelector), {
        sitekey: this.publicKey,
        callback: function callback() {
          _this.$emit("complete");
        }
      });
    }
  }
});

/***/ }),
/* 283 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", [
    _c(
      "button",
      {
        staticClass: "button is-primary",
        attrs: {
          id: _vm.buttonSelector,
          disabled: _vm.$store.state.captcha.provider !== "recaptcha"
        }
      },
      [_vm._t("default")],
      2
    )
  ])
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-2d4af4ef", module.exports)
  }
}

/***/ })
],[32]);