<template>

  <div class="field">
    <label v-if="label" :for="'input_' + _uid " class="label">{{ label }}</label>

    <div class="control" :class="{'has-icons-left': (error || icon), 'has-icon-right': (messages.length || icon)}">

      <textarea v-if="htmlType === 'textarea'" class="textarea" :class="{'is-danger': error}" :placeholder="label" :value="value" @input="updateValue($event.target.value)" @keyup="methodOnKeyUp" @change="methodOnChange" @blur="methodOnBlur" :name="name ? name : autocomplete" :autocomplete="autocomplete" :rows="rows" :cols="cols" :readonly="readonly" :disabled="disabled"></textarea>

      <input v-else :id="'input_' + _uid" class="input" :class="dynamicInputClasses" :type="htmlType" :placeholder="label" :value="value" @input="updateValue($event.target.value)" :name="name ? name : autocomplete" :autocomplete="autocomplete" :step="step" :min="min" :max="max" :readonly="readonly" :disabled="disabled">
      <!--

        @keyup="methodOnKeyUp" @change="methodOnChange" @blur="methodOnBlur"


      <i v-if="error" class="fa fa-warning"></i>
      <i v-if="icon" :class="icon"></i>

      <span v-if="messages.length" class="help is-danger">
        <span v-for="message in messages" :key="message">{{ message }}<br></span>
      </span>
-->
    </div>

  </div>
</template>

<script type="text/babel">
export default {
  props: {
    /**
     * Type of the input. Basically mimics HTML input type but enhance it
     * with a couple supported types.
     *     - text: a standard text input. By default, no validation is applied.
     *     - email
     *     - tel
     *     - number
     *     - password
     *     - date
     *     - datetime
     *     - digits: not using the html 5 number field but preventing entry of non digit characters.
     */
    type: {
      type: String,
      default: "text"
    },

    /**
     * The input's value. Retrive it by using v-model on this component.
     */
    value: {
      type: String,
      default: ""
    },

    /**
     * A boolean, true if the field is mandatory.
     */
    required: {
      type: Boolean,
      default: false
    },

    /**
     * Minimum length of the entry
     */
    minLength: {
      type: Number
    },

    /**
     * Maximum length of the entry
     */
    maxLength: {
      type: Number
    },

    /**
     * A string that the input must match (e.g. the value of a nearby password field
     * for a password confirmation input). Type weak.
     */
    mustMatch: {
      type: String
    },

    /**
     * In the case of a 'number' type, step between numbers.
     */
    step: {
      type: Number
    },

    /**
     * In the case of a 'number' type, minimum numeric value.
     */
    min: {
      type: Number
    },

    /**
     * In the case of a 'number' type, maximum numeric value.
     */
    max: {
      type: Number
    },

    /**
     * For textarea only, rows attribute.
     */
    rows: {
      type: Number
    },

    /**
     * For textarea only, cols attribute.
     */
    cols: {
      type: Number
    },

    /**
     * A label. Will be displayed outside of the field.
     */
    label: {
      type: String
    },

    /**
     * The value of the autocomplete html attribute. If no 'name' is
     * provided, this value will be used in the 'name' field as
     * well.
     */
    autocomplete: {
      type: String
    },

    /**
     * The value of the name attribute
     */
    name: {
      type: String
    },

    /**
     * An array of custom classes to add to the field div. (eg. ['eight', 'wide']).
     */

    divClasses: {
      type: Array
    },

    /**
     * An array of custom classes to add to the html input.
     */

    inputClasses: {
      type: Array,
      default: function() {
        return [];
      }
    },

    /**
     * When true, the field cannot be edited but a user can tab to it, highlight it, and copy the text from it
     */
    readonly: {
      type: Boolean
    },

    /**
     * When true, the field is completely disabled and will not be sent with a form
     */
    disabled: {
      type: Boolean
    },

    /**
     * A list of error messages to display next to the field.
     */
    messages: {
      type: Array,
      default: function() {
        return [];
      }
    },

    /**
     * True if the field should present a red color.
     */
    error: {
      type: Boolean
    },

    /**
     * An icon to add to input (does not work on textareas). Can be any class name that will render an icon.
     * For example, for a font-awesome checkmark icon, use "fa fa-check".
     */
    icon: {
      type: String
    }
  },

  computed: {
    htmlType() {
      switch (this.type) {
        case "textarea":
          return "textarea";
        case "email":
          return "email";
        case "password":
          return "password";
        case "number":
          return "number";
        case "digits":
        case "tel":
          return "tel";
        case "date":
        case "datetime":
          return "date";
      }
      return "text";
    },

    dynamicInputClasses() {
      let classes = this.inputClasses.slice();
      if (this.error) classes.push("is-danger");
      return classes;
    }
  },

  methods: {
    /*
    methodOnKeyUp() {
      if (this.onKeyUp) {
        this.onKeyUp(this);
      }
    },

    methodOnBlur() {
      if (this.onBlurBeforeValidate) {
        this.onBlurBeforeValidate(this);
      }

      this.validate(this.shouldHardValidateOnBlur);

      if (this.onBlurAfterValidate) {
        this.onBlurAfterValidate(this);
      }
    },

    methodOnChange() {
      if (this.onChange) {
        this.onChange(this);
      }
    },
    */

    updateValue(value) {
      this.$emit("input", value);
    },

    /**
     * Validate a field's minimum length.
     * @return boolean false if the name is valid, true if invalid.
     */
    isMinLengthInvalid() {
      if (!this.required && this.value == "") return false;
      let invalid = this.minLength && this.value.length < this.minLength;
      return invalid;
    },

    /**
     * Validate a field's maximum length.
     * @return boolean false if the name is valid, true if invalid.
     */
    isMaxLengthInvalid() {
      let invalid = this.maxLength && this.value.length > this.maxLength;
      return invalid;
    },

    /**
     * Validate the email field.
     * @return boolean true if the email is invalid, false if valid.
     */
    isEmailInvalid() {
      if (this.value === "") return false;

      const reg = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
      return !reg.test(this.value);
    },

    /**
     * Validate the number field. Unlike digits, number accepts decimals.
     * @return boolean true if the value is invalid, false if valid.
     */
    isNumberInvalid() {
      const reg = /^-?\d*\.?\d*$/;
      return !reg.test(this.value);
    },

    /**
     * Validate the number field. Unlike digits, number accepts decimals.
     * @return boolean true if the value is invalid, false if valid.
     */
    isDigitsInvalid() {
      return !isNaN(parseFloat(this.value)) && isFinite(this.value);
    },

    /**
     * Triggering this function will check the value of the field and validate
     * it. If the trigger is set to hard, error messages will be set for the
     * field and be displayed next to it.
     * @param  boolean hard If true, error messages will be displayed next to the field.
     * @return boolean      True if valid.
     */
    validate(hard) {
      let valid = true;
      let messages = [];

      // Make sure that we at least have an empty string to work with
      // since we can't even check for length on undefined.
      if (this.value === null) {
        this.value = "";
      }

      if (typeof this.value == "undefined") {
        this.value = "";
      }

      // Check for required fields.
      if (this.required && this.value === "") {
        valid = false;
        messages.push(_.replace(this.trans.required, ":attribute", this.label));
      }

      // Check length
      if (this.isMinLengthInvalid()) {
        valid = false;
        messages.push(
          _.replace(
            _.replace(this.trans.min.string, ":min", this.minLength),
            ":attribute",
            this.label
          )
        );
      }
      if (this.isMaxLengthInvalid()) {
        valid = false;
        messages.push(
          _.replace(
            _.replace(this.trans.max.string, ":max", this.maxLength),
            ":attribute",
            this.label
          )
        );
      }

      // Check for min and max values for numeric fields
      if (
        (this.type == "number" || this.type == "digit") &&
        this.min != null &&
        this.value < this.min
      ) {
        valid = false;
        messages.push(
          _.replace(
            _.replace(this.trans.min.numeric, ":min", this.min),
            ":attribute",
            this.label
          )
        );
      } else if (
        (this.type == "number" || this.type == "digit") &&
        this.max != null &&
        this.value > this.max
      ) {
        valid = false;
        messages.push(
          _.replace(
            _.replace(this.trans.max.numeric, ":max", this.max),
            ":attribute",
            this.label
          )
        );
      }

      // Email validation
      if (this.type == "email" && this.isEmailInvalid()) {
        valid = false;
        messages.push(_.replace(this.trans.email, ":attribute", this.label));
      }

      // Number validation (for decimal steps)
      if (
        this.type == "number" &&
        this.step % 1 != 0 &&
        this.isNumberInvalid()
      ) {
        valid = false;
        messages.push(_.replace(this.trans.numeric, ":attribute", this.label));
      }

      // Digit validation (or number with an integer step)
      if (
        (this.type == "digit" ||
          (this.type == "number" && this.step % 1 == 0)) &&
        this.isDigitsInvalid()
      ) {
        valid = false;
        messages.push(_.replace(this.trans.integer, ":attribute", this.label));
      }

      // Exact match validation
      if (this.mustMatch && this.mustMatch != this.value) {
        valid = false;
        messages.push(
          _.replace(this.trans.confirmed, ":attribute", this.label)
        );
      }

      this.error = !valid;

      if (hard) {
        this.messages = messages;
      } else {
        this.messages = [];
      }

      return valid;
    }
  }
};
</script>
