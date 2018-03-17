<style scoped>
.toc {
  width: 30%;
  border: 1px solid #dbdbdb;
  padding: 1em;
}
.toc div.level2 {
  font-size: 0.8em;
  margin-left: 2em;
}
.toc div.level3 {
  font-size: 0.8em;
  margin-left: 3em;
}
.toc div.level4 {
  font-size: 0.8em;
  margin-left: 4em;
}
.toc div.level5 {
  font-size: 0.8em;
  margin-left: 5em;
}
.toc div.level6 {
  font-size: 0.8em;
  margin-left: 6em;
}
</style>
<template>
    <nav class="toc">

        <div v-for="(header, key) in headers" :key="key" :class="'level' + header.level">
            <a :href="header.link">
                {{ header.title }}
            </a>
        </div>

    </nav>
</template>

<script type="text/babel">
export default {
  computed: {
    headers() {
      let headers = Object.values(this.$store.state.parsed.headers);
      return headers.sort((a, b) => {
        if (a.chaining < b.chaining) return -1;
        if (a.chaining > b.chaining) return 1;
        return 0;
      });
    }
  }
};
</script>
