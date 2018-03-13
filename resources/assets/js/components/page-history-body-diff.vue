<template>
    <div class="diff">
        <history-metadata :diff="diff"></history-metadata>
        <pre v-if="diff.data && diff.data.changes.diff">{{ diff.data.changes.diff }}</pre>
    </div>

</template>
<script type="text/babel">
let diff2html = require("diff2html").Diff2Html;

export default {
  components: {
    historyMetadata: require("./history-metadata.vue")
  },
  props: {
    diff: {
      type: Object,
      required: true
    }
  },
  computed: {},
  data() {
    return {};
  },
  methods: {
    computeDiff() {}
  }
};
</script>
