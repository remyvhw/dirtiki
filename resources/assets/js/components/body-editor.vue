<style scoped>
.textarea {
  min-height: 70vh;
}
</style>
<template>
  <div class="control">
    <textarea class="textarea" v-if="editedBodyCopy" v-model="editedBodyCopy.data.content"></textarea>

    <image-selector></image-selector>

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
    }
  }
};
</script>
