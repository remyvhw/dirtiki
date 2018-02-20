<style>
.content img {
  display: block;
  margin-left: auto;
  margin-right: auto;
  max-width: 75%;
}
</style>
<template>
    <div class="columns">

        <div class="column content" v-html="content">

        </div>

    </div>
</template>

<script type="text/babel">
var marked = require("marked");
marked.setOptions({
  gfm: true,
  tables: true,
  breaks: true,
  sanitize: true
});
export default {
  props: {
    pageJson: { Type: String, Required: true }
  },
  data() {
    return {
      page: null
    };
  },
  ready() {
    this.page = JSON.parse(this.pageJson);
  },
  computed: {
    content() {
      return marked(this.$slots.default[0].text);
    }
  }
};
</script>
