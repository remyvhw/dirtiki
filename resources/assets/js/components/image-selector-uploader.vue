<style>
.active-dropzone {
  border: 5px hsl(171, 100%, 41%) dashed !important;
}
.active-dropzone img {
  filter: blur(4px);
}
.is-primary {
  transition: transform 0.2s;
}
.active-dropzone .is-primary {
  transform: scale3d(1.2, 1.2, 1.2);
}
</style>
<template>
    <div>
        <button class="button is-large is-fullwidth" :class="{'is-primary':dragging , 'is-dark': !dragging}">
            <span class="icon">
                <i class="fas" :class="{'fa-cloud-upload-alt':dragging , 'fa-plus': !dragging}"></i>
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
        _this.$parent.$el.classList.add("active-dropzone");
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
        _this.$parent.$el.classList.remove("active-dropzone");
        this.removeEventListener(event.type, handler);
        _this.startListeningForDragover();
      });
    }
  }
};
</script>
