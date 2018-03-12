<template>
    <div class="diff">
        <history-metadata :diff="diff"></history-metadata>
        <button @click="computeDiff">Generate</button>
        <pre v-if="computedDiff" v-html="computedDiff"></pre>
    </div>

</template>
<script type="text/babel">
var jsDiff = require("diff");

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
    return {
      computedDiff: null
    };
  },
  methods: {
    computeDiff() {
      let diff = jsDiff.diffWordsWithSpace(
        this.diff.data.changes.before.content,
        this.diff.data.changes.after.content
      );

      let fragment = document.createDocumentFragment(),
        color = "",
        span = null;

      diff.forEach(function(part) {
        color = part.added ? "green" : part.removed ? "red" : "grey";
        span = document.createElement("span");
        span.style.color = color;
        span.appendChild(document.createTextNode(part.value));
        fragment.appendChild(span);
      });

      let container = document.createElement("pre");
      container.appendChild(fragment);
      debugger;
      this.computedDiff = container.innerHTML;
    }
  }
};
</script>
