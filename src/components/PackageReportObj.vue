<template>
  <div>
    <md-content class="md-dense">
      <div class="md-toolbar-row">
        <h4 class="md-title">{{ packagePath }}</h4>
      </div>
      <md-table 
        v-model="packReport" 
        mdCard
        @md-selected="onSelect"
      >
        <md-table-row 
          slot="md-table-row"
          slot-scope="{ item }"
          mdSelectable="multiple"
          :class="{outOfSync: item.versionMismatch}"
        >
          <md-table-cell mdLabel="Package">{{ item.PackageName }}</md-table-cell>
          <md-table-cell mdLabel="SemVerKey">{{ item.semVerKey }}</md-table-cell>
          <md-table-cell mdLabel="Package Version">{{ item.pckgVersion }}</md-table-cell>
          <md-table-cell mdLabel="Installed Version">{{ item.installedVersion }}</md-table-cell>
        </md-table-row>
      </md-table>
    </md-content>  
  </div>
</template>

<script>
export default {
  name: 'PackageReportObj',
  emits: ['selected-changed'],
  props: {
    packagePath: {
      type: String,
      default: ''
    },
    updated: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    selected: [],
    packReport: []
  }),
  methods: {
    onSelect (items) {
      this.selected = items;
      this.$emit('selected-changed', { selected: this.selected, packPath: this.packagePath });
    },
    updatePackageReport: function (pr) {
      // Coerce packageReport into an array of objects
      this.packReport = [];
      let keys = Object.keys(pr);
      keys.forEach(key => {
        let obj = {};
        obj.PackageName = key;
        obj.installedVersion = pr[key].installedVersion;
        obj.pckgVersion = pr[key].pckgVersion;
        obj.semVerKey = pr[key].semVerKey;
        obj.versionMismatch = pr[key].versionMismatch;
        this.packReport.push(obj);
      });
    }
  },
  watch: {
    updated: function (wasUpdated) {
      if (wasUpdated) {
        this.updatePackageReport(this.$attrs.packageReport);
      }
    }
  }
};
</script>

<style>
.outOfSync{
  background-color: red;
  color: white;
  font-weight: 900;
}
</style>