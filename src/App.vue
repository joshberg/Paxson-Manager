<template>
  <div class="page-container">
    <md-app>
      <md-app-toolbar class="md-primary" mdElevation="0">
        <md-button v-if="!menuVisible" class="md-icon-button" @click="toggleMenu">
          <md-icon>menu</md-icon>
        </md-button>
        <span class="md-title">
          <span v-if="currentProject.length > 0">{{ currentProject }} - </span>
          {{ title }}
        </span>
      </md-app-toolbar>

      <md-app-drawer :mdActive.sync="menuVisible" mdPersistent="mini">
        <md-toolbar class="md-transparent" mdElevation="0">
          <md-button class="md-icon-button md-dense" @click="toggleMenu">
            <md-icon class="md-size-3x">keyboard_arrow_left</md-icon>
          </md-button>
        </md-toolbar>

        <md-list v-for="(navi, index) in navItems" :key="index">
          <md-list-item @click="showAction(navi.text)">
            <mdicon :name="navi.icon" />
            <span class="md-list-item-text">{{ navi.text }}</span>
            <md-badge v-if="navi.notices" class="md-square" :mdContent="navi.notices" />
          </md-list-item>
          <md-progress-bar v-if="navi.processing" mdMode="indeterminate" />
        </md-list>  
      </md-app-drawer>

      <md-app-content>
        <app-settings v-show="appSettingsVisible" @project-switch="reloadActivities" />
        <sync-packages 
          v-show="syncPackagesVisible" 
          :currentProject="currentProject" 
          @mismatches-detected="updateNotices" 
          @background-processing="updateProcessing" 
        />
        <check-dependencies 
          v-show="checkDependenciesVisible" 
          :currentProject="currentProject" 
          @outOfDate-detected="updateNotices"
          @background-processing="updateProcessing"
        />
        <test-packages
          v-show="testPackagesVisible"
          :currentProject="currentProject"
          @background-processing="updateProcessing"
        />
        <update-packages
          v-show="updatePackagesVisible"
          :currentProject="currentProject"
          @background-processing="updateProcessing"
        />
      </md-app-content>
    </md-app>
  </div>
</template>

<script>
import appSettings from './components/AppSettings.vue';
import syncPackages from './components/SyncPackages.vue';
import checkDependencies from './components/CheckDependencies.vue';
import TestPackages from './components/TestPackages.vue';
import UpdatePackages from './components/UpdatePackages.vue';

export default {
  name: 'App',
  components: {
    appSettings,
    syncPackages,
    checkDependencies,
    TestPackages,
    UpdatePackages
  },
  data: () => ({
    menuVisible: true,
    currentProject: '',
    title: 'Settings',
    appSettingsVisible: true,
    syncPackagesVisible: false,
    checkDependenciesVisible: false,
    testPackagesVisible: false,
    updatePackagesVisible: false,
    navItems: [
      {
        icon: 'cog',
        text: 'Settings'
      },
      { 
        icon: 'spider-web',
        text: 'Check Dependencies'
      },
      {
        icon: 'update',
        text: 'Update Packages'
      },
      {
        icon: 'package-variant',
        text: 'Sync Package.json'
      },
      {
        icon: 'test-tube',
        text: 'Test Packages'
      },
      {
        icon: 'numeric-positive-1',
        text: 'Increment Semvers'
      },
      {
        icon: 'publish',
        text: 'Publish Packages'
      }
    ]
  }),
  methods: {
    toggleMenu: function () {
      this.menuVisible = !this.menuVisible;
    },
    showAction: function (action) {
      this.title = action;
      this.appSettingsVisible = false;
      this.syncPackagesVisible = false;
      this.checkDependenciesVisible = false;
      this.testPackagesVisible = false;
      this.updatePackagesVisible = false;
      switch (action) {
        case 'Settings':
          this.appSettingsVisible = true;
          break;
        case 'Sync Package.json':
          this.syncPackagesVisible = true;
          break;  
        case 'Check Dependencies':
          this.checkDependenciesVisible = true;
          break;
        case 'Update Packages':
          this.updatePackagesVisible = true;
          break;
        case 'Test Packages':
          this.testPackagesVisible = true;
          break;
        case 'Increment Semvers':
          break;
        case 'Publish Packages':
          break;        
      }
    },
    reloadActivities: function (ProjectName) {
      this.currentProject = ProjectName;
    },
    updateNotices: function (text, notices) {
      let obj = this.navItems.filter(bob => {
        return bob.text === text;
      });
      obj[0].notices = notices;
      let index = this.navItems.indexOf(obj[0]);
      this.navItems.splice(index, 1, obj[0]);
    },
    updateProcessing: function (text, processing) {
      let obj = this.navItems.filter(bob => {
        return bob.text === text;
      });
      obj[0].processing = processing;
      let index = this.navItems.indexOf(obj[0]);
      this.navItems.splice(index, 1, obj[0]);
    }
  }
};
</script>

<style lang="scss" scoped>
.md-list {
  width: 400px;
  max-width: 100%;
  display: inline-block;
  vertical-align: top;
  border: 1px solid rgba(#000, .12);
}

.md-list-item-text {
  margin-left: 1em;
}

.md-app {
  max-height: 100vh;
  border: 1px solid rgba(#000, 0.12);
}

// Demo purposes only
.md-drawer {
  width: 250px;
  max-width: calc(100vw - 125px);
}
</style>