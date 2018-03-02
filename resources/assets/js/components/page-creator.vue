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
  methods: {
    /**
     * Check for valid and hard validate subcomponents. Part of the validation chain.
     * @param  boolean hard If true, error messages will be displayed next to the fields.
     * @return boolean      True if valid.
     */
    validate(hard) {
      let allValid = true;
      // Check for required fields.
      window.collect(this.$children).each(child => {
        if (typeof child.validate === "function") {
          allValid = child.validate(hard) ? allValid : false;
        }
      });

      return allValid;
    }
  }
};
</script>
