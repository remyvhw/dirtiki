<style scoped>
img {
  display: block;
  margin-left: auto;
  margin-right: auto;
  max-width: 75%;
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
  computed: {},
  render(createElement) {
    return createElement(
      "img",
      { attrs: { src: this.href, alt: this.alt, title: this.title } },
      []
    );
  }
};
</script>
