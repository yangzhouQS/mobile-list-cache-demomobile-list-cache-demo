import history from './history.js';
import config from './config/config.js';

const eventRegister = router => {
  const routerPush = router.push.bind(router);
  const routerGo = router.go.bind(router);
  const routerReplace = router.replace.bind(router);
  const routerBack = router.back.bind(router);
  const routerForward = router.forward.bind(router);

  window.addEventListener('popstate', () => {
    console.log('start - history.action',history.action);
    console.log('你点击了浏览器的后退按钮或者调用了 history.back() 方法！');
    history.action = config.backName;
    console.log('end - history.action',history.action);
  });

  window.addEventListener('pushState', () => {
    console.log('你点击了浏览器的后退按钮或者调用了 pushState() 方法！');
  });

  router.push = to => {
    history.action = config.pushName;
    return routerPush(to);
  };

  router.go = n => {
    if (n > 0) {
      history.action = config.forwardName;
    }
    if (n < 0) {
      history.action = config.backName;
    }
    history.n = n;
    routerGo(n);
  };

  router.replace = to => {
    history.action = config.replaceName;
    return routerReplace(to);
  };

  router.back = () => {
    history.action = config.backName;
    history.n = -1;
    routerBack();
  };

  router.forward = () => {
    history.action = config.forwardName;
    routerForward();
  };
};

export default eventRegister;
