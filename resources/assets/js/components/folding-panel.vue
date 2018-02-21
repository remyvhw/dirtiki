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
                <i v-if="!deployed" class="fas fa-caret-right"></i>
                <i v-if="deployed" class="fas fa-caret-down"></i>
            </span>
        </p>
        <div class="panel-block" v-if="deployed">
            <slot></slot>
        </div>
    </div>
</template>

<script type="text/babel">
export default {
  props: {
    deployed: { type: Boolean, default: true },
    title: { type: String, required: true }
  },
  methods: {
    toggle() {
      this.deployed = !this.deployed;
      this.$emit("toggle", this);
    }
  }
};
</script>
