<template>
    <div>
        <loading-indicator :size="2" v-if="loading"></loading-indicator>
        <div else>
            <page-history-metadata-diff v-for="diff in data.data" :key="diff.key" :diff="diff"></page-history-metadata-diff>
        </div>
    </div>

</template>
<script type="text/babel">
export default {
  components: {
    pageHistoryMetadataDiff: require("./page-history-metadata-diff.vue")
  },
  props: {
    pageSlug: { Type: String, Required: true }
  },
  data() {
    return {
      loading: false,
      data: null
    };
  },
  mounted() {
    this.loadHistory("/api/pages/" + this.pageSlug + "/history");
  },
  methods: {
    loadHistory(url) {
      this.loading = true;
      this.$http.get(url).then(({ data }) => {
        this.data = data;
        this.loading = false;
      });
    }
  }
};
</script>
