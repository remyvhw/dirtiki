<template>
    <div class="section">
        <section class="container">
            <folding-panel :deployed="activePanel === 'metadata'" title="Settings" ref="metadata" @toggle="toggleFolding">
                <page-history-metadata :page-slug="pageSlug"></page-history-metadata>
            </folding-panel>
        </section>
    </div>

</template>
<script type="text/babel">
export default {
  components: {
    pageHistoryMetadata: require("./page-history-metadata.vue")
  },
  props: {
    pageSlug: { Type: String, Required: true }
  },
  data() {
    return {
      activePanel: "metadata"
    };
  },
  mounted() {},
  methods: {
    toggleFolding(component) {
      if (component === this.$refs.metadata) {
        this.activePanel = "metadata";
      } else if (component === this.$refs.body) {
        this.activePanel = "body";
      }
    }
  }
};
</script>
