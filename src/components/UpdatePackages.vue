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
            @click="RunUpdates"
          >Run Update(s)</md-button>
        </md-toolbar>
        <md-content>
          <md-list class="">
            <md-list-item v-for="(pckg, index) in PackageJSONs" :key="index">
              <md-checkbox v-model="packagesSelected[index]" class="md-layout-item" />
              <span class="md-layout-item md-size-20">{{ pckg.split('\\')[pckg.split('\\').length-2] }}</span>
              <div class="md-layout-item md-size-80 console-output">
                <console-update-window 
                  :folder="pckg"
                  :willRunUpdate="packagesSelected[index]" 
                  :runUpdate="runUpdatesNow" 
                />
              </div>
            </md-list-item>
          </md-list>
        </md-content>
      </md-card-header>
    </md-card>
  </div>
</template>

<script>
import ConsoleUpdateWindow from './ConsoleUpdateWindow.vue';

export default {
  name: 'UpdatePackages',
  components: {
    ConsoleUpdateWindow
  },
  props: {
    currentProject: {
      type: String,
      default: ''
    }
  },
  data: ()=>({
    PackageJSONs: [],
    packagesSelected: [],
    foldersSelected: [],
    isLoadingBarDisplayed: false,
    itemsToSkip: [],
    itemsToUpdate: {},
    runUpdatesNow: false
  }),
  methods: {
    ScanForPackages: function () {
      console.log('Methods called this');
      console.log(this);
      this.PackageJSONs = [];
      this.packagesSelected = [];
      this.itemsToSkip = [];
      this.isLoadingBarDisplayed = true;

      if (Object.prototype.hasOwnProperty.call(global.settings, 'PackagePathExclusions')) {
        if (global.settings.PackagePathExclusions.length > 0) {
          this.itemsToSkip = global.settings.PackagePathExclusions;
        }
      }  

      let fs = this.nw.require('fs');
      let projectFolder = global.settings.ProjectPath;
      if (fs.existsSync(projectFolder)) {
        // Search all folders (except for node_modules) for package.json.
        this.isLoadingBarDisplayed = true;
        this.PackageJSONs = this.GetAllPackageFiles(projectFolder);
        this.packagesSelected = new Array(this.PackageJSONs.length);
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
    RunUpdates: function () {
      this.runUpdatesNow = true;
      let lclThis = this;
      setTimeout(function () {
        lclThis.runUpdatesNow = false;
      }, 500);
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
    },
    foldersSelected: function (newValue) {
      let lclThis = this;
      newValue.forEach(val => {
        let folder = lclThis.ParentFolders[newValue.indexOf(val)];
        lclThis.PackageJSONs.forEach(pckg => {
          if (pckg.includes(folder)) {
            lclThis.packagesSelected[lclThis.PackageJSONs.indexOf(pckg)] = val;
          }
        });
      });
    }
  }
};
</script>

<style>

</style>