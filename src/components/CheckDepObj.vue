<template>
  <md-table-row :class="{outOfSync: version !== latest}">
    <md-table-cell mdLabel="Package">{{ packageName }}</md-table-cell>
    <md-table-cell mdLabel="Package Version">{{ version }}</md-table-cell>
    <md-table-cell mdLabel="Latest Version"> {{ latest }}</md-table-cell>
    <md-table-cell mdLabel="Packages Affected">
      <md-list class="md-dense">
        <md-list-item v-for="(dep) in $attrs.dependency.depended" :key="dep">
          {{ dep }}
        </md-list-item>
      </md-list>
    </md-table-cell>
    <md-table-cell mdLabel="Repository">
      <md-button 
        class="md-raised"
        @click="openRepo"
      >{{ repo }}</md-button>
    </md-table-cell>
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
    latest: {
      type: String,
      default: '0.0.0'
    },
    repo: {
      type: String,
      default: ''
    },
    finishedLoading: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    dependencies: []
  }),
  methods: {
    openRepo: function () {
      const gui = this.nw.require('nw.gui');
      if (this.repo.includes('http')) {
        gui.Shell.openExternal(this.repo);
      }
    }
  }
};
</script>

<style scoped>
.outOfSync{
  background-color: red;
  color: white;
  font-weight: 900;
}
</style>