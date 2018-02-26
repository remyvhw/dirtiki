<template>
    <div class="column" :class="columnClasses">
        <img class="image is-square" src="https://picsum.photos/200/200/?random">
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
      columnClasses: "is-3-desktop is-5-tablet is-11-mobile"
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
        columnClasses = "is-11";
      } else if (parentElWidth < 800) {
        columnClasses = "is-8";
      } else if (parentElWidth < 1023) {
        columnClasses = "is-5";
      } else {
        columnClasses = "is-3-desktop is-5-tablet is-11-mobile";
      }
      if (this.columnClasses != columnClasses) {
        this.columnClasses = columnClasses;
      }
    }
  }
};
</script>