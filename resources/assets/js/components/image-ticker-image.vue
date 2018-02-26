<style scoped>
.card {
  cursor: pointer;
}
</style>
<template>
    <div class="column" :class="columnClasses">
        <div class="card">
            <div class="card-image">
                <figure class="image is-square">
                    <img src="https://picsum.photos/200/200/?random">
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
      columnClasses: "is-2-desktop is-3-tablet is-5-mobile"
    };
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
    }
  }
};
</script>