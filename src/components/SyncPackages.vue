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
            @click="SyncSelectedPackages"
          >Sync Selected Packages</md-button>
          <md-card class="md-layout-item md-raised">
            <md-content class="md-title">
              {{ packagesToSync }} Packages to Sync in {{ filesToSync }} files.
            </md-content>
          </md-card>
        </md-toolbar>
        <md-content>
          <package-report-obj 
            v-for="(packPath, index) in PackageJSONs" 
            :packagePath="packPath" 
            :packageReport="PackageReports[packPath]"
            :updated="PackageReportUpdated[index]"
            @selected-changed="UpdateSelected"
            :key="index" 
          />
        </md-content>
      </md-card-header>
    </md-card>
  </div>
</template>

<script>
import PackageReportObj from './PackageReportObj.vue';

export default {
  name: 'SyncPackages',
  components: {
    PackageReportObj
  },
  props: {
    currentProject: {
      type: String,
      default: ''
    }
  },
  data: ()=>({
    PackageJSONs: [],
    PackageReports: {},
    PackageReportUpdated: [],
    isLoadingBarDisplayed: false,
    itemsToSkip: [],
    itemsToUpdate: {},
    filesToSync: 0,
    packagesToSync: 0,
    versionMismatchesDetected: 0
  }),
  methods: {
    ScanForPackages: function () {
      console.log('Methods called this');
      console.log(this);
      this.PackageJSONs = [];
      this.PackageReports = {};
      this.PackageReportUpdated = [];
      this.itemsToSkip = [];
      this.versionMismatchesDetected = 0;

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
        this.PackageReportUpdated = new Array(this.PackageJSONs.length);
        this.isLoadingBarDisplayed = false;
        this.CompareDependencies();
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
          arrayOfFiles.push(path.join(__dirname, dirPath, '/', file).substring(1));
        }
      });

      return arrayOfFiles;
    },
    CompareDependencies: function () {
      console.log('comparing dependencies with what is installed');
      this.isLoadingBarDisplayed = true;
      let fs = this.nw.require('fs');
      let lclThis = this;
      let filesScanned = 0;
      let totalFiles = this.PackageJSONs.length;
      for (let i = 0; i < this.PackageJSONs.length; i++) {
        let pack = this.PackageJSONs[i];
        let packageLockFile = pack.replace('package.json', 'package-lock.json');
        fs.readFile(pack, {
          encoding: 'utf-8'
        }, (err, data) => {
          if (err) {
            console.log('ERROR PROCESSING: ' + pack);
            console.log(err);
          } else {
            if (fs.existsSync(packageLockFile)) {
              fs.readFile(packageLockFile, {
                encoding: 'utf-8'
              }, (err, plData) => {
                if (err) {
                  console.log('ERROR PROCESSING: ' + packageLockFile);
                } else {
                  setTimeout(function () {
                    lclThis.PackageReportUpdated.splice(i, 1, true);
                  }, 200);
                  filesScanned++;
                  if (filesScanned >= totalFiles) {
                    lclThis.isLoadingBarDisplayed = false;
                  }
                  let packg = JSON.parse(data);
                  let pckglck = JSON.parse(plData);
                  let deps = packg.dependencies;
                  let depNames = Object.keys(deps);
                  lclThis.PackageReports[pack] = {};
                  depNames.forEach(depName => {
                    lclThis.PackageReports[pack][depName] = {};
                    lclThis.PackageReports[pack][depName].pckgVersion = packg.dependencies[depName].substring(1);
                    lclThis.PackageReports[pack][depName].installedVersion = pckglck.packages['node_modules/' + depName].version;
                    lclThis.PackageReports[pack][depName].versionMismatch = lclThis.PackageReports[pack][depName].pckgVersion !== lclThis.PackageReports[pack][depName].installedVersion;
                    if (lclThis.PackageReports[pack][depName].versionMismatch) {
                      lclThis.versionMismatchesDetected++;
                    }
                    let semVerKey = packg.dependencies[depName].match(/^[^0-9]/);
                    lclThis.PackageReports[pack][depName].semVerKey = semVerKey.length > 0 ? semVerKey[0] : '';
                  });
                }
              });
            } else {
              console.log('ERROR PROCESSING: ' + pack);
              console.log('Package lock file does not exist.');
              filesScanned++;
              if (filesScanned >= totalFiles) {
                lclThis.isLoadingBarDisplayed = false;
              }
            }
          }
        });
      }
    },
    SyncSelectedPackages: function () {
      const fs = this.nw.require('fs');
      let lclThis = this;
      let files = Object.keys(this.itemsToUpdate);
      let doneCount = 0;
      this.isLoadingBarDisplayed = true;
      files.forEach(file => {
        let packagesToUpdate = this.itemsToUpdate[file];
        console.log(JSON.stringify(packagesToUpdate, '', 2));
        fs.readFile(file, { encoding: 'utf-8' }, (err, data) => {
          if (err) {
            console.log(err);
          } else {
            let packg = JSON.parse(data);
            let dependencies = packg.dependencies;
            packagesToUpdate.forEach(dep => {
              dependencies[dep.PackageName] = dep.semVerKey + dep.installedVersion;
            });
            fs.writeFile(file, JSON.stringify(packg, '', 2) + '\r\n', {
              enconding: 'utf-8'
            }, (err)=>{
              if (err) {
                console.log(err);
              } else {
                doneCount++;
              }
            });
          }
        });
      });
      let doneChecker = setInterval(function () {
        if (doneCount == files.length) {
          lclThis.isLoadingBarDisplayed = false;
          lclThis.ScanForPackages();
          clearInterval(doneChecker);
        } else {
          console.log('Still updating versions...');
        }
      }, 100);
    },
    UpdateSelected: function (data) {
      // Package to modify is data.packPath
      // Selected for that package is data.selected
      if (data.selected.length > 0) {
        this.itemsToUpdate[data.packPath] = data.selected;
      } else {
        delete this.itemsToUpdate[data.packPath];
      }
      this.filesToSync = Object.keys(this.itemsToUpdate).length;
      let keys = Object.keys(this.itemsToUpdate);
      let packageCount = 0;
      keys.forEach(key => {
        packageCount += this.itemsToUpdate[key].length;
      });
      this.packagesToSync = packageCount;
    }
  },
  watch: {
    currentProject: function (newValue) {
      if (newValue !== '') {
        this.ScanForPackages();
      }
    },
    versionMismatchesDetected: function (newValue) {
      if (newValue !== 0) {
        this.$emit('mismatches-detected', 'Sync Package.json', newValue);
      }
    }
  }
};
</script>

<style>

</style>