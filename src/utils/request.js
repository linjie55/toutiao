// 基于 axios 封装的请求模块
import axios from 'axios'

//非组件模块可以这样加载使用element的message组件 
import { Message } from 'element-ui'

//引用路由
import router from '@/router'
//import JSONbig from 'json-bigint'

//创建一个axios实例，说白了就是复制了一个axios
//我们通过这个实例去发请求，把需要的配置配置给这个实例来处
const request =  axios.create({
    baseURL: 'http://81.71.147.62:9808/', //请求的基础路径
    //http://81.71.147.62:9808/
    //xn3j9w3q.xiaomy.net:25631
    //定义后端返回的袁术数据的处理
    //参数data就是后端返回的原始数据(未经处理的JSON格式字符串)
    // transformResponse: [function(data) {

    // //后端返回的数据可能不是JSON格式字符串
    // //如果不是的话,那么 JSONbig.parse 调用就会报错
    // //所以我们使用 try-catch来捕获异常，处理异常的发生
    // try {
    //     //如果转换成功，则直接把结果返回
    //     return JSONbig.parse(data)
    //     //如果转换失败了，则进入这里
    //     //我们在这里把数据原封不动的直接返回给请求使用
    // } catch (err) {
    //     console.log('转换失败',err)
    //     return data
    // }

    //     //axios默认在内部使用JSON.parse来转换处理原始数据
    //     //return JSON.parse(data)
    // }],

})

//请求拦截器
request.interceptors.request.use(
    //所有请求会经过这里
    //config是当前请求相关的配置信息对象
    //config是可以修改的
function(config) {
    const user = JSON.parse(window.localStorage.getItem('user'))
    //如果有登录用户信息，则通一设置 token
    if (user){
        config.headers.Authorization = `Bearer ${user.token}`
    }
    //然后我们就可以在允许请求出去之前定制统一业务功能处理
    //例如：统一的设置token
    
    //当这里return config之后请求在会真正的发出去
    return config
    
},
//请求失败，会经过这里
function (error) {
    return Promise.reject(error)

}
)

//响应拦截器
// Add a response interceptor
request.interceptors.response.use(function (response) {
    //所有响应码为2xx的响应都会进入这里
    
    //response是响应处理
    //注意：一定要把响应结果return，否则真正发请求的位置拿不到数据
    return response
}, function (error) {
    const {status} = error.response
    //任何超出2xx的响应码都会进入这里
    if(status === 401) {
        //跳转到登录页面
        //清楚本地存储中的用户登录状态
        window.localStorage.removeItem('user')
        router.push('/login')
        Message('登录状态无效，请重新登录')
    }else if(status === 403) {
        Message({
            type:'warning',
            message:'没有操作权限'
        })
    }else if(status >= 500) {
        Message('服务端内部异常，请稍后重试')
    }else if(status === 400){
        Message.error('参数错误，请检查请求参数')
    }
    return Promise.reject(error)
})

//导出请求方法
export default request

//谁要使用谁就加载request模块
