<script type="text/babel">
export default {
  components: {
    recaptchaButton: require("./recaptcha-button.vue")
  },
  methods: {
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
    },

    submit() {
      if (!this.validate(true)) return;

      this.$el.submit();
    }
  }
};
</script>
