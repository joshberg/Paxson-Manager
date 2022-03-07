<template>
  <div v-html="html" :class="{console:true, overflow: content!='TEST WAS NOT SELECTED TO RUN' }">
  </div>
</template>

<script>
import AnsiUp from 'ansi_up';

export default {
  name: 'ConsoleWindow',
  props: {
    folder: {
      type: String,
      default: ''
    },
    testToRun: {
      type: String,
      default: 'NOTATEST'
    },
    willRunThisTest: {
      type: Boolean,
      default: false
    },
    killProcess: {
      type: Boolean,
      default: false
    },
    runTest: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      ansi: undefined,
      content: '',
      bat: undefined,
      testRunning: false
    };
  },
  methods: {
    runTestToConsole: function () {
      this.content = '';
      if (this.willRunThisTest) {
        if (!this.testRunning) {
          this.testRunning = true;
          console.log('RunTest triggered for test: ', this.folder, this.testToRun);
          const spawn = this.nw.require('child_process').spawn;
          this.bat = spawn('npm test ' + this.testToRun, {
            shell: true,
            cwd: this.folder
          });
          this.bat.stdout.on('data', (data) => {
            this.content += data.toString();
          });
          this.bat.stderr.on('data', (data) => {
            this.content += data.toString();
          });
          this.bat.on('close', () => {
            this.testRunning = false;
            this.content += '\nCOMMAND COMPLETED';
          });
        }
      } else {
        this.content = 'TEST WAS NOT SELECTED TO RUN';
      }
    }
  },
  computed: {
    html () {
      return this.ansi.ansi_to_html(this.content).replace(/\n/gm, '<br>');
    }
  },
  watch: {
    runTest: function () {
      this.runTestToConsole();
    },
    killProcess: function () {
      this.bat.kill('SIGINT');
    }
  },
  beforeMount () {
    this.ansi = new AnsiUp();
  },
  // mounted () {
  //   window.shell = this;
  // },
  updated () {
    this.$el.scrollTop = this.$el.scrollHeight;
  }
};
</script>

<style lang="scss" scoped>
.console {
  font-family: 'Roboto Mono', monospace;
  text-align: left;
  background-color: black;
  color: #fff;
}
.overflow {
  overflow-x: scroll;
}
</style>