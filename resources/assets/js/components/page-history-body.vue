<style scoped>
.diffs > .diff {
  padding: 1em 0 1em 0;
}
.diffs > .diff:first-child {
  padding: 0 0 1em 0;
}
.diffs > :last-child {
  padding: 1em 0 0 0;
}
.diffs > .diff:not(:last-child) {
  border-bottom: 2px solid hsl(0, 0%, 96%);
}
</style>
<style>
.diff-regular {
  border-left: 0.5em solid hsl(0, 0%, 96%);
}
.diff-original {
  text-decoration-line: line-through;
  text-decoration-color: red;
  border-left: 0.5em solid hsl(348, 100%, 61%);
}
.diff-new {
  border-left: 0.5em solid hsl(141, 71%, 48%);
}
.diff-updated {
  border-left: 0.5em solid hsl(48, 100%, 67%);
}
.diff-fragment-added {
  color: hsl(141, 71%, 48%);
}
.diff-fragment-added {
  color: hsl(141, 71%, 48%);
}
.diff-fragment-removed {
  text-decoration-line: line-through;
  text-decoration-color: red;
  color: hsl(348, 100%, 61%);
}
</style>
<template>
  <div style="width:100%">
    <loading-indicator :size="2" v-if="loading"></loading-indicator>
    <div class="diffs" else>
      <page-history-body-diff v-for="diff in data.data" :key="diff.key" :diff="diff"></page-history-body-diff>
      <basic-paginator v-if="data.links" :links="data.links" :meta="data.meta" @select="handlePaginationSelect"></basic-paginator>
    </div>
  </div>

</template>
<script type="text/babel">
export default {
  components: {
    pageHistoryBodyDiff: require("./page-history-body-diff.vue")
  },
  props: {
    pageSlug: { Type: String, Required: true }
  },
  data() {
    return {
      loading: false,
      data: { data: null }
    };
  },
  mounted() {
    this.loadHistory("/api/pages/" + this.pageSlug + "/body/history");
  },
  methods: {
    handlePaginationSelect(url) {
      this.loadHistory(url);
    },
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
