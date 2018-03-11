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
/* 1 */,
/* 2 */
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
/* 3 */
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

var listToStyles = __webpack_require__(146)

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
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(188)
/* template */
var __vue_template__ = __webpack_require__(189)
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
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(190)
}
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(192)
/* template */
var __vue_template__ = __webpack_require__(213)
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
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(21);
module.exports = __webpack_require__(218);


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

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

__webpack_require__(22);

window.Vue = __webpack_require__(17);

/**
 * Next, registrer Axios on the Vue object so we can just call this.$http like
 * we did with vue-resource. Idiot proofing future debugging.
 */
Vue.prototype.$http = window.axios;

Vue.component('dirtiki-input', __webpack_require__(137));
Vue.component('loading-indicator', __webpack_require__(140));
Vue.component('folding-panel', __webpack_require__(143));

var app = new Vue({
  el: '#app',
  data: {
    query: ""
  },
  components: {
    searchModal: __webpack_require__(149),
    pageViewer: __webpack_require__(154),
    pageEditor: __webpack_require__(186),
    pageCreator: __webpack_require__(215)
  }
});

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

window.collect = __webpack_require__(9);

/**
 * We'll load the axios HTTP library which allows us to easily issue requests
 * to our Laravel back-end. This library automatically handles sending the
 * CSRF token as a header based on the value of the "XSRF" token cookie.
 */

window.axios = __webpack_require__(11);

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

window.marked = __webpack_require__(133);
__webpack_require__(134);

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
/* 23 */,
/* 24 */,
/* 25 */,
/* 26 */,
/* 27 */,
/* 28 */,
/* 29 */,
/* 30 */,
/* 31 */,
/* 32 */,
/* 33 */,
/* 34 */,
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
/* 133 */
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
/* 134 */
/***/ (function(module, exports) {

var renderer = new window.marked.Renderer();

// Override function
renderer.heading = function (text, level) {
    var escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
    return '<header-anchor :level=\'' + escape(level) + '\' anchor=\'' + escapedText + '\'>' + escape(text) + '</header-anchor>';
};

renderer.code = function (code, language) {
    return '</div></section><code-presenter language=\'' + escape(language) + '\'>' + escape(code) + '</code-presenter><section class="section"><div class="container content">';
};

window.marked.setOptions({
    gfm: true,
    tables: true,
    breaks: true,
    sanitize: true,
    renderer: renderer
});

/***/ }),
/* 135 */,
/* 136 */,
/* 137 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(138)
/* template */
var __vue_template__ = __webpack_require__(139)
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
/* 138 */
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
        url: "The :attribute format is invalid."
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
/* 139 */
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
/* 140 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(141)
/* template */
var __vue_template__ = __webpack_require__(142)
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
/* 141 */
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
/* 142 */
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
/* 143 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(144)
}
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(147)
/* template */
var __vue_template__ = __webpack_require__(148)
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
/* 144 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(145);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(3)("6ba67fb2", content, false, {});
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
/* 145 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)(false);
// imports


// module
exports.push([module.i, "\n.panel-heading[data-v-f151b61e] {\n  cursor: pointer;\n}\n", ""]);

// exports


/***/ }),
/* 146 */
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
/* 147 */
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
    deployed: { type: Boolean, default: true },
    title: { type: String, required: true }
  },
  methods: {
    toggle: function toggle() {
      this.deployed = !this.deployed;
      this.$emit("toggle", this);
    }
  }
});

/***/ }),
/* 148 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "panel" }, [
    _c("p", { staticClass: "panel-heading", on: { click: _vm.toggle } }, [
      _vm._v("\n        " + _vm._s(_vm.title) + "\n        "),
      _c("span", { staticClass: "is-pulled-right" }, [
        !_vm.deployed
          ? _c("i", { staticClass: "fas fa-caret-right" })
          : _vm._e(),
        _vm._v(" "),
        _vm.deployed ? _c("i", { staticClass: "fas fa-caret-down" }) : _vm._e()
      ])
    ]),
    _vm._v(" "),
    _vm.deployed
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
/* 149 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(150)
}
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(152)
/* template */
var __vue_template__ = __webpack_require__(153)
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
/* 150 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(151);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(3)("107cecfc", content, false, {});
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
/* 151 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)(false);
// imports


// module
exports.push([module.i, "\n\n", ""]);

// exports


/***/ }),
/* 152 */
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
  components: {},
  props: {
    value: {
      type: String,
      required: true
    }
  },
  data: function data() {
    return {
      initialSearchField: null
    };
  },
  mounted: function mounted() {
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
    handleInput: function handleInput() {
      this.$emit("input", this.value);
    },
    clear: function clear() {
      this.value = "";
      this.$emit("input", "");
    }
  }
});

/***/ }),
/* 153 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "modal is-active" }, [
    _c("div", { staticClass: "modal-background" }),
    _vm._v(" "),
    _c("div", { staticClass: "modal-content box" }, [
      _c("div", { staticClass: "control has-icons-right" }, [
        _c("input", {
          directives: [
            {
              name: "model",
              rawName: "v-model",
              value: _vm.value,
              expression: "value"
            }
          ],
          staticClass: "input",
          attrs: { id: "search-field-" + _vm._uid, placeholder: "Search" },
          domProps: { value: _vm.value },
          on: {
            input: [
              function($event) {
                if ($event.target.composing) {
                  return
                }
                _vm.value = $event.target.value
              },
              _vm.handleInput
            ]
          }
        }),
        _vm._v(" "),
        _vm._m(0)
      ])
    ]),
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
    return _c("span", { staticClass: "icon is-small is-right" }, [
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
/* 154 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(155)
}
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(157)
/* template */
var __vue_template__ = __webpack_require__(185)
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
/* 155 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(156);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(3)("0544e5be", content, false, {});
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
/* 156 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)(false);
// imports


// module
exports.push([module.i, "\n.content img {\r\n  display: block;\r\n  margin-left: auto;\r\n  margin-right: auto;\r\n  max-width: 75%;\n}\r\n", ""]);

// exports


/***/ }),
/* 157 */
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
    markdownRenderer: __webpack_require__(158)
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
/* 158 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(159)
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
/* 159 */
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
        headerAnchor: __webpack_require__(160),
        codePresenter: __webpack_require__(164)
      }
    });

    return createElement("div", {}, [createElement(component)]);
  }
});

/***/ }),
/* 160 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(161)
}
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(163)
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
/* 161 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(162);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(3)("a4d87160", content, false, {});
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
/* 162 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)(false);
// imports


// module
exports.push([module.i, "\nsmall[data-v-3f98b6ee] {\r\n  color: hsl(217, 71%, 53%);\r\n  font-size: 0.8em;\n}\nsmall i[data-v-3f98b6ee] {\r\n  position: relative;\r\n  top: -1em;\r\n  font-size: 0.8em;\n}\r\n", ""]);

// exports


/***/ }),
/* 163 */
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
  props: {
    anchor: { Type: String, Required: true },
    level: { Type: Number, Required: true }
  },
  data: function data() {
    return {
      showHelper: false,
      showLink: false
    };
  },

  computed: {
    linkUrl: function linkUrl() {
      return document.location.href.substr(0, document.location.href.indexOf("#")) + "#" + this.anchor;
    }
  },
  render: function render(createElement) {
    var self = this;

    var anchorA = createElement("a", {
      domProps: {
        name: this.anchor,
        href: "#" + this.anchor
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

    var headerChildren = [anchorA, mainSpan];
    if (this.showLink) headerChildren.push(linkSpan);
    return createElement("h" + this.level, headerChildren);
  }
});

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
var __vue_template__ = __webpack_require__(184)
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
/* 165 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(166);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(3)("71f76bd3", content, false, {});
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
/* 166 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)(false);
// imports


// module
exports.push([module.i, "\naside[data-v-75ef749f] {\r\n  background-color: #fafafa;\n}\npre[data-v-75ef749f] {\r\n  background-color: initial;\r\n  font-size: 1em;\r\n  padding: 0;\n}\r\n", ""]);

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
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
  components: {
    codeHighlighter: __webpack_require__(168)
  },
  props: {
    language: { type: String, required: false }
  },
  data: function data() {
    return {
      allowHighlights: true,
      selectedType: null
    };
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

      if (!this.selectedType || !window.collect(presentations).where("type", this.selectedType).count()) {
        this.selectedType = presentations[0].type;
      }

      return presentations;
    }
  },

  methods: {
    selectFirstPresentationType: function selectFirstPresentationType() {}
  }
});

/***/ }),
/* 168 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(169)
}
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(171)
/* template */
var __vue_template__ = __webpack_require__(183)
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
/* 169 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(170);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(3)("cd00b406", content, false, {});
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
/* 170 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)(false);
// imports


// module
exports.push([module.i, "\npre code[data-v-44eb8e18] .token.number {\r\n  font-size: 1em;\r\n  background-color: inherit;\r\n  border-radius: 0;\r\n  height: inherit;\r\n  margin: 0;\r\n  padding: 0;\n}\r\n", ""]);

// exports


/***/ }),
/* 171 */
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

var Prism = __webpack_require__(172);
__webpack_require__(173);
__webpack_require__(174);
__webpack_require__(175);
__webpack_require__(176);
__webpack_require__(177);
__webpack_require__(178);
//require("prismjs/components/prism-cpp");
__webpack_require__(179);
__webpack_require__(180);
__webpack_require__(181);
//require("prismjs/components/prism-objectivec");
var beautify = __webpack_require__(182);

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
/* 172 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {
/* **********************************************
     Begin prism-core.js
********************************************** */

var _self = (typeof window !== 'undefined')
	? window   // if in browser
	: (
		(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope)
		? self // if in worker
		: {}   // if in node js
	);

/**
 * Prism: Lightweight, robust, elegant syntax highlighting
 * MIT license http://www.opensource.org/licenses/mit-license.php/
 * @author Lea Verou http://lea.verou.me
 */

var Prism = (function(){

// Private helper vars
var lang = /\blang(?:uage)?-(\w+)\b/i;
var uniqueId = 0;

var _ = _self.Prism = {
	manual: _self.Prism && _self.Prism.manual,
	disableWorkerMessageHandler: _self.Prism && _self.Prism.disableWorkerMessageHandler,
	util: {
		encode: function (tokens) {
			if (tokens instanceof Token) {
				return new Token(tokens.type, _.util.encode(tokens.content), tokens.alias);
			} else if (_.util.type(tokens) === 'Array') {
				return tokens.map(_.util.encode);
			} else {
				return tokens.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\u00a0/g, ' ');
			}
		},

		type: function (o) {
			return Object.prototype.toString.call(o).match(/\[object (\w+)\]/)[1];
		},

		objId: function (obj) {
			if (!obj['__id']) {
				Object.defineProperty(obj, '__id', { value: ++uniqueId });
			}
			return obj['__id'];
		},

		// Deep clone a language definition (e.g. to extend it)
		clone: function (o) {
			var type = _.util.type(o);

			switch (type) {
				case 'Object':
					var clone = {};

					for (var key in o) {
						if (o.hasOwnProperty(key)) {
							clone[key] = _.util.clone(o[key]);
						}
					}

					return clone;

				case 'Array':
					return o.map(function(v) { return _.util.clone(v); });
			}

			return o;
		}
	},

	languages: {
		extend: function (id, redef) {
			var lang = _.util.clone(_.languages[id]);

			for (var key in redef) {
				lang[key] = redef[key];
			}

			return lang;
		},

		/**
		 * Insert a token before another token in a language literal
		 * As this needs to recreate the object (we cannot actually insert before keys in object literals),
		 * we cannot just provide an object, we need anobject and a key.
		 * @param inside The key (or language id) of the parent
		 * @param before The key to insert before. If not provided, the function appends instead.
		 * @param insert Object with the key/value pairs to insert
		 * @param root The object that contains `inside`. If equal to Prism.languages, it can be omitted.
		 */
		insertBefore: function (inside, before, insert, root) {
			root = root || _.languages;
			var grammar = root[inside];

			if (arguments.length == 2) {
				insert = arguments[1];

				for (var newToken in insert) {
					if (insert.hasOwnProperty(newToken)) {
						grammar[newToken] = insert[newToken];
					}
				}

				return grammar;
			}

			var ret = {};

			for (var token in grammar) {

				if (grammar.hasOwnProperty(token)) {

					if (token == before) {

						for (var newToken in insert) {

							if (insert.hasOwnProperty(newToken)) {
								ret[newToken] = insert[newToken];
							}
						}
					}

					ret[token] = grammar[token];
				}
			}

			// Update references in other language definitions
			_.languages.DFS(_.languages, function(key, value) {
				if (value === root[inside] && key != inside) {
					this[key] = ret;
				}
			});

			return root[inside] = ret;
		},

		// Traverse a language definition with Depth First Search
		DFS: function(o, callback, type, visited) {
			visited = visited || {};
			for (var i in o) {
				if (o.hasOwnProperty(i)) {
					callback.call(o, i, o[i], type || i);

					if (_.util.type(o[i]) === 'Object' && !visited[_.util.objId(o[i])]) {
						visited[_.util.objId(o[i])] = true;
						_.languages.DFS(o[i], callback, null, visited);
					}
					else if (_.util.type(o[i]) === 'Array' && !visited[_.util.objId(o[i])]) {
						visited[_.util.objId(o[i])] = true;
						_.languages.DFS(o[i], callback, i, visited);
					}
				}
			}
		}
	},
	plugins: {},

	highlightAll: function(async, callback) {
		_.highlightAllUnder(document, async, callback);
	},

	highlightAllUnder: function(container, async, callback) {
		var env = {
			callback: callback,
			selector: 'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'
		};

		_.hooks.run("before-highlightall", env);

		var elements = env.elements || container.querySelectorAll(env.selector);

		for (var i=0, element; element = elements[i++];) {
			_.highlightElement(element, async === true, env.callback);
		}
	},

	highlightElement: function(element, async, callback) {
		// Find language
		var language, grammar, parent = element;

		while (parent && !lang.test(parent.className)) {
			parent = parent.parentNode;
		}

		if (parent) {
			language = (parent.className.match(lang) || [,''])[1].toLowerCase();
			grammar = _.languages[language];
		}

		// Set language on the element, if not present
		element.className = element.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;

		if (element.parentNode) {
			// Set language on the parent, for styling
			parent = element.parentNode;

			if (/pre/i.test(parent.nodeName)) {
				parent.className = parent.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;
			}
		}

		var code = element.textContent;

		var env = {
			element: element,
			language: language,
			grammar: grammar,
			code: code
		};

		_.hooks.run('before-sanity-check', env);

		if (!env.code || !env.grammar) {
			if (env.code) {
				_.hooks.run('before-highlight', env);
				env.element.textContent = env.code;
				_.hooks.run('after-highlight', env);
			}
			_.hooks.run('complete', env);
			return;
		}

		_.hooks.run('before-highlight', env);

		if (async && _self.Worker) {
			var worker = new Worker(_.filename);

			worker.onmessage = function(evt) {
				env.highlightedCode = evt.data;

				_.hooks.run('before-insert', env);

				env.element.innerHTML = env.highlightedCode;

				callback && callback.call(env.element);
				_.hooks.run('after-highlight', env);
				_.hooks.run('complete', env);
			};

			worker.postMessage(JSON.stringify({
				language: env.language,
				code: env.code,
				immediateClose: true
			}));
		}
		else {
			env.highlightedCode = _.highlight(env.code, env.grammar, env.language);

			_.hooks.run('before-insert', env);

			env.element.innerHTML = env.highlightedCode;

			callback && callback.call(element);

			_.hooks.run('after-highlight', env);
			_.hooks.run('complete', env);
		}
	},

	highlight: function (text, grammar, language) {
		var tokens = _.tokenize(text, grammar);
		return Token.stringify(_.util.encode(tokens), language);
	},

	matchGrammar: function (text, strarr, grammar, index, startPos, oneshot, target) {
		var Token = _.Token;

		for (var token in grammar) {
			if(!grammar.hasOwnProperty(token) || !grammar[token]) {
				continue;
			}

			if (token == target) {
				return;
			}

			var patterns = grammar[token];
			patterns = (_.util.type(patterns) === "Array") ? patterns : [patterns];

			for (var j = 0; j < patterns.length; ++j) {
				var pattern = patterns[j],
					inside = pattern.inside,
					lookbehind = !!pattern.lookbehind,
					greedy = !!pattern.greedy,
					lookbehindLength = 0,
					alias = pattern.alias;

				if (greedy && !pattern.pattern.global) {
					// Without the global flag, lastIndex won't work
					var flags = pattern.pattern.toString().match(/[imuy]*$/)[0];
					pattern.pattern = RegExp(pattern.pattern.source, flags + "g");
				}

				pattern = pattern.pattern || pattern;

				// Don’t cache length as it changes during the loop
				for (var i = index, pos = startPos; i < strarr.length; pos += strarr[i].length, ++i) {

					var str = strarr[i];

					if (strarr.length > text.length) {
						// Something went terribly wrong, ABORT, ABORT!
						return;
					}

					if (str instanceof Token) {
						continue;
					}

					pattern.lastIndex = 0;

					var match = pattern.exec(str),
					    delNum = 1;

					// Greedy patterns can override/remove up to two previously matched tokens
					if (!match && greedy && i != strarr.length - 1) {
						pattern.lastIndex = pos;
						match = pattern.exec(text);
						if (!match) {
							break;
						}

						var from = match.index + (lookbehind ? match[1].length : 0),
						    to = match.index + match[0].length,
						    k = i,
						    p = pos;

						for (var len = strarr.length; k < len && (p < to || (!strarr[k].type && !strarr[k - 1].greedy)); ++k) {
							p += strarr[k].length;
							// Move the index i to the element in strarr that is closest to from
							if (from >= p) {
								++i;
								pos = p;
							}
						}

						/*
						 * If strarr[i] is a Token, then the match starts inside another Token, which is invalid
						 * If strarr[k - 1] is greedy we are in conflict with another greedy pattern
						 */
						if (strarr[i] instanceof Token || strarr[k - 1].greedy) {
							continue;
						}

						// Number of tokens to delete and replace with the new match
						delNum = k - i;
						str = text.slice(pos, p);
						match.index -= pos;
					}

					if (!match) {
						if (oneshot) {
							break;
						}

						continue;
					}

					if(lookbehind) {
						lookbehindLength = match[1].length;
					}

					var from = match.index + lookbehindLength,
					    match = match[0].slice(lookbehindLength),
					    to = from + match.length,
					    before = str.slice(0, from),
					    after = str.slice(to);

					var args = [i, delNum];

					if (before) {
						++i;
						pos += before.length;
						args.push(before);
					}

					var wrapped = new Token(token, inside? _.tokenize(match, inside) : match, alias, match, greedy);

					args.push(wrapped);

					if (after) {
						args.push(after);
					}

					Array.prototype.splice.apply(strarr, args);

					if (delNum != 1)
						_.matchGrammar(text, strarr, grammar, i, pos, true, token);

					if (oneshot)
						break;
				}
			}
		}
	},

	tokenize: function(text, grammar, language) {
		var strarr = [text];

		var rest = grammar.rest;

		if (rest) {
			for (var token in rest) {
				grammar[token] = rest[token];
			}

			delete grammar.rest;
		}

		_.matchGrammar(text, strarr, grammar, 0, 0, false);

		return strarr;
	},

	hooks: {
		all: {},

		add: function (name, callback) {
			var hooks = _.hooks.all;

			hooks[name] = hooks[name] || [];

			hooks[name].push(callback);
		},

		run: function (name, env) {
			var callbacks = _.hooks.all[name];

			if (!callbacks || !callbacks.length) {
				return;
			}

			for (var i=0, callback; callback = callbacks[i++];) {
				callback(env);
			}
		}
	}
};

var Token = _.Token = function(type, content, alias, matchedStr, greedy) {
	this.type = type;
	this.content = content;
	this.alias = alias;
	// Copy of the full string this token was created from
	this.length = (matchedStr || "").length|0;
	this.greedy = !!greedy;
};

Token.stringify = function(o, language, parent) {
	if (typeof o == 'string') {
		return o;
	}

	if (_.util.type(o) === 'Array') {
		return o.map(function(element) {
			return Token.stringify(element, language, o);
		}).join('');
	}

	var env = {
		type: o.type,
		content: Token.stringify(o.content, language, parent),
		tag: 'span',
		classes: ['token', o.type],
		attributes: {},
		language: language,
		parent: parent
	};

	if (o.alias) {
		var aliases = _.util.type(o.alias) === 'Array' ? o.alias : [o.alias];
		Array.prototype.push.apply(env.classes, aliases);
	}

	_.hooks.run('wrap', env);

	var attributes = Object.keys(env.attributes).map(function(name) {
		return name + '="' + (env.attributes[name] || '').replace(/"/g, '&quot;') + '"';
	}).join(' ');

	return '<' + env.tag + ' class="' + env.classes.join(' ') + '"' + (attributes ? ' ' + attributes : '') + '>' + env.content + '</' + env.tag + '>';

};

if (!_self.document) {
	if (!_self.addEventListener) {
		// in Node.js
		return _self.Prism;
	}

	if (!_.disableWorkerMessageHandler) {
		// In worker
		_self.addEventListener('message', function (evt) {
			var message = JSON.parse(evt.data),
				lang = message.language,
				code = message.code,
				immediateClose = message.immediateClose;

			_self.postMessage(_.highlight(code, _.languages[lang], lang));
			if (immediateClose) {
				_self.close();
			}
		}, false);
	}

	return _self.Prism;
}

//Get current script and highlight
var script = document.currentScript || [].slice.call(document.getElementsByTagName("script")).pop();

if (script) {
	_.filename = script.src;

	if (!_.manual && !script.hasAttribute('data-manual')) {
		if(document.readyState !== "loading") {
			if (window.requestAnimationFrame) {
				window.requestAnimationFrame(_.highlightAll);
			} else {
				window.setTimeout(_.highlightAll, 16);
			}
		}
		else {
			document.addEventListener('DOMContentLoaded', _.highlightAll);
		}
	}
}

return _self.Prism;

})();

if (typeof module !== 'undefined' && module.exports) {
	module.exports = Prism;
}

// hack for components to work correctly in node.js
if (typeof global !== 'undefined') {
	global.Prism = Prism;
}


/* **********************************************
     Begin prism-markup.js
********************************************** */

Prism.languages.markup = {
	'comment': /<!--[\s\S]*?-->/,
	'prolog': /<\?[\s\S]+?\?>/,
	'doctype': /<!DOCTYPE[\s\S]+?>/i,
	'cdata': /<!\[CDATA\[[\s\S]*?]]>/i,
	'tag': {
		pattern: /<\/?(?!\d)[^\s>\/=$<]+(?:\s+[^\s>\/=]+(?:=(?:("|')(?:\\[\s\S]|(?!\1)[^\\])*\1|[^\s'">=]+))?)*\s*\/?>/i,
		inside: {
			'tag': {
				pattern: /^<\/?[^\s>\/]+/i,
				inside: {
					'punctuation': /^<\/?/,
					'namespace': /^[^\s>\/:]+:/
				}
			},
			'attr-value': {
				pattern: /=(?:("|')(?:\\[\s\S]|(?!\1)[^\\])*\1|[^\s'">=]+)/i,
				inside: {
					'punctuation': [
						/^=/,
						{
							pattern: /(^|[^\\])["']/,
							lookbehind: true
						}
					]
				}
			},
			'punctuation': /\/?>/,
			'attr-name': {
				pattern: /[^\s>\/]+/,
				inside: {
					'namespace': /^[^\s>\/:]+:/
				}
			}

		}
	},
	'entity': /&#?[\da-z]{1,8};/i
};

Prism.languages.markup['tag'].inside['attr-value'].inside['entity'] =
	Prism.languages.markup['entity'];

// Plugin to make entity title show the real entity, idea by Roman Komarov
Prism.hooks.add('wrap', function(env) {

	if (env.type === 'entity') {
		env.attributes['title'] = env.content.replace(/&amp;/, '&');
	}
});

Prism.languages.xml = Prism.languages.markup;
Prism.languages.html = Prism.languages.markup;
Prism.languages.mathml = Prism.languages.markup;
Prism.languages.svg = Prism.languages.markup;


/* **********************************************
     Begin prism-css.js
********************************************** */

Prism.languages.css = {
	'comment': /\/\*[\s\S]*?\*\//,
	'atrule': {
		pattern: /@[\w-]+?.*?(?:;|(?=\s*\{))/i,
		inside: {
			'rule': /@[\w-]+/
			// See rest below
		}
	},
	'url': /url\((?:(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1|.*?)\)/i,
	'selector': /[^{}\s][^{};]*?(?=\s*\{)/,
	'string': {
		pattern: /("|')(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
		greedy: true
	},
	'property': /[-_a-z\xA0-\uFFFF][-\w\xA0-\uFFFF]*(?=\s*:)/i,
	'important': /\B!important\b/i,
	'function': /[-a-z0-9]+(?=\()/i,
	'punctuation': /[(){};:]/
};

Prism.languages.css['atrule'].inside.rest = Prism.util.clone(Prism.languages.css);

if (Prism.languages.markup) {
	Prism.languages.insertBefore('markup', 'tag', {
		'style': {
			pattern: /(<style[\s\S]*?>)[\s\S]*?(?=<\/style>)/i,
			lookbehind: true,
			inside: Prism.languages.css,
			alias: 'language-css',
			greedy: true
		}
	});

	Prism.languages.insertBefore('inside', 'attr-value', {
		'style-attr': {
			pattern: /\s*style=("|')(?:\\[\s\S]|(?!\1)[^\\])*\1/i,
			inside: {
				'attr-name': {
					pattern: /^\s*style/i,
					inside: Prism.languages.markup.tag.inside
				},
				'punctuation': /^\s*=\s*['"]|['"]\s*$/,
				'attr-value': {
					pattern: /.+/i,
					inside: Prism.languages.css
				}
			},
			alias: 'language-css'
		}
	}, Prism.languages.markup.tag);
}

/* **********************************************
     Begin prism-clike.js
********************************************** */

Prism.languages.clike = {
	'comment': [
		{
			pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
			lookbehind: true
		},
		{
			pattern: /(^|[^\\:])\/\/.*/,
			lookbehind: true
		}
	],
	'string': {
		pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
		greedy: true
	},
	'class-name': {
		pattern: /((?:\b(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[\w.\\]+/i,
		lookbehind: true,
		inside: {
			punctuation: /[.\\]/
		}
	},
	'keyword': /\b(?:if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,
	'boolean': /\b(?:true|false)\b/,
	'function': /[a-z0-9_]+(?=\()/i,
	'number': /\b-?(?:0x[\da-f]+|\d*\.?\d+(?:e[+-]?\d+)?)\b/i,
	'operator': /--?|\+\+?|!=?=?|<=?|>=?|==?=?|&&?|\|\|?|\?|\*|\/|~|\^|%/,
	'punctuation': /[{}[\];(),.:]/
};


/* **********************************************
     Begin prism-javascript.js
********************************************** */

Prism.languages.javascript = Prism.languages.extend('clike', {
	'keyword': /\b(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|var|void|while|with|yield)\b/,
	'number': /\b-?(?:0[xX][\dA-Fa-f]+|0[bB][01]+|0[oO][0-7]+|\d*\.?\d+(?:[Ee][+-]?\d+)?|NaN|Infinity)\b/,
	// Allow for all non-ASCII characters (See http://stackoverflow.com/a/2008444)
	'function': /[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*\()/i,
	'operator': /-[-=]?|\+[+=]?|!=?=?|<<?=?|>>?>?=?|=(?:==?|>)?|&[&=]?|\|[|=]?|\*\*?=?|\/=?|~|\^=?|%=?|\?|\.{3}/
});

Prism.languages.insertBefore('javascript', 'keyword', {
	'regex': {
		pattern: /(^|[^/])\/(?!\/)(\[[^\]\r\n]+]|\\.|[^/\\\[\r\n])+\/[gimyu]{0,5}(?=\s*($|[\r\n,.;})]))/,
		lookbehind: true,
		greedy: true
	},
	// This must be declared before keyword because we use "function" inside the look-forward
	'function-variable': {
		pattern: /[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*=\s*(?:function\b|(?:\([^()]*\)|[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)\s*=>))/i,
		alias: 'function'
	}
});

Prism.languages.insertBefore('javascript', 'string', {
	'template-string': {
		pattern: /`(?:\\[\s\S]|[^\\`])*`/,
		greedy: true,
		inside: {
			'interpolation': {
				pattern: /\$\{[^}]+\}/,
				inside: {
					'interpolation-punctuation': {
						pattern: /^\$\{|\}$/,
						alias: 'punctuation'
					},
					rest: Prism.languages.javascript
				}
			},
			'string': /[\s\S]+/
		}
	}
});

if (Prism.languages.markup) {
	Prism.languages.insertBefore('markup', 'tag', {
		'script': {
			pattern: /(<script[\s\S]*?>)[\s\S]*?(?=<\/script>)/i,
			lookbehind: true,
			inside: Prism.languages.javascript,
			alias: 'language-javascript',
			greedy: true
		}
	});
}

Prism.languages.js = Prism.languages.javascript;


/* **********************************************
     Begin prism-file-highlight.js
********************************************** */

(function () {
	if (typeof self === 'undefined' || !self.Prism || !self.document || !document.querySelector) {
		return;
	}

	self.Prism.fileHighlight = function() {

		var Extensions = {
			'js': 'javascript',
			'py': 'python',
			'rb': 'ruby',
			'ps1': 'powershell',
			'psm1': 'powershell',
			'sh': 'bash',
			'bat': 'batch',
			'h': 'c',
			'tex': 'latex'
		};

		Array.prototype.slice.call(document.querySelectorAll('pre[data-src]')).forEach(function (pre) {
			var src = pre.getAttribute('data-src');

			var language, parent = pre;
			var lang = /\blang(?:uage)?-(?!\*)(\w+)\b/i;
			while (parent && !lang.test(parent.className)) {
				parent = parent.parentNode;
			}

			if (parent) {
				language = (pre.className.match(lang) || [, ''])[1];
			}

			if (!language) {
				var extension = (src.match(/\.(\w+)$/) || [, ''])[1];
				language = Extensions[extension] || extension;
			}

			var code = document.createElement('code');
			code.className = 'language-' + language;

			pre.textContent = '';

			code.textContent = 'Loading…';

			pre.appendChild(code);

			var xhr = new XMLHttpRequest();

			xhr.open('GET', src, true);

			xhr.onreadystatechange = function () {
				if (xhr.readyState == 4) {

					if (xhr.status < 400 && xhr.responseText) {
						code.textContent = xhr.responseText;

						Prism.highlightElement(code);
					}
					else if (xhr.status >= 400) {
						code.textContent = '✖ Error ' + xhr.status + ' while fetching file: ' + xhr.statusText;
					}
					else {
						code.textContent = '✖ Error: File does not exist or is empty';
					}
				}
			};

			xhr.send(null);
		});

	};

	document.addEventListener('DOMContentLoaded', self.Prism.fileHighlight);

})();

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ }),
/* 173 */
/***/ (function(module, exports) {

Prism.languages.sql= {
	'comment': {
		pattern: /(^|[^\\])(?:\/\*[\s\S]*?\*\/|(?:--|\/\/|#).*)/,
		lookbehind: true
	},
	'string' : {
		pattern: /(^|[^@\\])("|')(?:\\[\s\S]|(?!\2)[^\\])*\2/,
		greedy: true,
		lookbehind: true
	},
	'variable': /@[\w.$]+|@(["'`])(?:\\[\s\S]|(?!\1)[^\\])+\1/,
	'function': /\b(?:COUNT|SUM|AVG|MIN|MAX|FIRST|LAST|UCASE|LCASE|MID|LEN|ROUND|NOW|FORMAT)(?=\s*\()/i, // Should we highlight user defined functions too?
	'keyword': /\b(?:ACTION|ADD|AFTER|ALGORITHM|ALL|ALTER|ANALYZE|ANY|APPLY|AS|ASC|AUTHORIZATION|AUTO_INCREMENT|BACKUP|BDB|BEGIN|BERKELEYDB|BIGINT|BINARY|BIT|BLOB|BOOL|BOOLEAN|BREAK|BROWSE|BTREE|BULK|BY|CALL|CASCADED?|CASE|CHAIN|CHAR VARYING|CHARACTER (?:SET|VARYING)|CHARSET|CHECK|CHECKPOINT|CLOSE|CLUSTERED|COALESCE|COLLATE|COLUMN|COLUMNS|COMMENT|COMMIT|COMMITTED|COMPUTE|CONNECT|CONSISTENT|CONSTRAINT|CONTAINS|CONTAINSTABLE|CONTINUE|CONVERT|CREATE|CROSS|CURRENT(?:_DATE|_TIME|_TIMESTAMP|_USER)?|CURSOR|DATA(?:BASES?)?|DATE(?:TIME)?|DBCC|DEALLOCATE|DEC|DECIMAL|DECLARE|DEFAULT|DEFINER|DELAYED|DELETE|DELIMITER(?:S)?|DENY|DESC|DESCRIBE|DETERMINISTIC|DISABLE|DISCARD|DISK|DISTINCT|DISTINCTROW|DISTRIBUTED|DO|DOUBLE(?: PRECISION)?|DROP|DUMMY|DUMP(?:FILE)?|DUPLICATE KEY|ELSE|ENABLE|ENCLOSED BY|END|ENGINE|ENUM|ERRLVL|ERRORS|ESCAPE(?:D BY)?|EXCEPT|EXEC(?:UTE)?|EXISTS|EXIT|EXPLAIN|EXTENDED|FETCH|FIELDS|FILE|FILLFACTOR|FIRST|FIXED|FLOAT|FOLLOWING|FOR(?: EACH ROW)?|FORCE|FOREIGN|FREETEXT(?:TABLE)?|FROM|FULL|FUNCTION|GEOMETRY(?:COLLECTION)?|GLOBAL|GOTO|GRANT|GROUP|HANDLER|HASH|HAVING|HOLDLOCK|IDENTITY(?:_INSERT|COL)?|IF|IGNORE|IMPORT|INDEX|INFILE|INNER|INNODB|INOUT|INSERT|INT|INTEGER|INTERSECT|INTO|INVOKER|ISOLATION LEVEL|JOIN|KEYS?|KILL|LANGUAGE SQL|LAST|LEFT|LIMIT|LINENO|LINES|LINESTRING|LOAD|LOCAL|LOCK|LONG(?:BLOB|TEXT)|MATCH(?:ED)?|MEDIUM(?:BLOB|INT|TEXT)|MERGE|MIDDLEINT|MODIFIES SQL DATA|MODIFY|MULTI(?:LINESTRING|POINT|POLYGON)|NATIONAL(?: CHAR VARYING| CHARACTER(?: VARYING)?| VARCHAR)?|NATURAL|NCHAR(?: VARCHAR)?|NEXT|NO(?: SQL|CHECK|CYCLE)?|NONCLUSTERED|NULLIF|NUMERIC|OFF?|OFFSETS?|ON|OPEN(?:DATASOURCE|QUERY|ROWSET)?|OPTIMIZE|OPTION(?:ALLY)?|ORDER|OUT(?:ER|FILE)?|OVER|PARTIAL|PARTITION|PERCENT|PIVOT|PLAN|POINT|POLYGON|PRECEDING|PRECISION|PREV|PRIMARY|PRINT|PRIVILEGES|PROC(?:EDURE)?|PUBLIC|PURGE|QUICK|RAISERROR|READ(?:S SQL DATA|TEXT)?|REAL|RECONFIGURE|REFERENCES|RELEASE|RENAME|REPEATABLE|REPLICATION|REQUIRE|RESTORE|RESTRICT|RETURNS?|REVOKE|RIGHT|ROLLBACK|ROUTINE|ROW(?:COUNT|GUIDCOL|S)?|RTREE|RULE|SAVE(?:POINT)?|SCHEMA|SELECT|SERIAL(?:IZABLE)?|SESSION(?:_USER)?|SET(?:USER)?|SHARE MODE|SHOW|SHUTDOWN|SIMPLE|SMALLINT|SNAPSHOT|SOME|SONAME|START(?:ING BY)?|STATISTICS|STATUS|STRIPED|SYSTEM_USER|TABLES?|TABLESPACE|TEMP(?:ORARY|TABLE)?|TERMINATED BY|TEXT(?:SIZE)?|THEN|TIMESTAMP|TINY(?:BLOB|INT|TEXT)|TOP?|TRAN(?:SACTIONS?)?|TRIGGER|TRUNCATE|TSEQUAL|TYPES?|UNBOUNDED|UNCOMMITTED|UNDEFINED|UNION|UNIQUE|UNPIVOT|UPDATE(?:TEXT)?|USAGE|USE|USER|USING|VALUES?|VAR(?:BINARY|CHAR|CHARACTER|YING)|VIEW|WAITFOR|WARNINGS|WHEN|WHERE|WHILE|WITH(?: ROLLUP|IN)?|WORK|WRITE(?:TEXT)?)\b/i,
	'boolean': /\b(?:TRUE|FALSE|NULL)\b/i,
	'number': /\b-?(?:0x)?\d*\.?[\da-f]+\b/,
	'operator': /[-+*\/=%^~]|&&?|\|\|?|!=?|<(?:=>?|<|>)?|>[>=]?|\b(?:AND|BETWEEN|IN|LIKE|NOT|OR|IS|DIV|REGEXP|RLIKE|SOUNDS LIKE|XOR)\b/i,
	'punctuation': /[;[\]()`,.]/
};

/***/ }),
/* 174 */
/***/ (function(module, exports) {

Prism.languages.json = {
	'property': /"(?:\\.|[^\\"\r\n])*"(?=\s*:)/i,
	'string': {
		pattern: /"(?:\\.|[^\\"\r\n])*"(?!\s*:)/,
		greedy: true
	},
	'number': /\b-?(?:0x[\dA-Fa-f]+|\d*\.?\d+(?:[Ee][+-]?\d+)?)\b/,
	'punctuation': /[{}[\]);,]/,
	'operator': /:/g,
	'boolean': /\b(?:true|false)\b/i,
	'null': /\bnull\b/i
};

Prism.languages.jsonp = Prism.languages.json;


/***/ }),
/* 175 */
/***/ (function(module, exports) {

Prism.languages.java = Prism.languages.extend('clike', {
	'keyword': /\b(?:abstract|continue|for|new|switch|assert|default|goto|package|synchronized|boolean|do|if|private|this|break|double|implements|protected|throw|byte|else|import|public|throws|case|enum|instanceof|return|transient|catch|extends|int|short|try|char|final|interface|static|void|class|finally|long|strictfp|volatile|const|float|native|super|while)\b/,
	'number': /\b0b[01]+\b|\b0x[\da-f]*\.?[\da-fp\-]+\b|\b\d*\.?\d+(?:e[+-]?\d+)?[df]?\b/i,
	'operator': {
		pattern: /(^|[^.])(?:\+[+=]?|-[-=]?|!=?|<<?=?|>>?>?=?|==?|&[&=]?|\|[|=]?|\*=?|\/=?|%=?|\^=?|[?:~])/m,
		lookbehind: true
	}
});

Prism.languages.insertBefore('java','function', {
	'annotation': {
		alias: 'punctuation',
		pattern: /(^|[^.])@\w+/,
		lookbehind: true
	}
});


/***/ }),
/* 176 */
/***/ (function(module, exports) {

Prism.languages.csharp = Prism.languages.extend('clike', {
	'keyword': /\b(abstract|as|async|await|base|bool|break|byte|case|catch|char|checked|class|const|continue|decimal|default|delegate|do|double|else|enum|event|explicit|extern|false|finally|fixed|float|for|foreach|goto|if|implicit|in|int|interface|internal|is|lock|long|namespace|new|null|object|operator|out|override|params|private|protected|public|readonly|ref|return|sbyte|sealed|short|sizeof|stackalloc|static|string|struct|switch|this|throw|true|try|typeof|uint|ulong|unchecked|unsafe|ushort|using|virtual|void|volatile|while|add|alias|ascending|async|await|descending|dynamic|from|get|global|group|into|join|let|orderby|partial|remove|select|set|value|var|where|yield)\b/,
	'string': [
		{
			pattern: /@("|')(?:\1\1|\\[\s\S]|(?!\1)[^\\])*\1/,
			greedy: true
		},
		{
			pattern: /("|')(?:\\.|(?!\1)[^\\\r\n])*?\1/,
			greedy: true
		}
	],
	'number': /\b-?(?:0x[\da-f]+|\d*\.?\d+f?)\b/i
});

Prism.languages.insertBefore('csharp', 'keyword', {
	'generic-method': {
		pattern: /[a-z0-9_]+\s*<[^>\r\n]+?>\s*(?=\()/i,
		alias: 'function',
		inside: {
			keyword: Prism.languages.csharp.keyword,
			punctuation: /[<>(),.:]/
		}
	},
	'preprocessor': {
		pattern: /(^\s*)#.*/m,
		lookbehind: true,
		alias: 'property',
		inside: {
			// highlight preprocessor directives as keywords
			'directive': {
				pattern: /(\s*#)\b(?:define|elif|else|endif|endregion|error|if|line|pragma|region|undef|warning)\b/,
				lookbehind: true,
				alias: 'keyword'
			}
		}
	}
});


/***/ }),
/* 177 */
/***/ (function(module, exports) {

Prism.languages.python = {
	'comment': {
		pattern: /(^|[^\\])#.*/,
		lookbehind: true
	},
	'triple-quoted-string': {
		pattern: /("""|''')[\s\S]+?\1/,
		greedy: true,
		alias: 'string'
	},
	'string': {
		pattern: /("|')(?:\\.|(?!\1)[^\\\r\n])*\1/,
		greedy: true
	},
	'function': {
		pattern: /((?:^|\s)def[ \t]+)[a-zA-Z_]\w*(?=\s*\()/g,
		lookbehind: true
	},
	'class-name': {
		pattern: /(\bclass\s+)\w+/i,
		lookbehind: true
	},
	'keyword': /\b(?:as|assert|async|await|break|class|continue|def|del|elif|else|except|exec|finally|for|from|global|if|import|in|is|lambda|nonlocal|pass|print|raise|return|try|while|with|yield)\b/,
	'builtin':/\b(?:__import__|abs|all|any|apply|ascii|basestring|bin|bool|buffer|bytearray|bytes|callable|chr|classmethod|cmp|coerce|compile|complex|delattr|dict|dir|divmod|enumerate|eval|execfile|file|filter|float|format|frozenset|getattr|globals|hasattr|hash|help|hex|id|input|int|intern|isinstance|issubclass|iter|len|list|locals|long|map|max|memoryview|min|next|object|oct|open|ord|pow|property|range|raw_input|reduce|reload|repr|reversed|round|set|setattr|slice|sorted|staticmethod|str|sum|super|tuple|type|unichr|unicode|vars|xrange|zip)\b/,
	'boolean': /\b(?:True|False|None)\b/,
	'number': /\b-?(?:0[bo])?(?:(?:\d|0x[\da-f])[\da-f]*\.?\d*|\.\d+)(?:e[+-]?\d+)?j?\b/i,
	'operator': /[-+%=]=?|!=|\*\*?=?|\/\/?=?|<[<=>]?|>[=>]?|[&|^~]|\b(?:or|and|not)\b/,
	'punctuation': /[{}[\];(),.:]/
};


/***/ }),
/* 178 */
/***/ (function(module, exports) {

/**
 * Original by Aaron Harun: http://aahacreative.com/2012/07/31/php-syntax-highlighting-prism/
 * Modified by Miles Johnson: http://milesj.me
 *
 * Supports the following:
 * 		- Extends clike syntax
 * 		- Support for PHP 5.3+ (namespaces, traits, generators, etc)
 * 		- Smarter constant and function matching
 *
 * Adds the following new token classes:
 * 		constant, delimiter, variable, function, package
 */

Prism.languages.php = Prism.languages.extend('clike', {
	'string': {
		pattern: /(["'])(?:\\[\s\S]|(?!\1)[^\\])*\1/,
		greedy: true
	},
	'keyword': /\b(?:and|or|xor|array|as|break|case|cfunction|class|const|continue|declare|default|die|do|else|elseif|enddeclare|endfor|endforeach|endif|endswitch|endwhile|extends|for|foreach|function|include|include_once|global|if|new|return|static|switch|use|require|require_once|var|while|abstract|interface|public|implements|private|protected|parent|throw|null|echo|print|trait|namespace|final|yield|goto|instanceof|finally|try|catch)\b/i,
	'constant': /\b[A-Z0-9_]{2,}\b/,
	'comment': {
		pattern: /(^|[^\\])(?:\/\*[\s\S]*?\*\/|\/\/.*)/,
		lookbehind: true
	}
});

// Shell-like comments are matched after strings, because they are less
// common than strings containing hashes...
Prism.languages.insertBefore('php', 'class-name', {
	'shell-comment': {
		pattern: /(^|[^\\])#.*/,
		lookbehind: true,
		alias: 'comment'
	}
});

Prism.languages.insertBefore('php', 'keyword', {
	'delimiter': {
		pattern: /\?>|<\?(?:php|=)?/i,
		alias: 'important'
	},
	'variable': /\$\w+\b/i,
	'package': {
		pattern: /(\\|namespace\s+|use\s+)[\w\\]+/,
		lookbehind: true,
		inside: {
			punctuation: /\\/
		}
	}
});

// Must be defined after the function pattern
Prism.languages.insertBefore('php', 'operator', {
	'property': {
		pattern: /(->)[\w]+/,
		lookbehind: true
	}
});

// Add HTML support if the markup language exists
if (Prism.languages.markup) {

	// Tokenize all inline PHP blocks that are wrapped in <?php ?>
	// This allows for easy PHP + markup highlighting
	Prism.hooks.add('before-highlight', function(env) {
		if (env.language !== 'php' || !/(?:<\?php|<\?)/ig.test(env.code)) {
			return;
		}

		env.tokenStack = [];

		env.backupCode = env.code;
		env.code = env.code.replace(/(?:<\?php|<\?)[\s\S]*?(?:\?>|$)/ig, function(match) {
			var i = env.tokenStack.length;
			// Check for existing strings
			while (env.backupCode.indexOf('___PHP' + i + '___') !== -1)
				++i;

			// Create a sparse array
			env.tokenStack[i] = match;

			return '___PHP' + i + '___';
		});

		// Switch the grammar to markup
		env.grammar = Prism.languages.markup;
	});

	// Restore env.code for other plugins (e.g. line-numbers)
	Prism.hooks.add('before-insert', function(env) {
		if (env.language === 'php' && env.backupCode) {
			env.code = env.backupCode;
			delete env.backupCode;
		}
	});

	// Re-insert the tokens after highlighting
	Prism.hooks.add('after-highlight', function(env) {
		if (env.language !== 'php' || !env.tokenStack) {
			return;
		}

		// Switch the grammar back
		env.grammar = Prism.languages.php;

		for (var i = 0, keys = Object.keys(env.tokenStack); i < keys.length; ++i) {
			var k = keys[i];
			var t = env.tokenStack[k];

			// The replace prevents $$, $&, $`, $', $n, $nn from being interpreted as special patterns
			env.highlightedCode = env.highlightedCode.replace('___PHP' + k + '___',
					"<span class=\"token php language-php\">" +
					Prism.highlight(t, env.grammar, 'php').replace(/\$/g, '$$$$') +
					"</span>");
		}

		env.element.innerHTML = env.highlightedCode;
	});
}


/***/ }),
/* 179 */
/***/ (function(module, exports) {

Prism.languages.typescript = Prism.languages.extend('javascript', {
	// From JavaScript Prism keyword list and TypeScript language spec: https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#221-reserved-words
	'keyword': /\b(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|var|void|while|with|yield|false|true|module|declare|constructor|namespace|abstract|require|type)\b/,
	'builtin': /\b(?:string|Function|any|number|boolean|Array|symbol|console)\b/,
});

Prism.languages.ts = Prism.languages.typescript;

/***/ }),
/* 180 */
/***/ (function(module, exports) {

/**
 * Original by Samuel Flores
 *
 * Adds the following new token classes:
 * 		constant, builtin, variable, symbol, regex
 */
(function(Prism) {
	Prism.languages.ruby = Prism.languages.extend('clike', {
		'comment': [
			/#(?!\{[^\r\n]*?\}).*/,
			/^=begin(?:\r?\n|\r)(?:.*(?:\r?\n|\r))*?=end/m
		],
		'keyword': /\b(?:alias|and|BEGIN|begin|break|case|class|def|define_method|defined|do|each|else|elsif|END|end|ensure|false|for|if|in|module|new|next|nil|not|or|raise|redo|require|rescue|retry|return|self|super|then|throw|true|undef|unless|until|when|while|yield)\b/
	});

	var interpolation = {
		pattern: /#\{[^}]+\}/,
		inside: {
			'delimiter': {
				pattern: /^#\{|\}$/,
				alias: 'tag'
			},
			rest: Prism.util.clone(Prism.languages.ruby)
		}
	};

	Prism.languages.insertBefore('ruby', 'keyword', {
		'regex': [
			{
				pattern: /%r([^a-zA-Z0-9\s{(\[<])(?:(?!\1)[^\\]|\\[\s\S])*\1[gim]{0,3}/,
				greedy: true,
				inside: {
					'interpolation': interpolation
				}
			},
			{
				pattern: /%r\((?:[^()\\]|\\[\s\S])*\)[gim]{0,3}/,
				greedy: true,
				inside: {
					'interpolation': interpolation
				}
			},
			{
				// Here we need to specifically allow interpolation
				pattern: /%r\{(?:[^#{}\\]|#(?:\{[^}]+\})?|\\[\s\S])*\}[gim]{0,3}/,
				greedy: true,
				inside: {
					'interpolation': interpolation
				}
			},
			{
				pattern: /%r\[(?:[^\[\]\\]|\\[\s\S])*\][gim]{0,3}/,
				greedy: true,
				inside: {
					'interpolation': interpolation
				}
			},
			{
				pattern: /%r<(?:[^<>\\]|\\[\s\S])*>[gim]{0,3}/,
				greedy: true,
				inside: {
					'interpolation': interpolation
				}
			},
			{
				pattern: /(^|[^/])\/(?!\/)(\[.+?]|\\.|[^/\\\r\n])+\/[gim]{0,3}(?=\s*($|[\r\n,.;})]))/,
				lookbehind: true,
				greedy: true
			}
		],
		'variable': /[@$]+[a-zA-Z_]\w*(?:[?!]|\b)/,
		'symbol': /:[a-zA-Z_]\w*(?:[?!]|\b)/
	});

	Prism.languages.insertBefore('ruby', 'number', {
		'builtin': /\b(?:Array|Bignum|Binding|Class|Continuation|Dir|Exception|FalseClass|File|Stat|Fixnum|Float|Hash|Integer|IO|MatchData|Method|Module|NilClass|Numeric|Object|Proc|Range|Regexp|String|Struct|TMS|Symbol|ThreadGroup|Thread|Time|TrueClass)\b/,
		'constant': /\b[A-Z]\w*(?:[?!]|\b)/
	});

	Prism.languages.ruby.string = [
		{
			pattern: /%[qQiIwWxs]?([^a-zA-Z0-9\s{(\[<])(?:(?!\1)[^\\]|\\[\s\S])*\1/,
			greedy: true,
			inside: {
				'interpolation': interpolation
			}
		},
		{
			pattern: /%[qQiIwWxs]?\((?:[^()\\]|\\[\s\S])*\)/,
			greedy: true,
			inside: {
				'interpolation': interpolation
			}
		},
		{
			// Here we need to specifically allow interpolation
			pattern: /%[qQiIwWxs]?\{(?:[^#{}\\]|#(?:\{[^}]+\})?|\\[\s\S])*\}/,
			greedy: true,
			inside: {
				'interpolation': interpolation
			}
		},
		{
			pattern: /%[qQiIwWxs]?\[(?:[^\[\]\\]|\\[\s\S])*\]/,
			greedy: true,
			inside: {
				'interpolation': interpolation
			}
		},
		{
			pattern: /%[qQiIwWxs]?<(?:[^<>\\]|\\[\s\S])*>/,
			greedy: true,
			inside: {
				'interpolation': interpolation
			}
		},
		{
			pattern: /("|')(?:#\{[^}]+\}|\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
			greedy: true,
			inside: {
				'interpolation': interpolation
			}
		}
	];
}(Prism));

/***/ }),
/* 181 */
/***/ (function(module, exports) {

// issues: nested multiline comments
Prism.languages.swift = Prism.languages.extend('clike', {
	'string': {
		pattern: /("|')(\\(?:\((?:[^()]|\([^)]+\))+\)|\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
		greedy: true,
		inside: {
			'interpolation': {
				pattern: /\\\((?:[^()]|\([^)]+\))+\)/,
				inside: {
					delimiter: {
						pattern: /^\\\(|\)$/,
						alias: 'variable'
					}
					// See rest below
				}
			}
		}
	},
	'keyword': /\b(?:as|associativity|break|case|catch|class|continue|convenience|default|defer|deinit|didSet|do|dynamic(?:Type)?|else|enum|extension|fallthrough|final|for|func|get|guard|if|import|in|infix|init|inout|internal|is|lazy|left|let|mutating|new|none|nonmutating|operator|optional|override|postfix|precedence|prefix|private|Protocol|public|repeat|required|rethrows|return|right|safe|self|Self|set|static|struct|subscript|super|switch|throws?|try|Type|typealias|unowned|unsafe|var|weak|where|while|willSet|__(?:COLUMN__|FILE__|FUNCTION__|LINE__))\b/,
	'number': /\b(?:[\d_]+(?:\.[\de_]+)?|0x[a-f0-9_]+(?:\.[a-f0-9p_]+)?|0b[01_]+|0o[0-7_]+)\b/i,
	'constant': /\b(?:nil|[A-Z_]{2,}|k[A-Z][A-Za-z_]+)\b/,
	'atrule': /@\b(?:IB(?:Outlet|Designable|Action|Inspectable)|class_protocol|exported|noreturn|NS(?:Copying|Managed)|objc|UIApplicationMain|auto_closure)\b/,
	'builtin': /\b(?:[A-Z]\S+|abs|advance|alignof(?:Value)?|assert|contains|count(?:Elements)?|debugPrint(?:ln)?|distance|drop(?:First|Last)|dump|enumerate|equal|filter|find|first|getVaList|indices|isEmpty|join|last|lexicographicalCompare|map|max(?:Element)?|min(?:Element)?|numericCast|overlaps|partition|print(?:ln)?|reduce|reflect|reverse|sizeof(?:Value)?|sort(?:ed)?|split|startsWith|stride(?:of(?:Value)?)?|suffix|swap|toDebugString|toString|transcode|underestimateCount|unsafeBitCast|with(?:ExtendedLifetime|Unsafe(?:MutablePointers?|Pointers?)|VaList))\b/
});
Prism.languages.swift['string'].inside['interpolation'].inside.rest = Prism.util.clone(Prism.languages.swift);

/***/ }),
/* 182 */
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
/* 183 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "container" }, [
    _c("pre", { class: "language-" + _vm.language }, [
      _c("code", { domProps: { innerHTML: _vm._s(_vm.highlightedCode) } })
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
/* 184 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("aside", [
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
    )
  ])
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
/* 185 */
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
/* 186 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(187)
/* template */
var __vue_template__ = __webpack_require__(214)
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
/* 187 */
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
    metadataEditor: __webpack_require__(18),
    bodyEditor: __webpack_require__(19)
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
/* 189 */
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
/* 190 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(191);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(3)("427a0c64", content, false, {});
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
/* 191 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)(false);
// imports


// module
exports.push([module.i, "\n.textarea[data-v-8aa2d09e] {\n  min-height: 70vh;\n}\n", ""]);

// exports


/***/ }),
/* 192 */
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
    imageSelector: __webpack_require__(193)
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
/* 193 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(194)
}
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(196)
/* template */
var __vue_template__ = __webpack_require__(212)
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
/* 194 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(195);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(3)("d2a5230a", content, false, {});
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
/* 195 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)(false);
// imports


// module
exports.push([module.i, "\n.section.box.is-light[data-v-6f54bd68] {\n  margin-top: 1em;\n  margin-bottom: 1em;\n  background-color: #f5f5f5;\n  -webkit-animation-duration: 1.25s;\n          animation-duration: 1.25s;\n  -webkit-animation-fill-mode: both;\n          animation-fill-mode: both;\n  -webkit-animation-name: slideInDown;\n          animation-name: slideInDown;\n}\n", ""]);

// exports


/***/ }),
/* 196 */
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
    imageTicker: __webpack_require__(197),
    imageSelectorUploader: __webpack_require__(207)
  },
  methods: {
    imageSelected: function imageSelected(ticker, image) {
      this.$emit("image-selected", this, image);
    }
  }
});

/***/ }),
/* 197 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(198)
}
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(200)
/* template */
var __vue_template__ = __webpack_require__(206)
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
/* 198 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(199);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(3)("6ed474d5", content, false, {});
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
/* 199 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)(false);
// imports


// module
exports.push([module.i, "\n.ticker[data-v-3ce88f53] {\n  overflow-x: scroll;\n  -webkit-overflow-scrolling: touch;\n}\n", ""]);

// exports


/***/ }),
/* 200 */
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
    imageTickerImage: __webpack_require__(201)
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
/* 201 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(202)
}
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(204)
/* template */
var __vue_template__ = __webpack_require__(205)
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
/* 202 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(203);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(3)("07793596", content, false, {});
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
/* 203 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)(false);
// imports


// module
exports.push([module.i, "\n.card[data-v-50ab853e] {\n  cursor: pointer;\n  -webkit-transition: border 0.2s ease-in;\n  transition: border 0.2s ease-in;\n}\n.card[selected][data-v-50ab853e] {\n  border: 3px solid hsl(171, 100%, 41%);\n}\n.display-press[data-v-50ab853e] {\n  -webkit-animation: pop-data-v-50ab853e 0.3s ease-out;\n          animation: pop-data-v-50ab853e 0.3s ease-out;\n}\n@-webkit-keyframes pop-data-v-50ab853e {\nfrom {\n    -webkit-transform: scale3d(1, 1, 1) translate3d(0, 0, 0);\n            transform: scale3d(1, 1, 1) translate3d(0, 0, 0);\n    -webkit-filter: brightness(100%);\n            filter: brightness(100%);\n}\n50% {\n    -webkit-transform: scale3d(1.05, 1.05, 1.05) translate3d(0, -5%, 0);\n            transform: scale3d(1.05, 1.05, 1.05) translate3d(0, -5%, 0);\n    -webkit-filter: brightness(75%);\n            filter: brightness(75%);\n}\nto {\n    -webkit-transform: scale3d(1, 1, 1) translate3d(0, 0, 0);\n            transform: scale3d(1, 1, 1) translate3d(0, 0, 0);\n    -webkit-filter: brightness(100%);\n            filter: brightness(100%);\n}\n}\n@keyframes pop-data-v-50ab853e {\nfrom {\n    -webkit-transform: scale3d(1, 1, 1) translate3d(0, 0, 0);\n            transform: scale3d(1, 1, 1) translate3d(0, 0, 0);\n    -webkit-filter: brightness(100%);\n            filter: brightness(100%);\n}\n50% {\n    -webkit-transform: scale3d(1.05, 1.05, 1.05) translate3d(0, -5%, 0);\n            transform: scale3d(1.05, 1.05, 1.05) translate3d(0, -5%, 0);\n    -webkit-filter: brightness(75%);\n            filter: brightness(75%);\n}\nto {\n    -webkit-transform: scale3d(1, 1, 1) translate3d(0, 0, 0);\n            transform: scale3d(1, 1, 1) translate3d(0, 0, 0);\n    -webkit-filter: brightness(100%);\n            filter: brightness(100%);\n}\n}\n", ""]);

// exports


/***/ }),
/* 204 */
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
/* 205 */
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
/* 206 */
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
/* 207 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(208)
}
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(210)
/* template */
var __vue_template__ = __webpack_require__(211)
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
/* 208 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(209);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(3)("7c434f34", content, false, {});
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
/* 209 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)(false);
// imports


// module
exports.push([module.i, "\n.active-dropzone {\n  border: 5px hsl(171, 100%, 41%) dashed !important;\n  padding: 43px 19px;\n}\n.active-dropzone img {\n  -webkit-filter: blur(4px);\n          filter: blur(4px);\n}\n.active-dropzone .is-dark {\n  -webkit-transition: -webkit-transform 0.2s;\n  transition: -webkit-transform 0.2s;\n  transition: transform 0.2s;\n  transition: transform 0.2s, -webkit-transform 0.2s;\n  -webkit-transform: scale3d(1.1, 1.1, 1.1);\n          transform: scale3d(1.1, 1.1, 1.1);\n}\n", ""]);

// exports


/***/ }),
/* 210 */
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
/* 211 */
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
/* 212 */
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
/* 213 */
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
/* 214 */
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
/* 215 */
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
//
//
//
//
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
    metadataEditor: __webpack_require__(18),
    bodyEditor: __webpack_require__(19)
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
/* 217 */
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
/* 218 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ })
],[20]);