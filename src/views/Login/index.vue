<template>
  <div id="login">
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
      <el-form-item label="账号" prop="telephone">
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
      <el-form-item label="验证码" prop="code">
        <div class="codeBox">
          <img :src="base64Img" alt="" class="codeImg" @click="changeCode" />
          <el-input v-model="ruleForm.code" class="codeInput"></el-input>
        </div>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitForm('ruleForm')">登陆</el-button>
        <el-button @click="resetForm('ruleForm')">重置</el-button>
      </el-form-item>
      <div class="tips">
        如果没有账号，请点击<span @click="jumpRegister">注册</span>哦
      </div>
    </el-form>
  </div>
</template>

<script>
import { fromData } from "/@/utils/util";
import { clock } from "/@/utils/clock";
import { fire } from "/@/utils/fire";

export default {
  data() {
    return {
      ruleForm: {
        telephone: "",
        password: "",
        code: "",
      },
      base64Img: "",
      captchaId: "",
      passwordType: true,
      rules: {
        telephone: [{ required: true, message: "请输入您的账号", trigger: "blur" }],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 10,
            message: "长度在 6 到 10 个字符",
            trigger: "blur",
          },
        ],
        code: [{ required: true, message: "请输入验证码", trigger: "blur" }],
      },
    };
  },
  created() {
    this.getCode();
  },
  methods: {
    // 获取验证码
    async getCode() {
      try {
        let res = await this.$axios({
          method: "get",
          url: "/api/getCode",
        });
        console.log(res.data);
        this.base64Img = res.data.img;
        this.captchaId = res.data.captchaId;
      } catch (err) {
        console.log(err);
      }
    },
    // 密码的显示与隐藏
    showPwd() {
      this.passwordType = !this.passwordType;
    },
    // 点击切换二维码
    changeCode() {
      this.getCode();
    },
    // 提交
    submitForm(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          try {
            let res = await this.$axios({
              method: "post",
              url: "/api/auth/login",
              data: fromData({ ...this.ruleForm, captchaId: this.captchaId }),
            });

            if (res.code !== 200) {
              this.$message({
                message: res.msg,
                type: "error",
              });
              this.getCode();
            } else {
              const token = res.data.token;
              const userInfo = res.data;
              if (token) {
                this.$store.dispatch("login", userInfo);
                this.$router.replace({ path: "/" });
              }
            }
          } catch (err) {
            console.log(err, "--");
          }
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    // 返回icon的路劲
    iconPath(icon) {
      return `/icons/svg/${icon}.svg`;
    },
    // 跳到注册页面
    jumpRegister() {
      this.$router.push({ path: "/register" });
    },
  },
  mounted() {
    clock(); // 执行时钟效果
    fire(); // 火焰背景
    document.onkeyup = (e) => {
      if (e.keyCode === 13) {
        this.submitForm("ruleForm");
      }
    };
  },
};
</script>

<style lang="scss" scoped>
@import "./index.scss";
</style>
