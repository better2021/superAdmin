<template>
  <div id="wrapHome">
    <el-tabs v-model="activeName" type="card">
      <el-tab-pane label="用户管理" name="user">
        <!-- 失活的组件将会被缓存！-->
        <keep-alive>
          <Home v-show="activeName === 'user'"></Home>
        </keep-alive>
      </el-tab-pane>
      <el-tab-pane label="IP白名单" name="ip">
        <!-- 失活的组件将会被缓存！-->
        <keep-alive>
          <IP v-show="activeName === 'ip'"></IP>
        </keep-alive>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import Home from "./home.vue";
import IP from "./ip.vue";

export default {
  components: {
    Home,
    IP,
  },
  data() {
    return {
      activeName: "user",
    };
  },
};
</script>
