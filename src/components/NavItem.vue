<template>
  <md-list-item>
    <mdicon :name="icon" />
    <span class="md-list-item-text">{{ text }}</span>
    <md-badge v-if="noticesCount > 0" class="md-square" :mdContent="noticesCount" />
  </md-list-item>
</template>

<script>
export default {
  props: {
    icon: {
      type: String,
      default: ''
    },
    text: {
      type: String,
      default: ''
    },
    noticesCount: {
      type: Number,
      default: 0
    }
  }
};
</script>

<style scoped>
.md-list-item-text{
  margin-left: 1em;
}
</style>