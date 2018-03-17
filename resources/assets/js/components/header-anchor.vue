<style scoped>
small {
  color: hsl(217, 71%, 53%);
  font-size: 0.8em;
}
small i {
  position: relative;
  top: -1em;
  font-size: 0.8em;
}
</style>
<script type="text/babel">
export default {
  props: {
    level: { Type: Number, Required: true }
  },
  data() {
    return {
      showHelper: false,
      showLink: false
    };
  },
  computed: {
    anchor() {
      return this.$slots.default[0].text.toLowerCase().replace(/[^\w]+/g, "-");
    },
    linkUrl() {
      return (
        document.location.href.substr(0, document.location.href.indexOf("#")) +
        "#" +
        this.anchor
      );
    }
  },
  mounted() {
    if (!this.$store.state.parsed.headers[this.anchor]) {
      this.$store.commit({
        type: "setParsedHeader",
        key: this.anchor,
        header: {
          title: this.$slots.default[0].text,
          level: this.level,
          link: this.linkUrl
        }
      });
    }
  },
  destroyed() {
    this.$store.unsetParsedHeader(this.anchor);
  },
  render(createElement) {
    var self = this;

    const anchorA = createElement("a", {
      domProps: {
        name: this.anchor,
        href: "#" + this.anchor
      }
    });

    const helperSmall = createElement("small", [
      createElement("i", { class: ["fas", "fa-link"] })
    ]);

    let mainSpanChildren = [this.$slots.default];
    if (this.showHelper && !this.showLink) mainSpanChildren.push(helperSmall);

    const mainSpan = createElement(
      "span",
      {
        on: {
          mouseover: () => {
            self.showHelper = true;
          },
          mouseleave: () => {
            self.showHelper = false;
          },
          click: e => {
            self.showLink = true;
          }
        }
      },
      mainSpanChildren
    );

    const linkSpan = createElement("span", [
      createElement("br"),
      createElement("small", [self.linkUrl])
    ]);

    let headerChildren = [anchorA, mainSpan];
    if (this.showLink) headerChildren.push(linkSpan);
    return createElement("h" + this.level, headerChildren);
  }
};
</script>
