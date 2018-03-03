<script type="text/babel">
export default {
  props: {
    value: { Type: String, Required: true }
  },
  methods: {
    parseMarkdown() {
      return window.marked(this.value);
    }
  },
  render: function(createElement) {
    const template = this.parseMarkdown(this.value);
    var component = Vue.component("rendered-markdown", {
      template: "<article>" + template + "</article>",
      components: {
        headerAnchor: require("./header-anchor.vue"),
        markdownHighlighter: require("./code-highlighter.vue")
      }
    });

    return createElement("div", {}, [createElement(component)]);
  }
};
</script>
