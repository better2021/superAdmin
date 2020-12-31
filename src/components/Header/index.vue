<template>
  <div id="header">
    <div class="marquee">
      <Marquee :data="arr" :speed="speed"></Marquee>
    </div>
    <div class="tipBox">
      <el-color-picker
        v-model="color"
        :predefine="predefineColors"
        size="mini"
        @change="handleChange"
      >
      </el-color-picker>
      <span
        >欢迎您，<i :style="{ color: color }"> {{ userName }}</i></span
      >
      <el-avatar size="small" :src="imgUrl" class="userIcon"></el-avatar>
      <el-button size="mini" type="primary" @click="handleOut">退出登录</el-button>
    </div>
  </div>
</template>

<script>
import Marquee from "/@/components/Marquee/index.vue";
export default {
  components: {
    Marquee,
  },
  data() {
    return {
      userName: "",
      imgUrl: "",
      color: "#545c64",
      predefineColors: [
        "#545c64",
        "#8FCDDA",
        "#5f9da3",
        "#463750",
        "#2a2b3d",
        "#4A3F55",
        "#283c5f",
        "#ad1341",
        "#c55c66",
        "#4aa9a4",
        "#2089a5",
      ],
      arr: [],
      speed: 10,
    };
  },
  mounted() {
    let userInfo = this.$store.getters.userInfo;
    this.userName = userInfo.name || "";
    this.imgUrl = userInfo.imgUrl || "/images/unnamed.jpg";
    this.color = userInfo ? userInfo.themeColor || "#545c64" : "#545c64";
    this.getData();
  },
  methods: {
    // 退出登录
    handleOut() {
      this.$store.dispatch("loginOut");
      this.$router.replace({ path: "/login" });
    },
    // 获取跑马灯内容
    async getData() {
      try {
        let res = await this.$axios({
          url: `/api`,
          methodL: "GET",
        });
        const array = ["message", "time", "week"];
        this.arr = array.map((o) => res[o]);
      } catch (err) {
        console.log(err);
      }
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

<style lang="scss" scoped>
#header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .marquee {
    width: 30%;
    color: rgb(255, 102, 0);
  }
  .tipBox {
    margin: 20px 0;
    display: flex;
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
