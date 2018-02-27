<style scoped>
.ticker {
  overflow-x: scroll;
  -webkit-overflow-scrolling: touch;
}
</style>

<template>
    <div class="columns is-vcentered is-mobile ticker">
        <div class="column" v-if="loading && !datas.length">
            <loading-indicator></loading-indicator>
        </div>
        <image-ticker-image :key="image.id" :image="image" v-for="image in images" @toggle-selection="toggleSelection"></image-ticker-image>

        <div v-if="nextPageUrl" class="column is-1 has-text-centered">
            <loading-indicator :size="3" v-if="loading"></loading-indicator>
            <button v-else class="button is-light is-large" @click="retrieveImagesAtUrl(nextPageUrl)">
                <span class="icon is-medium">
                    <i class="fas fa-ellipsis-h fa-2x"></i>
                </span>
            </button>
        </div>

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
    },
    nextPageUrl() {
      const last = window.collect(this.datas).last();
      return last ? last.links.next : null;
    }
  },
  methods: {
    retrieveImagesAtUrl(url) {
      this.loading = true;
      this.$http.get(url).then(({ data }) => {
        this.loading = false;
        this.datas.push(data);
      });
    },
    toggleSelection(imageTickerImage) {
      // Prevent defaults.
      imageTickerImage.selected = false;
      imageTickerImage.presentPressFeedback();
      this.$emit("image-selected", this, imageTickerImage.image);
    }
  }
};
</script>
