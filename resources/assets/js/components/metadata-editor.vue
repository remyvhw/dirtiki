<template>
    <div>
        <dirtiki-input v-if="page" type="text" :should-hard-validate-on-blur="true" :required="true" label="Page Name" name="page-name" v-model="page.data.name">
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
      saving: false
    };
  },
  methods: {
    savePage() {
      this.saving = true;
      this.$http
        .put("/api/pages/" + this.page.data.slug, this.page)
        .then(({ data }) => {
          this.$emit("input", data);
          this.page = data;
          this.saving = false;
        });
    }
  }
};
</script>
