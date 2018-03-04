<style scoped>
aside {
  background-color: #fafafa;
}

pre {
  background-color: initial;
  font-size: 1em;
  padding: 0;
}
</style>
<template>
    <aside>
        <section class="section">
            <div class="tabs is-small is-centered is-toggle is-toggle-rounded">
                <ul>
                    <li v-for="presentation in availablePresentations" :key="presentation.type" :class="{'is-active': presentation.type === selectedType}">
                        <a @click="selectedType = presentation.type">
                            <span>{{ presentation.label }}</span>
                        </a>
                    </li>
                </ul>
            </div>

            <code-highlighter v-if="selectedType === 'highlighted'" :language="language">{{ code }}</code-highlighter>
            <div v-if="selectedType === 'raw'" class="container">
                <pre><code>{{ rawCode }}</code></pre>
            </div>
        </section>
    </aside>
</template>
<script type="text/babel">
export default {
  components: {
    codeHighlighter: require("./code-highlighter.vue")
  },
  props: {
    language: { type: String, required: false }
  },
  data() {
    return {
      selectedType: null
    };
  },
  computed: {
    code() {
      const code = this.$slots.default[0].text;
      return code;
    },
    rawCode() {
      return unescape(this.code);
    },
    availablePresentations() {
      return window
        .collect([
          {
            type: "highlighted",
            label: "Highlighted"
          },
          {
            type: "raw",
            label: "Raw"
          }
        ])
        .toArray();
    }
  },
  mounted() {
    this.selectedType = this.availablePresentations[0].type;
  },
  methods: {}
};
</script>