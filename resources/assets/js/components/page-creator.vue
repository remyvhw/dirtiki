<template>
    <article>

        <metadata-editor :page="page"></metadata-editor>

        <body-editor :body="page.relationships.body"></body-editor>

    </article>
</template>

<script type="text/babel">
export default {
  components: {
    metadataEditor: require("./metadata-editor.vue"),
    bodyEditor: require("./body-editor.vue")
  },
  props: {},
  data() {
    return {
      page: null
    };
  },
  mounted() {},
  methods: {}
};
</script>
