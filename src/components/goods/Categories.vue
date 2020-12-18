<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 添加按钮 -->
      <el-row>
        <el-col :span="4">
          <el-button @click="addCategoriesDialog" type="primary">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 显示分类 -->
      <el-table>
        <el-table-column></el-table-column>
      </el-table>
      <!-- 页码 -->
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog :visible.sync="CategoriesDialogVisible" title="添加分类" width="30%">
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="CategoriesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="CategoriesDialogVisible = true">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 添加分类对话框显示
      CategoriesDialogVisible: false
    }
  },
  methods: {
    addCategoriesDialog() {
      this.CategoriesDialogVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
</style>