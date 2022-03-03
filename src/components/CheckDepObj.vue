<template>
  <md-table-row 
    slot="md-table-row"
  >
    <md-table-cell mdLabel="Package">{{ packageName }}</md-table-cell>
    <md-table-cell mdLabel="Package Version">{{ version }}</md-table-cell>
    <md-table-cell mdLabel="Repository"><button class="md-button" :click="openRepo">{{ repo }}</button></md-table-cell>
  </md-table-row>
</template>

<script>
export default {
  name: 'CheckDepObj',
  props: {
    packageName: {
      type: String,
      default: ''
    },
    version: {
      type: String,
      default: '0.0.0'
    },
    repo: {
      type: String,
      default: ''
    }
  },
  methods: {
    openRepo: function () {
      const gui = this.nw.require('nw.gui');
      gui.Shell.openExternal(this.$props.repo);
    }
  }
};
</script>

<style>
</style>