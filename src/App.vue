<template>
  <Menu v-if="isShow" :bgColor="color"></Menu>
  <div id="warp">
    <div class="tipBox" v-if="isShow">
      <el-color-picker v-model="color" :predefine="predefineColors" size="mini" @change="handleChange"> </el-color-picker>
      <span
        >欢迎您，<i :style="{ color: color }"> {{ userName }}</i></span
      >
      <el-avatar size="small" :src="imgUrl" class="userIcon"></el-avatar>
      <el-button size="mini" type="primary" @click="handleOut">退出登录</el-button>
    </div>
    <router-view />
  </div>
</template>

<script>
import Menu from "/@/components/Menu/index.vue";

export default {
  name: "App",
  components: {
    Menu,
  },
  data() {
    return {
      isShow: false,
      userName: "",
      imgUrl: "",
      color: "#545c64",
      predefineColors: ["#545c64", "#8FCDDA", "#5f9da3", "#463750", "#2a2b3d", "#4A3F55", "#283c5f", "#ad1341", "#c55c66", "#4aa9a4", "#2089a5"],
    };
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
    // 退出登录
    handleOut() {
      this.$store.dispatch("loginOut");
      this.$router.replace({ path: "/login" });
    },
    getPath() {
      let path = this.$route.path;
      let pathArr = ["/login", "/register"];
      if (pathArr.includes(path)) {
        this.isShow = false;
      } else {
        this.isShow = true;
      }

      let userInfo = this.$store.getters.userInfo;
      this.userName = userInfo.name || "";
      this.imgUrl = userInfo.imgUrl || "/images/unnamed.jpg";
      this.color = userInfo ? userInfo.themeColor || "#545c64" : "#545c64";
      // console.log(this.color, "themeColor");
    },
    // 换主题颜色
    async handleChange(val) {
      console.log(val);
      let userInfo = this.$store.getters.userInfo;
      const userId = userInfo.userId || 1;
      let res = await this.$axios({
        url: `/api/users/${userId}`,
        method: "PUT",
        data: { themeColor: val, password: "123456" },
      });

      if (res.code === 200) {
        this.color = val;
        if (userInfo) {
          userInfo.themeColor = val;
          this.$store.commit("SET_USERINFO", userInfo);
        }
        this.$message({
          type: "success",
          message: "主题已更换",
        });
      } else {
        this.$message({
          type: "error",
          message: res.msg,
        });
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
    background-image: -webkit-linear-gradient(45deg, hsla(0, 0%, 100%, 0.4) 25%, transparent 0, transparent 50%, hsla(0, 0%, 100%, 0.4) 0, hsla(0, 0%, 100%, 0.4) 75%, transparent 0, transparent);
  }
  /* 外层轨道*/
  &::-webkit-scrollbar-track {
    background-color: transparent;
  }

  .tipBox {
    margin: 20px 0;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    &:hover {
      .userIcon {
        animation: rotate 3s linear infinite;
      }
    }
    > span {
      margin: 0px 10px;
    }
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
}
</style>
