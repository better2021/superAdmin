<template>
  <div id="ipAddress">
    <el-tag
      :key="tag"
      v-for="tag in dynamicTags"
      closable
      :disable-transitions="false"
      @close="handleDelete(tag)"
    >
      {{ tag.ip }}
    </el-tag>
    <el-input
      class="input-new-tag"
      v-if="inputVisible"
      v-model="inputValue"
      ref="saveTagInput"
      size="small"
      @blur="handleInputConfirm"
    >
    </el-input>
    <el-button
      v-else
      class="button-new-tag"
      size="small"
      type="primary"
      icon="el-icon-circle-plus-outline"
      @click="showInput"
      >添加IP</el-button
    >
  </div>
</template>

<style>
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>

<script>
export default {
  data() {
    return {
      dynamicTags: [],
      inputVisible: false,
      inputValue: "",
    };
  },
  created() {
    this.getIpList();
  },
  mounted() {
    document.onkeyup = (e) => {
      e.stopPropagation();
      if (e.keyCode === 13) {
        this.handleInputConfirm();
      }
    };
  },
  methods: {
    async getIpList() {
      try {
        let res = await this.$axios({
          url: "/api/ipWhite",
          method: "get",
        });
        if (res.code === 200) {
          this.dynamicTags = res.ipList;
        }
      } catch (err) {
        console.log(err);
      }
    },
    showInput() {
      this.inputVisible = true;
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },

    async handleInputConfirm() {
      let inputValue = this.inputValue;
      if (inputValue) {
        this.dynamicTags.push(inputValue);

        try {
          let res = await this.$axios({
            url: "/api/ipWhite",
            method: "post",
            data: {
              ip: inputValue,
            },
          });
          if (res.code === 200) {
            this.getIpList();
          }
        } catch (err) {
          console.log(err);
        }
      }
      this.inputVisible = false;
      this.inputValue = "";
    },

    // 删除
    handleDelete(row) {
      this.$confirm("此操作将永久删除该选项, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          const res = await this.$axios({
            url: `/api/ipWhite/${row.id}`,
            method: "DELETE",
          });
          if (res.code !== 200) {
            return this.$message.error(res.msg || "删除失败");
          }
          this.$message({
            type: "success",
            message: "删除成功!",
          });
          this.getIpList();
        })
        .catch(() => {
          console.log("取消删除");
        });
    },
  },
};
</script>
