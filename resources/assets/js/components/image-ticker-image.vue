<style scoped>
.card {
  cursor: pointer;
  transition: border 0.2s ease-in;
}
.card[selected] {
  border: 3px solid hsl(171, 100%, 41%);
}

.display-press {
  animation: pop 0.5s ease-in-out;
}

@keyframes pop {
  from {
    transform: scale3d(1, 1, 1) translate3d(0, 0, 0);
    filter: brightness(100%);
  }

  50% {
    transform: scale3d(1.05, 1.05, 1.05) translate3d(0, -5%, 0);
    filter: brightness(75%);
  }

  to {
    transform: scale3d(1, 1, 1) translate3d(0, 0, 0);
    filter: brightness(100%);
  }
}
</style>
<template>
    <div class="column" @click="toggleSelection" :class="columnClasses">
        <div class="card" :selected="selected" ref="card">
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
      this.$emit("toggle-selection", this);
    },
    /**
     * When called, will slightly animated the card to display a subtle feedback.
     * Is better used following a tap or a click on the card, when the whole
     * card is used as a button.
     */
    presentPressFeedback() {
      this.$refs.card.classList.add("display-press");
      this.$refs.card.addEventListener("animationend", function handler() {
        this.classList.remove("display-press");
        this.removeEventListener(event.type, handler);
      });
    }
  }
};
</script>