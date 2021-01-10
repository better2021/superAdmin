<template>
  <div id="chat">
    <div class="chatRoom">
      <div class="leftList">
        <ul>
          <li v-for="item in roomList" :key="item.id" @click="SelectRoom(item)">
            <img :src="item.imgUrl" alt="" />
            <span>{{ item.title }}</span>
            <i>{{ userCount }}</i>
          </li>
          <div v-for="(todo, index) in userList" :key="index">
            <li @click="SelectUser(todo)" v-if="userInfo.userId !== todo.uid">
              <img :src="todo.img_url" alt="" />
              <span>{{ todo.username }}</span>
            </li>
          </div>
        </ul>
      </div>
      <div class="rightRoom">
        <div class="roomTop">这个头部</div>
        <div class="middleRoom" ref="chatBox">
          <ul v-if="chatMsgList.length !== 0">
            <li
              v-for="(item, index) in chatMsgList"
              :key="index"
              :class="[userInfo.userId === (item.uid || item.user_id) ? 'self' : 'other']"
            >
              <img :src="item.img_url" class="imgUrl" />
              <div class="msgBox">
                <h5>
                  <span>{{ item.username || item.user_name }}</span>
                  <span class="time">{{ formatDate(item.time || item.createAt) }}</span>
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
      UserList: [], //  用户在线用户列表
      userCount: 0, // 在线用户人数
      status: 3,
    };
  },
  created() {
    this.getRoomList();
    this.getRoomHistory();
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
    // 获取房间聊天历史记录
    async getRoomHistory() {
      try {
        let res = await this.$axios({
          url: `/api/room/${this.room_id}`,
          method: "get",
        });
        console.log(res, "--");
        this.chatMsgList = res.msg_list || [];
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
        const dataRoom = {
          status: 1, // 群聊
          data: {
            uid: this.userInfo.userId,
            img_url: this.userInfo.imgUrl,
            room_id: this.room_id,
            username: this.userInfo.name,
            content: "websocket已开启",
          },
        };
        const dataUser = {
          status: 4, // 获取用户列表
          data: {
            uid: this.userInfo.userId,
            img_url: this.userInfo.imgUrl,
            room_id: this.room_id,
            username: this.userInfo.name,
          },
        };
        this.ImSocket.send(JSON.stringify(dataRoom));
        this.ImSocket.send(JSON.stringify(dataUser));
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
            this.chatMsgList.push(res.data);
            console.log(this.chatMsgList);
            break;
          case 4: // 在线用户
            this.userList = res.data.list || [];
            this.userCount = res.data.count;
            console.log(this.UserList);
            break;
          case 5: // 私聊通知
            this.chatMsgList.push(res.data);
            break;
          default:
            console.log(res);
        }

        const chatBox = this.$refs.chatBox;
        // 设置滚动到底部
        if (status) {
          this.$nextTick(() => {
            chatBox.scrollTop = chatBox.scrollHeight;
          });
        }
      };
    },
    // ws关闭
    wsClose() {
      this.ImSocket.onclose = () => {
        console.log("ws close");
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
      this.to_uid = "0";
      this.status = 3;
      const req = {
        status: 1, // 进入房间
        data: {
          uid: this.userInfo.userId,
          img_url: this.userInfo.imgUrl,
          room_id: this.room_id,
          username: this.userInfo.name,
          content: `进入id为${this.room_id}的房间`,
        },
      };

      this.ImSocket.send(JSON.stringify(req));
    },
    // 选择私聊的人
    SelectUser(todo) {
      this.status = 5;
      this.to_uid = String(todo.uid);
      this.room_id = todo.room_id;
    },
    // 发送消息
    handleSend() {
      if (this.content.trim() == "")
        return this.$message({
          type: "warning",
          message: "发出的信息不能为空哦",
        });
      let req = {
        status: this.status, // 3为群聊，5为私聊
        data: {
          time: +Date.now(),
          content: this.content,
          room_id: this.room_id,
          username: this.userInfo.name,
          uid: this.userInfo.userId,
          img_url: this.userInfo.imgUrl,
          to_uid: this.to_uid,
        },
      };
      this.ImSocket.send(JSON.stringify(req));
      this.chatMsgList.push(req.data);
      console.log(this.chatMsgList, "---");
      this.content = ""; // 消息发送后清空输入框
    },
    formatDate(timestamp) {
      try {
        if (typeof timestamp === "string") return timestamp;
        const date = new Date(timestamp);
        const y = date.getFullYear();
        const m = date.getMonth() + 1;
        const d = date.getDate();
        const hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
        const minute =
          date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
        const second =
          date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
        return `${y}/${m < 10 ? "0" + m : m}/${
          d < 10 ? "0" + d : d
        } ${hour}:${minute}:${second}`;
      } catch (err) {
        console.log(err);
      }
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
    &::-webkit-input-placeholder {
      color: pink;
    }
    &:-moz-placeholder {
      /* Firefox 18- */
      color: pink;
    }
  }
}
</style>
