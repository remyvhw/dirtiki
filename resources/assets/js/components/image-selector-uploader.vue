<style scoped>
.dropzone {
  border: 5px solid hsl(171, 100%, 41%) dashed;
}
</style>
<template>
    <div>
        <button v-if="!dragging" class="button is-dark is-large is-fullwidth">
            <span class="icon">
                <i class="fas fa-plus"></i>
            </span>
        </button>
    </div>
</template>
<script type="text/babel">
export default {
  data() {
    return {
      dragging: false
    };
  },
  mounted() {
    this.startListeningForDragover();
  },

  methods: {
    startListeningForDragover() {
      var _this = this;
      _this.$parent.$el.addEventListener("dragover", function handler(event) {
        event.dataTransfer.dropEffect = "copy";
        _this.dragging = true;
        this.removeEventListener(event.type, handler);
        _this.startListeningForDragLeave();
      });
    },
    startListeningForDragLeave() {
      var _this = this;
      _this.$parent.$el.addEventListener("dragleave", function handler(event) {
        if (_this.$parent.$el.contains(event.relatedTarget)) return; // Ignore 'leaves' on child components.
        _this.dragging = false;
        this.removeEventListener(event.type, handler);
        _this.startListeningForDragover();
      });
    }
  }
};
</script>
