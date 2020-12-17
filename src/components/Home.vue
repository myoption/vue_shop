<template>
  <el-container class="home_container">
    <el-header>
      <div class="header_left">
        <img src="../assets/heima.png" alt="" />
        <span>黑马电商后台管理系统</span>
      </div>
      <el-button class="logout" @click="logout" type="primary" plain>退出</el-button>
    </el-header>
    <el-container>
      <!-- 收起菜单 调整aside宽度 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle_button" @click="toggleCollapse">|||</div>
        <el-menu default-active="activePath" background-color="#333744" text-color="#fff" active-text-color="#409eff" :unique-opened="true" :collapse="isCollapse" :collapse-transition="false" router>
          <!-- 1级菜单 -->
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <!-- 一级菜单模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item @click="saveNavstate(itemc.path)" :key="itemc.id" v-for="itemc in item.children" :index="'/' + itemc.path">
              <!-- 二级菜单模板区域 -->
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{ itemc.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 左侧菜单数据
      menuList: [],
      // 一级菜单图标
      iconObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      isCollapse: false,
      activePath: ''
    }
  },
  // 一加载页面就调用 生命周期
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenuList() {
      const { data: result } = await this.$http.get('menus')
      if (result.meta.status !== 200) return this.$message.error(result.meta.msg)
      this.menuList = result.data
    },
    // 点击按钮展开/收起菜单
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    saveNavstate(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
      console.log(this.activePath)
    }
  }
}
</script>

<style lang="less" scoped>
.home_container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  color: #fff;
  display: flex;
  // 左右贴边对齐
  justify-content: space-between;
  // 按钮垂直居中
  align-items: center;
  font-size: 20px;
  .header_left {
    display: flex;
    // 文字垂直居中
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}

.el-aside {
  background-color: #333744;
  color: #fff;
}

.el-main {
  background-color: #eaedf1;
  color: #333;
}

.iconfont {
  margin-right: 10px;
}

.toggle_button {
  background-color: #4a5064;
  text-align: center;
  color: #fff;
  letter-spacing: 0.2em;
  line-height: 26px;
  cursor: pointer;
}
</style>