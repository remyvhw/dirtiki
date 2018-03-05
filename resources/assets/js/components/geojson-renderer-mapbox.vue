<style scoped>

</style>
<template>
    <div>Map
    </div>
</template>
<script type="text/babel">
export default {
  props: {},
  computed: {
    geojson() {
      const code = this.$slots.default[0].text;
      try {
        return JSON.parse(code);
      } catch (e) {
        this.$emit("error");
      }
    }
  },
  mounted() {}
};
</script>