<template>
  <div class="fans-container"><el-card class="box-card">
  <div slot="header" class="clearfix">
      <!-- 面包屑路径导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/' }">首页
        </el-breadcrumb-item>
        <el-breadcrumb-item>粉丝管理</el-breadcrumb-item>
        </el-breadcrumb>
    <!-- /面包屑路径导航 -->
  </div>
   
  <el-tabs type="card" v-model="activeName">
        <el-tab-pane label="粉丝列表" name="list">
  <el-row :gutter="10" >
        <el-col 
        :xs="12"
        :sm="6"
        :md="6"
        :lg="4"
        v-for="(fens,index) in list" 
        :key="index"
        class="fans_item">
        <el-avatar :size="50" :src=fens.photo></el-avatar>
        <p>{{fens.name}}</p>
        <el-button type="primary" plain size="small">+关注</el-button>
    </el-col>
</el-row>

        <!-- 分页列表 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page.sync="page"
      :page-sizes="[10, 20, 300, 400]"
      :page-size.sync="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="totalCount"
      background
      >
    </el-pagination>
  <!-- /分页列表 -->

        </el-tab-pane>
        <el-tab-pane label="粉丝画像" name="photo">

            <!-- 为ECharts准备一个具备大小（宽高）的画布容器Dom -->
        <div ref="main" style="width: 600px;height:400px;"></div>

        <h2>地图图标示例</h2>
        <map-demo />
            
        </el-tab-pane>    
      </el-tabs>
</el-card>
</div>
</template>


<script>
//2、加载echarts
import * as echarts from 'echarts'
import { getUserfans } from '@/api/user'
import MapDemo from './components/map-demo'



        

export default {
  components:{
    MapDemo
  },
  data () {
    return {
        list: [],
            totalCount:0, //总数据条数
            pageSize:20,
            page:1, //当前激活的页码
            activeName:'list' //默认显示页面
    }
  },
  name:'',
  
    created(){
        this.loadfans()
       
    },
    mounted(){
      //3.初始化生成图表，基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(this.$refs.main)

         //注意：初始化操作DOM一定要写到mounted钩子函数中
        // 指定图表的配置项和数据
        var option = {
            title: {
                text: 'ECharts 入门示例'
            },
            tooltip: {},
            legend: {
                data:['销量']
            },
            xAxis: {
                data: ["衬衫","羊毛衫","雪纺衫","裤子","高跟鞋","袜子"]
            },
            yAxis: {},
            series: [{
                name: '销量',
                type: 'bar',
                data: [5, 20, 36, 10, 10, 20]
            }]
        };

        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option);

    },
    methods:{
        handleSizeChange(){
          this.loadfans(1)
        },
        handleCurrentChange(page){
          //页码改变，加载指定页码数据
          this.loadfans(page)
        },
        loadfans(){
           getUserfans({

           }).then(res => {
            this.list = res.data.data.results 
            this.name = res.data.data.results[0].name
            this.totalCount = res.data.data.total_count
           })                 
        }
        
    }

}
</script>

<style scoped lang='less'>

.fans_item{
  width: 120px;
  height: 170px;
  border: 1px dashed #ddd;
  text-align: center;
  margin-bottom: 20px; //间距
  margin-left: 60px;

  padding-top: 10px;
  p{
    font-size: 12px;
  }
}

</style>
