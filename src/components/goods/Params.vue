<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 警告区域 -->
      <el-alert show-icon title="注意：只能为第三级分类设置参数" type="warning" :closable="false"></el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_area">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 级联选择区域 -->
          <el-cascader size="mini" v-model="selectedKeys" :options="catList" :props="catProps" @change="handleChange" :show-all-levels="false" clearable></el-cascader>
        </el-col>
      </el-row>
      <!-- 选项卡区域 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" :disabled="isBtnDisabled" @click="addAttrDialogVisible = true">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="attrManyList" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(tag, i) in scope.row.attr_vals" :key="i" class="tag_attr" closable @close="deleteTagClose(scope.row, i)">{{ tag }}</el-tag>
                <el-input
                  v-if="scope.row.tagInputVisible"
                  v-model="scope.row.tagInputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleTagInputConfirm(scope.row)"
                  @blur="handleTagInputConfirm(scope.row)"
                  class="input-new-tag"
                ></el-input>
                <el-button v-else size="small" @click="showTagInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="序号"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" @click="editAttrManyShow(scope.row)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" @click="deleteAttrMany(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" :disabled="isBtnDisabled" @click="addAttrDialogVisible = true">添加属性</el-button>
          <!-- 静态参数表格 -->
          <el-table :data="attrOnlyList" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(tag, i) in scope.row.attr_vals" :key="i" class="tag_attr" closable @close="deleteTagClose(scope.row, i)">{{ tag }}</el-tag>
                <el-input
                  v-if="scope.row.tagInputVisible"
                  v-model="scope.row.tagInputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleTagInputConfirm(scope.row)"
                  @blur="handleTagInputConfirm(scope.row)"
                  class="input-new-tag"
                ></el-input>
                <el-button v-else size="small" @click="showTagInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="序号"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" @click="editAttrManyShow(scope.row)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" @click="deleteAttrMany(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 动态参数对话框 -->
    <el-dialog :visible.sync="addAttrDialogVisible" title="添加" width="40%" @close="dialogAttrClose">
      <el-form label-width="80px" :model="addAttrMany" :rules="addAttrManyRules" ref="addAttrManyRef">
        <el-form-item label="参数名称" prop="attr_name" v-if="activeName === 'many'">
          <el-input v-model="addAttrMany.attr_name"></el-input>
        </el-form-item>
        <el-form-item label="属性名称" prop="attr_name" v-else-if="activeName === 'only'">
          <el-input v-model="addAttrMany.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="addAttrDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addAttrManyConfirm">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑动态参数对话框 -->
    <el-dialog :visible.sync="editAttrDialogVisible" title="编辑" width="40%">
      <el-form :model="editAttrMany" :rules="addAttrManyRules" ref="editAttrManyRef" label-width="80px">
        <el-form-item label="参数名称" prop="attr_name">
          <el-input v-model="editAttrMany.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editAttrDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editAttrManyConfirm">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 删除动态参数对话框 -->
    <el-dialog :visible.sync="deleteAttrDialogVisible" title="删除" width="30%">
      <span>该操作将永久删除参数，是否继续？</span>
      <span slot="footer">
        <el-button @click="deleteAttrDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="deleteAttrManyConfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 分类数据
      catList: [],
      catProps: {
        expandTrigger: 'hover',
        //指定选中的值
        value: 'cat_id',
        // 显示的值
        label: 'cat_name',
        // 嵌套关系
        children: 'children'
      },
      // 对选中的值进行双向绑定
      selectedKeys: [],
      // 选项卡被激活的名称
      activeName: 'many',
      // 参数数据列表
      attrManyList: [],
      attrOnlyList: [],
      // 显示动态参数对话框
      addAttrDialogVisible: false,
      //添加参数数据列表
      addAttrMany: {
        attr_name: ''
      },
      // 添加规则
      addAttrManyRules: {
        attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
      },
      // 编辑动态参数对话框
      editAttrDialogVisible: false,
      // 编辑动态参数数据
      editAttrMany: {
        attr_name: ''
      },
      // 保存编辑之前的名称 用于检测用户是否修改了名称
      preAttrName: '',
      // 删除动态参数对话框
      deleteAttrDialogVisible: false,
      //删除数据
      deleteAttr: {}
    }
  },
  created() {
    this.getCatList()
  },
  methods: {
    async getCatList() {
      const { data: result } = await this.$http.get('categories')
      if (result.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }
      // console.log(result)
      this.catList = result.data
    },
    // 级联选择框选中时变化触发
    handleChange() {
      this.getAttrList()
    },
    // 选项卡点击事件
    handleClick() {
      // console.log(this.activeName)
      this.getAttrList()
    },
    async getAttrList() {
      //判断是否选中3级分类
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        // 情况数据 避免未选择三级分类时 显示table
        this.attrManyList = []
        this.attrOnlyList = []
        return
      }
      const { data: result } = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: { sel: this.activeName }
      })
      if (result.meta.status !== 200) {
        return this.$message.error('获取数据失败！')
      }
      // 将attr_vals 用数组存储 需要判断是否为空 否则产生空tag
      result.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        // 控制文本框的显示与隐藏 否则会共用 导致添加在全部参数生效
        item.tagInputValue = ''
        item.tagInputVisible = false
      })
      // 一定先加字段 再赋值给 attrManyList 这样 当tagInputVisible 值变化时 vue 才会重新渲染DOM
      if (this.activeName === 'many') {
        this.attrManyList = result.data
        // console.log(this.attrTags)
      }
      if (this.activeName === 'only') {
        this.attrOnlyList = result.data
      }
      // console.log(result)
    },
    // 添加动态参数
    addAttrManyConfirm() {
      //构造添加的数据
      this.addAttrMany.cat_id = this.selectedKeys[2]
      this.addAttrMany.attr_sel = this.activeName
      this.$refs['addAttrManyRef'].validate(async (valid) => {
        if (!valid) return
        const { data: result } = await this.$http.post(`categories/${this.selectedKeys[2]}/attributes`, this.addAttrMany)
        if (result.meta.status !== 201) {
          return this.$message.error('添加失败')
        }
        this.getAttrList()
        this.addAttrDialogVisible = false
        this.$message.success('添加成功')
        return (this.addAttrMany = { attr_name: '' })
      })
    },
    // 关闭对话框时 情况之前的输入
    dialogAttrClose() {
      this.$refs['addAttrManyRef'].resetFields()
    },
    // 编辑参数对话框
    editAttrManyShow(attr) {
      //先将数据绑定到表单
      this.editAttrMany.attr_name = attr.attr_name
      this.editAttrMany.cat_id = attr.cat_id
      this.editAttrMany.attr_id = attr.attr_id
      this.editAttrMany.attr_sel = attr.attr_sel
      this.editAttrDialogVisible = true
      this.preAttrName = attr.attr_name
      // console.log(attr)
    },
    // 提交编辑
    editAttrManyConfirm() {
      console.log(this.$refs)
      // 将修改的数据提交 如果名称未变化 则不提交
      this.$refs['editAttrManyRef'].validate(async (valid) => {
        if (!valid) return
        if (this.preAttrName !== this.editAttrMany.attr_name) {
          const { data: result } = await this.$http.put(`categories/${this.editAttrMany.cat_id}/attributes/${this.editAttrMany.attr_id}`, this.editAttrMany)
          if (result.meta.status !== 200) {
            return this.$message.error('编辑提交失败')
          }
          // 更新参数列表
          this.getAttrList()
          this.editAttrDialogVisible = false
          this.$message.success('编辑提交成功')
        } else {
          this.editAttrDialogVisible = false
          this.$message.info('未修改')
        }
      })
    },
    // 删除动态参数
    deleteAttrMany(attr) {
      this.deleteAttr = attr
      this.deleteAttrDialogVisible = true
      //获取删除分类的参数id 分类id
      // console.log(attr)
    },
    async checkAttrIsExisted() {
      const { data: result } = await this.$http.get(`categories/${this.deleteAttr.cat_id}/attributes/${this.deleteAttr.attr_id}`, {
        params: {
          attr_sel: this.activeName
        }
      })
      if (result.meta.status === 200) {
        return true
      } else {
        return false
      }
    },
    async deleteAttrManyConfirm() {
      //删除之前先查询 要删除的参数是否存在
      const isExisted = this.checkAttrIsExisted()
      if (!isExisted) {
        return this.$message.info('参数已经被删除')
      }
      const { data: result } = await this.$http.delete(`categories/${this.deleteAttr.cat_id}/attributes/${this.deleteAttr.attr_id}`)
      if (result.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      // 更新列表
      this.getAttrList()
      // 关闭对话框
      this.deleteAttrDialogVisible = false
      // 给出提示
      this.$message.success('删除成功')
    },
    // 点击 x 删除tag
    async deleteTagClose(attr, i) {
      // console.log(attr, i)
      // 先将input值添加到数组
      attr.attr_vals.splice(i, 1)
      // 进行提交
      this.commitTag(attr)
    },
    // 点击new tag 显示输入框
    showTagInput(attr) {
      // console.log(attr)
      attr.tagInputVisible = true
      //自动获得焦点
      // console.log(this.$refs)
      this.$nextTick((_) => {
        this.$refs['saveTagInput'].$refs.input.focus()
      })
    },
    // 按 Enter 或者 失焦进行提交操作
    async handleTagInputConfirm(attr) {
      //如果输入框为空 则不提交 清除空格
      if (attr.tagInputValue.trim().length === 0) {
        attr.tagInputValue = ''
        attr.tagInputVisible = false
        return
      }
      // 先将input值添加到数组
      attr.attr_vals.push(attr.tagInputValue)
      attr.tagInputValue = ''
      // 进行提交
      this.commitTag(attr)
    },
    // 提交tag 增加或者删除
    async commitTag(attr) {
      const { data: result } = await this.$http.put(`categories/${this.cateId}/attributes/${attr.attr_id}`, {
        attr_vals: attr.attr_vals.join(','),
        attr_sel: this.activeName,
        attr_name: attr.attr_name
      })
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg)
      }
      // 根据返回的数据 更新
      // attr.attr_vals = result.data.attr_vals.split(',')
      attr.tagInputVisible = false
    }
  },
  computed: {
    // 如果按钮要被禁用 返回true 否则返回false
    isBtnDisabled() {
      if (this.selectedKeys.length !== 3) {
        return true
      }
      return false
    },
    // 获取分类的id
    cateId() {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.cat_area {
  margin-top: 15px;
}
.tag_attr {
  margin-right: 8px;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>