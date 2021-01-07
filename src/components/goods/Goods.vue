<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索框 添加按钮  清除 失焦 点击 都调用查询即可完成搜索和展示-->
      <el-input placeholder="请输入内容" v-model="queryInfo.query" class="searchInput" clearable @blur="searchGoods" @clear="searchGoods">
        <el-button slot="append" icon="el-icon-search" @click="searchGoods"></el-button>
      </el-input>
      <el-button type="primary" @click="addGoodDialogShow">添加商品</el-button>
      <!-- 数据table -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="价格（元）"></el-table-column>
        <el-table-column prop="goods_number" label="商品数量"></el-table-column>
        <el-table-column prop="add_time" label="创建时间">
          <!-- 使用作用域插槽配合过滤器 格式化时间 -->
          <template slot-scope="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" @click="showEdidGoodDialog(scope.row)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" @click="deleteGood(scope.row.goods_id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 页码 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加商品对话框 -->
    <el-dialog :visible.sync="addGoodDialogVisible" title="添加商品" width="40%" @close="resetAddGoodForm">
      <el-form :model="addGood" :rules="addGoodRules" ref="addGoodRef" label-width="80px">
        <el-form-item prop="goods_name" label="商品名称">
          <el-input v-model="addGood.goods_name"></el-input>
        </el-form-item>
        <el-form-item prop="goods_cat" label="商品分类">
          <el-cascader v-model="addGood.goods_cat" :options="optionsGoodsCat" :props="cascaderProps" @change="handleChange" clearable=""></el-cascader>
        </el-form-item>
        <el-form-item prop="goods_price" label="商品价格">
          <el-input v-model="addGood.goods_price"></el-input>
        </el-form-item>
        <el-form-item prop="goods_number" label="商品数量">
          <el-input v-model="addGood.goods_number"></el-input>
        </el-form-item>
        <el-form-item prop="goods_weight" label="商品重量">
          <el-input v-model="addGood.goods_weight"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="addGoodDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitNewGood">确定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑商品对话框 -->
    <el-dialog :visible.sync="editGoodDialogVisible" title="编辑商品" width="40%">
      <el-form :model="editGood" :rules="addGoodRules" ref="addGoodRef" label-width="80px">
        <el-form-item prop="goods_name" label="商品名称">
          <el-input v-model="editGood.goods_name"></el-input>
        </el-form-item>
        <el-form-item prop="goods_cat" label="商品分类">
          <el-cascader v-model="editGood.goods_cat" :options="optionsGoodsCat" :props="cascaderProps" @change="handleChange" clearable=""></el-cascader>
        </el-form-item>
        <el-form-item prop="goods_price" label="商品价格">
          <el-input v-model="editGood.goods_price"></el-input>
        </el-form-item>
        <el-form-item prop="goods_number" label="商品数量">
          <el-input v-model="editGood.goods_number"></el-input>
        </el-form-item>
        <el-form-item prop="goods_weight" label="商品重量">
          <el-input v-model="editGood.goods_weight"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editGoodDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEdidGood">确定</el-button>
      </span>
    </el-dialog>
    <!-- 删除对话框 -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 输入框绑定的值
      inputSearch: '',
      // 商品数据
      goodsList: [],
      // 查询参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 商品总数
      total: 0,
      // 显示添加商品的对话框
      addGoodDialogVisible: false,
      // 编辑商品对话框
      editGoodDialogVisible: false,
      // 添加商品数据
      addGood: {
        goods_name: '',
        goods_cat: [],
        goods_price: null,
        goods_number: null,
        goods_weight: null
      },
      // 编辑商品数据
      editGood: {
        goods_name: '',
        goods_cat: [],
        goods_price: null,
        goods_number: null,
        goods_weight: null
      },
      // 添加商品校验规则
      addGoodRules: {
        goods_name: [{ required: true, message: '请输入商品名称', tirgger: 'blur' }],
        goods_cat: [{ required: true, message: '请选择商品分类', tirgger: 'blur' }],
        goods_price: [{ required: true, message: '请输入商品价格', tirgger: 'blur' }],
        goods_number: [{ required: true, message: '请输入商品数量', tirgger: 'blur' }],
        goods_weight: [{ required: true, message: '请输入商品重量', tirgger: 'blur' }]
      },
      // 级联选择器数据
      optionsGoodsCat: [],
      // 级联选择器渲染配置
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      }
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    // 获取商品数据
    async getGoodsList() {
      const { data: result } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg)
      }
      // console.log(result)
      // 时间为毫秒数 需要转换
      /* result.data.goods.forEach((item) => {
        let handledDate = new Date(item.add_time)
        item.add_time = this.formatDate(handledDate)
      }) */
      this.goodsList = result.data.goods
      // console.log(result.data.goods)
      this.total = result.data.total
    },
    // 页码切换
    handleSizeChange(pageSize) {
      this.queryInfo.pagesize = pageSize
      // 改变页码设置后 刷新列表
      this.getGoodsList()
    },
    handleCurrentChange(pageNum) {
      this.queryInfo.pagenum = pageNum
      // 改变页码设置后 刷新列表
      this.getGoodsList()
    },
    // 格式化时间
    add0(m) {
      return m < 10 ? '0' + m : m
    },
    formatDate(timeStamp) {
      let time = new Date(timeStamp),
        y = time.getFullYear(),
        m = time.getMonth() + 1,
        d = time.getDate(),
        h = time.getHours(),
        mm = time.getMinutes(),
        s = time.getSeconds()

      return y + '-' + this.add0(m) + '-' + this.add0(d) + ' ' + this.add0(h) + ':' + this.add0(mm) + ':' + this.add0(s)
    },
    // 搜索商品
    searchGoods() {
      this.getGoodsList()
    },
    // 级联选择器 触发
    handleChange() {
      // 将获取到的cat id 数组 转为字符串 方便后续提交
      this.addGood.goods_cat = this.addGood.goods_cat.join(',')
      // console.log(this.addGood.goods_cat)
    },
    // 获取商品分类数据
    async getGoodsCat() {
      const { data: result } = await this.$http.get('categories')
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg)
      }
      this.optionsGoodsCat = result.data
    },
    // 显示添加商品对话框 和获取商品分类数据
    addGoodDialogShow() {
      // this.addGoodDialogVisible = true
      // this.getGoodsCat()
      this.$router.push('/goods/add')
    },
    // 提交添加的商品
    submitNewGood() {
      this.$refs['addGoodRef'].validate(async (valid) => {
        if (!valid) return
        const { data: result } = await this.$http.post('goods', this.addGood)
        if (result.meta.status !== 201) {
          return this.$message.error(result.meta.msg)
        }
        this.getGoodsList()
        this.addGoodDialogVisible = false
        this.$message.success(result.meta.msg)
      })
    },
    // 对话框关闭时 清除表单数据
    resetAddGoodForm() {
      this.$refs['addGoodRef'].resetFields()
    },
    // 打开编辑对话框
    showEdidGoodDialog(good) {
      console.log(good)
      this.editGoodDialogVisible = true
    },
    // 提交编辑
    submitEdidGood() {},
    // 删除商品
    async deleteGood(goodID) {
      // 先判断是否点击确定
      const confirmText = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      // console.log(good)
      if (confirmText !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: result } = await this.$http.delete('goods/' + goodID)
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg)
      }
      this.$message.success('删除成功')
      this.getGoodsList()
    }
  }
}
</script>

<style lang="less" scoped>
.searchInput {
  width: 500px;
  margin-right: 15px;
}
</style>