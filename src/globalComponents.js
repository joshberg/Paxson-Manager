import VueMaterial from 'vue-material';
import 'vue-material/dist/vue-material.min.css';
import 'vue-material/dist/theme/default-dark.css';
import mdiVue from 'mdi-vue/v2';
import * as mdijs from '@mdi/js';

/**
 * You can register global components here and use them as a plugin in your main Vue instance
 */

const GlobalComponents = {
  // eslint-disable-next-line no-restricted-syntax
  install (Vue) {
    Vue.use(VueMaterial);
    Vue.use(mdiVue, {
      icons: mdijs
    });
  }
};

export default GlobalComponents;
