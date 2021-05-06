<template>
  <div class="login-container">
    <!--
      el-form 表单组件
      每个表单项都必须使用 el-form-item 组件包裹
     -->

    <div class="login-form-wrap">
      <div class="login-head">
        <div class="logo"></div>

        <!-- 配置Form表单验证：
              1、必须给el-from组件绑定model为表单数据对象
              2、给需要验证的表单项 el-form-item绑定prop属性
              注意：prop属性需要指定表单对象中的数据名称
              3、给el-from组件的rules属性配置验证规则
              具体的验证规则可以参考：https://github.com/yiminghe/async-validator
              如果内置的验证规则不满足，也可以自定义验证规则 -->

              <!-- 手动触发表单验证
              1、给el-form设置ref起个名字（随便起名，不要重复即可）
              2、通过ref获取el-form组件，调用组件的validata进行验证 -->
      </div>
      <el-form
        class="login-form"
        ref="login-form"
        :model="user"
        :rules="formRules"
        >

        <el-form-item prop="mobile">
          <el-input v-model="user.mobile" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item prop="code">
          <el-input v-model="user.code" placeholder="请输入验证码"></el-input>
        </el-form-item>
        <el-form-item prop="agree">
          <el-checkbox v-model="user.agree"
            >我已阅读并同意用户协议和隐私条款</el-checkbox
          >
        </el-form-item>
        <el-form-item>
          <el-button class="login-btn" type="primary" @click="onLgoin" :loading="loginLoading">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>

import { login } from '@/api/user'

  export default {
    name: 'LoginIndex',
    components: {},
    props: {},
    data() {
      return {
        user: {
          mobile: '13911111111', // 手机号
          code: '666666', // 验证码
          agree: false //是否同意协议
        },
        //checked: false, // 是否同意协议的选中状态
        loginLoading: false, //登录的loading状态
        formRules: { //表单验证规则配置
        // 要验证的数据名称：规则列表[]
          mobile: [
            {required: true, message: '请输入手机号', trigger: 'change' },
            {pattern: /^1[3|5|7|8|9]\d{9}$/,message:'请输入正确的号码格式',trigger:'change'}
          ],
          code: [
            {required: true, message: '请输入验证码', trigger: 'change' },
            {pattern: /^\d{6}$/,message:'请输入正确的验证码格式',trigger:'change'}
          ],
          agree: [
            {
              //自定义校验规则https://element.eleme.cn/#/zh-CN/component/form
              //验证通过：callback()
              //验证失败：callback(new Error('请勾选同意用户协议'))
               validator: (rule, value, callback) => {
                 if(value) {
                   callback()
                 }else{
                   callback(new Error('请勾选同意用户协议'))
                 }
               },
               trigger:'change'



            }
            

          ]

        }
      }
    },
    computed: {},
    watch: {},
    created() {},
    mounted() {},
    methods: {
      onLgoin() {
        //获取表单数据（根据接口要求绑定数据）
        //const user = this.user

        //表单验证
        this.$refs['login-form'].validate(valid => {
          //如果表单验证失败，停止请求登录
          if(!valid) {
            return
          }
          //验证通过，请求登录
          this.login()
        })
        //验证通过，提交登录
        //处理后端响应结果
        //成功：xxx
        //失败：xxx
      },
      login(){
        //开启登录中 loading....
        this.loginLoading = true

        //对于代码中的请求操作
        //1、接口请求可能需要重用
        //2、实际工作中，接口非常容易变动，改起来麻烦
        //我们建议的做法是把所有的请求都封装成函数然后统一的组织到模块中进行管理
        //这样做的好处就是：管理维护更方便，也好重用
        login(this.user).then(res => {

          //登录成功
          this.$message({
            message: '登录成功',
            type: 'success'
          })

          //关闭loading
          this.loginLoading = false

          //将接口返回的用户相关数据放到本地存储，方便应用数据共享
          //本地存储只能存储字符串
          //如果需要存储对象、数组类型的数据，则把他们转为JSON格式字符串进行存储
          window.localStorage.setItem('user', JSON.stringify(res.data.data))
          //跳转到首页
          //this.$router.push('/')
          this.$router.push({
            name: 'home'
          })
        }).catch(err => { //登录失败
          this.$message.error('登录失败，手机号或验证码错误',)
        })
      }

    }
  }
</script>

<style scoped lang="less">
  .login-container {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: url('./login_bg.jpg') no-repeat;
    background-size: cover;
    .login-form-wrap {
      min-width: 300px;
      padding: 30px 50px 10px;
      background-color: #fff;
      .login-head {
        display: flex;
        justify-content: center;
        .logo {
          width: 100px;
          height: 100px;
          background: url('./login_index.png') no-repeat;
          background-size: contain;
        }
      }
      .login-form {
        .login-btn {
          width: 100%;
        }
      }
    }
  }
</style>