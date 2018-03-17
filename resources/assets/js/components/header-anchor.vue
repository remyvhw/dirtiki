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
  components: {
    tocBox: require("./toc-box.vue")
  },
  props: {
    level: { Type: Number, Required: true }
  },
  data() {
    return {
      showHelper: false,
      showLink: false,
      isFirst: null
    };
  },
  computed: {
    anchor() {
      return this.$slots.default[0].text.toLowerCase().replace(/[^\w]+/g, "-");
    },
    safeAnchor() {
      return this.anchor + "-" + this._uid;
    },
    safeLinkUrl() {
      return (
        document.location.href.substr(0, document.location.href.indexOf("#")) +
        "#" +
        this.safeAnchor
      );
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
    this.isFirst = !Object.keys(this.$store.state.parsed.headers).length;

    if (!this.$store.state.parsed.headers[this.anchor]) {
      this.$store.commit({
        type: "setParsedHeader",
        key: this.safeAnchor,
        header: {
          title: this.$slots.default[0].text,
          level: this.level,
          link: this.safeLinkUrl,
          chaining: Object.keys(this.$store.state.parsed.headers).length
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

    const safeAnchorA = createElement("a", {
      domProps: {
        name: this.safeAnchor,
        href: "#" + this.safeAnchor
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

    let headingContent = [anchorA, safeAnchorA, mainSpan];
    if (this.showLink) headerChildren.push(linkSpan);

    let toc;
    if (this.isFirst) {
      toc = createElement("toc-box");
    }

    let header = createElement("h" + this.level, headingContent);

    return createElement("div", this.isFirst ? [toc, header] : [header]);
  }
};
</script>
