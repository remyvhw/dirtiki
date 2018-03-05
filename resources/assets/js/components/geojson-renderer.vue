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
var geojsonExtent = require("geojson-extent");

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
        return JSON.parse(unescape(code));
      } catch (e) {
        this.$emit("error");
      }
    }
  },
  mounted() {
    if (this.$store.state.maps.provider === "mapbox") {
      this.instanciateMapboxMap();
    }
  },
  methods: {
    instanciateMapboxMap() {
      const extent = geojsonExtent(this.geojson);

      let map = new mapboxgl.Map({
        container: "map_" + this._uid,
        style: "mapbox://styles/mapbox/streets-v9"
      });

      map.fitBounds(extent, {
        padding: 20,
        duration: 0
      });

      map.on("load", () => {
        map.addSource("code-content", {
          type: "geojson",
          data: this.geojson
        });

        map.addLayer({
          id: "geojson-shapes",
          type: "fill",
          source: "code-content",
          paint: {
            "fill-color": ["get", "fill"],
            "fill-opacity": 0.5
          },
          filter: ["==", "$type", "Polygon"]
        });

        map.addLayer({
          id: "code-points",
          type: "circle",
          source: "code-content",
          paint: {
            "circle-radius": 6,
            "circle-color": ["get", "marker-color"]
          },
          filter: ["==", "$type", "Point"]
        });

        map.addLayer({
          id: "code-lines",
          type: "line",
          source: "code-content",
          layout: {
            "line-join": "round",
            "line-cap": "round"
          },
          paint: {
            "line-color": ["get", "stroke"],
            "line-width": ["get", "stroke-width"]
          },
          filter: ["==", "$type", "LineString"]
        });
      });

      this.map = map;
    }
  }
};
</script>