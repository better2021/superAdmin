<template>
  <div id="chat">
    <div class="chatRoom">
      <div class="leftList">
        <ul>
          <li v-for="item in roomList" :key="item.id">
            <img :src="item.imgUrl" alt="" />
            <span>{{ item.title }}</span>
          </li>
        </ul>
      </div>
      <div class="rightRoom">
        <div class="roomTop">这个头部</div>
        <div class="roomBottom">
          <img src="/images/image.png" class="img" alt="" />
          <el-input
            type="text"
            placeholder="请输入内容"
            v-model="content"
            class="textContent"
            ref="elInput"
          >
          </el-input>
          <i class="el-icon-s-promotion send" @click="handleSend"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      roomList: [],
      ImSocket: null,
      content: "",
    };
  },
  created() {
    this.getRoomList();
    this.ImSocket = new WebSocket(`${this.$axios.defaults.wsURL}/api/ws`);
    this.initIM(); // 初始化
  },
  mounted() {
    this.$refs.elInput.focus();
  },
  unmounted() {
    this.ImSocket.close();
    this.ImSocket = null;
  },
  methods: {
    async getRoomList() {
      try {
        let res = await this.$axios({
          url: "/api/roomList",
          method: "get",
        });
        console.log(res);
        this.roomList = res.rooms;
      } catch (err) {
        console.log(err);
      }
    },
    // 初始化IM
    initIM() {
      this.wsOpen();
      this.wsMessage();
      this.wsClose();
      this.wsError();
    },
    // ws打开连接
    wsOpen() {
      this.ImSocket.onopen = () => {
        const data = { content: "websocket已开启" };
        this.ImSocket.send(JSON.stringify(data));
      };
    },
    // ws消息处理
    wsMessage() {
      this.ImSocket.onmessage = (event) => {
        let data = event.data;
        console.log(data);
      };
    },
    // ws关闭
    wsClose() {
      this.ImSocket.onclose = () => {
        const data = {
          content: "websocket已关闭",
        };
        this.ImSocket.send(JSON.stringify(data));
      };
    },
    // ws错误处理
    wsError() {
      this.ImSocket.onerror = (event) => {
        let data = event.data;
        console.log("err", data);
      };
    },
    // 发送消息
    handleSend() {
      let data = { content: this.content };
      this.ImSocket.send(JSON.stringify(data));
    },
  },
};
</script>

<style lang="scss" scoped>
@import "./index.scss";
</style>
<style lang="scss">
.roomBottom {
  .el-input__inner {
    border: none;
    padding: 0 5px;
  }
}
</style>
