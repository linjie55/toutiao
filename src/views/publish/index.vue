<template>
  <div class="publish-container">
    <el-card class="box-card">
  <div slot="header" class="clearfix">
    <!-- 面包屑路径导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/' }">首页
        </el-breadcrumb-item>
        <el-breadcrumb-item>{{ $route.query.id ? '修改文章' : '发布文章'}}</el-breadcrumb-item>
        </el-breadcrumb>
    <!-- /面包屑路径导航 -->
  </div>
    <el-form
     ref="publish-form"
     :model="article"
     :rules="formRules"
     label-width="60px"
     

    
     
     >
  <el-form-item label="标题" prop="title">
    <el-input v-model="article.title"></el-input>
  </el-form-item>
  <el-form-item label="内容" prop="content">
    <el-tiptap
      v-model="article.content"
      :extensions="extensions"
    />
  </el-form-item>
  <el-form-item label="封面">
    <el-radio-group v-model="article.cover.type">
      <el-radio :label="1">单图</el-radio>
      <el-radio :label="3">三图</el-radio>
      <el-radio :label="0">无图</el-radio>
      <el-radio :label="-1">自动</el-radio>
  </el-radio-group>

  <!-- 
    我们需要把选择的封面图片的地址放到
    article.cover.images数组中

    当年给事件处理函数传递了自定义参数以后，就无法得到原本的那个数据参数了。

    如果想要在事件处理函数自定义传参以后还想得到
    原来的那个事件本身的参数，则手动指定$event,它就代表那个
    事件本身的参数
    
    在组件上使用v-model
    
    当你给子组件提供的数据既要使用还要修改，这个时候我们可以使用v-model简化数据绑定。
    v-model="article.cover.images[index]"
    给子组件传递了一名字叫value的数据
    相当于:value="article.cover.images[index]"
    默认监听input事件，当事件发生，它会让绑定数据 = 事件参数
    @input="article.cover.images[index] =事件参数"

    注意：v-model
    仅仅是简写了而已。本质还是在父子组件通信

    v-model的参考文档https://cn.vuejs.org/v2/guide/components-custom-events.html#%E8%87%AA%E5%AE%9A%E4%B9%89%E7%BB%84%E4%BB%B6%E7%9A%84-v-model 
   -->
  <template v-if="article.cover.type > 0">
    <upload-cover
      :key="cover"
      v-for="(cover, index) in article.cover.type" 
     v-model="article.cover.images[index]"
    />
    <!-- <upload-cover
      :key="cover"
      v-for="(cover, index) in article.cover.type" 
      :cover-image="article.cover.images[index]"
      @update-cover="onUpdateCover(index, $event)"
    /> -->
    </template>   
    
  </el-form-item>
  <el-form-item label="频道" prop="channel_id">
    <el-select v-model="article.channel_id" placeholder="请选择频道">
      <el-option
        :label="channel.name"
        :value="channel.id"
        v-for="(channel,index) in channels"
        :key="index"
        ></el-option>
    </el-select>
  </el-form-item>
  <el-form-item>
    <el-button type="primary" @click="onPublish(false)">{{ $route.query.id ? '修改' : '发表'}}</el-button>
    <el-button @click="onPublish(true)">存入草稿</el-button>
  </el-form-item>
</el-form>
</el-card>
</div>
</template>

<script>
import UploadCover from './components/upload-cover'
import {getArticleChannels,addArticle,getArticle,updateArticle} from '@/api/article'
import 
{ ElementTiptap,
  Doc,
  Text,
  Paragraph,
  Heading,
  Bold,
  Underline,
  Italic,
  Strike,
  ListItem,
  BulletList,
  OrderedList,
  TextColor,
  Image
 } from 'element-tiptap'
 import 'element-tiptap/lib/index.css';
 import { uploadImage } from '@/api/image' 

export default {
    name:'publishIndex',
    components: {
      'el-tiptap': ElementTiptap,
      UploadCover
    },
    props:'',
    data () {
      return {
        channels:[],//文章频道列表
        article:{
          title:'',//文章标题
          content:'',//文章内容
          cover:{ //文章封面
          type: 1, //封面的类型， -1：自动，0-无图，1-1张，3-3张
          images:[],//封面图片的地址
          },
          channel_id:null,
          visibleLine: 'none'  //隐藏
          
      
        },
        // 编辑器的 extensions
        // 它们将会按照你声明的顺序被添加到菜单栏和气泡菜单中
        extensions: [
          new Doc(),
          new Text(),
          new Paragraph(),
          new Heading({ level: 5 }),
          new Bold({ bubble: true }), // 在气泡菜单中渲染菜单按钮
          new Underline({ bubble: true, menubar: false }), // 在气泡菜单而不在菜单栏中渲染菜单按钮
          new Italic(),
          new Strike(),
          new ListItem(),
          new BulletList(),
          new OrderedList(),
          new TextColor(),
          new Image({
            //默认会把图片生成base64字符串和内容存储在一起，如果需要自定义图片上传
            uploadRequest(file){
              //如果接口要求Content-Type是multipart/form-data，则请求体必须用FormData
              const fd = new FormData()
              fd.append('image',file)
              //第一个return是返回Promise对象
              //为什么？因为axios本身就是返回Promise对象
              return uploadImage(fd).then( res => {
                //这个return是返回最后的结果
                return res.data.data.url
              })
            }
          }),
          
      ],
      formRules:{
        title:[
          { required:true, message:'请输入文章标题',
            trigger:'blur' 
          },
          { min: 5, max: 30, message: '长度在 1 到 30 个字符', trigger: 'blur' }
        ],
        content:[{
          validator (rule, value,callback){
            if(value === '<p></p>'){
              //验证失败
              callback(new Error('请输入文章内容'))
            }else{
              //验证通过
              callback()
            }
          }
        },
        { required:true, message:'请输入文章内容',
            trigger:'blur' 
          },
        ],
        
        channel_id:[
          { required:true, message:'请选择文章频道',
          },
        ]
      }
       }
    },
    computed: {},
    watch: {},
    created () {
      this.loadChannels()

      //由于我们让发布和修改使用的同一个组件
      //所以这里要判断
      //如果路由路径参数中有id，则请求展示文章内容
      if(this.$route.query.id){
        this.loadArticle()
      }
    },
    mounted () {},
    methods: {
      loadChannels(){
        getArticleChannels().then(res => {
          this.channels = res.data.data.channels
          
          
        })
      },
      onPublish(draft = false) {
        this.$refs['publish-form'].validate(valid => {
          if (!valid){
            return
          }
          //验证通过，提交表单
          //找到数据接口
        //封装请求方法
        //请求提交表单
        //如果是修改文章，则执行修改操作，否则执行添加操作
        const articleId =this.$route.query.id
        if(articleId) {
          updateArticle(articleId,this.article,draft).then(res => {
            
            this.$message({
            message:`${draft ? '存入草稿' : '发表'}成功`,
            type:'success'
          })
          //跳转到内容管理页面
          this.$router.push('/article')
          })
          //执行修改操作
        }else{
          addArticle(this.article,draft).then(res => {
            
          //处理响应结果
          this.$message({
            message:`${draft ? '存入草稿' : '发表'}成功`,
            type:'success'
          })
          //跳转到内容管理页面
          this.$router.push('/article')
        })

        }
        })
        
        
        //处理响应结果

      },

      //修改文章：加载文章内容
      loadArticle(){
        //找到数据接口
        //封装请求方法
        //请求获取数据
        getArticle(this.$route.query.id).then(res => {
          //模板绑定展示
          this.article = res.data.data
         
          var reg = new RegExp("http://81.71.147.62/download/download/","g")
          this.article.cover.images.forEach((item, index) => {
          var str = item
          var a = str.replace(reg,"");
          a = "http://81.71.147.62/download/"+a
          this.article.cover.images[index] = a
})
        })
        


      },
      onUpdateCover(index,url){
      this.article.cover.images[index] = url
      }

    }

}
</script>

<style>

</style>