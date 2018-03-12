<template>
    <div class="diff">
        <history-metadata :diff="diff"></history-metadata>
        <h1>Hello</h1>
    </div>

</template>
<script type="text/babel">
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
  computed: {
    diffPairs() {}
  },
  data() {
    return {};
  }
};
</script>
