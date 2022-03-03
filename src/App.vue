<template>
  <div id="app" class="page-container">
    <md-app>
      <md-app-toolbar class="md-primary" mdElevation="0">
        <span class="md-title">{{ title }}</span>
      </md-app-toolbar>

      <md-app-drawer mdPermanent="full">
        <md-toolbar class="" mdElevation="0">
          <div class="">Current Project:</div>
          <div class="md-title">{{ currentProject }}</div>
        </md-toolbar>

        <md-list v-for="(navi, index) in navItems" :key="index">
          <md-list-item @click="showAction(navi.text)">
            <mdicon :name="navi.icon" />
            <span class="md-list-item-text">{{ navi.text }}</span>
            <md-badge v-if="navi.notices" class="md-square" :mdContent="navi.notices" />
          </md-list-item>
        </md-list>  
      </md-app-drawer>

      <md-app-content>
        <app-settings v-show="appSettingsVisible" @project-switch="reloadActivities" />
        <sync-packages v-show="syncPackagesVisible" :currentProject="currentProject" @mismatches-detected="updateNotices" />
        <check-dependencies v-show="checkDependenciesVisible" :currentProject="currentProject" />
      </md-app-content>
    </md-app>
  </div>
</template>

<script>
import appSettings from './components/AppSettings.vue';
import syncPackages from './components/SyncPackages.vue';
import checkDependencies from './components/CheckDependencies.vue';

export default {
  name: 'App',
  components: {
    appSettings,
    syncPackages,
    checkDependencies
  },
  data: () => ({
    currentProject: '',
    title: 'Settings',
    appSettingsVisible: true,
    syncPackagesVisible: false,
    checkDependenciesVisible: false,
    navItems: [
      {
        icon: 'cog',
        text: 'Settings'
      },
      {
        icon: 'package-variant',
        text: 'Sync Package.json'
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
          break;
        case 'Test Packages':
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
      console.log(obj);
      obj[0].notices = notices;
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
  min-height: 70vh;
  border: 1px solid rgba(#000, 0.12);
}

// Demo purposes only
.md-drawer {
  width: 250px;
  max-width: calc(100vw - 125px);
}
</style>