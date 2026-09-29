import { VuePageStack } from './components/VuePageStack.js';
import eventRegister from './eventRegister.js';
import history from './history.js';
import config from './config/config.js';
import DetectBrowserNavigationInVueRouter from 'detect-browser-navigation-in-vue-router';

const backCallback = n => {
  history.n = n;
  history.action = config.backName;
  // console.log('browser back', n);
};

const forwardCallback = n => {
  history.n = n;
  history.action = config.forwardName;
  // console.log('browser forward', n);
};

const VuePageStackPlugin = {
  install(app, { router }) {
    if (!router) {
      throw Error('\n vue-router is necessary. \n\n');
    }
    app.component(config.componentName, VuePageStack);

    app.use(DetectBrowserNavigationInVueRouter, { router, backCallback, forwardCallback });

    eventRegister(router);
  }
};

export { VuePageStackPlugin, VuePageStack };
