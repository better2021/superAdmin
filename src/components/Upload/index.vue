<template>
  <div id="upload">
    <el-upload class="avatar-uploader" drag :action="uploadUrl" :headers="headers" :show-file-list="false" :accept="accept" :before-upload="beforeUpload" :on-success="handleSuccess" :on-error="handleError">
      <img v-if="imgUrl" :src="imgUrl" class="avatar" />
      <i v-else class="el-icon-plus avatar-uploader-icon"></i>
      <template #tip>
        <div class="el-upload__tip">只能上传 jpg/png 文件，且不超过 {{ imgSize }}kb</div>
      </template>
    </el-upload>
  </div>
</template>

<script>
import { getToken } from "/@/utils/cookie";
export default {
  props: {
    imgUrl: {
      type: String,
      default: "",
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
      uploadUrl: `${this.$axios.defaults.baseURL}/api/upload`,
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
    handleSuccess(res, file, fileList) {
      this.$emit("handleSuccess", res, file, fileList);
    },
    handleError(err, file, fileList) {
      this.$message.error("图片上传失败:" + err.message);
    },
  },
};
</script>

<style lang="scss">
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  .avatar-uploader-icon,
  .el-upload-dragger {
    width: 178px !important;
    height: 178px !important;
    line-height: 178px !important;
  }
}

.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
