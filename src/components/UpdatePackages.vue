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
        </md-toolbar>
        <md-content>
          <md-list>
            <md-list-item v-for="(folder, ind) in ParentFolders" :key="ind">
              <md-checkbox v-model="foldersSelected[ind]" class="md-layout-item md-alignment-top-center md-size-5" />
              <span class="md-layout-item md-size-10">{{ folder }}</span>
              <md-list class="md-layout-item md-size-85">
                <md-list-item v-for="(pckg, index) in PackageJSONs.filter(pck => pck.includes(folder))" :key="index">
                  <md-checkbox v-model="packagesSelected[index]" class="md-layout-item md-size-5" />
                  <span class="md-layout-item md-size-15">{{ pckg.split('\\')[pckg.split('\\').length-2] }}</span>
                  <div class="md-layout-item md-size-80 console-output">
                    <console-update-window 
                      :folder="pckg"
                      :willRunUpdate="packagesSelected[index]" 
                      :runUpdate="runUpdatesNow" 
                    />
                  </div>
                </md-list-item>
              </md-list>
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
    }
  },
  computed: {
    ParentFolders: function () {
      let rootFolder = global.settings.ProjectPath;
      let parentFolders = [];
      this.PackageJSONs.forEach(pckg =>{
        let folderPath = pckg.replace(rootFolder, '').split('\\');
        folderPath.splice(0, 1);
        folderPath.splice(folderPath.length - 1, 1);
        if (folderPath.length == 1) {
          parentFolders.push(folderPath[0]);
        } else {
          for (let i = 0; i < folderPath.length - 1; i++) {
            let folder = folderPath[i];
            if (!parentFolders.includes(folder)) {
              parentFolders.push(folder);
            }
          }
        }
      });
      return parentFolders;
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