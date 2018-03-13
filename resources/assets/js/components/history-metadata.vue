<template>
    <header class="level">
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
                {{ author }}
            </p>
        </div>
    </header>
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
    author() {
      return this.diff.data.author.anonymous
        ? "Anonyme (" + this.diff.data.author.ip + ")"
        : this.diff.relationships.user.data.name;
    }
  }
};
</script>
