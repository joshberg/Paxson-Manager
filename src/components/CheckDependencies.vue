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
          <md-table-head>Latest Version</md-table-head>
          <md-table-head>Packages Affected</md-table-head>
          <md-table-head>Repository</md-table-head>
          <check-dep-obj 
            v-for="(dep,index) in DepNames"
            :packageName="dep"
            :version="Dependencies[dep].packageVersion"
            :latest="Dependencies[dep].latest ? Dependencies[dep].latest : Dependencies[dep].packageVersion"
            :dependency="Dependencies[dep]"
            :repo="Dependencies[dep].url"
            :finishedLoading="DependenciesFinished[index]"
            :key="dep" 
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
    DependenciesFinished: [],
    outOfDateCount: 0
  }),
  methods: {
    GetProjectDependencies: function () {
      this.PackageJSONs = [];
      this.Dependencies = {};
      this.DepNames = [];
      this.DependenciesFinished = [];
      this.$emit('outOfDate-detected', 'Check Dependencies', 0);


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
              // eslint-disable-next-line no-prototype-builtins
              if (!lclThis.Dependencies.hasOwnProperty(depName)) {
                lclThis.Dependencies[depName] = { 
                  url:'', 
                  packageVersion: packg.dependencies[depName].substring(1),
                  depended: [packg.name]
                };
                lclThis.DepNames.push(depName);
                lclThis.DepNames.sort();
              } else {
                lclThis.Dependencies[depName].depended.push(packg.name);
              }
            });
          }
        });
      }
      let filesScannedListener = setInterval(function () {
        if (filesScanned >= totalFiles) {
          clearInterval(filesScannedListener);
          lclThis.GetRepos();
          lclThis.GetLatestVersions();
        }
      }, 200);
    },
    GetRepos: function () {
      console.log('Executing GetRepos');
      const repoURL = this.nw.require('get-repository-url');
      let lclThis = this;
      console.log(this.DepNames);
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
      this.outOfDateCount = 0;
      this.isLoadingBarDisplayed = true;
      const spawn = this.nw.require('child_process').spawn;
      let lclThis = this;
      let dataOut = '';
      let errorOut = '';
      let foldersChecked = 0;
      let folderCount = this.PackageJSONs.length;
      this.PackageJSONs.forEach((packFile) => {
        let packFolder = packFile.replace('\\package.json', '');
        let bat = spawn('npm outdated', {
          shell: true,
          cwd: packFolder
        });
        bat.stdout.on('data', (data) => {
          dataOut += data.toString();
        });
        bat.stderr.on('data', (data) => {
          errorOut += data.toString();
        });
        bat.on('close', () => {
          foldersChecked++;
          if (foldersChecked >= folderCount) {
            lclThis.isLoadingBarDisplayed = false;
          }
          if (errorOut.length > 0) {
            console.log('Error processing path: ', packFolder);
            console.log(errorOut);
          }
        });
      });
      let npmOutdatedInterval = setInterval(function () { 
        if (foldersChecked >= folderCount) {
          clearInterval(npmOutdatedInterval);
          let lines = dataOut.split('\n');
          lines.forEach(line => {
            if (!line.includes('Package')) {
              let words = line.match(/\S+(\s||$)/g);
              if (words !== null) {
                let pckg = words[0].trim();
                let latest = words[3].trim();
                if (lclThis.DepNames.includes(pckg)) {
                  // eslint-disable-next-line no-prototype-builtins
                  if (!lclThis.Dependencies[pckg].hasOwnProperty('latest')) {
                    lclThis.Dependencies[pckg].latest = latest;
                    let index = lclThis.DepNames.indexOf(pckg);
                    lclThis.DependenciesFinished.splice(index, 1, true);
                    lclThis.outOfDateCount++;
                  }
                }
              }
            }
          });
        }
      }, 200);
    }
  },
  watch: {
    currentProject: function (newValue) {
      if (newValue !== '') {
        this.GetProjectDependencies();
      }
    },
    outOfDateCount: function (newValue) {
      if (newValue !== 0) {
        this.$emit('outOfDate-detected', 'Check Dependencies', newValue);
      }
    },
    isLoadingBarDisplayed: function (newValue) {
      this.$emit('background-processing', 'Check Dependencies', newValue);
    }
  }
};                
</script>

<style>

</style>