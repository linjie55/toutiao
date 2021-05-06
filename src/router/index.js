import Vue from 'vue'
import VueRouter from 'vue-router'

//在 VueCLI 创建的项目中 @表示src目录
//它是src目录的路径别名
//好处：它不受当前文件路径影响
//注意：@就是src路径，后面别忘了写那个斜杠
//建议：如果加载的资源路径就在当前目录下，那就正常写
//     如果需要进行父级路径查找的都使用@
import Login from '@/views/login/index.vue'
import Home from '@/views/home/index.vue'
import Layout from '@/views/layout/index.vue'
import Article from '@/views/article/index.vue'
import Publish from '@/views/publish/index.vue'
import Image from '@/views/image/index.vue'
import Comment from '@/views/comment/index.vue'
import Settings from '@/views/settings/index.vue'
import Fans from '@/views/fans/index.vue'

Vue.use(VueRouter)

//路由配置表
const routes = [
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/',
    //命名路由layout有一个默认子路由，这个名字没有意义，所以警告
    //正确的做法是：如果有默认子路由，就不要给父路由起名字了
    // name: 'layout',
    component:Layout,
    children:[
      {
        path: '/', //path为空，会作为默认子路由渲染
    
        //路由的名字是干啥的？
        name: 'home',
        component: Home
      },
      {
        path: '/article',
        name: 'article',
        component: Article
      },
      {
        path: '/publish',
        name: 'publish',
        component: Publish
      },
      {
        path: '/image',
        name: 'image',
        component: Image
      },
      {
        path: '/comment',
        name: 'comment',
        component: Comment
      },
      {
        path: '/settings',
        name: 'settings',
        component: Settings
      },
      {
        path: '/fans',
        name: 'fans',
        component: Fans
      },
    ]

  }

  
]

const router = new VueRouter({
  
  routes
  
})

//路由导航守卫：说白了所有页面的导航都会经过这里
//守卫页面的导航的
//to:要去的路由信息
//from:来自哪里的路由信息
//next:放行方法
router.beforeEach((to, from, next) => {
  //如果要访问的页面不是 /login，校验登录状态
  //如果没有登录，则跳转到登录页面
  //如果登录了，则允许通过
  //允许通过

  const user = JSON.parse(window.localStorage.getItem('user'))

  if(to.path !== '/login') {
    if(user) {
      next()
    }else{
      //没有登录，跳转到登录页面
      next('/login')
    }

  }else{
    //登录页面，正常允许通过
    next()

  }
})

//我们在组件中使用的this.$router其实就是这个模块中的router
export default router
