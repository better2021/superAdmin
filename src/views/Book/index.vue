<template>
  <div id="book">
    <div class="search">
      <el-input placeholder="请输入内容" v-model="title" class="inputSearch">
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
      element-loading-text="拼命加载中"
    >
      <el-table-column prop="title" label="书籍名称" width="180"> </el-table-column>
      <el-table-column prop="author" label="作者" width="180"> </el-table-column>
      <el-table-column prop="year" label="年份" width="150"> </el-table-column>
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
        :title="type === 'create' ? '新增书籍' : '编辑书籍'"
        v-model="dialogVisible"
        width="500px"
      >
        <el-form ref="ruleForm" :model="fromData" :rules="rules" label-width="80px">
          <el-form-item label="书籍名称" prop="title">
            <el-input v-model="fromData.title" placeholder="请输入书籍名称"></el-input>
          </el-form-item>
          <el-form-item label="作者" prop="author">
            <el-input v-model="fromData.author" placeholder="请输入作者名称"></el-input>
          </el-form-item>
          <el-form-item label="出品年份" prop="year">
            <el-input v-model="fromData.year" placeholder="请输入电影年份"></el-input>
          </el-form-item>
          <el-form-item label="书籍描述" prop="desc">
            <el-input v-model="fromData.desc" placeholder="请输入书籍描述"></el-input>
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
import { ref, reactive, getCurrentInstance, onMounted } from "vue";
import Pagination from "/@/components/Pagination/index.vue";
import { useStore } from "vuex";
export default {
  components: {
    Pagination,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const title = ref("");
    const total = ref(0);
    const tableData = ref([]);
    const loading = ref(false);
    const dialogVisible = ref(false);
    const type = ref("create");

    const store = useStore();
    const userInfo = store.getters.userInfo;

    const userId = userInfo.userId || 1;
    const query = reactive({
      pageNum: 1,
      pageSize: 5,
    });
    let fromData = reactive({
      title: "",
      year: "",
      desc: "",
      author: "",
      userId: Number(userId),
    });

    const rules = reactive({
      title: [
        { required: true, message: "请输入书籍名称", trigger: "blur" },
        { min: 2, max: 30, message: "长度在 3 到 30 个字符", trigger: "blur" },
      ],
      year: [{ required: true, message: "请输入书籍年份", trigger: "blur" }],
      desc: [{ required: true, message: "请输入描述", trigger: "blur" }],
    });

    // 获取书籍列表
    const getList = async () => {
      loading.value = true;
      try {
        let res = await proxy.$axios({
          url: "/api/books",
          method: "get",
          params: {
            userId: userId,
            title: title.value,
            ...query,
          },
        });

        if (res.code === 200) {
          tableData.value = res.data;
          total.value = res.attr.total;
        }

        console.log(res, "--");
      } catch (err) {
        console.log(err);
      }
      loading.value = false;
    };

    onMounted(() => {
      getList();
    });

    // 搜索
    const handleSearch = () => {
      query.pageNum = 1;
      getList();
    };

    // 重置
    const handleReset = () => {
      title.value = "";
      query.pageNum = 1;
      getList();
    };

    // 新增
    const handleNew = () => {
      dialogVisible.value = true;
      type.value = "create";
      for (let key in fromData) {
        fromData[key] = "";
      }
      fromData.userId = Number(userId);
      proxy.$nextTick(() => {
        proxy.$refs["ruleForm"].clearValidate();
      });
    };

    // 编辑
    const handleEdit = (index, row) => {
      dialogVisible.value = true;
      type.value = "edit";
      Object.keys(fromData).forEach((key) => {
        fromData[key] = row[key];
      });
      fromData.id = row.id;
      console.log(fromData, row);
      proxy.$nextTick(() => {
        proxy.$refs["ruleForm"].clearValidate();
      });
    };

    // 确认
    const handleSure = () => {
      console.log(proxy)
      proxy.$refs["ruleForm"].validate(async (valid) => {
        if (!valid) return;
        let res;
        if (type.value === "create") {
          res = await proxy.$axios({
            url: "/api/books",
            method: "post",
            data: fromData,
          });
        } else {
          res = await proxy.$axios({
            url: `/api/books/${fromData.id}`,
            method: "put",
            data: fromData,
          });
        }

        if (res.code === 200) {
          dialogVisible.value = false;
          getList();

          proxy.$message({
            type: "success",
            message: type.value === "create" ? "创建成功" : "更新成功",
          });
        } else {
          proxy.$message({
            type: "error",
            message: res.msg,
          });
        }
      });
    };

    // 删除
    const handleDelete = (row) => {
      proxy
        .$confirm("此操作将永久删除该选项, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
        .then(async () => {
          const res = await proxy.$axios({
            url: `/api/books/${row.id}`,
            method: "DELETE",
          });
          if (res.code !== 200) {
            return proxy.$message.error(res.msg || "删除失败");
          }
          proxy.$message({
            type: "success",
            message: "删除成功!",
          });
          getList();
        })
        .catch(() => {
          console.log("取消删除");
        });
    };

    // 暴露给模板
    return {
      title,
      query,
      total,
      loading,
      dialogVisible,
      tableData,
      fromData,
      type,
      rules,
      handleSearch,
      handleReset,
      handleNew,
      handleEdit,
      handleSure,
      handleDelete,
    };
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
