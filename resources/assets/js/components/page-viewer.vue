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
      <div class="column content" v-html="content">

      </div>
    </div>
  </article>
</template>

<script type="text/babel">
export default {
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
  },
  computed: {
    content() {
      return window.marked(this.$slots.default[0].text);
    }
  }
};
</script>
