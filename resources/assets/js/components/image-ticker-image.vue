<style scoped>
.card {
  cursor: pointer;
}
.card[selected] {
  border: 3px solid hsl(171, 100%, 41%);
}
</style>
<template>
    <div class="column" @click="toggleSelection" :class="columnClasses">
        <div class="card" :selected="selected">
            <div class="card-image">
                <figure class="image is-square">
                    <img :src="thumbnailUrl" :srcset="thumbnailUrlSet">
                </figure>
            </div>
        </div>
    </div>
</template>
<script type="text/babel">
export default {
  props: {
    image: {
      type: Object,
      required: true
    }
  },

  mounted() {
    this.updateDisplay();
    this.$el.addEventListener(
      "animationend",
      () => {
        this.updateDisplay();
      },
      false
    );
  },
  data() {
    return {
      columnClasses: "is-2-desktop is-3-tablet is-5-mobile",
      selected: false
    };
  },
  computed: {
    isVector() {
      return this.image.type === "image/svg+xml";
    },
    thumbnailUrl() {
      const variation = window
        .collect(this.image.variations)
        .pipe(collection => {
          if (this.isVector) return collection;
          return collection.where("width", 250).where("height", 250);
        })
        .first();
      return variation ? variation.url : null;
    },
    thumbnailUrlSet() {
      if (this.isVector) {
        return null;
      }
      return (
        this.thumbnailUrl +
        "&scale=3 3x," +
        this.thumbnailUrl +
        "&scale=2 2x," +
        this.thumbnailUrl +
        " 1x"
      );
    }
  },
  methods: {
    updateDisplay() {
      this.updateColumnClasses();
    },
    updateColumnClasses() {
      let columnClasses;
      const parentElWidth = this.$el.parentElement.clientWidth;
      if (parentElWidth < 600) {
        columnClasses = "is-5";
      } else if (parentElWidth < 800) {
        columnClasses = "is-4";
      } else if (parentElWidth < 1023) {
        columnClasses = "is-2";
      } else {
        columnClasses = "is-2-desktop is-3-tablet is-5-mobile";
      }
      if (this.columnClasses != columnClasses) {
        this.columnClasses = columnClasses;
      }
    },
    toggleSelection() {
      this.selected = !this.selected;
      this.$emit("click", this);
    }
  }
};
</script>