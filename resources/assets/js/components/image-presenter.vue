<style scoped>
img {
  display: block;
  margin-left: auto;
  margin-right: auto;
  max-width: 75%;
}
</style>
<template>
    <div><img :src='href' :alt='alt' :title="title"></div>
</template>

<script type="text/babel">
export default {
  components: {},
  props: {
    href: {
      type: String,
      required: true
    },
    alt: {
      type: String
    },
    title: {
      type: String
    }
  },
  data() {},
  computed: {}
};
</script>
