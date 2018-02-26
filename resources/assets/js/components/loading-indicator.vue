<template>
    <div class="has-text-centered">
        <i class="fas fa-spinner fa-spin" :class="sizeClass"></i>
    </div>
</template>
<script type="text/babel">
export default {
  props: {
    size: {
      Type: Number,
      Default: 2
    }
  },
  computed: {
    sizeClass() {
      return "fa-" + this.size + "x";
    }
  }
};
</script>