import Vue from 'vue'
import App from './App.vue'
import router from './router'
import * as echarts from 'echarts';
import { ElementTiptapPlugin } from 'element-tiptap';
// import element-tiptap 样式
import 'element-tiptap/lib/index.css';

//加载Element组件库
import ElementUI from 'element-ui'

//加载Element组件库的样式
import 'element-ui/lib/theme-chalk/index.css'

//加载全局样式文件
import './styles/index.less'



//全局注册Element组件库
Vue.use(ElementUI);

Vue.config.productionTip = false

//创建Vue根实例
//把router 配置到根实例中
//通过render方法把APP根组件渲染到 #app 入口节点

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

// 安装 element-tiptap 插件
Vue.use(ElementTiptapPlugin, { /* 插件配置项 */ lang: 'zh' })
// 现在你已经在全局注册了 `el-tiptap` 组件。


//加载echarts
Vue.prototype.$echarts = echarts