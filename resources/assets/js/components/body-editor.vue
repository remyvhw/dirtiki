<style scoped>
.textarea {
  min-height: 70vh;
}
</style>
<template>
  <div class="control">
    <textarea class="textarea" v-if="value" v-model="value.data.content" @input="emitInput" ref="textarea"></textarea>

    <image-selector @image-selected="imageSelected"></image-selector>

    <div v-if="canSave" class="field">
      <p class="control">
        <button @click="saveBody" :class="{'is-loading':saving}" class="button is-primary is-fullwidth">
          Save
        </button>
      </p>
    </div>
  </div>
</template>

<script type="text/babel">
export default {
  components: {
    imageSelector: require("./image-selector.vue")
  },
  props: {
    value: { type: Object, required: true },
    canSave: { type: Boolean, default: true }
  },
  data() {
    return {
      saving: false
    };
  },
  methods: {
    saveBody() {
      if (!this.validate()) return;
      this.saving = true;
      this.$http.put(this.value.links.self, this.value).then(({ data }) => {
        this.value = data;
        this.saving = false;
        this.emitInput();
        this.$emit("save", this.value);
      });
    },
    insertTextAtCursorPosition(text) {
      const startPosition = this.$refs.textarea.selectionStart;
      const endPosition = this.$refs.textarea.selectionEnd;
      this.value.data.content =
        this.value.data.content.substring(0, startPosition) +
        text +
        this.value.data.content.substring(
          endPosition,
          this.value.data.content.length
        );
    },
    imageSelected(imageSelector, image) {
      const imageVariation = window
        .collect(image.variations)
        .sortByDesc(variation => {
          return (
            (variation.width ? variation.width : 1) +
            (variation.height ? variation.height : 1)
          );
        })
        .first();
      if (!imageVariation) {
        return;
      }

      const altText = prompt("Alternative text");
      if (altText === null || altText === false) {
        // user canceled
        return;
      }
      const template =
        "\n![" +
        altText.replace(/\[|\]/g, "") +
        "](" +
        imageVariation.url +
        ")\n";
      this.insertTextAtCursorPosition(template);
    },
    emitInput() {
      this.$emit("input", this.value);
    },
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
