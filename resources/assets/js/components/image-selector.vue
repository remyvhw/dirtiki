
<template>
    <section class="columns">
        <div class="column is-one-quarter">
            <button class="button">
                Add
            </button>
        </div>
        <div class="column">
            <image-ticker></image-ticker>
        </div>
    </section>
</template>

<script type="text/babel">
export default {
  components: {
    imageTicker: require("./image-ticker.vue")
  },
  props: {
    page: { Type: Object, Required: true }
  },
  data() {
    return {
      pages: []
    };
  },
  mounted() {},
  methods: {}
};
</script>
