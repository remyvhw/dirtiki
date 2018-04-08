
<template>

  <div class="field">
    <label v-if="label" :for="'input_' + _uid " class="label">{{ label }}</label>

    <div class="control" :class="{'has-icons-left': (error || icon), 'has-icon-right': (dynamicMessages.length || icon)}">

      <textarea v-if="htmlType === 'textarea'" class="textarea" :class="{'is-danger': error}" :placeholder="label" :value="value" @input="methodOnUpdateValue($event.target.value)" @keyup="methodOnKeyUp" @change="methodOnChange" @blur="methodOnBlur" :name="name ? name : autocomplete" :autocomplete="autocomplete" :rows="rows" :cols="cols" :readonly="readonly" :disabled="disabled"></textarea>

      <input v-else :id="'input_' + _uid" class="input" :class="dynamicInputClasses" :type="htmlType" :placeholder="label" :value="value" @input="methodOnUpdateValue($event.target.value)" :name="name ? name : autocomplete" :autocomplete="autocomplete" :step="step" :min="min" :max="max" :readonly="readonly" :disabled="disabled" @keyup="methodOnKeyUp" @change="methodOnChange" @blur="methodOnBlur">

      <span v-if="error || icon" class="icon is-small is-left">
        <i v-if="error" class="fas fa-exclamation-triangle"></i>
        <i v-if="icon" :class="icon"></i>
      </span>

      <span v-if="dynamicMessages.length" class="help is-danger">
        <span v-for="message in dynamicMessages" :key="message">{{ message }}<br></span>
      </span>

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
     * An array of strings the string must end with to validate.
     * Used on the registration form to validate an email address agains't
     * a list of preapproved domains.
     */
    mustEndWith: {
      type: Array
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
    errorMessages: {
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
    },

    /**
     * If true, the field will validate itself on blur but will also display error messages.
     */
    shouldHardValidateOnBlur: {
      Type: Boolean
    }
  },

  data() {
    return {
      messages: [],
      trans: {
        accepted: "The :attribute must be accepted.",
        active_url: "The :attribute is not a valid URL.",
        after: "The :attribute must be a date after :date.",
        after_or_equal:
          "The :attribute must be a date after or equal to :date.",
        alpha: "The :attribute may only contain letters.",
        alpha_dash:
          "The :attribute may only contain letters, numbers, and dashes.",
        alpha_num: "The :attribute may only contain letters and numbers.",
        array: "The :attribute must be an array.",
        before: "The :attribute must be a date before :date.",
        before_or_equal:
          "The :attribute must be a date before or equal to :date.",
        between: {
          numeric: "The :attribute must be between :min and :max.",
          file: "The :attribute must be between :min and :max kilobytes.",
          string: "The :attribute must be between :min and :max characters.",
          array: "The :attribute must have between :min and :max items."
        },
        boolean: "The :attribute field must be true or false.",
        confirmed: "The :attribute confirmation does not match.",
        date: "The :attribute is not a valid date.",
        date_format: "The :attribute does not match the format :format.",
        different: "The :attribute and :other must be different.",
        digits: "The :attribute must be :digits digits.",
        digits_between: "The :attribute must be between :min and :max digits.",
        dimensions: "The :attribute has invalid image dimensions.",
        distinct: "The :attribute field has a duplicate value.",
        email: "The :attribute must be a valid email address.",
        exists: "The selected :attribute is invalid.",
        file: "The :attribute must be a file.",
        filled: "The :attribute field must have a value.",
        image: "The :attribute must be an image.",
        in: "The selected :attribute is invalid.",
        in_array: "The :attribute field does not exist in :other.",
        integer: "The :attribute must be an integer.",
        ip: "The :attribute must be a valid IP address.",
        ipv4: "The :attribute must be a valid IPv4 address.",
        ipv6: "The :attribute must be a valid IPv6 address.",
        json: "The :attribute must be a valid JSON string.",
        max: {
          numeric: "The :attribute may not be greater than :max.",
          file: "The :attribute may not be greater than :max kilobytes.",
          string: "The :attribute may not be greater than :max characters.",
          array: "The :attribute may not have more than :max items."
        },
        mimes: "The :attribute must be a file of type: :values.",
        mimetypes: "The :attribute must be a file of type: :values.",
        min: {
          numeric: "The :attribute must be at least :min.",
          file: "The :attribute must be at least :min kilobytes.",
          string: "The :attribute must be at least :min characters.",
          array: "The :attribute must have at least :min items."
        },
        not_in: "The selected :attribute is invalid.",
        numeric: "The :attribute must be a number.",
        present: "The :attribute field must be present.",
        regex: "The :attribute format is invalid.",
        required: "The :attribute field is required.",
        required_if: "The :attribute field is required when :other is :value.",
        required_unless:
          "The :attribute field is required unless :other is in :values.",
        required_with:
          "The :attribute field is required when :values is present.",
        required_with_all:
          "The :attribute field is required when :values is present.",
        required_without:
          "The :attribute field is required when :values is not present.",
        required_without_all:
          "The :attribute field is required when none of :values are present.",
        same: "The :attribute and :other must match.",
        size: {
          numeric: "The :attribute must be :size.",
          file: "The :attribute must be :size kilobytes.",
          string: "The :attribute must be :size characters.",
          array: "The :attribute must contain :size items."
        },
        string: "The :attribute must be a string.",
        timezone: "The :attribute must be a valid zone.",
        unique: "The :attribute has already been taken.",
        uploaded: "The :attribute failed to upload.",
        url: "The :attribute format is invalid.",
        mustEndWith: "The :attribute must end with the following: :end"
      }
    };
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
    },

    dynamicMessages() {
      return this.messages.concat(this.errorMessages);
    }
  },

  methods: {
    methodOnKeyUp(value) {
      this.$emit("keyup", value);
    },

    methodOnBlur(value) {
      this.$emit("onBlurBeforeValidate", this);

      this.validate(this.shouldHardValidateOnBlur);

      this.$emit("onBlurAfterValidate", this);
    },

    methodOnChange() {
      this.$emit("onChange", this);
    },

    methodOnUpdateValue(value) {
      this.$emit("input", value);
      this.value = value;
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
        messages.push(this.trans.required.replace(":attribute", this.label));
      }

      // Check length
      if (this.isMinLengthInvalid()) {
        valid = false;
        let message = messages.push(
          this.trans.min.string
            .replace(":min", this.minLength)
            .replace(":attribute", this.label)
        );
      }
      if (this.isMaxLengthInvalid()) {
        valid = false;
        messages.push(
          this.trans.max.string
            .replace(":max", this.maxLength)
            .replace(":attribute", this.label)
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
          this.trans.min.numeric
            .replace(":min", this.min)
            .replace(":attribute", this.label)
        );
      } else if (
        (this.type == "number" || this.type == "digit") &&
        this.max != null &&
        this.value > this.max
      ) {
        valid = false;
        messages.push(
          this.trans.max.numeric
            .replace(":max", this.max)
            .replace(":attribute", this.label)
        );
      }

      // Email validation
      if (this.type == "email" && this.isEmailInvalid()) {
        valid = false;
        messages.push(this.trans.email.replace(":attribute", this.label));
      }

      // MustEndWith validation
      if (
        this.mustEndWith &&
        !RegExp(".+(" + this.mustEndWith.join("|") + ")$").test(this.value)
      ) {
        valid = false;
        messages.push(
          this.trans.mustEndWith
            .replace(":attribute", this.label)
            .replace(":end", this.mustEndWith.join(", "))
        );
      }

      // Number validation (for decimal steps)
      if (
        this.type == "number" &&
        this.step % 1 != 0 &&
        this.isNumberInvalid()
      ) {
        valid = false;
        messages.push(this.trans.numeric.replace(":attribute", this.label));
      }

      // Digit validation (or number with an integer step)
      if (
        (this.type == "digit" ||
          (this.type == "number" && this.step % 1 == 0)) &&
        this.isDigitsInvalid()
      ) {
        valid = false;
        messages.push(this.trans.integer.replace(":attribute", this.label));
      }

      // Exact match validation
      if (this.mustMatch && this.mustMatch != this.value) {
        valid = false;
        messages.push(this.trans.confirmed.replace(":attribute", this.label));
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
