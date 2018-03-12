<template>
    <div class="diff">
        <history-metadata :diff="diff"></history-metadata>
        <pre></pre>
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
  computed: {},
  data() {
    return {};
  },
  methods: {
    computeDiff() {}
  }
};
</script>
