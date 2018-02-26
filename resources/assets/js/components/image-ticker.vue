<style scoped>
.ticker {
  overflow-x: scroll;
  -webkit-overflow-scrolling: touch;
}
</style>

<template>
    <div class="columns is-vcentered is-mobile ticker">
        <div class="column" v-if="loading">
            <loading-indicator></loading-indicator>
        </div>
        <image-ticker-image :key="image.id" :image="image" v-for="image in images"></image-ticker-image>
    </div>
</template>

<script type="text/babel">
export default {
  components: {
    imageTickerImage: require("./image-ticker-image.vue")
  },
  props: {},
  data() {
    return {
      datas: [],
      loading: false
    };
  },
  mounted() {
    this.retrieveImagesAtUrl("/api/images");
  },
  computed: {
    images() {
      return window
        .collect(this.datas)
        .pluck("data")
        .flatten(1)
        .toArray();
    }
  },
  methods: {
    retrieveImagesAtUrl(url) {
      this.loading = true;
      this.$http.get(url).then(({ data }) => {
        this.loading = false;
        this.datas.push(data);
      });
    }
  }
};
</script>
