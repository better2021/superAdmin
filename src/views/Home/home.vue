<template>
  <div id="home">
    <div class="search">
      <el-input placeholder="请输入内容" v-model="name" class="inputSearch">
        <template v-slot:prefix>
          <i class="el-input__icon el-icon-search"></i>
        </template>
      </el-input>
      <el-button type="primary" icon="el-icon-search" @click="handleSearch"
        >搜索</el-button
      >
      <el-button type="success" @click="handleReset">重置</el-button>
    </div>

    <el-table
      :data="tableData"
      border
      stripe
      class="tableBox"
      v-loading="loading"
      element-loading-text="拼命加载中"
    >
      <el-table-column prop="name" label="呢称" width="180"> </el-table-column>

      <el-table-column label="头像" width="180">
        <template v-slot="scope">
          <el-avatar v-if="scope.row.imgUrl" :src="scope.row.imgUrl"></el-avatar>
          <el-avatar v-else src="/images/unnamed.jpg"></el-avatar>
        </template>
      </el-table-column>

      <el-table-column prop="telephone" label="账号" width="180"> </el-table-column>
      <el-table-column prop="desc" label="描述"> </el-table-column>
      <el-table-column prop="ip" label="最近登陆ip地址"> </el-table-column>
      <el-table-column label="创建时间" width="180">
        <template v-slot="scope">
          <i class="el-icon-time"></i>
          <span style="margin-left: 10px">{{ scope.row.createAt }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" v-if="Number(userId) === 1">
        <template v-slot="scope">
          <el-button size="mini" type="primary" @click="handleEdit(scope.row)"
            >编辑</el-button
          >
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <Pagination
      v-show="total > 0"
      :total="total"
      v-model:page.sync="query.pageNum"
      v-model:limit.sync="query.pageSize"
      @pagination="getList()"
    ></Pagination>

    <div>
      <el-dialog title="编辑用户" v-model="dialogVisible" width="500px">
        <el-form ref="ruleForm" :model="fromData" :rules="rules" label-width="80px">
          <el-form-item label="昵称" prop="name">
            <el-input v-model="fromData.name" placeholder="请输入用户昵称"></el-input>
          </el-form-item>
          <el-form-item label="头像" prop="imgUrl">
            <Upload
              :imgUrl="fromData.imgUrl"
              :imgSize="1000"
              @handleSuccess="uploadSuccess"
            ></Upload>
          </el-form-item>
          <el-form-item label="账号" prop="telephone">
            <el-input v-model="fromData.telephone" placeholder="请输入账号"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="fromData.password"
              :type="passwordType ? 'password' : 'text'"
              placeholder="请输入密码"
            ></el-input>
            <span class="show-pwd" @click="showPwd">
              <img :src="iconPath(passwordType ? 'eye' : 'eye-open')" class="svg-icon" />
            </span>
          </el-form-item>
          <el-form-item label="描述" prop="desc">
            <el-input v-model="fromData.desc" placeholder="请输入电影描述"></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="handleSure">确 定</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import Pagination from "/@/components/Pagination/index.vue";
import Upload from "/@/components/Upload/index.vue";
export default {
  components: {
    Pagination,
    Upload,
  },
  data() {
    return {
      name: "",
      total: 0,
      query: {
        pageNum: 1,
        pageSize: 5,
      },
      fromData: {},
      dialogVisible: false,
      tableData: [],
      loading: false,
      passwordType: true,
      rules: {
        name: [
          { required: true, message: "请输入用户昵称", trigger: "blur" },
          { min: 2, max: 30, message: "长度在 3 到 30 个字符", trigger: "blur" },
        ],
        imgUrl: [{ required: true, message: "请上传头像", trigger: "change" }],
        telephone: [{ required: true, message: "请输入账号", trigger: "blur" }],
        password: [{ required: true, message: "请输入密码", trigger: "blur" }],
      },
      userId: 1,
    };
  },
  created() {
    this.userId = this.$store.getters.userInfo.userId || 1;
    this.getList();
  },
  methods: {
    async getList() {
      try {
        this.loading = true;
        const res = await this.$axios({
          url: "/api/users",
          method: "get",
          params: {
            name: this.name,
            ...this.query,
          },
        });
        // console.log(res, "--");
        this.tableData = res.data;
        this.total = res.attr.total;
        this.loading = false;
      } catch (err) {
        console.log(err);
        this.loading = false;
      }
    },
    // 返回icon的路劲
    iconPath(icon) {
      return `/icons/svg/${icon}.svg`;
    },
    // 密码的显示与隐藏
    showPwd() {
      this.passwordType = !this.passwordType;
    },
    // 搜索
    handleSearch() {
      this.query.pageNum = 1;
      this.getList();
    },
    // 重置
    handleReset() {
      this.name = "";
      this.query.pageNum = 1;
      this.getList();
    },
    // 上传成功之后
    uploadSuccess(res, file, fileList) {
      console.log(res, file, fileList);
      if (res.code !== 200) {
        return this.$message.error("图片上传失败");
      }
      this.fromData.imgUrl = res.imgUrl;
    },
    // 编辑
    handleEdit(row) {
      this.dialogVisible = true;
      this.fromData = { ...row, id: row.id, password: "123456" };
      delete this.fromData.createAt;
      delete this.fromData.updateAt;
      this.$nextTick(() => {
        this.$refs["ruleForm"].clearValidate();
      });
    },
    // 确认
    handleSure() {
      this.$refs["ruleForm"].validate(async (valid) => {
        if (!valid) return;
        let res = await this.$axios({
          url: `/api/users/${this.fromData.id}`,
          method: "PUT",
          data: { ...this.fromData },
        });

        if (res.code === 200) {
          this.dialogVisible = false;
          this.getList();

          this.$message({
            type: "success",
            message: "更新成功",
          });
        } else {
          this.$message({
            type: "error",
            message: res.msg,
          });
        }
      });
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
            url: `/api/users/${row.id}`,
            method: "DELETE",
          });
          if (res.code !== 200) {
            return this.$message.error(res.msg || "删除失败");
          }
          this.$message({
            type: "success",
            message: "删除成功!",
          });
          this.getList();
        })
        .catch(() => {
          console.log("取消删除");
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.search {
  display: flex;
  .inputSearch {
    display: inline-block;
    width: 300px;
    margin-right: 20px;
  }
}
.show-pwd {
  position: absolute;
  right: 10px;
  font-size: 16px;
  color: #fff;
  cursor: pointer;
  user-select: none;
  .svg-icon {
    width: 1em;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
  }
}
.tableBox {
  margin-top: 30px;
}
</style>
<style>
.el-avatar > img {
  width: 100%;
}
</style>
