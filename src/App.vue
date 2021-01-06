<template>
  <Menu v-if="isShow" :bgColor="color"></Menu>
  <div id="warp">
    <Header v-if="isShow"></Header>
    <router-view />
  </div>
</template>

<script>
import Menu from "/@/components/Menu/index.vue";
import Header from "/@/components/Header/index.vue";

export default {
  name: "App",
  components: {
    Menu,
    Header,
  },
  data() {
    return {
      isShow: false,
    };
  },
  computed: {
    color() {
      return this.$store.getters.userInfo.themeColor || "#545C64";
    },
  },
  watch: {
    $route(to, from) {
      this.getPath();
      if (from.path === "/login" && to.path !== "/register") {
        this.$notify({
          type: "success",
          title: "登录成功",
          message: "欢迎您再次光临哦",
          position: "bottom-right",
          offset: 100,
        });
      }
    },
  },
  methods: {
    getPath() {
      let path = this.$route.path;
      let pathArr = ["/login", "/register"];
      if (pathArr.includes(path)) {
        this.isShow = false;
      } else {
        this.isShow = true;
      }
    },
  },
};
</script>

<style lang="scss">
#warp {
  width: 100%;
  height: 100vh;
  box-sizing: border-box;
  padding: 20px;
  overflow-y: auto;

  /*滚动条整体部分*/
  &::-webkit-scrollbar {
    width: 8px;
    height: 5px;
    background: #fcfae9;
  }
  /*滚动条里面可以拖动的那个*/
  &::-webkit-scrollbar-thumb {
    border-radius: 3px;
    background-color: #2089a5;
    background-image: -webkit-linear-gradient(
      45deg,
      hsla(0, 0%, 100%, 0.4) 25%,
      transparent 0,
      transparent 50%,
      hsla(0, 0%, 100%, 0.4) 0,
      hsla(0, 0%, 100%, 0.4) 75%,
      transparent 0,
      transparent
    );
  }
  /* 外层轨道*/
  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
}
</style>
