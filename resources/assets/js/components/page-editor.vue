<template>
    <article>
        <loading-indicator v-if="loading"></loading-indicator>
        <div class="panel" v-else>
            <p class="panel-heading">
                repositories
            </p>
            <div class="panel-block">
                <metadata-editor :page="page"></metadata-editor>
            </div>

        </div>
    </article>
</template>

<script type="text/babel">
export default {
  components: {
    metadataEditor: require("./metadata-editor.vue")
  },
  props: {
    pageSlug: { Type: String, Required: true }
  },
  data() {
    return {
      loading: false,
      page: null
    };
  },
  mounted() {
    this.loadPage();
  },
  methods: {
    loadPage() {
      this.loading = true;
      this.$http.get("/api/pages/" + this.pageSlug).then(({ data }) => {
        this.page = data;
        this.loading = false;
      });
    }
  }
};
</script>
