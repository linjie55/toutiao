<template>
  <div class="image-list">
        <div class="action-head">
    <el-radio-group  
    v-model="collect" 
    size="mini"
    @change="loadImages(1)"
    >
      <el-radio-button
      
      :label="false"
      >全部</el-radio-button>
      <el-radio-button 
      :label="true"
      >收藏</el-radio-button>
    </el-radio-group>
    <el-button
    v-if="isShowAdd"
    sizi="mini"
    type="success"
    @click="dialogUploadVisible = true"
    >上传素材</el-button>
  </div>
  <!-- 素材列表 -->
  <el-row :gutter="10">
      <el-col 
      :xs="12" 
      :sm="6" 
      :md="6" 
      :lg="4" 
      v-for="(img,index) in images"
      :key="index"
      class="image-item"
      @click.native="selected = index"
      >
      <el-image
      
      style="height:100px" 
      :src="img.url"
      fit="cover">
      </el-image>
    <div 
    class="selected"
    v-if="isShowSelected && selected === index"
    ></div>
      <div class="image-action" v-if="isShowAction">
      <!-- 
        class 样式绑定
        {
          CSS类名：布尔值
        }
        true:作用类名
        false:不作用类名
       -->
       <el-button
         type="warning"
         :icon="img.is_collected ? 'el-icon-star-on' : 'el-icon-star-off'"
         circle
         size="mini"
         @click="onCollect(img)"
         :loading="img.loading"
          
        ></el-button>

        <el-button
         type="danger"
         icon="el-icon-delete"
         circle
         size="mini"
         @click="onDeleteImage(img)"
         :loading="img.loading"
          
        ></el-button>  

      <!-- <i
      class="buttoncolor"
       :class="{
         'el-icon-star-on':img.is_collected,
         'el-icon-star-off':!img.is_collected 
         }" 
         @click="onCollect(img)"
       
       
      ></i> -->
      <!-- <i :class="el-icon-delete-solid"></i> -->
      </div>
      </el-col>
  </el-row>
  <!-- /素材列表 -->

  <!-- 数据分页 -->
  <!-- 
    分页数据改变以后，页码不会变化
    它需要单独处理高亮的页码

   -->
   
  <el-pagination
    background
    layout="total, sizes, prev, pager, next, jumper"
    :total="totalCount"
    :page-size="pageSize"
    :current-page.sync="page"
    @current-change="onPageChange"
    >
  </el-pagination>
  <!-- /数据分页 -->

  <el-dialog 
title="上传素材" 
:visible.sync="dialogUploadVisible"
:append-to-body="true"


>
<!-- upload 组件本身就支持请求提交上传操作，
说白了你使用它不用自己去发请求，它会自己发。
请求方法:默认就是POST
请求路径：action，必须写完整路径
请求体：headers
 -->
  <el-upload
    class="upload-demo"
    drag
    action="http://81.71.147.62:9808/mp/v1_0/user/images"
    :headers="uploadHeaders"
    name="image"
    multiple
    :on-success="onUploadSuccess"
    :show-file-list="false"
    >
    <i class="el-icon-upload"></i>
    <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
    <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>
  </el-upload>  
</el-dialog>
  </div>
</template>

<script>

import {getImages,collectImage,deleteImage} from '@/api/image'
export default {
    name:'ImageList',

    //使用对象的方式定义prop，更严谨，功能更丰富，强烈建议在项目中使用
    //参考文档：https://cn.vuejs.org/v2/guide/components-props.html#Prop-%E9%AA%8C%E8%AF%81
    props:{
        //是否添加显示素材
        isShowAdd:{
            type:Boolean, //布尔值
            default:true //默认值
        },

        //是否显示图片下方的操作（收藏和删除）
        isShowAction:{
            type:Boolean, //布尔值
            default:true //默认值
        },
        isShowSelected:{
            type:Boolean,
            default:false
    }

        
    },
    //使用数组声明
    //prop，不建议，不够严谨，而且功能页不够强大，仅适合demo演示


    data () {
      const user = JSON.parse(window.localStorage.getItem('user'))
      return {
        collect: false,//默认查询全部素材列表
        images:[], //图片素材列表
        dialogUploadVisible:false, //遮罩层
        uploadHeaders:{
          Authorization: `Bearer ${user.token}`      
        },
         totalCount:0, //总数据条数
         pageSize:10, //每页大小
         page:1 ,//当前页码
         collectLoading:false, //收藏的loading状态
         selected:null//选中的索引
        
      }
    },
    created() {
      //页面初始化加载第1页数据
      this.loadImages(1)

    },
    methods:{
      loadImages(page = 1 ){
        //重置高亮页码，防止数据与页码不对应
        this.page = page
        getImages({
          collect:this.collect,
          page,
          per_page: this.pageSize,
        }).then(res => {
          const results = res.data.results
          results.forEach(img => {
            //img对象本来没有loading数据
            //我们这里收到的往里面添加该数据是用来控制每个收
            //藏按钮的loading状态
            img.loading = false
          });
         this.images = results
         this.totalCount = res.data.total_count
        })
      },
      // onCollectChange(){
      //   console.log(this.collect)
      //   this.loadImages(1)

      // },
      onUploadSuccess() {
        //关闭对话框
        this.dialogUploadVisible = false
        //更新素材列表
        this.loadImages(this.page)
        
        this.$message({
          type:'success',
          message:'上传成功'
        })
      },
      onPageChange(page){
        this.loadImages(page)
      },


      onCollect(img){
        //展示 loading
        img.loading = true
        collectImage(img.id, !img.is_collected).then(res => {

        //更新视图状态
          img.is_collected = !img.is_collected
        //关闭 loading
          img.loading = false
        })
        // if (img.is_collected){
        //  //已收藏，取消收藏 
        //  collectImage(img.id,false)
        // }else{
        //  //没有收藏，添加收藏     
        // collectImage(img.id,true)
        // }
       
      },
      onDeleteImage(img) {
        img.loading = true 
        this.$confirm('确认删除吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          //确认执行这里
          deleteImage(img.id).then(res =>
           {
             
          //删除成功，更新当前页的文章数据列表
          this.loadImages(this.page)
          })
        }).catch(() => {
          img.loading = false
          this.$message({
            
            type: 'info',
            message: '已取消删除'
            
          })        
        })
        // 找到数据接口
        // 封装请求方法
        // 删除请求调用
        // 处理响应结果
        
      }
      
    }
}
</script>

<style scoped lang="less">

.action-head{
  padding-bottom: 20px;
  display: flex;
  justify-content: space-between;

}

.image-item{
  position: relative; //父元素
}

.image-action{
  height: 40px; //高
  background-color: rgba(204, 204, 204, .5);//背景颜色
  position: absolute;//子元素
  bottom: 4px;
  left: 5px;
  right: 5px;
  font-size: 25px;//像素
  display: flex;//两边撑开
  justify-content: space-evenly;//边距的距离都相等
  align-items: center;
  color: #fff;

}
.buttoncolor{
  color: aqua;
}

.buttoncolordelete{
  color: firebrick;
}

.selected{
    background: url(./selected.png) no-repeat;
    background-size: 100% 100%;//覆盖背景图片大小
    position: absolute;
    opacity: 0.7;//图片透明
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    
}


</style>