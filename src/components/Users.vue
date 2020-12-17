<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row :gutter="10">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" @blur="searchUser" clearable @clear="searchUser">
            <el-button slot="append" icon="el-icon-search" @click="searchUser"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button @click="addUserDialog" type="primary">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮件"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <!--   scope.row  这行数据-->
            <!-- {{ scope.row }} -->
            <el-switch v-model="scope.row.mg_state" @change="changeUserState(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" class="btns">
          <!-- 使用插槽 进行操作时需带上id -->
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="modifyUser(scope.row.id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUser(scope.row.id)"></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="right-start" :enterable="false">
              <el-button type="primary" icon="el-icon-setting" size="mini" @click="asignRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域  思路 改变get查询的参数 再调用获取用户信息 即可实现数据实时更新-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加用户对话框 close事件 清除之前的输入 -->
    <el-dialog @close="addDialogClosed" title="添加用户" :visible.sync="addDialogVisible" width="50%">
      <!-- 主体 -->
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮件" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-input v-model="addForm.role"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="state">
          <el-input v-model="addForm.state"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog @close="editDialogClosed" title="编辑用户" :visible.sync="modifyDialogVisible" width="50%">
      <!-- 主体 -->
      <el-form ref="modifyFormRef" :model="modifyForm" :rules="modifyFormRules" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="modifyForm.username" disabled="disabled"></el-input>
        </el-form-item>
        <el-form-item label="邮件" prop="email">
          <el-input v-model="modifyForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="modifyForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="modifyDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="modifyUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 删除用户对话框 -->
    <el-dialog title="删除用户" :visible.sync="deleteDialogVisible" width="30%">
      <span>此操作将永久删除用户，是否继续</span>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="deleteUserConfirm">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog :visible.sync="asignRoleDialogVisible" title="分配角色" width="30%" @close="resetData">
      <div>
        <p>当前的用户：{{ userInfo.username }}</p>
        <p>当前的角色：{{ userInfo.role_name }}</p>
        <p>
          请选择角色：
          <el-select v-model="selectedRoleID" placeholder="请选择">
            <el-option v-for="item in roleList" :key="item.id" :label="item.roleName" :value="item.id"></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="asignRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 验证邮箱规则
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法邮箱'))
    }
    // 验证电话规则
    var checkmobile = (rule, value, callback) => {
      const regmobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57]|16[6])[0-9]{8}/
      if (regmobile.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法的手机号'))
    }
    return {
      // 定义get请求参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      userList: [],
      roleList: [],
      // 需要分配权限的用户信息
      userInfo: {},
      selectedRoleID: '',
      total: 0,
      // 添加用户对话框的显示与隐藏
      addDialogVisible: false,
      // 删除用户对话框的显示与隐藏
      deleteDialogVisible: false,
      // 编辑用户对话框的显示与隐藏
      modifyDialogVisible: false,
      // 分配角色对话框
      asignRoleDialogVisible: false,
      // 添加用户的数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: '',
        role: '',
        state: ''
      },
      // 删除用户的id
      deleteUserId: 0,
      // 修改用户的数据
      modifyForm: {},
      // 添加用户的验证规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名长度3-10字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '密码长度6-20字符', trigger: 'blur' }
        ],
        // 自定义校验规则
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入电话', trigger: 'blur' },
          { validator: checkmobile, trigger: 'blur' }
        ]
      },
      // 编辑用户的校验规则
      modifyFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入电话', trigger: 'blur' },
          { validator: checkmobile, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: result } = await this.$http.get('users', {
        params: this.queryInfo
      })
      console.log(result)
      if (result.meta.status !== 200) return this.$message.error(result.meta.msg)
      this.userList = result.data.users
      this.total = result.data.total
    },
    // 当前页 改变监听
    handleCurrentChange(newCurrentPage) {
      this.queryInfo.pagenum = newCurrentPage
      this.getUserList()
    },
    // 监听size改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    async changeUserState(userinfo) {
      const { data: result } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      // 判断是否成功 当失败时 恢复修改前的状态
      if (result.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('用户状态修改失败')
      }
      this.$message.success('成功修改用户状态')
    },
    searchUser() {
      // 调用即可查询
      this.getUserList()
    },
    // 弹出添加对话框
    addUserDialog() {
      this.addDialogVisible = true
    },
    // 清空输入框
    addDialogClosed() {
      this.$refs['addFormRef'].resetFields()
    },
    // 点击确定时先进行校验再提交
    addUser() {
      console.log(this.$refs)
      this.$refs['addFormRef'].validate(async (valid) => {
        if (valid) {
          const { data: result } = await this.$http.post('users', this.addForm)
          if (result.meta.status !== 201) {
            return this.$message.error(result.meta.msg)
          }
          // 成功后关闭对话框
          this.addDialogVisible = false
          this.$message.success(result.meta.msg)
          // 刷新列表
          this.getUserList()
        }
      })
    },
    // 重置修改用户对话框
    editDialogClosed() {
      this.$refs['modifyFormRef'].resetFields()
    },
    // 修改用户信息
    async modifyUser(id) {
      // 显示对话框
      this.modifyDialogVisible = true
      // 将数据绑定到修改用户对象数据
      const { data: result } = await this.$http.get('users/' + id)
      // console.log(user)
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg)
      }
      this.modifyForm = result.data
    },
    modifyUserInfo() {
      // 点击确定时先进行校验 注意请求数据的格式
      this.$refs['modifyFormRef'].validate(async (valid) => {
        if (valid) {
          let id = this.modifyForm.id
          const { data: result } = await this.$http.put('users/' + id, {
            mobile: this.modifyForm.mobile,
            email: this.modifyForm.email
          })
          if (result.meta.status !== 200) {
            return this.$message.error(result.meta.msg)
          }
          this.$message.success(result.meta.msg)
          this.modifyDialogVisible = false
          this.getUserList()
        }
      })
    },
    // 弹出删除用户
    async deleteUser(id) {
      // 方法1 对话框
      /*  this.deleteDialogVisible = true
      this.deleteUserId = id */
      // 方法2
      const result = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      if (result === 'confirm') {
        const { data: result } = await this.$http.delete('users/' + this.deleteUserId)
        // console.log(result)
        if (result.meta.status !== 200) {
          return this.$message.error(result.meta.msg)
        }
        this.$message.success(result.meta.msg)
        this.getUserList()
      }
    },
    // 删除用户
    async deleteUserConfirm() {
      const { data: result } = await this.$http.delete('users/' + this.deleteUserId)
      // console.log(result)
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg)
      }
      this.deleteDialogVisible = false
      this.$message.success(result.meta.msg)
      this.getUserList()
    },
    // 获取角色数据
    async getRoleList() {
      const { data: result } = await this.$http.get('roles')
      // console.log(result)
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg)
      }
      this.roleList = result.data
    },
    // 提前处理角色相关数据
    asignRole(user) {
      // console.log(user)
      this.getRoleList()
      this.asignRoleDialogVisible = true
      this.userInfo = user
    },
    // 提交角色
    async confirmRole() {
      console.log(this.selectedRoleID)
      if (!this.selectedRoleID) {
        return this.$message.error('请选择角色')
      }
      const { data: result } = await this.$http.put(`users/${this.userInfo.id}/role`, {
        rid: this.selectedRoleID
      })
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg)
      }
      this.$message.success('设置成功')
      this.asignRoleDialogVisible = false
      this.getUserList()
    },
    // 重置数据
    resetData() {
      this.selectedRoleID = ''
      this.userInfo = {}
    }
  }
}
</script>

<style lang="less" scoped>
</style>