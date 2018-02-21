<template>
    <div class="panel">
        <p class="panel-heading">
            {{ title }}
        </p>
        <div class="panel-block">
            <slot></slot>
        </div>
    </div>
</template>

<script type="text/babel">
export default {
  props: {
    deployed: { Type: Boolean, Default: true },
    title: { Type: String, Required: true }
  }
};
</script>
