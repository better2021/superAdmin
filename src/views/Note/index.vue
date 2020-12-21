<template>
  <div id="note">
    <div class="inputBox">
      <el-input type="textarea" :rows="3" placeholder="请输入内容" v-model="textarea">
      </el-input>
      <div class="btnBox">
        <span>
          <img src="/images/image.png" class="img" alt="" @click="handleShow" />
          <img
            src="/images/happy.png"
            class="img"
            alt=""
            @click="handleVisible"
          />
        </span>
        <el-button type="primary" icon="el-icon-position" size="small" @click="handleSend"
          >发表动态</el-button
        >

        <div v-show="state.emojiShow" class="emojiBox">
          <span
            v-for="item in state.emojiList"
            :key="item.name"
            @click="handleEmoji(item)"
          >
            <img :src="`/emoji/${item.name}.png`" />
          </span>
        </div>
      </div>
      <Uploads
        :imgSize="1500"
        :visible="isShow"
        @handleSuccess="uploadSuccess"
        ref="uploadFiles"
      ></Uploads>
    </div>

    <div class="listBox">
      <ul>
        <li v-for="item in list" :key="item.id">
          <div class="head">
            <el-avatar size="medium" :src="item.icon" class="userIcon"></el-avatar>
            <span>{{ item.userName }}</span>
            <span class="color">{{ getFormatDate(item.createAt) }}</span>
            <el-button
              v-if="item.userId === Number(userId)"
              type="danger"
              size="mini"
              icon="el-icon-delete"
              class="delete"
              @click="handleDelete(item)"
            ></el-button>
          </div>
          <div v-if="!!item.images" class="images">
            <img
              v-for="todo in item.images.split(',')"
              :key="todo"
              v-lazy="todo"
              alt=""
            />
          </div>
          <p class="content" v-html="toHtml(item.context)"></p>
        </li>
      </ul>
    </div>

    <vue-picture-swipe ref="pictureSwipe" :items="items"></vue-picture-swipe>

    <Pagination
      v-show="total > 0"
      :total="total"
      v-model:page.sync="query.pageNum"
      v-model:limit.sync="query.pageSize"
      @pagination="getNoteList()"
    ></Pagination>
  </div>
</template>

<script>
import VuePictureSwipe from "vue-picture-swipe";
import Uploads from "/@/components/Uploads/index.vue";
import Pagination from "/@/components/Pagination/index.vue";
import emoji from "/@/assets/emoji.json";
import { defineComponent, ref, getCurrentInstance, onMounted, reactive } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  components: {
    Uploads,
    Pagination,
    VuePictureSwipe,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    let textarea = ref("");
    const images = ref([]);
    const total = ref(0);
    const isShow = ref(false);
    const list = ref([]);
    const items = ref([
      {
        src: "http://via.placeholder.com/600x400",
        thumbnail: "http://via.placeholder.com/64x64",
        w: 600,
        h: 400,
        alt: "some numbers on a grey background", // optional alt attribute for thumbnail image
      },
      {
        src: "http://via.placeholder.com/1200x900",
        thumbnail: "http://via.placeholder.com/64x64",
        w: 1200,
        h: 900,
      },
    ]);
    let state = reactive({
      emojiShow: false,
      emojiList: [],
    });
    const query = reactive({
      pageNum: 1,
      pageSize: 10,
    });

    const store = useStore();

    const userName = store.getters.userInfo.name;
    const icon = store.getters.userInfo.imgUrl;
    const userId = store.getters.userInfo.userId;

    const handleShow = () => {
      isShow.value = !isShow.value;
      state.emojiShow = false;
    };

    const handleVisible = () => {
      state.emojiShow = !state.emojiShow;
    };

    const handleEmoji = (item) => {
      console.log(item.val);
      textarea.value += item.val;
    };

    // 字符串转 HTML
    const toHtml = (text) => {
      const str = text
        .replace(/(\[.*?\])/g, ($1) => {
          if (emoji[$1]) {
            const url = `/emoji/${emoji[$1]}.png`;
            return `<img src="${url}" class="emoji" title="emoji" name="${$1}" style="user-select:none" oncontextmenu="return false"/>`;
          } else {
            return $1;
          }
        })
        .replace(/\n/g, "</br>");
      return str;
    };

    const getFormatDate = (time) => {
      try {
        const d = +new Date(time);
        const now = Date.now();
        const diff = (now - d) / 1000;

        if (diff < 30) {
          return "刚刚";
        } else if (diff < 3600) {
          // less 1 hour
          return Math.ceil(diff / 60) + "分钟前";
        } else if (diff < 3600 * 24) {
          return Math.ceil(diff / 3600) + "小时前";
        } else if (diff < 3600 * 24 * 2) {
          return "1天前";
        }
        let date = new Date(d);
        return `${date.getFullYear()}年${
          date.getMonth() + 1
        }月${date.getDate()}日${date.getHours()}时${date.getMinutes()}分`;
      } catch (err) {
        console.log(err);
      }
    };

    // 处理表情包数据
    Object.keys(emoji).map((o) => {
      state.emojiList.push({ name: emoji[o], val: o });
    });

    // 图片上传成功后的回调
    const uploadSuccess = (res, fileList) => {
      isShow.value = false;
      images.value = res.images;
    };

    // 获取列表
    const getNoteList = async () => {
      try {
        let res = await proxy.$axios({
          method: "get",
          url: "/api/notes",
          params: query,
        });

        if (res.code === 200) {
          // console.log(res);
          list.value = res.data;
          total.value = res.attr.total;
          let array = [];
          list.value.forEach((o) => {
            if (o.images) {
              let arr = o.images.split(",");
              const obj = arr.map((i) => {
                return { src: i, thumbnail: i, w: 600, h: 500 };
              });
              array = array.concat(obj);
            }
          });
          console.log(array);
          items.value = array;
        } else {
          proxy.$message({
            type: "error",
            message: res.msg,
          });
        }
      } catch (err) {
        console.log(err);
      }
    };

    getNoteList();

    onMounted(() => {
      document.onkeyup = (e) => {
        // console.log(e);
        let event = e || window.event;
        if (event.keyCode === 13) {
          handleSend();
        }
      };
    });

    // 发表动态
    const handleSend = async () => {
      if (textarea.value.trim() === "") {
        proxy.$message({
          type: "warning",
          message: "发表的内容不能为空！",
        });
        return;
      }

      if (proxy.$refs.uploadFiles.fileList.length) {
        proxy.$message({
          type: "warning",
          message: "请先上传图片到服务器",
        });
        return;
      }

      let res = await proxy.$axios({
        method: "post",
        url: "/api/notes",
        data: {
          userName,
          icon,
          userId,
          images: images.value.join(","),
          context: textarea.value,
        },
      });

      if (res.code === 200) {
        console.log(res);
        images.value = [];
        textarea.value = "";
        isShow.value = false;
        state.emojiShow = false;
        getNoteList();
        proxy.$message({
          type: "success",
          message: "发表成功",
        });
      } else {
        proxy.$message({
          type: "error",
          message: res.msg,
        });
      }
    };

    // 删除发表的动态
    const handleDelete = async (item) => {
      proxy
        .$confirm("此操作将永久删除该选项, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
        .then(async () => {
          try {
            const res = await proxy.$axios({
              method: "delete",
              url: `/api/notes/${item.id}`,
            });

            if (res.code !== 200) {
              return proxy.$message({
                type: "error",
                message: res.msg,
              });
            }

            getNoteList(); // 刷新列表
            proxy.$message({
              type: "success",
              message: "删除成功",
            });
          } catch (err) {
            console.log(err);
          }
        })
        .catch(() => {
          console.log("取消删除");
        });
    };

    // 暴露给模板
    return {
      textarea,
      images,
      isShow,
      list,
      items,
      state,
      query,
      total,
      userId,
      handleEmoji,
      handleShow,
      handleVisible,
      uploadSuccess,
      getNoteList,
      handleSend,
      handleDelete,
      getFormatDate,
      toHtml,
    };
  },
});
</script>

<style lang="scss" scope>
@import "./index.scss";
img[itemprop="thumbnail"] {
  width: 80px;
}
</style>
