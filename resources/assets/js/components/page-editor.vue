<template>
    <article>
        <h1 v-if="page" class="title">{{ page.name }}</h1>
        <loading-indicator></loading-indicator>
    </article>
</template>

<script type="text/babel">
export default {
  props: {
    pageSlug: { Type: String, Required: true }
  },
  data() {
    return {
      page: null,
      body: null,
      images: null
    };
  },
  mounted() {
    this.loadPage();
  },
  methods: {
    loadPage() {
      this.$http.get("/api/pages/" + this.pageSlug).then(({ data }) => {
        this.page = data.data;
        this.body = data.relationships.body.data;
        this.images = data.relationships.images;
      });
    }
  }
};
</script>
