<template>
  <div id="upload" v-show="visible">
    <el-upload
      action=""
      :accept="accept"
      :http-request="uploadFile"
      :before-upload="beforeUpload"
      :on-change="handleChange"
      :on-success="handleSuccess"
      :on-error="handleError"
      :headers="headers"
      list-type="picture-card"
      :on-preview="handlePictureCardPreview"
      :on-remove="handleRemove"
      multiple
      :file-list="fileList"
      :limit="4"
      :auto-upload="false"
      ref="uploads"
    >
      <i class="el-icon-plus"></i>
      <template #tip>
        <div class="tipBox">
          <div class="el-upload__tip">只能上传 jpg/png 文件，且不超过 {{ imgSize }}kb</div>
          <el-button style="margin-left: 10px" size="small" type="success" @click="submitUpload">上传到服务器</el-button>
        </div>
      </template>
    </el-upload>
    <el-dialog title="图片预览" v-model="dialogVisible">
      <img :src="dialogImageUrl" alt="" class="imgPic" />
    </el-dialog>
  </div>
</template>

<script>
import { getToken } from "/@/utils/cookie";
export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    imgSize: {
      type: Number,
      default: 1000,
    },
  },
  data() {
    return {
      accept: "image/*",
      headers: { Authorization: `Bearer ${getToken()}` },
      dialogImageUrl: "",
      dialogVisible: false,
      fileList: [],
    };
  },
  methods: {
    // 上传之前
    beforeUpload(file) {
      let size = Math.ceil(file.size / 1024); // 单位kb
      if (size > this.imgSize) {
        this.$message({
          type: "warning",
          message: `图片大小不能超过${this.imgSize}kb`,
        });
        return false;
      }
    },
    handleChange(file, fileList) {
      console.log(fileList);
      this.fileList = fileList;
    },
    async uploadFile() {
      let formData = new FormData(); // 用于存放上传的文件
      this.fileList.forEach((file) => {
        formData.append("file", file.raw);
      });
      let res = await this.$axios({
        method: "post",
        url: "/api/uploads",
        data: formData,
      });

      if (res.code === 200) {
        this.$emit("handleSuccess", res, this.fileList);
        this.$refs.uploads.clearFiles(); // 成功后清除上传的文件列表
        this.fileList = [];
      }
    },
    handleSuccess(res, file, fileList) {
      console.log(res, file, fileList);
    },
    handleError(err, file, fileList) {
      this.$message({
        type: "error",
        message: "图片上传失败" + err.message,
      });
    },
    handleRemove(file, fileList) {
      console.log(file, fileList);
      this.fileList = fileList;
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
      console.log(this.dialogVisible, file.url);
    },
    // 手动上传
    submitUpload() {
      console.log(this);
      if (!this.fileList.length) {
        return this.$message({
          type: "error",
          message: "上传列表不能为空",
        });
      }
      this.uploadFile();
    },
  },
};
</script>

<style lang="scss">
#upload {
  .tipBox {
    display: flex;
    justify-content: flex-start;
  }
  .imgPic {
    width: 80%;
    margin-left: 10%;
  }
}
</style>
