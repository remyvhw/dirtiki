<template>
    <article>

        <div class="columns">
            <div class="column">
                <h3 class="title is-3">Page Settings</h3>
                <metadata-editor :can-save="false" v-model="value"></metadata-editor>
            </div>
        </div>

        <div class="columns">
            <div class="column">
                <h3 class="title is-3">Content</h3>
                <body-editor :can-save="false" v-model="value.relationships.body"></body-editor>
            </div>
        </div>

        <div class="columns">
            <div class="column">
                <button @click="savePage" :class="{'is-loading':saving}" class="button is-primary is-fullwidth">
                    Save
                </button>
            </div>
        </div>
    </article>
</template>

<script type="text/babel">
export default {
  components: {
    metadataEditor: require("./metadata-editor.vue"),
    bodyEditor: require("./body-editor.vue")
  },
  props: {
    canSave: { type: Boolean, default: true }
  },
  data() {
    return {
      saving: false,
      value: {
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
    },

    savePage() {
      if (!this.validate()) return;
      this.saving = true;
      this.$http.post("/api/pages", this.value).then(({ data }) => {
        this.value = data;
        this.saving = false;
        this.emitInput();
        this.$emit("save", this.value);
        if (this.canSave) {
          document.location.href = "/pages/" + data.data.slug;
        }
      });
    },

    emitInput() {
      this.$emit("input", this.value);
    }
  }
};
</script>
