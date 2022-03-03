<template>
  <md-card class="md-layout-item md-size-100">
    <md-card-header>
      <div v-if="isLoadingBarDisplayed">
        <md-progress-bar mdMode="indeterminate" />
      </div>
      <md-toolbar class="md-layout md-alignment-center-space-between">
        <md-button
          class="md-layout-item md-raised md-primary"
          @click="GetProjectDependencies"
        >Get Project Dependencies</md-button>
      </md-toolbar>
      <md-card-content>
        <md-table 
          mdCard
        >
          <md-table-head>Dependency Name</md-table-head>
          <md-table-head>Package Version</md-table-head>
          <md-table-head>Repository</md-table-head>
          <check-dep-obj 
            v-for="(dep,index) in DepNames"
            :packageName="dep"
            :version="Dependencies[dep].packageVersion"
            :repo="Dependencies[dep].url"
            :key="index" 
          />
        </md-table>
      </md-card-content>  
    </md-card-header>
  </md-card>
</template>

<script>
import CheckDepObj from './CheckDepObj.vue';
export default {
  name:'CheckDependencies',
  components: { CheckDepObj },
  props: {
    currentProject: {
      type: String,
      default: ''
    }
  },
  data: ()=>({
    Dependencies: {},
    isLoadingBarDisplayed: false,
    DepNames: [],
    PackageJSONs: [],
    DependencyFiles: []
  }),
  methods: {
    GetProjectDependencies: function () {
      this.PackageJSONs = [];

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
        this.isLoadingBarDisplayed = false;
        this.GetDependencies();
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
    GetDependencies: function () {
      console.log('GetDependencies fired.');
      this.isLoadingBarDisplayed = true;
      let fs = this.nw.require('fs');
      let lclThis = this;
      let filesScanned = 0;
      let totalFiles = this.PackageJSONs.length;
      for (let i = 0; i < this.PackageJSONs.length; i++) {
        let pack = this.PackageJSONs[i];
        fs.readFile(pack, {
          encoding: 'utf-8'
        }, (err, data) => {
          if (err) {
            console.log('ERROR PROCESSING: ' + pack);
            console.log(err);
          } else {
            filesScanned++;
            if (filesScanned >= totalFiles) {
              lclThis.isLoadingBarDisplayed = false;
            }
            let packg = JSON.parse(data);
            let deps = packg.dependencies;
            let depNames = Object.keys(deps);
            depNames.forEach(depName => {
              if (!Object.prototype.hasOwnProperty.call(lclThis.Dependencies, depName)) {
                lclThis.Dependencies[depName] = { 
                  url:'', 
                  packageVersion: packg.dependencies[depName].substring(1) 
                };
                lclThis.DepNames.push(depName);
                lclThis.DepNames.sort();
              }
            });
          }
        });
      }
      let filesScannedListener = setInterval(function () {
        if (filesScanned >= totalFiles) {
          console.log('GetDependencies finished. Executing GetDependencyPackages');
          clearInterval(filesScannedListener);
          lclThis.GetRepos();
          lclThis.GetLatestVersions();
        }
      }, 200);
    },
    GetRepos: function () {
      const repoURL = this.nw.require('get-repository-url');
      let lclThis = this;
      this.DepNames.forEach(dep => {
        repoURL(dep, function (err, url) {
          if (err) {
            console.log(err);
          } else {
            lclThis.Dependencies[dep].url = url;
          }
        });
      });
    },
    GetLatestVersions: function () {
      const spawn = this.nw.require('child_process').spawn;
      let dataOut = '';
      let errorOut = '';
      this.PackageJSONs.forEach((packFile) => {
        let packFolder = packFile.replace('package.json', '');
        let bat = spawn('cmd.exe', ['cd "' + packFolder + '"'], {
          shell: true
        });
        bat.stdout.on('data', (data) => {
          dataOut += data.toString();
        });
        bat.stderr.on('data', (data) => {
          errorOut += data.toString();
        });
        bat.on('close', (code) => {
          console.log('Closing code: ', code);
          console.log('DataOut: ');
          console.log(dataOut);
          console.log('-----------');
          console.log('ErrorOut: ');
          console.log(errorOut);
        });
      });
    }
  }
};                
</script>

<style>

</style>