<template>
  <div id="chat">
    <div class="chatRoom">
      <div class="leftList">
        <ul>
          <li v-for="item in roomList" :key="item.id" @click="SelectRoom(item)">
            <img :src="item.imgUrl" alt="" />
            <span>{{ item.title }}</span>
          </li>
        </ul>
      </div>
      <div class="rightRoom">
        <div class="roomTop">这个头部</div>
        <div class="middleRoom">
          <ul>
            <li
              v-for="(item, index) in chatMsgList"
              :key="index"
              :class="[userInfo.userId === item.uid ? 'self' : 'other']"
            >
              <img :src="item.img_url" class="imgUrl" />
              <div class="msgBox">
                <h5>
                  <span>{{ item.username }}</span> <span>{{ item.time }}</span>
                </h5>
                <p>{{ item.content }}</p>
              </div>
            </li>
          </ul>
        </div>
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
import WebsocketHeartbeatJs from "websocket-heartbeat-js";
export default {
  data() {
    return {
      options: {
        url: `${this.$axios.defaults.wsURL}/api/ws`, // websocket服务端接口地址
        pingTimeout: 8000, // 每隔8秒发送一次心跳，如果收到任何后端消息定时器将会重置
        pongTimeout: 10000, // ping消息发送之后，10秒内没收到后端消息便会认为连接断开
        reconnectTimeout: 2000, // 尝试重连的间隔时间
        pingMsg: "heartbeat", // ping消息值
        repeatLimit: 3, // 重连尝试次数
      },
      roomList: [],
      ImSocket: null,
      content: "",
      userInfo: this.$store.getters.userInfo || {},
      room_id: "1",
      to_uid: "0", // 默认为0，表示群聊
      chatMsgList: [],
    };
  },
  created() {
    this.getRoomList();
    this.ImSocket = new WebsocketHeartbeatJs(this.options);
    this.initIM(); // 初始化
  },
  mounted() {
    this.$refs.elInput.focus();
    document.onkeyup = (e) => {
      e.stopPropagation();
      if (e.keyCode === 13) {
        this.handleSend();
      }
    };
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
        const data = {
          status: 1, // 用户上线
          data: {
            uid: this.userInfo.userId,
            img_url: this.userInfo.imgUrl,
            room_id: this.room_id,
            username: this.userInfo.name,
            content: "websocket已开启",
          },
        };
        this.ImSocket.send(JSON.stringify(data));
      };
    },
    // ws消息处理
    wsMessage() {
      this.ImSocket.onmessage = (event) => {
        const res = JSON.parse(event.data);
        let status = res.status;
        switch (status) {
          case -1: // 断开连接
            this.ImSocket.close();
            break;
          case 1: // 用户上线
            break;
          case 2: // 离开房间
            break;
          case 3: // 接受消息
            console.log(res.data);
            this.chatMsgList.push(res.data);
            console.log(this.chatMsgList);
            break;
          case 4: // 在线用户
            break;
          case 5: // 私聊通知
            break;
          default:
            console.log(res);
        }
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
    // 选择房间
    SelectRoom(item) {
      this.room_id = String(item.id);
    },
    // 发送消息
    handleSend() {
      if (this.content.trim() == "")
        return this.$message({
          type: "warning",
          message: "发出的信息不能为空哦",
        });
      let data = {
        status: 3, // 群聊发信息
        data: {
          content: this.content,
          room_id: this.room_id,
          username: this.userInfo.name,
          uid: this.userInfo.userId,
          img_url: this.userInfo.imgUrl,
          to_uid: this.to_uid,
        },
      };
      this.ImSocket.send(JSON.stringify(data));
      this.content = ""; // 消息发送后清空输入框
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
