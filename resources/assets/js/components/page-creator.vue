<template>
    <article>

        <div class="section">
            <h3 class="title is-3">Page Settings</h3>
            <metadata-editor :can-save="false" v-model="page"></metadata-editor>
        </div>

        <div class="section">
            <h3 class="title is-3">Content</h3>
            <body-editor :can-save="false" v-model="page.relationships.body"></body-editor>
        </div>
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
      page: {
        data: {
          name: ""
        },
        relationships: {
          body: {
            data: {
              content: ""
            }
          }
        }
      }
    };
  },
  mounted() {},
  methods: {}
};
</script>
