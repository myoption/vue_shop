<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加按钮 -->
      <el-row>
        <el-col>
          <el-button @click="addCategoriesDialog" type="primary">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 显示分类 -->
      <tree-table class="tree-table" :data="goodsCategoriesList" :columns="columns" :selection-type="false" :expand-type="false" :show-index="true" border>
        <!-- 是否有效  -->
        <template slot="isok" slot-scope="scope">
          <el-tag size="medium" v-if="scope.row.cat_deleted == false">
            <i class="el-icon-success" v-if="scope.row.cat_deleted == false"></i>
            有效
          </el-tag>
          <el-tag type="danger" size="medium" v-if="scope.row.cat_deleted == true" style="color: red">
            <i class="el-icon-error" v-if="scope.row.cat_deleted == true"></i>
            无效
          </el-tag>
        </template>
        <!-- 排序 -->
        <template slot="rank" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level == 0">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level == 1" type="success">二级</el-tag>
          <el-tag v-else-if="scope.row.cat_level == 2" type="warning">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot-scope="scope" slot="operation">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="editCatDialog(scope.row)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteCatDialog(scope.row)">删除</el-button>
        </template>
      </tree-table>
      <!-- 页码 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="qureyInfo.pagenum"
        :page-size="qureyInfo.pagesize"
        :page-sizes="[5, 10, 15]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog :visible.sync="CategoriesDialogVisible" title="添加分类" width="30%" @close="resetAddForm">
      <!-- 主体 -->
      <el-form :model="addCatForm" :rules="addCatFormRules" ref="addCatFormRef" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCatForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- v-model 将选中的值双向绑定 为数组 -->
          <el-cascader v-model="selectedKeys" :options="catParnetList" :props="cascaderProps" @change="handleChange" collapse-tags clearable change-on-select></el-cascader>
        </el-form-item>
      </el-form>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="CategoriesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmCategories">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑对话框 -->
    <el-dialog :visible.sync="editCatDialogVisible" title="编辑分类">
      <el-form :model="editCatForm" ref="editCatRef" :rules="addCatFormRules" label-width="80px">
        <el-form-item prop="cat_name" label="分类名称">
          <el-input v-model="editCatForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCatDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="cofirmEditCatDialog">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 删除对话框 -->
    <el-dialog :visible.sync="deleteCatDialogVisible" title="删除分类" width="30%">
      <span>该操作将永久删除分类，是否继续？</span>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteCatDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="cofirmDeleteCatDialog">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 添加分类对话框显示
      CategoriesDialogVisible: false,
      // 编辑分类对话框
      editCatDialogVisible: false,
      // 删除对话框
      deleteCatDialogVisible: false,
      // 商品分类数据
      goodsCategoriesList: [],
      // 查询条件
      qureyInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 页码总数
      pageTotal: 0,
      // 分类总数
      total: 0,
      // 为table指定列定义
      columns: [
        { label: '分类名称', prop: 'cat_name' },
        {
          label: '是否有效',
          prop: 'cat_deleted',
          // 表示当前为自定义模板列
          type: 'template',
          //  当前列使用的插槽名称 slot="xx"
          template: 'isok'
        },
        { label: '排序', prop: 'cat_level', type: 'template', template: 'rank' },
        { label: '操作', type: 'template', template: 'operation' }
      ],
      // 添加分类表单
      addCatForm: {
        // 分类名称
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      // 层级联动设置
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 添加规则
      addCatFormRules: {
        cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      },
      // 父级分类数据列表
      catParnetList: [],
      // 选中的分类
      selectedKeys: [],
      // 编辑分类数据对象
      editCatForm: {
        cat_name: '',
        cat_id: 0
      }
    }
  },
  created() {
    this.getGoodsCatList()
  },
  methods: {
    async addCategoriesDialog() {
      const { data: result } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      // console.log(result)
      if (result.meta.status !== 200) {
        return this.$message.error('获取父级数据失败')
      }
      this.catParnetList = result.data
      // console.log(this.catParnetList)
      this.CategoriesDialogVisible = true
    },
    // 获取商品分类数据
    async getGoodsCatList() {
      const { data: result } = await this.$http.get('categories', {
        params: this.qureyInfo
      })
      if (result.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败')
      }
      // console.log(result.data)
      this.goodsCategoriesList = result.data.result
      this.total = result.data.total
    },
    // 页码设置
    handleSizeChange(newSize) {
      this.qureyInfo.pagesize = newSize
      this.getGoodsCatList()
    },
    handleCurrentChange(newPage) {
      this.qureyInfo.pagenum = newPage
      this.getGoodsCatList()
    },
    // 添加分类
    handleChange() {
      // console.log(this.selectedKeys)
      if (this.selectedKeys.length > 0) {
        // 父级id
        this.addCatForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCatForm.cat_level = this.selectedKeys.length
      } else {
        this.addCatForm.cat_pid = 0
      }
      // console.log(this.addCatForm)
    },
    // 关闭添加对话框 清空输入和选择
    resetAddForm() {
      this.$refs['addCatFormRef'].resetFields()
      this.selectedKeys = []
      this.addCatForm.cat_pid = 0
      this.addCatForm.cat_level = 0
    },
    // 确定提交新建分类
    confirmCategories() {
      this.$refs['addCatFormRef'].validate(async (valid) => {
        if (valid) {
          const { data: result } = await this.$http.post('categories', this.addCatForm)
          if (result.meta.status !== 201) {
            return this.$message.error('创建分类失败')
          }
          this.getGoodsCatList()
          this.CategoriesDialogVisible = false
          return this.$message.success('成功创建分类')
        }
      })
    },
    // 编辑对话框
    editCatDialog(catgory) {
      this.editCatDialogVisible = true
      // console.log(catgory)
      this.editCatForm.cat_id = catgory.cat_id
      this.editCatForm.cat_name = catgory.cat_name
      // console.log(this.editCatForm)
    },
    // 提交分类
    async cofirmEditCatDialog() {
      const { data: result } = await this.$http.put(`categories/${this.editCatForm.cat_id}`, {
        cat_name: this.editCatForm.cat_name
      })
      if (result.meta.status !== 200) {
        return this.$message.error('编辑提交失败')
      }
      this.editCatForm = {}
      this.$message.success('编辑提交成功')
      this.editCatDialogVisible = false
      this.getGoodsCatList()
    },
    // 删除对话框
    deleteCatDialog(catgory) {
      this.deleteCatDialogVisible = true
      this.editCatForm.cat_id = catgory.cat_id
    },
    async cofirmDeleteCatDialog() {
      const { data: result } = await this.$http.delete(`categories/${this.editCatForm.cat_id}`)
      if (result.meta.status !== 200) {
        return this.$message.error('删除分类失败')
      }
      this.deleteCatDialogVisible = false
      this.getGoodsCatList()
      return this.$message.success('删除分类成功')
    }
  }
}
</script>

<style  scoped>
.tree-table {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>