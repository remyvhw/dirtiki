<style>
.content img {
  display: block;
  margin-left: auto;
  margin-right: auto;
  max-width: 75%;
}
</style>
<template>
  <article>
    <h1 v-if="page" class="title">{{ page.name }}</h1>
    <div class="columns">
      <div class="column content">
        <markdown-renderer v-model="$slots.default[0].text"></markdown-renderer>
      </div>
    </div>
  </article>
</template>

<script type="text/babel">
export default {
  components: {
    markdownRenderer: require("./markdown-renderer.vue")
  },
  props: {
    pageJson: { Type: String, Required: true }
  },
  data() {
    return {
      page: null
    };
  },
  mounted() {
    this.page = JSON.parse(this.pageJson);
  }
};
</script>
