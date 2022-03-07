<template>
  <md-card class="md-layout-item md-size-100">
    <md-card-header>
      <md-checkbox v-model="allSelected" />
      <h4 class="md-title" style="display:inline;">{{ packageFolder }}</h4>
    </md-card-header>
    <md-list>
      <md-list-item 
        v-for="(test, index) in tests" 
        class="md-layout"
        :key="index"
      >
        <md-checkbox v-model="testsSelected[index]" class="md-layout-item md-size-5" />
        <span class="md-layout-item md-size-15">{{ test }}</span>
        <div class="md-layout-item md-size-80 console-output">
          <console-test-window 
            :folder="packageFolder" 
            :testToRun="test" 
            :willRunThisTest="testsSelected[index]" 
            :runTest="runTestsNow" 
          />
        </div>
      </md-list-item>
    </md-list>
  </md-card>
</template>

<script>
import ConsoleTestWindow from './ConsoleTestWindow.vue';
export default {
  name: 'TestItem',
  components: { ConsoleTestWindow },
  props: {
    packageFolder: {
      type: String,
      default: ''
    },
    totalTests: {
      type: Number,
      default: 0
    },
    runTestsNow: {
      type: Boolean,
      default: false
    }
  },
  data: ()=>({
    tests: [],
    testsSelected: [],
    itemsToSkip: [],
    allSelected: false
  }),
  methods: {
    GetAllTests: function (dirPath, arrayOfFiles) {
      let fs = this.nw.require('fs');
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
          arrayOfFiles = lclThis.GetAllTests (dirPath + '/' + file, arrayOfFiles);
        } else if (file.includes('.test')) {
          arrayOfFiles.push(file);
        }
      });

      return arrayOfFiles;
    }
  },
  watch: {
    testsSelected: function () {
      let testsToRun = [];
      for (let i = 0; i < this.tests.length; i++) {
        if (this.testsSelected[i]) {
          testsToRun.push(this.tests[i]);
        }
      }
      this.$emit('tests-selected', testsToRun, this.packageFolder);
    },
    allSelected: function (selectedValue) {
      if (selectedValue) {
        this.testsSelected.fill(true);
      } else { 
        this.testsSelected.fill(false);
      }
    },
    runTestsNow: function () {
      console.log('RunTestsNow triggered at middle level.');
    }
  },
  created: function () {
    if (Object.prototype.hasOwnProperty.call(global.settings, 'PackagePathExclusions')) {
      if (global.settings.PackagePathExclusions.length > 0) {
        this.itemsToSkip = global.settings.PackagePathExclusions;
      }
    }  
    // Tests should be located in packagefolder/tests
    this.tests = this.GetAllTests(this.packageFolder);
    if (this.tests.length == 0) {
      this.$emit('no-tests-found', this.packageFolder);
    }
    this.testsSelected = new Array(this.tests.length);
  }
};
</script>

<style scoped>
.console-output {
  max-height: 20em;
  overflow-y: scroll;
}
.linebreaks {
  white-space:pre;
}
</style>