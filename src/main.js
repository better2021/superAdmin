import { createApp } from "vue";
import router from "/@/router/index";
import store from "/@/store/index";
import axios from "/@/utils/axios";
import ElementPlus from "element-plus"; // 完整引入 也可以按需引入
import NProgress from "nprogress";
import lazyPlugin from "vue3-lazy";
import App from "/@/App.vue";

import "/@/style.scss"; // 公告样式
import "element-plus/lib/theme-chalk/index.css";
import "nprogress/nprogress.css";

const app = createApp(App);

NProgress.configure({ easing: "ease", speed: 500, showSpinner: true });

router.beforeEach((to, from, next) => {
  NProgress.start(to, from, next);
  next();
});

router.afterEach((transition) => {
  NProgress.done();
});

// 桌面通知
import Notification from "/@/utils/notice";
app.use(Notification);

/**
 * 正式环境不出现console打印,警告等
 */

const isDev = /^(192\.168|localhost)/.test(window.location.host);
if (!isDev) {
  console.log = () => {};
  console.info = () => {};
  console.warn = () => {};
}

// 在vue3中添加全局属性
app.config.globalProperties.$axios = axios;
app.use(router); // 使用路由
app.use(store); // 使用状态管理
app.use(ElementPlus); // 使用ElementPlus组件库
app.use(lazyPlugin, {
  loading: "/images/loading.gif",
  error: "/images/error.png",
});

app.mount("#app"); // 挂载到id为app的元素上

/* createApp(App).use(ElementPlus).mount('#app') */ // 链式写法
