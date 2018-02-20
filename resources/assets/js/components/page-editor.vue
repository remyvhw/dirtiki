<template>
    <article>
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
      page: null
    };
  },
  mounted() {
    this.loadPage();
  },
  methods: {
    loadPage() {
      this.$http.get("/api/pages/" + this.pageSlug).then(function({ data }) {
        console.log(data);
      });
    }
  }
};
</script>
