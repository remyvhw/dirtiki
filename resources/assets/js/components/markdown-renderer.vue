
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
      template:
        "<article><div class='container content'>" +
        template +
        "</div></article>",
      components: {
        headerAnchor: require("./header-anchor.vue"),
        codePresenter: require("./code-presenter.vue")
      }
    });

    return createElement("div", {}, [createElement(component)]);
  }
};
</script>
