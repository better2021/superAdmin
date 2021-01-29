/**
 * 桌面消息通知
 */

let notification = {};

notification.install = function (app, options) {
  app.config.globalProperties.$notification = (title, options) => {
    // 先检查浏览器是否支持
    if (!("Notification" in window)) {
      alert("很抱歉当前浏览器不支持桌面通知！");
    } else if (Notification.permission === "granted") {
      // 检查用户是否同意接受通知
      notification = new Notification(title, options);
      notification.onclick = function () {
        window.focus();
      };
    } else if (Notification.permission !== "denied") {
      // 否则我们需要向用户获取权限
      Notification.requestPermission(function (permission) {
        // 如果用户同意，就可以向他们发送通知
        if (permission === "granted") {
          console.log("用户同意授权");
          notification = new Notification(title, options);
          notification.onclick = function () {
            window.focus();
          };
        } else if (permission === "default") {
          console.warn("用户关闭授权 未刷新页面之前 可以再次请求授权");
        } else {
          // denied
          console.log("用户拒绝授权 不能显示通知");
        }
      });
    } else {
      // denied 用户拒绝
      console.log("用户曾经拒绝显示通知");
    }
  };
};

export default notification;
