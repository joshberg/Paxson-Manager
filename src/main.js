import Vue from 'vue';

import App from '@/App.vue';
import applyPrototypes from '@/helpers/applyPrototypes.js';

// Plugins
import GlobalComponents from './globalComponents';

Vue.config.productionTip = false;
Vue.use(GlobalComponents);
applyPrototypes(Vue);

// eslint-disable-next-line no-unused-vars
const app = new Vue({
  render: function (hyperscript) {
    return hyperscript(App);
  }
}).$mount('#app');
