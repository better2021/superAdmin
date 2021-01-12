<template>
  <div id="chat">
    <div class="chatRoom">
      <div class="leftList">
        <ul>
          <li
            v-for="(item, index) in roomList"
            :key="index"
            @click="SelectRoom(item, index)"
            :class="{ active: String(item.id) === room_id && isRoom }"
          >
            <img :src="item.imgUrl" alt="" />
            <span>{{ item.title }}</span>
            <el-badge
              v-if="unreadRoom[index] !== 0"
              :value="unreadRoom[index]"
              class="item"
              type="success"
            ></el-badge>
          </li>
          <div v-for="(todo, index) in userList" :key="index">
            <li
              @click="SelectUser(todo, index)"
              v-if="userInfo.userId !== todo.uid"
              :class="{ active: String(todo.uid) === to_uid }"
            >
              <img :src="todo.img_url" alt="" />
              <span>{{ todo.username }}</span>
              <el-badge
                v-if="unreadUser[index] !== 0"
                :value="unreadUser[index]"
                class="item"
                type="primary"
              ></el-badge>
            </li>
          </div>
        </ul>
      </div>
      <div class="rightRoom">
        <div class="roomTop">
          <p v-if="to_uid === '0'">
            正在<span style="color: #ad1341">{{ roomTitle }}</span
            >中聊天 <i>在线人数：{{ userCount }} 人</i>
          </p>
          <p v-else>
            正在与<span style="color: #ad1341">{{ roomTitle }}</span
            >聊天
          </p>
        </div>
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
                <p v-html="toHtml(item.content)"></p>
              </div>
            </li>
          </ul>
        </div>
        <div class="roomBottom">
          <img src="/images/image.png" class="img" alt="" />
          <img src="/images/happy.png" class="img" alt="" @click="handleVisible" />
          <el-input
            type="text"
            placeholder="请输入内容"
            v-model="content"
            class="textContent"
            ref="elInput"
          >
          </el-input>
          <i class="el-icon-s-promotion send" @click="handleSend"></i>
          <!-- emijo表情 -->
          <div v-show="emojiShow" class="emojiBox">
            <span v-for="item in emojiList" :key="item.name" @click="handleEmoji(item)">
              <img :src="`/emoji/${item.name}.png`" />
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import WebsocketHeartbeatJs from "websocket-heartbeat-js";
import emoji from "/@/assets/emoji.json";

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
      isRoom: true,
      roomTitle: "聊天室1",
      chatIndex: 1,
      unreadRoom: [],
      unreadUser: [],
      emojiShow: false,
      emojiList: [],
    };
  },
  created() {
    this.getRoomList();
    this.getRoomHistory();
    this.ImSocket = new WebsocketHeartbeatJs(this.options);
    this.initIM(); // 初始化

    // 处理表情包数据
    Object.keys(emoji).map((o) => {
      this.emojiList.push({ name: emoji[o], val: o });
    });
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
        // console.log(res);
        this.roomList = res.rooms;
        this.unreadRoom = Array(res.rooms.length).fill(0);
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
        // console.log(res, "--");
        this.chatMsgList = res.msg_list || [];
        this.srollToBottom();
      } catch (err) {
        console.log(err);
      }
    },
    // 获取私聊历史记录
    async getPrivateHistory() {
      try {
        let res = await this.$axios({
          url: "/api/private-chart",
          method: "get",
          params: {
            roomId: this.room_id,
            uid: this.userInfo.userId,
            to_uid: this.to_uid,
          },
        });
        // console.log(res);
        this.chatMsgList = res.msg_List || [];
        this.srollToBottom();
      } catch (err) {
        console.log(err);
      }
    },
    // 滚动条滑到底部
    srollToBottom() {
      const chatBox = this.$refs.chatBox;
      // 设置滚动到底部
      this.$nextTick(() => {
        chatBox.scrollTop = chatBox.scrollHeight;
      });
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
          case 3: // 接受群消息
            if (this.to_uid === "0" && this.room_id === res.data.room_id) {
              this.chatMsgList.push(res.data);
            } else {
              this.unreadRoom[Number(res.data.room_id) - 1]++;
              console.log(this.unreadRoom, "--");
            }
            break;
          case 4: // 在线用户
            this.userList = res.data.list || [];
            this.userCount = res.data.count;
            this.unreadUser = Array(this.userList.length).fill(0);
            break;
          case 5: // 私聊通知
            if (this.to_uid === String(res.data.uid)) {
              this.chatMsgList.push(res.data);
            } else {
              const index = this.userList.findIndex((i) => i.uid === res.data.uid);
              console.log(index, "index");
              this.unreadUser[index]++;
            }
            break;
          default:
            console.log(res);
        }

        // 设置滚动到底部
        if (status) {
          this.srollToBottom();
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
    SelectRoom(item, index) {
      this.roomTitle = item.title;
      this.room_id = String(item.id);
      this.to_uid = "0";
      this.status = 3; //群聊
      this.isRoom = true;
      this.chatIndex = 1;
      this.unreadRoom[index] = 0;
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
      this.getRoomHistory(); // 获取群聊历史记录
    },
    // 选择私聊的人
    SelectUser(todo, index) {
      this.roomTitle = todo.username;
      this.status = 5; // 私聊
      this.to_uid = String(todo.uid);
      this.room_id = todo.room_id;
      this.isRoom = false;
      this.chatIndex = 1;
      this.unreadUser[index] = 0;
      this.getPrivateHistory(); // 获取私聊历史记录
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
          chatIndex: this.chatIndex++,
        },
      };
      this.ImSocket.send(JSON.stringify(req));
      this.chatMsgList.push(req.data);
      console.log(this.chatMsgList, "---");
      this.content = ""; // 消息发送后清空输入框

      this.emojiShow = false;
      this.srollToBottom();
    },
    // 时间格式化
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
    // emoji的显示和隐藏
    handleVisible() {
      this.emojiShow = !this.emojiShow;
    },
    handleEmoji(item) {
      console.log(item.val);
      this.content += item.val;
    },
    // 字符串转 HTML
    toHtml(text) {
      const str = text
        .replace(/(\[.*?\])/g, ($1) => {
          if (emoji[$1]) {
            const url = `/emoji/${emoji[$1]}.png`;
            return `<img src="${url}" class="emoji" title="emoji" name="${$1}" style="user-select:none;width: 26px;" oncontextmenu="return false"/>`;
          } else {
            return $1;
          }
        })
        .replace(/\n/g, "</br>");
      return str;
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
