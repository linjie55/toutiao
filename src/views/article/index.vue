<template>
    <div class="article-container">
        <el-card class="filter-card">
    <div slot="header" class="clearfix">
    <!-- 面包屑路径导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/' }">首页
        </el-breadcrumb-item>
        <el-breadcrumb-item>内容管理</el-breadcrumb-item>
        </el-breadcrumb>
    <!-- /面包屑路径导航 -->
    </div>
    <!-- 数据筛选表单 -->
<el-form ref="form" :model="form" label-width="60px" size="mini">
    <el-form-item label="状态：">
    <el-radio-group v-model="status">
      <!-- 
        el-radio 默认把label作为文本和选中之后的value值
        el-radio 的文本和value值可以分开

       -->
      <el-radio :label="null">全部</el-radio>
      <el-radio :label="0">草稿</el-radio>
      <el-radio :label="1">待审核</el-radio>
      <el-radio :label="2">审核通过</el-radio>
      <el-radio :label="3">审核失败</el-radio>
      <el-radio :label="4">已删除</el-radio>
    </el-radio-group>
    </el-form-item>
    <el-form-item label="频道：">
    <el-select v-model="channelId" placeholder="请选择">
      <el-option   
       label="全部" 
       :value="null"
       ></el-option>
      <el-option   
       :label="channel.name" 
       :value="channel.id"
       v-for="(channel,index) in channels"
       :key="index"
       ></el-option>
    </el-select>
  </el-form-item>
  <el-form-item label="日期：">
    <el-date-picker
      v-model="rangeDate"
      type="datetimerange"
      start-placeholder="开始日期"
      end-placeholder="结束日期"
      format="yyyy-MM-dd"
      value-format="yyyy-MM-dd"
      >
    </el-date-picker>
  </el-form-item>
  <el-form-item>
    <!-- button 按钮的click事件有个默认参数
          当你没有指定参数的时候，它会默认传递一个没用的数据
         -->
    <el-button type="primary"
      :disabled="loading"
      @click="loadArticles(1)">筛选</el-button>
  </el-form-item>
</el-form>
<!-- /数据筛选表单 -->
    </el-card>


<el-card class="filter-card">
    <div slot="header" class="clearfix">
        根据筛选条件共查询到{{totalCount}}条结果：
    </div>
   <!-- 数据列表 -->

   <!-- 1、把需要展示的数组列表数据绑定给 table 组件的data属性
            注意：你不用去 v-for 遍历，它自己会遍历
        2、设计表格列 <el-table-column
          width 可以设定表格列的宽度
          label 可以设定列的标题
          prop 用来设定要渲染的列表项数据字段,只能展示文本
        3、表格列默认只能渲染普通文本，如果需要展示其它内容，例如放个按钮啊、
        放个图片啊，那就需要自定义表格列模板了：
        https://element.eleme.cn/#/zh-CN/component/table#zi-ding-yi-lie-mo-ban



    -->
    <el-table
      :data="articles"
      stripe
      style="width: 100%"
      class="list-table"
      size="mini"
      v-loading='loading'
      >
      <el-table-column
        prop="date"
        label="封面">
        <template slot-scope="scope">
          <el-image
            style="width: 100px; height: 100px"
            :src="scope.row.cover.images[0]" 
            fit="cover"
            lazy 
            ></el-image>
          <!-- <img
          v-if="scope.row.cover.images[0]"      
          class="article-cover"
           :src="scope.row.cover.images[0] " alt="">
           <img v-else class="article-cover"
            src="./no-cover.jpg" alt=""> -->
            <!-- 下面这种情况是在运行期间动态改变处理的。
                  而本地图片必须在打包的时候就存在。 -->

          <!-- 错误写法 -->
          <!-- <img class="article-cover" :src="scope.row.cover.images[0] || 'no-cover.jpg'" alt=""> -->

        </template>
      </el-table-column>
      <el-table-column
        prop="title"
        label="标题">
      </el-table-column>
      <el-table-column
        label="状态">
        <!-- 如果需要在自定义列模板中获取当前遍历项数据，那么就在 tamplate 上声明
        slot-scope="scope"
         -->
        <template slot-scope="scope">
          <el-tag :type="articleStatus[scope.row.status].type">
            {{ articleStatus[scope.row.status].text }}</el-tag>

          <!-- <el-tag v-else-if="scope.row.status === 1">待审核</el-tag>
          <el-tag type="success" v-else-if="scope.row.status === 2">审核通过</el-tag>
          <el-tag type="danger" v-else-if="scope.row.status === 3">审核失败</el-tag>
          <el-tag type="info" v-else-if="scope.row.status === 4">已删除</el-tag> -->
        </template>
      </el-table-column>
      <el-table-column
        prop="pubdate"
        label="发布时间">
      </el-table-column>
      <el-table-column
        label="操作">
        <!-- 如果需要自定义表格列模板，则把需要自定义的内容放到 template 里面 -->
        <template slot-scope="scope">
        <el-button 
         size="mini"
         circle
         icon="el-icon-edit" 
         type="primary"
         @click="$router.push('/publish?id=' + scope.row.id)"
         
         ></el-button>
        <el-button 
         type="danger"
         size="mini"
         icon="el-icon-delete" 
         circle
         @click="onDeleteArticle(scope.row.id)"
         ></el-button>
      </template>
      </el-table-column>
    </el-table>
<!-- /数据列表 -->

<!-- 列表分页 -->
<!-- total 用来设定总数据的条数
      它默认按照10条每页计算总页码
      你只要把总数据条数给它，它就计算出来一共有多少页码

      其实计算总页码的方式非常简单，需要两个核心数据：
      -每页大小
      -总数据条数

      page-size 每页显示条目个数，支持 .sync修饰符，默认每页10条 
      
      分页组件中设定的每页数据大小应该和我们请求数据的每页大小保持一致，否则页码的计算就会有问题。
      -->
  <el-pagination
    background
    layout="prev, pager, next"
    :total="totalCount"
    :page-size="pageSize"
    :disabled="loading"
    :current-page.sync="page"
    @current-change="onCurrentChange"
    
    >
  </el-pagination>
  <!-- /列表分页 -->
    </el-card>
    



</div>
</template>

<script>
import { getArticles,getArticleChannels,deleteArticle } from '@/api/article'



export default {
    data() {
      return {
        form: {
          name: '',
          region: '',
          date1: '',
          date2: '',
          delivery: false,
          type: [],
          resource: '',
          desc: '',
          
          
        },
          articles: [], //文章数据列表
          articleStatus:[
            {status: 0, text:'草稿', type: 'info'},//0
            {status: 1, text:'待审核', type: ''},//1
            {status: 2, text:'审核通过', type: 'success'},//2
            {status: 3, text:'审核失败', type: 'danger'},//3
            {status: 4, text:'已删除', type: 'danger'},//4
          ],
          totalCount:0 ,//总数据条数
          pageSize:10, //每页大小
          status:null, //筛选文章的状态，不传就是全部
          channels:[],//文章频道列表
          channelId:null, //查询文章的频道
          rangeDate:null, //筛选的默认日期
          loading: true, //表单数据加载中 loading
          page:1 //当前页码


      }
      
    },
    created () {
        this.loadChannels()
        this.loadArticles()
    },

    methods: {
      //循环图片并过滤掉网址
        loadArticles(page = 1){
          //展示加载中 loading
          this.loading = true
            getArticles({
              page,
              per_page : this.pageSize,
              status:this.status,
              channel_id:this.channelId,
              begin_pubdate: this.rangeDate ? this.rangeDate[0] :null, //开始日期
              end_pubdate: this.rangeDate ? this.rangeDate[1] : null //截止日期
              
              
            }).then(res => {
              //total_count:totalCount 驼峰不规范更名
              const {results, total_count:totalCount} =res.data.data
              this.articles = results
              this.totalCount = totalCount

              //关闭加载中 loading
              this.loading = false
              this.articles = res.data.data.results

              
              var reg = new RegExp("http://81.71.147.62/download/download/","g")
              this.articles.forEach((item, index) => {
		          var str = item.cover.images[0]
              var a = str.replace(reg,"");
              a = "http://81.71.147.62/download/"+a
              this.articles[index].cover.images[0] = a
})
                  
            })
        },

      pickerOptions(){

      },
      onCurrentChange(page) {
        this.loadArticles(page)
      },
      loadChannels(){
        getArticleChannels().then(res => {
          this.channels = res.data.data.channels
        })
      },
      onDeleteArticle(articleId) {
        this.$confirm('确认删除吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          //确认执行这里
          deleteArticle(articleId).then(res =>
           {
          //删除成功，更新当前页的文章数据列表
          this.loadArticles(this.page)
          })
        }).catch(() => {
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

<style lang="less" scoped>
.filter-card{
    margin-bottom: 30px;
}
.list-table{
    margin-bottom: 20px;
}

.article-cover{
  width: 150px;
  height: 100px;
  background-size: cover;
}


</style>>

