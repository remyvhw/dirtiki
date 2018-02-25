<style lang="sass" scoped>
.ticker {
    overflow-x: scroll;
    -webkit-overflow-scrolling: touch;
}
.ticker .card {
    animation-duration: 2.5s;
    animation-fill-mode: both;
    animation-name: bounceInRight;
}
.ticker-title .fa {
    font-size: 3em;
    text-shadow: 0px 1px 1px #FFF;
}
.ticker-title:not(fa) {
    font-size: 1em;
}
.ticker-title {
    color: #7F7F7F;
}
.section.is-light {
    background-color: #f5f5f5;
    animation-duration: 1.25s;
    animation-fill-mode: both;
    animation-name: slideInDown;
}
.section.is-light.compact{
    padding-top: 0;
    padding-bottom: 0;
}
</style>

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
