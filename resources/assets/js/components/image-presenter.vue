<style scoped>
img.centered {
  display: block;
  margin-left: auto;
  margin-right: auto;
  max-width: 75%;
}

img.lefted {
  float: left;
}

img.righted {
  float: right;
}

img.lefted,
img.righted {
  margin: 2em 2em 2em 0;
  max-width: 30vh;
}
</style>

<script type="text/babel">
export default {
  components: {},
  props: {
    href: {
      type: String,
      required: true
    },
    alt: {
      type: String
    },
    title: {
      type: String
    }
  },
  computed: {
    alignementClass() {
      const description =
        this.$slots.default[0] && this.$slots.default[0].text
          ? this.$slots.default[0].text
          : "";

      if (description.startsWith(":") && description.endsWith(":")) {
        // Todo: implement medium like full width banner
      } else if (description.startsWith(":")) {
        return "lefted";
      } else if (description.endsWith(":")) {
        return "righted";
      }
      return "centered";
    }
  },
  render(createElement) {
    return createElement(
      "img",
      {
        class: this.alignementClass,
        attrs: { src: this.href, alt: this.alt, title: this.title }
      },
      []
    );
  }
};
</script>
