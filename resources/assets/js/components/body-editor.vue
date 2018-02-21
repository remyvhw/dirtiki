<style scoped>
.textarea {
  min-height: 70vh;
}
</style>
<template>
    <div class="control">
        <textarea class="textarea" v-model="editedBodyCopy.data.content"></textarea>

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
