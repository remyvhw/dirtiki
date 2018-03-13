<style scoped>
pre code>>>.token.number {
  font-size: 1em;
  background-color: inherit;
  border-radius: 0;
  height: inherit;
  margin: 0;
  padding: 0;
}
</style>
<template>
  <section class="section">
    <div class="container">
      <pre :class="'language-' + language"><code v-html="highlightedCode"></code></pre>
    </div>
  </section>
</template>
<script type="text/babel">
var Prism = require("prismjs");
require("prismjs/components/prism-sql");
require("prismjs/components/prism-json");
require("prismjs/components/prism-java");
require("prismjs/components/prism-csharp");
require("prismjs/components/prism-python");
require("prismjs/components/prism-php");
//require("prismjs/components/prism-cpp");
require("prismjs/components/prism-typescript");
require("prismjs/components/prism-ruby");
require("prismjs/components/prism-swift");
//require("prismjs/components/prism-objectivec");
var beautify = require("json-beautify");

const prismLanguages = {
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

export default {
  props: {
    language: { type: String, required: false }
  },
  computed: {
    code() {
      const code = this.$slots.default[0].text;

      if (this.language === "json") {
        try {
          return beautify(JSON.parse(unescape(code)), null, 2, 100);
        } catch (e) {}
      }
      return code;
    },

    highlightedCode() {
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
    renderPrismHtml() {
      return Prism.highlight(
        unescape(this.code),
        prismLanguages[this.language]
      );
    }
  }
};
</script>