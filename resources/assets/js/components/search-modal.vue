<style scoped>

</style>
<template>
    <div class="modal">
        <div class="modal-background"></div>
        <div class="modal-content">
            <!-- Any other Bulma elements you want -->
        </div>
        <button class="modal-close is-large" aria-label="close"></button>
    </div>
</template>

<script type="text/babel">
export default {
  components: {},
  props: {
    query: {
      type: string,
      required: true
    }
  },
  data() {
    return {
      page: null
    };
  },
  mounted() {}
};
</script>
