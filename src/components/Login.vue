<template>
  <div class="login_container">
    <div class="login_box">
      <!-- logo -->
      <div class="avatr_box">
        <img src="../assets/logo.png" alt="" />
      </div>
      <!-- 登录表单区域 -->
      <el-form ref="formRef" :model="form" :rules="rules" class="formData" label-width="0px">
        <el-form-item prop="username">
          <!-- iconfont 指定字体family -->
          <el-input v-model="form.username" prefix-icon="iconfont icon-user" class="inputArea"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" prefix-icon="iconfont icon-3702mima" class="inputArea" show-password></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button @click="submitLoginForm('formRef')" type="primary" round>登录</el-button>
          <el-button @click="resetLoginForm('formRef')" type="primary" round>重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        username: 'admin',
        password: '123456'
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 15, message: '长度为3-15字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度为6-15字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 重置表单
    resetLoginForm(FormName) {
      //   console.log(this)
      this.$refs[FormName].resetFields()
    },
    // 登录
    submitLoginForm(FormName) {
      this.$refs[FormName].validate(async (valid) => {
        if (valid) {
          const { data: result } = await this.$http.post('login', this.form)
          if (result.meta.status === 200) {
            this.$message.success(result.meta.msg)
            // console.log(result)
            window.sessionStorage.setItem('token', result.data.token)
            this.$router.push('/home')
            /* 
              1.登录之后将token保存到客户端的sessionStorage(回话期间存储)
              除了登录页其他页面都应在登录之后访问
              token只在网站打开期间生效所以存到sessionStorage
              2.通过编程式导航跳转到后台主页 /home
              */
          } else {
            this.$message.error(result.meta.msg)
          }
        }
      })
    }
  }
}
</script>

<style lang='less' scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  //表单样式
  .formData {
    position: absolute;
    bottom: 0;
    width: 90%;
    left: 50%;
    transform: translateX(-50%);
  }
}
.avatr_box {
  height: 130px;
  width: 130px;
  border: 1px solid #eee;
  border-radius: 50%;
  box-shadow: 0 0 10px #ddd;
  padding: 10px;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  //使图片居中 父盒子居中即可
  img {
    height: 100%;
    width: 100%;
    border-radius: 50%;
    background-color: #eee;
  }
}
//按钮靠右
.btns {
  display: flex;
  justify-content: flex-end;
}
</style>
