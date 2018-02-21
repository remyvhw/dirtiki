<style scoped>

</style>
<template>
    <div>
        <textarea v-model="editedBodyCopy.data.content"></textarea>
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
        .put(this.body.links.self, this.editedPageCopy)
        .then(({ data }) => {
          this.editedBodyCopy = data;
          this.saving = false;
          this.$emit("input", this);
        });
    }
  }
};
</script>
