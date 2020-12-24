<template>
  <div id="film">
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
      <el-button
        type="primary"
        icon="el-icon-circle-plus-outline"
        @click="handleNew"
        class="newBtn"
        >新增</el-button
      >
    </div>

    <el-table
      :data="tableData"
      border
      stripe
      class="tableBox"
      v-loading="loading"
      element-loading-spinner="el-icon-loading"
      element-loading-text="拼命加载中"
    >
      <el-table-column prop="name" label="电影名称" width="180"> </el-table-column>
      <el-table-column prop="actor" label="演员" width="180"> </el-table-column>
      <el-table-column prop="address" label="出品地区"> </el-table-column>
      <el-table-column prop="year" label="年份"> </el-table-column>
      <el-table-column prop="desc" label="描述"> </el-table-column>
      <el-table-column label="创建时间" width="180">
        <template v-slot="scope">
          <i class="el-icon-time"></i>
          <span style="margin-left: 10px">{{ scope.row.createAt }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template v-slot="scope">
          <el-button
            size="mini"
            type="primary"
            @click="handleEdit(scope.$index, scope.row)"
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
      <el-dialog
        :title="type === 'create' ? '新增电影' : '编辑电影'"
        v-model="dialogVisible"
        width="500px"
      >
        <el-form ref="ruleForm" :model="fromData" :rules="rules" label-width="80px">
          <el-form-item label="电影名称" prop="name">
            <el-input v-model="fromData.name" placeholder="请输入电影名称"></el-input>
          </el-form-item>
          <el-form-item label="演员" prop="actor">
            <el-input v-model="fromData.actor" placeholder="请输入演员名称"></el-input>
          </el-form-item>
          <el-form-item label="出品年份" prop="year">
            <el-input v-model="fromData.year" placeholder="请输入电影年份"></el-input>
          </el-form-item>
          <el-form-item label="出品地区" prop="address">
            <el-input v-model="fromData.address" placeholder="请输入出品地区"></el-input>
          </el-form-item>
          <el-form-item label="电影描述" prop="desc">
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
const initFromData = {
  name: "",
  year: "",
  desc: "",
  actor: "",
  address: "",
};

import Pagination from "/@/components/Pagination/index.vue";
export default {
  components: {
    Pagination,
  },
  data() {
    return {
      name: "",
      total: 0,
      query: {
        pageNum: 1,
        pageSize: 5,
      },
      loading: false,
      fromData: {},
      dialogVisible: false,
      type: "create",
      tableData: [],
      userId: "",
      rules: {
        name: [
          { required: true, message: "请输入电影名称", trigger: "blur" },
          { min: 2, max: 30, message: "长度在 3 到 30 个字符", trigger: "blur" },
        ],
        year: [{ required: true, message: "请输入电影年份", trigger: "blur" }],
        desc: [{ required: true, message: "请输入产品描述", trigger: "blur" }],
      },
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
          url: "/api/films",
          method: "get",
          params: {
            userId: this.userId,
            name: this.name,
            ...this.query,
          },
        });
        // console.log(res, "--");
        this.tableData = res.data;
        this.total = res.attr.total;
        this.loading = false;
      } catch (err) {
        this.loading = false;
        console.log(err);
      }
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
    // 新增
    handleNew() {
      this.dialogVisible = true;
      this.type = "create";
      this.fromData = { ...initFromData };
      this.$nextTick(() => {
        this.$refs["ruleForm"].clearValidate();
      });
    },
    // 编辑
    handleEdit(index, row) {
      this.dialogVisible = true;
      this.type = "edit";
      this.fromData = { ...row, id: row.id };
      this.$nextTick(() => {
        this.$refs["ruleForm"].clearValidate();
      });
    },
    // 确认
    handleSure() {
      this.$refs["ruleForm"].validate(async (valid) => {
        if (!valid) return;
        let res;
        if (this.type === "create") {
          res = await this.$axios({
            url: "/api/films",
            method: "POST",
            data: { ...this.fromData, userId: Number(this.userId) },
          });
        } else {
          res = await this.$axios({
            url: `/api/films/${this.fromData.id}`,
            method: "PUT",
            data: { ...this.fromData },
          });
        }

        if (res.code === 200) {
          this.dialogVisible = false;
          this.getList();

          this.$message({
            type: "success",
            message: this.type === "create" ? "创建成功" : "更新成功",
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
            url: `/api/films/${row.id}`,
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
  position: relative;
  display: flex;
  .inputSearch {
    display: inline-block;
    width: 300px;
    margin-right: 20px;
  }
  .newBtn {
    position: absolute;
    right: 20px;
  }
}
.tableBox {
  margin-top: 30px;
}
</style>
