<style>

</style>
<template>
  <article>
    <div class="section">
      <div class=" container ">
        <h1 v-if="page" class="title">{{ page.name }}</h1>
      </div>
    </div>
    <markdown-renderer v-model="$slots.default[0].text"></markdown-renderer>
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
