<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
      <!-- 进度条  字符转换为数字-->
      <el-steps :active="activeIndex - 0" finish-status="success" class="progress_bar" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品描述"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab标签页  通过绑定name实现切换进度条和tab  注意 form表单和tabs的UI嵌套-->
      <el-form :model="addGoodForm" :rules="addGoodRules" ref="addGoodRef" label-width="100px" label-position="top">
        <el-tabs v-model="activeIndex" tab-position="left" :before-leave="beforeLeave" @tab-click="tableClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price" value="number">
              <el-input v-model="addGoodForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addGoodForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addGoodForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader expand-trigger="hover" :options="catList" v-model="addGoodForm.goods_cat" @change="handleChange" :props="catProps" clearable></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单Item -->
            <el-form-item v-for="item in manyTableData" :key="item.attr_id" :label="item.attr_name">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action 图片上传的后台地址 -->
            <el-upload action="http://127.0.0.1:8888/api/private/v1/upload" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture" :headers="headerUpload" :on-success="addPicPath">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor ref="myQuillEditor" v-model="addGoodForm.goods_introduce"></quill-editor>
            <el-button type="primary" @click="submitAddGood" class="submitGood">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <el-dialog title="图片预览" :visible.sync="picPreDialogVisible" @close="closePicPre">
      <img :src="currentPicPath" class="previewPic" />
    </el-dialog>
  </div>
</template>

<script>
import lodash from 'lodash'
export default {
  data() {
    //验证输入的是否是数字
    var checkNumber = (rule, value, callback) => {
      const regNumber = /^[1-9]+[0-9]{0,}/
      if (regNumber.test(value)) {
        return callback
      }
      callback(new Error('请输入数字'))
    }
    return {
      // 激活的步骤
      activeIndex: '0',
      addGoodForm: {
        goods_name: '',
        goods_price: null,
        goods_weight: null,
        goods_number: null,
        goods_cat: [],
        pics: [],
        // 商品介绍
        goods_introduce: '',
        // 参数 属性
        attrs: []
      },
      addGoodRules: {
        goods_name: [{ required: true, message: '请输入商品名称', tirgger: 'blur' }],
        goods_price: [
          { required: true, message: '请输入商品价格', tirgger: 'blur' },
          { validator: checkNumber, trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', tirgger: 'blur' },
          { validator: checkNumber, trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', tirgger: 'blur' },
          { validator: checkNumber, trigger: 'blur' }
        ]
        // goods_cat: [{ required: true, message: '请选择商品分类', tirgger: 'blur' }]
      },
      // 商品分类数据
      catList: [],
      // 级联选择器配置
      catProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      // 动态属性
      manyTableData: [],
      // 静态属性
      onlyTableData: [],
      // 上传的header设置
      headerUpload: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 图片预览路径
      currentPicPath: '',
      picPreDialogVisible: false
    }
  },
  created() {
    this.getCatList()
  },
  methods: {
    // 获取商品分类
    async getCatList() {
      const { data: result } = await this.$http.get('categories')
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg)
      }
      this.catList = result.data
      // console.log(this.catList)
    },
    //  选择分类时 触发
    handleChange() {
      // this.addGoodForm.goods_cat = this.addGoodForm.goods_cat.join(',')
      // console.log(this.addGoodForm.goods_cat)
      // console.log(this.addGoodForm.goods_cat.split(',').length)
    },
    // 切换事件tabs
    beforeLeave(activeName, preActiveName) {
      // console.log(activeName, preActiveName)
      // console.log(this.addGoodForm.goods_cat)
      if (preActiveName === '0' && this.addGoodForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类!')
        return false
      }
    },
    // 点击tabs时触发
    async tableClicked() {
      if (this.activeIndex === '1') {
        const { data: result } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {
            sel: 'many'
          }
        })
        if (result.meta.status !== 200) {
          return this.$message.error(result.meta.msg)
        }
        console.log(result.data)
        // console.log(result.data)
        // 处理为数组之后再返回数据
        result.data.forEach((element) => {
          element.attr_vals = element.attr_vals.length === 0 ? [] : element.attr_vals.split(',')
        })
        this.manyTableData = result.data
        console.log(this.manyTableData)
      } else if (this.activeIndex === '2') {
        const { data: result } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {
            sel: 'only'
          }
        })
        if (result.meta.status !== 200) {
          return this.$message.error(result.meta.msg)
        }
        console.log(result.data)
        // console.log(result.data)
        // 处理为数组之后再返回数据
        this.onlyTableData = result.data
      }
    },
    // 发起请求，查询参数
    async getParams(type) {
      // console.log(this.cateId)
      const { data: result } = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: {
          sel: type
        }
      })
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg)
      }
      console.log(result.data)
      // console.log(result.data)
      // 处理为数组之后再返回数据
      if (type === 'many') {
        result.data.forEach((element) => {
          element.attr_vals = element.attr_vals.length === 0 ? [] : element.attr_vals.split(',')
        })
      }
      return result.data
    },
    // 图片预览事件
    handlePreview(file) {
      // console.log(file)
      this.currentPicPath = file.response.data.url
      this.picPreDialogVisible = true
    },
    // 关闭预览
    closePicPre() {
      this.picPreDialogVisible = false
      this.currentPicPath = ''
    },
    // 删除图片事件
    handleRemove(file) {
      // console.log(file)
      // 获取删除图片的路径
      const picPath = file.response.data.tmp_path
      const index = this.addGoodForm.pics.findIndex((x) => x.pic === picPath)
      this.addGoodForm.pics.splice(index, 1)
      // console.log(this.addGoodForm.pics)
    },
    // 图片上传的事件
    addPicPath(res) {
      // console.log(res)
      this.addGoodForm.pics.push({ pic: `"${res.data.tmp_path}"` })
      // console.log(this.addGoodForm.pics)
    },
    // 添加商品
    async submitAddGood() {
      this.$refs['addGoodRef'].validate((valid) => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项！')
        }
        // 执行添加的业务逻辑
        // lodash   cloneDeep(obj)
      })
      console.log('here')
      const form = lodash.cloneDeep(this.addGoodForm)
      // console.log(form)
      form.goods_cat = form.goods_cat.join(',')
      // 处理动态参数
      this.manyTableData.forEach((item) => {
        const newInfo1 = {
          attr_id: item.attr_id,
          attr_value: item.attr_vals.join(',')
        }
        this.addGoodForm.attrs.push(newInfo1)
      })
      // 处理静态属性
      this.onlyTableData.forEach((item) => {
        const newInfo2 = { attr_id: item.attr_id, attr_value: item.attr_vals }
        this.addGoodForm.attrs.push(newInfo2)
      })
      form.attrs = this.addGoodForm.attrs
      // console.log(form)

      // 发起请求添加商品
      // 商品的名称，必须是唯一的
      const { data: res } = await this.$http.post('goods', form)

      if (res.meta.status !== 201) {
        return this.$message.error('添加商品失败！')
      }

      this.$message.success('添加商品成功！')
      this.$router.push('/goods')
    }
  },
  computed: {
    // 计算分类ID
    cateId() {
      if (this.addGoodForm.goods_cat.length === 3) {
        return this.addGoodForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.progress_bar {
  margin: 40px 0;
}
.el-step__title {
  font-size: 12px;
}
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewPic {
  width: 100%;
}
.submitGood {
  margin-top: 10px;
}
</style>