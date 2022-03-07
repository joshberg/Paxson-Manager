<template>
  <div>
    <md-card class="md-layout-item md-size-100">
      <md-card-header>
        <div v-if="isLoadingBarDisplayed">
          <md-progress-bar mdMode="indeterminate" />
        </div>
        <md-toolbar class="md-layout md-alignment-center-space-around">
          <md-button
            class="md-layout-item md-raised md-primary"
            @click="ScanForPackages"
          >Scan for package.json(s)</md-button>
          <md-button
            class="md-layout-item md-raised md-accent"
            @click="RunSelectedTests"
          >Run Selected Tests</md-button>
        </md-toolbar>
        <md-list>
          <md-list-item v-for="(pack) in PackageJSONs" :key="pack">
            <test-item 
              :packageFolder="pack"
              :runTestsNow="runTests"
              @no-tests-found="RemovePackage" 
              @tests-selected="UpdateTestsToRun"
            />
          </md-list-item>
        </md-list>
      </md-card-header>
    </md-card>
  </div>
</template>

<script>
import TestItem from './TestItem.vue';

export default {
  name: 'TestPackages',
  components: {
    TestItem
  },
  props: {
    currentProject: {
      type: String,
      default: ''
    }
  },
  data: ()=>({
    PackageJSONs: [],
    isLoadingBarDisplayed: false,
    itemsToSkip: [],
    testsToRun: {},
    runTests: false
  }),
  methods: {
    ScanForPackages: function () {
      console.log('Methods called this');
      console.log(this);
      this.PackageJSONs = {};
      this.itemsToSkip = [];
      this.packagesToUpdate = [];

      if (Object.prototype.hasOwnProperty.call(global.settings, 'PackagePathExclusions')) {
        if (global.settings.PackagePathExclusions.length > 0) {
          this.itemsToSkip = global.settings.PackagePathExclusions;
        }
      }  

      let fs = this.nw.require('fs');
      let projectFolder = global.settings.ProjectPath;
      if (fs.existsSync(projectFolder)) {
        console.log('Path exists.');
        // Search all folders (except for node_modules) for package.json.
        this.isLoadingBarDisplayed = true;
        this.PackageJSONs = this.GetAllPackageFiles(projectFolder);
        this.packagesToUpdate = new Array(this.PackageJSONs.length);
        this.isLoadingBarDisplayed = false;
      }
    },
    GetAllPackageFiles: function (dirPath, arrayOfFiles) {
      let fs = this.nw.require('fs');
      let path = this.nw.require('path');
      let files = fs.readdirSync(dirPath);

      this.itemsToSkip.forEach(item => {
        let index = files.indexOf(item);
        if (index > -1) {
          files.splice(index, 1);
        }  
      });

      let lclThis = this;

      arrayOfFiles = arrayOfFiles || [];

      files.forEach(function (file) {
        if (fs.statSync(dirPath + '/' + file).isDirectory()) {
          arrayOfFiles = lclThis.GetAllPackageFiles (dirPath + '/' + file, arrayOfFiles);
        } else if (file.includes('package.json')) {
          arrayOfFiles.push(path.join(__dirname, dirPath, '/').substring(1));
        }
      });

      return arrayOfFiles;
    },
    RemovePackage: function (packageName) {
      let index = this.PackageJSONs.indexOf(packageName);
      this.PackageJSONs.splice(index, 1);
    },
    RunSelectedTests: function () {
      console.log('Run Selected Tests triggered at top level.');
      this.runTests = true;
      let lclThis = this;
      setTimeout(function () { lclThis.runTests = false; }, 500);
    },
    UpdateTestsToRun: function (tests, packagePath) {
      this.testsToRun[packagePath] = tests;
    }
  },
  watch: {
    currentProject: function (newValue) {
      if (newValue !== '') {
        this.ScanForPackages();
      }
    },
    isLoadingBarDisplayed: function (newValue) {
      this.$emit('background-processing', 'Sync Package.json', newValue);
    }
  }
};
</script>

<style>

</style>