<template>
  <div class="control">
    <dirtiki-input v-if="value" type="text" :should-hard-validate-on-blur="true" :required="true" label="Page Name" name="page-name" v-model="value.data.name" @input="notifyOfInput">
    </dirtiki-input>
    <div class="field" v-if="canSave">
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
    value: { type: Object, required: true },
    canSave: { type: Boolean, default: true }
  },
  data() {
    return {
      saving: false
    };
  },
  methods: {
    savePage() {
      this.saving = true;
      this.$http.put(this.value.links.self, this.value).then(({ data }) => {
        this.value = data;
        this.saving = false;
        this.$emit("input", this.value);
        this.$emit("save", this.value);
      });
    },
    notifyOfInput() {
      this.$emit("input", this.value);
    }
  }
};
</script>
