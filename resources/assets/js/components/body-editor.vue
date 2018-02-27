<style scoped>
.textarea {
  min-height: 70vh;
}
</style>
<template>
  <div class="control">
    <textarea class="textarea" v-if="editedBodyCopy" v-model="editedBodyCopy.data.content" ref="textarea"></textarea>

    <image-selector @image-selected="imageSelected"></image-selector>

    <div class="field">
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
    body: { Type: Object, Required: true }
  },
  data() {
    return {
      saving: false,
      editedBodyCopy: null
    };
  },
  mounted() {
    this.editedBodyCopy = this.body;
  },
  methods: {
    saveBody() {
      this.saving = true;
      this.$http
        .put(this.body.links.self, this.editedBodyCopy)
        .then(({ data }) => {
          this.editedBodyCopy = data;
          this.saving = false;
          this.$emit("input", this);
        });
    },
    insertTextAtCursorPosition(text) {
      const startPosition = this.$refs.textarea.selectionStart;
      const endPosition = this.$refs.textarea.selectionEnd;
      this.editedBodyCopy.data.content =
        this.editedBodyCopy.data.content.substring(0, startPosition) +
        text +
        this.editedBodyCopy.data.content.substring(
          endPosition,
          this.editedBodyCopy.data.content.length
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

      const altText = prompt("Alternative text").replace(/\[|\]/g, "");
      if (altText === null || altText === false) {
        // user canceled
        return;
      }
      const template = "\n![" + altText + "](" + imageVariation.url + ")\n";
      this.insertTextAtCursorPosition(template);
    }
  }
};
</script>
