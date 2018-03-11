<style scoped>

</style>
<template>
    <div class="modal is-active">
        <div class="modal-background"></div>
        <div class="modal-content box">
            <div class="control has-icons-right">
                <input :id="'search-field-' + _uid" class="input" @input="handleInput($event.target.value)" placeholder="Search" @keyup="debouncer">

                <span class="icon is-small is-right">
                    <i class="fas fa-search"></i>
                </span>
            </div>
        </div>
        <button @click="clear" class="modal-close is-large" aria-label="close"></button>
    </div>
</template>

<script type="text/babel">
var debounce = require("lodash.debounce");

export default {
  components: {},
  props: {
    value: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      initialSearchField: null,
      debouncer: () => {}
    };
  },
  mounted() {
    this.debouncer = debounce(this.refreshResults, 250, {
      maxWait: 1000
    });

    /*
        Keep track of the element that presented the search field, so we can
        give it back the focus when dismissed.
    */
    this.initialSearchField = document.activeElement;

    /*
        Transfer focus to the search field at the forefront.
        We need to manually empty the field first (without triggering a change
        on the query model) so Firefox puts the cursor at the very end of the
        already typed in string.
    */
    const searchFieldId = "#search-field-" + this._uid;
    let searchField = this.$el.querySelector(searchFieldId);
    searchField.value = "";
    searchField.focus();
    searchField.value = this.value;
  },
  beforeDestroy() {
    // Give focus to the element where user initially started typing
    // her request.
    if (this.initialSearchField) {
      this.initialSearchField.focus();
    }
  },
  methods: {
    handleInput(input) {
      this.$emit("input", input);
    },
    clear() {
      this.value = "";
      this.$emit("input", "");
    },
    refreshResults() {
      console.log(this.value);
    }
  }
};
</script>
