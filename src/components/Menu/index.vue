<template>
  <div id="menu">
    <el-menu :default-active="this.$route.path" class="el-menu-vertical-demo" :background-color="bgColor" text-color="#fff" active-text-color="#ffd04b">
      <div v-for="(item, index) in routes" :key="index" @click="goPath(item)">
        <el-menu-item v-if="!item.hidden" :index="item.path" :style="{ background: bgColor }">
          <i :class="item.icon"></i>
          <template #title>{{ item.name }}</template>
        </el-menu-item>
      </div>
    </el-menu>
  </div>
</template>

<script>
export default {
  props: {
    bgColor: {
      type: String,
      default: "#545c64",
    },
  },
  data() {
    return {
      routes: this.$router.options.routes,
    };
  },
  created() {
    // console.log(this.routes);
  },
  methods: {
    goPath(item) {
      this.$router.push({ path: item.path });
    },
  },
};
</script>

<style lang="scss" scope>
#menu {
  width: 200px;
  height: 100vh;
  background: rgb(84, 92, 100);
  overflow: hidden;
  .el-menu-vertical-demo {
    height: 100vh;
  }
}
</style>
