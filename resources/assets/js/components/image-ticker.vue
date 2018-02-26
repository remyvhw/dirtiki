<style  scoped>
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
  text-shadow: 0px 1px 1px #fff;
}
.ticker-title:not(fa) {
  font-size: 1em;
}
.ticker-title {
  color: #7f7f7f;
}
.section.is-light {
  background-color: #f5f5f5;
  animation-duration: 1.25s;
  animation-fill-mode: both;
  animation-name: slideInDown;
}
.section.is-light.compact {
  padding-top: 0;
  padding-bottom: 0;
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
