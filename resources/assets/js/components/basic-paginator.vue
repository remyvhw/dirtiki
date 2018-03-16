<style scoped>

</style>
<template>
  <nav class="pagination" role="navigation" aria-label="pagination">
    <a class="pagination-previous" :disabled="!links.prev" @click="handleLinkClick(links.prev)">{{ $store.state.strings ? $store.state.strings.pagination.previous : "" }}</a>
    <a class="pagination-next" :disabled="!links.next" @click="handleLinkClick(links.next)">{{ $store.state.strings ? $store.state.strings.pagination.next : "" }}</a>
    <ul v-if="meta" class="pagination-list">
      <li v-if="shouldShowFirstPageLink">
        <a class="pagination-link" :aria-label="$store.state.strings ? $store.state.strings.pagination.aria_go_to.replace(':page', 1) : ''" @click="handleLinkClick(links.first)">1</a>
      </li>
      <li v-if="shouldShowLeftEllipsis">
        <span class="pagination-ellipsis">&hellip;</span>
      </li>
      <li>
        <a class="pagination-link is-current" :aria-label="$store.state.strings ? $store.state.strings.pagination.aria_current.replace(':page', currentPageNumber) : ''" aria-current="page">{{ currentPageNumber }}</a>
      </li>
      <li v-if="shouldShowRightEllipsis">
        <span class="pagination-ellipsis">&hellip;</span>
      </li>
      <li v-if="shouldShowLastPageLink">
        <a class="pagination-link" :aria-label="$store.state.strings ? $store.state.strings.pagination.aria_go_to.replace(':page', lastPageNumber) : ''" @click="handleLinkClick(links.last)">{{ lastPageNumber }}</a>
      </li>
    </ul>
  </nav>
</template>

<script type="text/babel">
export default {
  props: {
    links: { type: Object, required: true },
    meta: { type: Object, required: false }
  },
  methods: {
    handleLinkClick(url) {
      this.$emit("select", url);
    }
  },
  computed: {
    isLastPage() {
      return this.links.next;
    },
    currentPageNumber() {
      return this.meta ? this.meta.current_page : 1;
    },
    lastPageNumber() {
      return this.meta ? this.meta.last_page : 1;
    },
    shouldShowLeftEllipsis() {
      return this.currentPageNumber > 2;
    },
    shouldShowRightEllipsis() {
      return this.lastPageNumber - this.currentPageNumber > 1;
    },
    shouldShowFirstPageLink() {
      return this.currentPageNumber > 1;
    },
    shouldShowLastPageLink() {
      return this.currentPageNumber != this.lastPageNumber;
    }
  }
};
</script>
