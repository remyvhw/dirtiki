<template>
    <article>
        <loading-indicator v-if="loading"></loading-indicator>

        <div v-else>
            <folding-panel :deployed="activePanel === 'metadata'" title="Settings" ref="metadata" @toggle="toggleFolding">
                <metadata-editor @input="reloadWithUpdatedMetadata" :page="page"></metadata-editor>
            </folding-panel>

            <folding-panel :deployed="activePanel === 'geo'" title="Geo" ref="geo" @toggle="toggleFolding">
                Hello, geo!
            </folding-panel>

            <folding-panel :deployed="activePanel === 'body'" title="Body" ref="body" @toggle="toggleFolding">
                Hello, body!
            </folding-panel>
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
      page: null,
      activePanel: "body"
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
    },
    reloadWithUpdatedMetadata(component) {
      document.location.href = "/pages/" + component.editedPageCopy.data.slug;
    },

    toggleFolding(component) {
      if (component === this.$refs.metadata) {
        this.activePanel = "metadata";
      } else if (component === this.$refs.geo) {
        this.activePanel = "geo";
      } else if (component === this.$refs.body) {
        this.activePanel = "body";
      }
    }
  }
};
</script>
