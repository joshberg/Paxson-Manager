<template>
  <div>
    <form>
      <md-card class="md-layout-item md-size-100">
        <md-card-header class="md-layout">
          <h3 class="md-title md-layout-item md-size-30" style="display: inline">Project Settings</h3>
          <div class="md-layout">
            <md-button 
              class="md-raised md-accent md-layout-item" 
              @click="deleteProjectDialogShowing = true"
            >Delete Project from Manager</md-button>
            <md-button 
              class="md-raised md-primary md-layout-item" 
              @click="renameProjectDialogShowing = true"
            >Rename Project</md-button>
            <md-button 
              class="md-raised md-primary md-layout-item" 
              @click="newProjectDialogShowing = true"
            >New Project</md-button>
          </div>
        </md-card-header>
        <md-card-content>
          <md-field>
            <label for="ProjectName">Project Name</label>
            <md-select
              v-model="ProjectName"
              id="ProjectName"
              name="ProjectName"
              placeholder="Select a project or add a New Project"
              @md-selected="switchProjects"
            >
              <md-option v-for="(project, index) in projects" :value="project" :key="index">{{ project }}</md-option>
            </md-select>
          </md-field>
          <md-field>
            <label for="ProjectPath">Project Path</label>
            <md-file
              id="ProjectPath"
              name="ProjectPath"
              type="file"
              :placeholder="ProjectPath"
              :nwdirectory="true"
              @change="getProjectPath"
              ref="mdfile"
            />
          </md-field>
          <md-chips 
            v-model="PackagePathExclusions"
            id="PackagePathExclusions" 
            name="PackagePathExclusions"  
            mdPlaceholder="Add paths to exclude like node_modules..."
          />
        </md-card-content>
      </md-card>
    </form>
    <md-dialog-prompt
      v-model="newProjectName"  
      :mdActive.sync="newProjectDialogShowing"
      mdTitle="What is the project name?"
      mdInputPlaceholder="Type the name..."
      mdConfirmText="Save"
      mdCancelText="Cancel"
      @md-confirm="saveProjectName"
    />
    <md-dialog-prompt
      v-model="newProjectName"  
      :mdActive.sync="renameProjectDialogShowing"
      mdTitle="What is the selected project's new name?"
      mdInputPlaceholder="Type the name..."
      mdConfirmText="Save"
      mdCancelText="Cancel"
      @md-confirm="renameProject"
    />
    <md-dialog-prompt
      v-model="newProjectName"  
      :mdActive.sync="deleteProjectDialogShowing"
      mdTitle="Confirm the name of the project to delete:"
      mdInputPlaceholder="Type the name..."
      mdConfirmText="DELETE"
      mdCancelText="Cancel"
      @md-confirm="deleteProject"
    />
  </div>
</template>

<script>
export default {
  name: 'AppSettings',
  emits: ['project-switch'],
  data: () => ({
    ProjectName: '',
    ProjectPath: '',
    newProjectDialogShowing: false,
    renameProjectDialogShowing: false,
    deleteProjectDialogShowing: false,
    newProjectName: null,
    projects: [],
    settings: {},
    PackagePathExclusions: []
  }),
  methods: {
    switchProjects: function () {
      console.log('switching projects');
      let s = this.settings[this.ProjectName];
      console.log(JSON.stringify(s, '', 2));
      this.ProjectPath = s.ProjectPath == undefined ? '' : s.ProjectPath;
      this.PackagePathExclusions = s.PackagePathExclusions == undefined ? [] : s.PackagePathExclusions;

      global.settings = s;
      if (this.ProjectPath !== '') {
        this.$emit('project-switch', this.ProjectName);
      }
    },
    getProjectPath: function () {
      let files = document.querySelector('input[type=file]').files;
      this.ProjectPath = files[0].path;
      // TODO: Figure out how to get rid of the folder name after the folder selection.
      this.saveProjectSettings();
    },
    saveProjectSettings: function () {
      let settingsBlob = JSON.stringify(this.settings, '', 2);
      this.FS.writeFileSync(this.SETTINGS_FILE_PATH, settingsBlob, { encoding: 'utf-8' });
    },
    loadProjectList: function () {
      console.log('loading project list');
      if (this.FS.existsSync(this.SETTINGS_FILE_PATH)) {
        let settingsBlob = this.FS.readFileSync(this.SETTINGS_FILE_PATH);
        settingsBlob = JSON.parse(settingsBlob);
        this.settings = settingsBlob;
        let props = Object.keys(settingsBlob);
        this.projects = props;
      }
    },
    saveProjectName: function () {
      console.log('saving project name');
      this.projects.push(this.newProjectName);
      this.settings[this.newProjectName] = {};
      this.ProjectName = this.newProjectName;
      this.newProjectName = null;
      this.saveProjectSettings();
    },
    renameProject: function () {
      console.log('renaming project');
      let indexOfProject = this.projects.indexOf(this.ProjectName);
      let copyOfObj = JSON.parse(JSON.stringify(this.settings[this.ProjectName]));
      delete this.settings[this.ProjectName];
      this.projects[indexOfProject] = this.newProjectName;
      this.ProjectName = this.newProjectName;
      this.settings[this.ProjectName] = copyOfObj;
      this.newProjectName = null;
      this.saveProjectSettings();
    },
    deleteProject: function () {
      console.log('deleting project');
      let indexOfProject = this.projects.indexOf(this.ProjectName);
      if (this.ProjectName === this.newProjectName) {
        this.projects.splice(indexOfProject, 1);
        delete this.settings[this.ProjectName];
        this.newProjectName = null;
        this.ProjectName = null;
        this.ProjectPath = null;
        this.PackagePathExclusions = [];
        this.saveProjectSettings();
      }
    }
  },
  watch: {
    ProjectPath (newPath) {
      this.settings[this.ProjectName].ProjectPath = newPath;
      this.saveProjectSettings();
    },
    PackagePathExclusions (newValue) {
      this.settings[this.ProjectName].PackagePathExclusions = newValue;
    }
  },  
  created () {
    this.SETTINGS_FILE_PATH = '.\\settings.json';
    this.FS = this.nw.require('fs');
    this.loadProjectList();
  }
};
</script>

<style lang="scss" scoped>
.flt-right{
  float: right;
}
.ml1{
  margin-left: 1em;
}
</style>