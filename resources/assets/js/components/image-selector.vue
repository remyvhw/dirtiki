<style scoped>
.section.box.is-light {
  margin-top: 1em;
  margin-bottom: 1em;
  background-color: #f5f5f5;
  animation-duration: 1.25s;
  animation-fill-mode: both;
  animation-name: slideInDown;
}
</style>
<template>
    <section class="section box is-light">
        <div class="columns is-vcentered">
            <div class="column is-1">
                <button class="button">
                    Add
                </button>
            </div>
            <div class="column">
                <image-ticker @image-selected="imageSelected"></image-ticker>
            </div>
        </div>
    </section>
</template>

<script type="text/babel">
export default {
  components: {
    imageTicker: require("./image-ticker.vue")
  },
  methods: {
    imageSelected(ticker, image) {
      console.log(image);
    }
  }
};
</script>
