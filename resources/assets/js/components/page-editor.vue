<template>
    <article>
        <loading-indicator v-if="loading"></loading-indicator>
        <h1 v-if="page" class="title">{{ page.name }}</h1>

    </article>
</template>

<script type="text/babel">
export default {
  props: {
    pageSlug: { Type: String, Required: true }
  },
  data() {
    return {
      loading: false,
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
      this.loading = true;
      this.$http.get("/api/pages/" + this.pageSlug).then(({ data }) => {
        this.page = data.data;
        this.body = data.relationships.body.data;
        this.images = data.relationships.images;
        this.loading = false;
      });
    }
  }
};
</script>
