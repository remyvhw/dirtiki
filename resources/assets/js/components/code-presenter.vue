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
      <div v-if="availablePresentations.length > 1" class="tabs is-small is-centered is-toggle is-toggle-rounded">
        <ul>
          <li v-for="presentation in availablePresentations" :key="presentation.type" :class="{'is-active': presentation.type === selectedType}">
            <a @click="selectedType = presentation.type">
              <span>{{ presentation.label }}</span>
            </a>
          </li>
        </ul>
      </div>

      <code-highlighter v-if="selectedType === 'highlighted'" :language="language" @error="allowHighlights=false">{{ code }}</code-highlighter>
      <div v-if="selectedType === 'raw'" class="container">
        <pre><code>{{ rawCode }}</code></pre>
      </div>
    </section>

    <geojson-renderer v-if="selectedType === 'map'" @error="allowMaps=false">{{ code }}</geojson-renderer>
  </aside>
</template>
<script type="text/babel">
export default {
  components: {
    codeHighlighter: require("./code-highlighter.vue"),
    geojsonRenderer: require("./geojson-renderer.vue")
  },
  props: {
    language: { type: String, required: false }
  },
  data() {
    return {
      allowHighlights: true,
      allowMaps: true,
      selectedType: null
    };
  },
  watch: {
    "$store.state.maps.provider": function() {
      this.selectDefaultPresentationType();
    }
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
      let presentations = [];

      if (
        this.allowMaps &&
        this.language === "geojson" &&
        this.$store.state.maps.provider
      ) {
        presentations.push({
          type: "map",
          label: "Map"
        });
      }

      if (this.allowHighlights) {
        presentations.push({
          type: "highlighted",
          label: "Highlighted"
        });
      }

      presentations.push({
        type: "raw",
        label: "Raw"
      });

      return presentations;
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.selectDefaultPresentationType();
    });
  },
  methods: {
    selectDefaultPresentationType() {
      this.selectedType = this.availablePresentations[0].type;
    }
  }
};
</script>