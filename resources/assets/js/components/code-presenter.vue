<style scoped>
aside {
  background-color: #fafafa;
}
</style>
<template>
    <aside>
        <code-highlighter :language="language">{{ code }}</code-highlighter>
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
  computed: {
    code() {
      const code = this.$slots.default[0].text;
      return code;
    }
  },
  methods: {}
};
</script>