
<template>
    <section class="columns">
        <div class="column is-1">
            <button class="button">
                Add
            </button>
        </div>
        <div class="column">
            <image-ticker></image-ticker>
        </div>
    </section>
</template>

<script type="text/babel">
export default {
  components: {
    imageTicker: require("./image-ticker.vue")
  }
};
</script>
