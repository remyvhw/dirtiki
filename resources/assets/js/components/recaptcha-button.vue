<template>
    <div>
        <button class="button is-primary" :id="buttonSelector" :disabled="$store.state.captcha.provider!=='recaptcha'">
            <slot></slot>
        </button>
    </div>
</template>
<script type="text/babel">
export default {
  props: {
    publicKey: {
      type: String,
      required: true
    }
  },
  mounted() {
    if (this.$store.state.captcha.provider === "recaptcha") {
      this.initializeCaptcha();
    }
  },
  watch: {
    "$store.state.captcha.provider": function(newValue, oldValue) {
      if (!oldValue && newValue === "recaptcha") {
        this.initializeCaptcha();
      }
    }
  },
  computed: {
    buttonSelector() {
      return "grecaptcha-" + this._uid;
    }
  },
  methods: {
    initializeCaptcha() {
      grecaptcha.render(this.$el.querySelector("#" + this.buttonSelector), {
        sitekey: this.publicKey,
        callback: () => {
          this.$emit("complete");
        }
      });
    }
  }
};
</script>
