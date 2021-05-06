<template>
  <div class="home-container">
    <img class="homeimage" :src="user.photo"  alt="">
  </div>
  
</template>


<script>
import { getUserProfile } from '@/api/user'
export default {
  data() {
    return {
      user:{
        photo:''
      }
    }
  },
  created() {
    this.loadUserhome()
  },
  methods:{
    loadUserhome (){
      getUserProfile().then(res => {
        this.user.photo = res.data.data.photo
      })
    }
  }
  
    //指定name选项的另一个好处是便于调试。
    //有名字的组件有更友好的警告信息。
    //另外，当在有vue-devtools，未命名组件将显示成<AnonymousComponent>,这很没有语义。通过提高 name 选项，可以获得更有语义信息的组件树。
    //结论：给一个组件起个名字是非常有意义的，尽量不要让组件的名字重复
}
</script>

<style scoped lang="less"> 
.homeimage{
  height: 100%;
  width: 100%;
}
</style>