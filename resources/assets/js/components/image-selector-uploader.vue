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
    <label v-if="!uploading" class="file-label">
      <input class="file-input" type="file" name="resume" multiple :accept="acceptedMimeTypes.join(',')" @change="handleFileInputSelection">
      <span class="file-cta">
        <span class="file-icon">
          <i class="fas" :class="{'fa-cloud-upload-alt':dragging , 'fa-plus': !dragging}"></i>
        </span>
      </span>
    </label>
    <progress v-else class="progress is-info" :value="uploading.uploaded" :max="uploading.total"></progress>
  </div>
</template>
<script type="text/babel">
export default {
  data() {
    return {
      dragging: false,
      acceptedMimeTypes: ["image/png", "image/jpeg", "image/svg+xml"],
      queue: [],
      uploading: false
    };
  },
  mounted() {
    this.startListeningForDragover();
  },

  methods: {
    appendFilesToQueueThenProcessQueue(files) {
      this.uploading = {
        uploaded: 0,
        total: window
          .collect(files)
          .filter(file => {
            return this.acceptedMimeTypes.includes(file.type);
          })
          .each(file => {
            this.queue.push(this.uploadFile(file));
          })
          .reduce(function(carry, file) {
            return carry + file.size;
          }, 0)
      };
      Promise.all(this.queue).then(result => {
        this.uploading = false;
      });
    },

    uploadFile(file) {
      var formData = new FormData();
      formData.append("image", file);
      return this.$http
        .post("/api/images", formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          },
          onUploadProgress: progressEvent => {
            this.uploading.uploaded += progressEvent.loaded;
          }
        })
        .then(({ data }) => {
          this.$emit("uploaded", data);
        });
    },

    handleFileInputSelection(event) {
      this.appendFilesToQueueThenProcessQueue(event.target.files);
      event.target.value = "";
    },

    exitDraggableMode() {
      this.dragging = false;
      this.$parent.$el.classList.remove("active-dropzone");

      this.startListeningForDragover();
    },
    startListeningForDragover() {
      var _this = this;
      _this.$parent.$el.addEventListener("dragover", function handler(event) {
        this.removeEventListener(event.type, handler);
        _this.startListeningForDragLeave();
        _this.startListeningForDrop();
        if (
          window
            .collect(event.dataTransfer.items)
            .pluck("type")
            .filter(item => {
              return _this.acceptedMimeTypes.includes(item);
            })
            .values()
            .isEmpty()
        ) {
          event.dataTransfer.dropEffect = "none";
          return;
        }
        event.dataTransfer.dropEffect = "copy";
        _this.$parent.$el.classList.add("active-dropzone");
        _this.dragging = true;
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
        this.removeEventListener(event.type, handler);
        _this.exitDraggableMode();
      });
    },
    startListeningForDrop() {
      var _this = this;
      document.addEventListener("drop", function(event) {
        event.stopPropagation();
        event.preventDefault();
        const files = event.dataTransfer.files;
        _this.appendFilesToQueueThenProcessQueue(files);
        _this.exitDraggableMode();
      });
    }
  }
};
</script>
