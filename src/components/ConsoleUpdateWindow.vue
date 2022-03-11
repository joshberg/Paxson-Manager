<template>
  <div v-html="html" :class="{console:true, overflow: content!='UPDATE WAS NOT SELECTED TO RUN' }">
  </div>
</template>

<script>
import AnsiUp from 'ansi_up';

export default {
  name: 'ConsoleUpdateWindow',
  props: {
    folder: {
      type: String,
      default: ''
    },
    willRunUpdate: {
      type: Boolean,
      default: false
    },
    killProcess: {
      type: Boolean,
      default: false
    },
    runUpdate: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      ansi: undefined,
      content: '',
      bat: undefined,
      updateRunning: false
    };
  },
  methods: {
    runUpdateToConsole: function () {
      this.content = '';
      if (this.willRunUpdate) {
        if (!this.updateRunning) {
          this.updateRunning = true;
          console.log('RunUpdate triggered for package: ', this.folder);
          const spawn = this.nw.require('child_process').spawn;
          this.bat = spawn('npm update', {
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
        this.content = 'PACKAGE WAS NOT SELECTED TO RUN';
      }
    }
  },
  computed: {
    html () {
      return this.ansi.ansi_to_html(this.content).replace(/\n/gm, '<br>');
    }
  },
  watch: {
    runUpdate: function () {
      this.runUpdateToConsole();
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
/* custom scrollbar */
::-webkit-scrollbar {
  width: 20px;
}

::-webkit-scrollbar-track {
  background-color: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: #d6dee1;
  border-radius: 20px;
  border: 6px solid transparent;
  background-clip: content-box;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #a8bbbf;
}
</style>