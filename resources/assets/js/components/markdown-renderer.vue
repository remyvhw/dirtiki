
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
        "<article><section class='section'><div class='container content'>" +
        template +
        "</div></section></article>",
      components: {
        headerAnchor: require("./header-anchor.vue"),
        codePresenter: require("./code-presenter.vue"),
        imagePresenter: require("./image-presenter.vue")
      }
    });

    return createElement("div", {}, [createElement(component)]);
  }
};
</script>
