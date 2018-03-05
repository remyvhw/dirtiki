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
    },
    bounds() {
      if (!this.geojson) return [0, 0, 0, 0];
      return geojsonExtent(this.geojson);
    }
  },
  mounted() {
    if (this.$store.state.maps.provider === "mapbox") {
      this.instanciateMapboxMap();
    } else if (this.$store.state.maps.provider === "google") {
      this.instanciateGoogleMap();
    }
  },
  methods: {
    instanciateGoogleMap() {
      const extent = geojsonExtent(this.geojson);
      let map = new google.maps.Map(
        document.getElementById("map_" + this._uid),
        {
          center: { lat: this.bounds[1], lng: this.bounds[0] },
          zoom: 4
        }
      );
      map.data.addGeoJson(this.geojson);

      map.data.setStyle(function(feature) {
        var defaultColor = "hsl(0, 0%, 21%)";
        return /** @type {google.maps.Data.StyleOptions} */ ({
          fillColor: feature.getProperty("fill")
            ? feature.getProperty("fill")
            : defaultColor,
          fillOpacity: feature.getProperty("fill-opacity")
            ? feature.getProperty("fill-opacity")
            : 0.5,
          strokeColor: feature.getProperty("stroke")
            ? feature.getProperty("stroke")
            : defaultColor,
          strokeWeight: feature.getProperty("stroke-width")
            ? feature.getProperty("stroke-width")
            : 1,
          strokeOpacity: feature.getProperty("stroke-opacity")
            ? feature.getProperty("stroke-opacity")
            : 1
        });
      });

      let bounds = new google.maps.LatLngBounds();
      bounds.extend(new google.maps.LatLng(this.bounds[1], this.bounds[0]));
      bounds.extend(new google.maps.LatLng(this.bounds[3], this.bounds[2]));
      map.fitBounds(bounds);
      this.map = map;
    },

    instanciateMapboxMap() {
      let map = new mapboxgl.Map({
        container: "map_" + this._uid,
        style: "mapbox://styles/mapbox/streets-v9"
      });
      map.scrollZoom.disable();

      map.fitBounds(this.bounds, {
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