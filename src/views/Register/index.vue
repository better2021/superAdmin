<template>
  <div id="Register">
    <canvas id="fire">当前浏览器不支持canvas，请更换浏览器后再试</canvas>
    <div id="clock">
      <canvas id="canvas" style="width: 400px; margin-bottom: 50px; margin-left: 80px">
        当前浏览器不支持canvas，请更换浏览器后再试
      </canvas>
    </div>
    <el-form
      :model="ruleForm"
      :rules="rules"
      ref="ruleForm"
      label-width="100px"
      class="login-ruleForm"
    >
      <el-form-item label="昵称" prop="name">
        <el-input v-model="ruleForm.name" prefix-icon="el-icon-star-off"></el-input>
      </el-form-item>
      <el-form-item label="手机号" prop="telephone">
        <el-input v-model="ruleForm.telephone" prefix-icon="el-icon-user"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="ruleForm.password"
          :type="passwordType ? 'password' : 'text'"
          prefix-icon="el-icon-lock"
        >
        </el-input>
        <span class="show-pwd" @click="showPwd">
          <img :src="iconPath(passwordType ? 'eye' : 'eye-open')" class="svg-icon" />
        </span>
      </el-form-item>
      <el-form-item label="个人简介" prop="desc">
        <el-input v-model="ruleForm.desc" prefix-icon="el-icon-edit"></el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="success" @click="handleRegister">注册</el-button>
        <el-button @click="resetForm('ruleForm')">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { clock } from "/@/utils/clock";
import { fire } from "/@/utils/fire";

export default {
  data() {
    return {
      ruleForm: {
        name: "",
        telephone: "",
        password: "",
        desc: "",
      },
      passwordType: true,
      rules: {
        name: [{ required: true, message: "请输入您的昵称", trigger: "blur" }],
        telephone: [{ required: true, message: "请输入您的手机号", trigger: "blur" }],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 10,
            message: "长度在 6 到 10 个字符",
            trigger: "blur",
          },
        ],
      },
    };
  },
  mounted() {
    clock(); // 执行时钟效果
    fire(); // 火焰背景
  },
  methods: {
    // 密码的显示与隐藏
    showPwd() {
      this.passwordType = !this.passwordType;
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    // 返回icon的路劲
    iconPath(icon) {
      return `/icons/svg/${icon}.svg`;
    },
    // 注册
    async handleRegister() {
      try {
        let res = await this.$axios({
          url: "/api/auth/register",
          method: "post",
          data: this.ruleForm,
        });
        if (res.code === 200) {
          this.$message({
            message: "注册成功",
            type: "success",
          });
          this.$router.replace({ path: "/login" });
        } else {
          this.$message({
            message: res.msg,
            type: "error",
          });
        }
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
