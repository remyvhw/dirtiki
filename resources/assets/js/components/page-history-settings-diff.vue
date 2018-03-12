<style scoped>
table {
  margin: 0;
}
td,
th {
  width: 33%;
}
</style>
<template>
    <div class="diff">
        <history-metadata :diff="diff"></history-metadata>
        <table class='table is-striped is-narrow is-fullwidth'>
            <tr v-for="pair in diffPairs" :key="attribute">
                <th>{{ pair.attribute }}</th>
                <td>
                    <span v-if="pair.before">{{ pair.before }}</span>
                    <span v-else>&mdash;</span>
                </td>
                <td>
                    <span v-if="pair.after">{{ pair.after }}</span>
                    <span v-else>&mdash;</span>
                </td>
            </tr>
        </table>
    </div>

</template>
<script type="text/babel">
export default {
  components: {
    historyMetadata: require("./history-metadata.vue")
  },
  props: {
    diff: {
      type: Object,
      required: true
    }
  },
  computed: {
    diffPairs() {
      return window
        .collect()
        .times(Object.values(this.diff.data.changes.after).length, counter => {
          let index = counter - 1;
          return {
            attribute: Object.keys(this.diff.data.changes.after)[index],
            before: Object.values(this.diff.data.changes.before)[index],
            after: Object.values(this.diff.data.changes.after)[index]
          };
        })
        .toArray();
    }
  },
  data() {
    return {};
  }
};
</script>
