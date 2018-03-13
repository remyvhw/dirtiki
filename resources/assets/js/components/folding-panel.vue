<style scoped>
.panel-heading {
  cursor: pointer;
}
</style>
<template>
  <div class="panel">
    <p class="panel-heading" @click="toggle">
      {{ title }}
      <span class="is-pulled-right">
        <i v-if="!shouldBeDeployed" class="fas fa-caret-right"></i>
        <i v-if="shouldBeDeployed" class="fas fa-caret-down"></i>
      </span>
    </p>
    <div class="panel-block" v-if="shouldBeDeployed">
      <slot></slot>
    </div>
  </div>
</template>

<script type="text/babel">
export default {
  props: {
    deployed: { type: Boolean, default: undefined },
    title: { type: String, required: true }
  },
  computed: {
    shouldBeDeployed: {
      get: function() {
        if (typeof this.deployed === "undefined") {
          return this.enclosedDeployed;
        }
        return this.deployed;
      },
      set: function(newValue) {
        if (typeof this.deployed === "undefined") {
          this.enclosedDeployed = newValue;
        }
      }
    }
  },
  data() {
    return {
      enclosedDeployed: true
    };
  },
  methods: {
    toggle() {
      this.$emit("toggle", this);
      this.shouldBeDeployed = !this.shouldBeDeployed;
    }
  }
};
</script>
