<style scoped>
.map {
  height: 80vh;
}
</style>
<template>
  <div>
    <div class="map" :id="'map_' + _uid">

    </div>
  </div>
</template>
<script type="text/babel">
export default {
  props: {},
  data() {
    return {
      map: null
    };
  },
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
  mounted() {
    var map = new mapboxgl.Map({
      container: "map_" + this._uid,
      style: "mapbox://styles/mapbox/streets-v9"
    });
  }
};
</script>