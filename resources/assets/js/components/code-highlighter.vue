<template>
    <pre class="language-javascript"><code v-html="highlightedCode"></code></pre>
</template>
<script type="text/babel">
var Prism = require("prismjs");

const prismLanguages = {
  html: Prism.languages.html,
  css: Prism.languages.css,
  clike: Prism.languages.clike,
  javascript: Prism.languages.javascript
};

export default {
  props: {
    language: { type: String, required: false }
  },
  computed: {
    highlightedCode() {
      if (!this.$slots.default[0].text) {
        return "";
      }

      if (prismLanguages[this.language]) {
        return this.renderPrismHtml();
      }
      return this.$slots.default[0].text;
    }
  },
  methods: {
    renderPrismHtml() {
      return Prism.highlight(
        unescape(this.$slots.default[0].text),
        Prism.languages.html
      );
    }
  }
};
</script>
