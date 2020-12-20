<template>
  <div id="wrapHome">
    <el-tabs v-model="activeName" type="card">
      <el-tab-pane label="用户管理" name="user">
        <Home v-show="activeName === 'user'"></Home>
      </el-tab-pane>
      <el-tab-pane label="IP白名单" name="ip">
        <IP v-show="activeName === 'ip'"></IP>
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
