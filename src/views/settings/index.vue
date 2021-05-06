<template>
  <div class="settings-container"><el-card class="box-card">
  <div slot="header" class="clearfix">
    <!-- 面包屑路径导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/' }">首页
        </el-breadcrumb-item>
        <el-breadcrumb-item>个人设置</el-breadcrumb-item>
        </el-breadcrumb>
    <!-- /面包屑路径导航 -->
  </div>
  <!-- 栅格化 -->
  <el-row>
    <el-col :span="15">
  <el-form ref="form" :model="user" label-width="100px" :rules="formRules">
  <el-form-item label="编号：">
    {{user.id}}
  </el-form-item>
  <el-form-item label="手机号：">
    {{user.mobile}}
  </el-form-item >
  <el-form-item label="媒体名称：" prop="name">
    <el-input v-model="user.name"></el-input>
  </el-form-item>
  <el-form-item label="媒体介绍：" prop="intro">
    <el-input type="textarea" v-model="user.intro"></el-input>
  </el-form-item>
  <el-form-item label="邮箱：" prop="email">
    <el-input v-model="user.email"></el-input>
  </el-form-item>
  <el-form-item>
    <el-button 
    type="primary" 
    :loading="uodateProfileLoading"
    @click="onUpdateUser"
    
    >保存设置</el-button>
  </el-form-item>
</el-form></el-col>
    <el-col :offset="2" :span="5">
     
          
          <label for="file"> <el-avatar
        shape="square"
        :size="150"
        fit="fit"
        :src="user.photo"
        @change="onFileChange"
        ></el-avatar></label>
        <p @click="$refs.file.click()">点击修改头像</p>
          <input 
          id="file"
          type="file" 
          hidden ref="file"
          @change="onFileChange"
          >
    </el-col>
  </el-row>
  <!-- /栅格化 -->
  
</el-card>

<el-dialog
  title="修改头像"
  :visible.sync="dialogVisible"
  append-to-body
  @opened="onDialogOpened"
  @closed="onDialogClosed"
  >
  <div class="preview-image-wrap">
    <img 
    class="preview-image" 
    :src="previewImage" 
    ref="preview-image"
    
    >
  </div>
  <img  >
  <span slot="footer" class="dialog-footer">
    <el-button @click="dialogVisible = false">取 消</el-button>
    <el-button 
    type="primary" 
    :loading="updatePhotoLoading"
    @click="onUpdatePhoto"
    
    >确 定</el-button>
  </span>
</el-dialog>
</div>
</template>



<script>
import { getUserProfile,updateUserPhoto,updateUserProfile } from '@/api/user'
import 'cropperjs/dist/cropper.css'
import Cropper from 'cropperjs'

import globalBus from '@/utils/global-bus'

export default {
    data() {
      return { 
        
        formRules:{
            name: [
              { required:true, message:'请输入媒体名称',
            trigger:'blur' 
          },
          { min: 5, max: 30, message: '长度在 1 到 30 个字符', trigger: 'blur' }
            ],
            intro:[
              { required:true, message:'请输入媒体内容',
            trigger:'blur' 
          },

            ],
            email:[
              { required:true, message:'请输入邮箱',
            trigger:'blur' 
          },

            ]


          },
        user:{
        
          email:'',
          id:'null',
          intro:'',
          mobile:'',
          name:'',
          photo:''
        },//用户资料
        dialogVisible: false, //控制上传图片裁切预览的显示状态
        previewImage:'',//预览图片
        cropper:null, //裁切器示例
        updatePhotoLoading:false, //更新用户头像loading状态
        uodateProfileLoading:false//更新基本信息的loading状态
      }
    },
    created(){
      this.loadUser()
    },
    methods: {
      onUpdateUser() {
        //表单验证
        //验证通过，提交表单

        //开启loading状态
        this.uodateProfileLoading = true
        updateUserProfile(this.user).then(res =>{
          // name:this.user.nama,
          // intro:this.user.intro,
          // email:this.user.email
          this.$message({
            type:'success',
            message:"保存设置成功"
          })

          //关闭loading状态
          this.uodateProfileLoading = false
        })

        //更新头部当前登录用户的信息
        //发布通知，用户信息已修改
          globalBus.$emit('update-user',this.user)
        
      },
      loadUser(){
        getUserProfile().then(res => {
          this.user = res.data.data
        })
      },

      onFileChange(){
        //处理图片预览
        const file = this.$refs.file
        const blobData = window.URL.createObjectURL(file.files[0])
        
        this.previewImage = blobData

        //展示弹出层，预览用户选择的图片
        this.dialogVisible = true

        

        //解决选择相同文件不触发change事件问题
        this.$refs.file.value = ''
      },
      onDialogOpened(){
        //图片裁切器必须基于img进行初始化
        //注意：img必须是可见状态才能正常完成初始化
        //因为我们这里要在对话框里面初始化裁切器
        //所以务必要在对话框完全打开的状态去进行初始化
        //获取图片DOM节点
        const image = this.$refs['preview-image']

        //第1次初始化好以后，如果预览裁切的图片发生了变化，
        //裁切器默认不会更新
        //如果需要预览图片发生变化更新裁切器：
        //  方式一：裁切器.replace方法
        //  方式二：销毁裁切器，重新初始化
        //初始化裁切器
        // if(this.cropper){
        //   this.cropper.replace(this.previewImage)
        //   return
        // }
        this.cropper = new Cropper(image, {
          aspectRatio: 1,
          viewMode:1,
          dragMode:'none', //固定图片
          cropBoxResizable:false,
        })

      },
      onDialogClosed(){
        //对话框关闭，销毁裁切器
        this.cropper.destroy()
      },

      onUpdatePhoto(){
        //让确定按钮开始loading
        this.updatePhotoLoading = true
        //获取裁切的图片对象
        this.cropper.getCroppedCanvas().toBlob(file => {
          const fd = new FormData()
          fd.append('photo',file)
          //请求更新用户头像请求提交fd
          updateUserPhoto(fd).then(res => {
          //关闭对话框
          this.dialogVisible = false
          //更新视图展示

          //直接把截切结果的文件对象转为blob
          //数据本地预览
          this.user.photo = window.URL.createObjectURL(file)

          //关闭确定按钮loading
          this.updatePhotoLoading = false

          this.$message({
            type:'success',
            message:"更新头像成功"
          })

          //更新顶部登录用户的信息
          globalBus.$emit('update-user',this.user)
            

          //把服务端返回的图片进行展示有点慢
          //this.user.photo = res.data.data.photo
          })
        })   
      }
    }
  }
</script>

<style scoped lang="less">
.preview-image-wrap{
/* Ensure the size of the image fit the container perfectly */
.preview-image {
  display: block;

  /* This rule is very important, please don't ignore this */
  max-width: 100%;
  height: 200px;
}
}
</style>