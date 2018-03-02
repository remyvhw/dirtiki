<style scoped>
small {
  color: hsl(217, 71%, 53%);
  position: relative;
  top: -1em;
  font-size: 0.4em;
}
</style>
<template>
    <span>
        <a :name="anchor" class="anchor" href="#${escapedText}"></a>
        <span @mouseover="showHelper = true" @mouseleave="showHelper = false" @click="showLink=true">

            <slot></slot>
            <small v-if="showHelper && !showLink">
                <i class="fas fa-link"></i>
            </small>
        </span>
        <span v-if="showLink"><br>
            <small>{{ linkUrl }}</small>
        </span>

    </span>
</template>
<script type="text/babel">
export default {
  props: {
    anchor: { Type: String, Required: true },
    level: { Type: Number, Required: true }
  },
  data() {
    return {
      showHelper: false,
      showLink: false
    };
  },
  computed: {
    linkUrl() {
      return (
        document.location.href.substr(0, document.location.href.indexOf("#")) +
        "#" +
        this.anchor
      );
    }
  }
};
</script>
