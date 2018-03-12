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
        <div class="level">
            <!-- Left side -->
            <div class="level-left">
                <div class="level-item">
                    <p class="subtitle is-5">
                        {{ diff.data.created_at.date }}
                    </p>
                </div>
            </div>

            <!-- Right side -->
            <div class="level-right">
                <p class="level-item">
                    {{ diff.data.author.ip }}
                </p>
            </div>
        </div>
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
