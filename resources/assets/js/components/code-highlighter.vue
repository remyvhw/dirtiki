<template>
    <pre class="language-javascript"><code v-html="prismHtml"></code></pre>
</template>
<script type="text/babel">
var Prism = require("prismjs");

export default {
  props: {
    language: { type: String, required: false }
  },
  computed: {
    prismHtml() {
      return Prism.highlight(
        this.$slots.default[0].text,
        Prism.languages.javascript
      );
    }
  }
};
</script>
