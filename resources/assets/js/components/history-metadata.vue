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
                {{ diff.data.author.ip }}
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
  computed: {}
};
</script>
