<template>
    <div class="section">
        <section class="container">
            <folding-panel :deployed="activePanel === 'settings'" title="Settings" ref="settings" @toggle="toggleFolding">
                <page-history-settings :page-slug="pageSlug"></page-history-settings>
            </folding-panel>
            <folding-panel :deployed="activePanel === 'body'" title="Body" ref="body" @toggle="toggleFolding">
                <page-history-body :page-slug="pageSlug"></page-history-body>
            </folding-panel>
        </section>
    </div>

</template>
<script type="text/babel">
export default {
  components: {
    pageHistorySettings: require("./page-history-settings.vue"),
    pageHistoryBody: require("./page-history-body.vue")
  },
  props: {
    pageSlug: { Type: String, Required: true }
  },
  data() {
    return {
      activePanel: "settings"
    };
  },
  mounted() {},
  methods: {
    toggleFolding(component) {
      if (component === this.$refs.settings) {
        this.activePanel = "settings";
      } else if (component === this.$refs.body) {
        this.activePanel = "body";
      }
    }
  }
};
</script>
