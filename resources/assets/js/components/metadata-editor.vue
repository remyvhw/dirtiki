<template>
    <div class="control">
        <dirtiki-input v-if="editedPageCopy" type="text" :should-hard-validate-on-blur="true" :required="true" label="Page Name" name="page-name" v-model="editedPageCopy.data.name">
        </dirtiki-input>
        <div class="field">
            <p class="control">
                <button @click="savePage" :class="{'is-loading':saving}" class="button is-primary is-fullwidth">
                    Save
                </button>
            </p>
        </div>
    </div>
</template>

<script type="text/babel">
export default {
  props: {
    page: { Type: Object, Required: true }
  },
  data() {
    return {
      saving: false,
      editedPageCopy: null
    };
  },
  mounted() {
    this.editedPageCopy = this.page;
  },
  methods: {
    savePage() {
      this.saving = true;
      this.$http
        .put(this.page.links.self, this.editedPageCopy)
        .then(({ data }) => {
          this.editedPageCopy = data;
          this.saving = false;
          this.$emit("input", this);
        });
    }
  }
};
</script>
