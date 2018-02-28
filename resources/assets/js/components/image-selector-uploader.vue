<style>
.active-dropzone {
  border: 5px hsl(171, 100%, 41%) dashed !important;
  padding: 43px 19px;
}
.active-dropzone img {
  filter: blur(4px);
}

.active-dropzone .is-dark {
  transition: transform 0.2s;
  transform: scale3d(1.1, 1.1, 1.1);
}
</style>
<template>
    <div class="file is-fullwidth is-large is-boxed is-dark">
        <label class="file-label">
            <input class="file-input" type="file" name="resume" multiple :accept="acceptedMimeTypes.join(',')" @change="handleFileInputSelection">
            <span class="file-cta">
                <span class="file-icon">
                    <i class="fas" :class="{'fa-cloud-upload-alt':dragging , 'fa-plus': !dragging}"></i>
                </span>
            </span>
        </label>
    </div>
</template>
<script type="text/babel">
export default {
  data() {
    return {
      dragging: false,
      acceptedMimeTypes: ["image/png", "image/jpeg", "image/svg+xml"],
      queue: []
    };
  },
  mounted() {
    this.startListeningForDragover();
  },

  methods: {
    appendFilesToQueueThenProcessQueue(files) {
      window
        .collect(files)
        .filter(file => {
          return this.acceptedMimeTypes.includes(file.type);
        })
        .each(file => {
          this.queue.push(file);
        });
      debugger;
      let fileReaderPromises = window
        .collect(files)
        .map(file => {
          return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.onload = fileread => {
              resolve({ file: file, reader: reader });
            };
            reader.readAsDataURL(file);
          });
        })
        .toArray();

      Promise.all(fileReaderPromises).then(results => {
        this.uploadFiles(results);
      });
    },

    handleFileInputSelection(event) {
      this.appendFilesToQueueThenProcessQueue(event.target.files);
      event.target.value = "";
    },

    startListeningForDragover() {
      var _this = this;
      _this.$parent.$el.addEventListener("dragover", function handler(event) {
        event.dataTransfer.dropEffect = "copy";
        _this.$parent.$el.classList.add("active-dropzone");
        _this.dragging = true;
        this.removeEventListener(event.type, handler);
        _this.startListeningForDragLeave();
        _this.startListeningForDrop();
      });

      _this.$parent.$el.addEventListener("dragover", function handler(event) {
        event.preventDefault();
      });

      _this.$parent.$el.addEventListener("dragenter", function handler(event) {
        event.preventDefault();
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
    },
    startListeningForDrop() {
      var _this = this;
      document.addEventListener("drop", function(event) {
        event.stopPropagation();
        event.preventDefault();
        const files = event.dataTransfer.files;
        _this.appendFilesToQueueThenProcessQueue(files);
      });
    }
  }
};
</script>
