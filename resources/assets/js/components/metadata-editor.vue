<template>
  <div class="control">
    <dirtiki-input v-if="value" type="text" :should-hard-validate-on-blur="true" :required="true" label="Page Name" name="page-name" v-model="value.data.name" @input="emitInput">
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
      if (!this.validate()) return;
      this.saving = true;
      this.$http.put(this.value.links.self, this.value).then(({ data }) => {
        this.value = data;
        this.saving = false;
        this.emitInput();
        this.$emit("save", this.value);
      });
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
