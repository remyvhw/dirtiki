<template>
  <div class="diff">
    <history-metadata :diff="diff"></history-metadata>

    <div class="tabs is-small is-centered is-toggle is-toggle-rounded">
      <ul>
        <li v-for="presentation in availablePresentations" :key="presentation.type" :class="{'is-active': presentation.type === selectedPresentation}">
          <a @click="selectedPresentation = presentation.type">
            <span>{{ presentation.label }}</span>
          </a>
        </li>
      </ul>
    </div>

    <diff-highlighter v-if="selectedPresentation === 'diff'" :before="diff.data.changes.before.content" :after="diff.data.changes.after.content" :diff="diff.data.changes.diff"></diff-highlighter>

    <div v-if="selectedPresentation === 'raw'" class="columns">
      <div class="column is-half">
        <pre v-if="diff.data.changes.before.content">
          {{ diff.data.changes.before.content }}
        </pre>
        <div class="has-text-centered" v-else>
          &mdash;
          <em>Empty</em> &mdash;
        </div>
      </div>
      <div class="column is-half">
        <pre>
          {{ diff.data.changes.after.content }}
        </pre>
      </div>
    </div>
  </div>

</template>
<script type="text/babel">
export default {
  components: {
    historyMetadata: require("./history-metadata.vue"),
    diffHighlighter: require("./diff-highlighter.vue")
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
      selectedPresentation: "diff",
      availablePresentations: [
        {
          type: "diff",
          label: "Diff"
        },
        {
          type: "raw",
          label: "Raw"
        }
      ]
    };
  },
  methods: {}
};
</script>
