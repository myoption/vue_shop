<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col :span="4">
          <el-button @click="addRoleDialogVisible = true" type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="roleList" border stripe>
        <!-- 展开列  多重for渲染数据-->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- 第一行加顶边框 -->
            <el-row v-for="(item, i1) in scope.row.children" :key="item.id" :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'v-center']">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightsById(scope.row, item.id)">{{ item.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级权限 -->
              <el-col :span="19">
                <!-- 还需要放el-row -->
                <el-row :class="[i2 === 0 ? '' : 'bdtop', 'v-center']" v-for="(item2, i2) in item.children" :key="item2.id">
                  <!-- 分左右2列 为2 3 级权限 -->
                  <el-col :span="6">
                    <el-tag closable @close="removeRightsById(scope.row, item2.id)" type="success">{{ item2.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag closable @close="removeRightsById(scope.row, item3.id)" type="warning" :key="item3.id" v-for="item3 in item2.children">{{ item3.authName }}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
              <!-- 渲染三级权限 -->
              <el-col></el-col>
            </el-row>
            <!-- <pre>  {{ scope.row }}</pre> -->
          </template>
        </el-table-column>
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column prop="roleName" label="名称"></el-table-column>
        <el-table-column prop="roleDesc" label="描述"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="editRoleDialog(scope.row.id)">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteRoleDialog(scope.row.id)">删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="showAsignRoleDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog :visible.sync="addRoleDialogVisible" title="添加角色" width="30%">
      <el-form :model="addRoleForm" label-width="80px" :rules="addRoleRules" ref="addRoleRef">
        <el-form-item prop="roleName" label="名称">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item prop="roleDesc" label="描述">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 删除角色对话框 -->
    <el-dialog :visible.sync="deleteRoleDialogVisible" title="删除" width="20%">
      <span>此操作将永久删除该角色，是否继续？</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="deleteRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色对话框 -->
    <el-dialog :visible.sync="editRoleDialogVisible" title="编辑角色" width="40%">
      <el-form :model="editRoleForm" :rules="addRoleRules" ref="editRoleRef" label-width="70px">
        <el-form-item prop="roleName" label="名称">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item prop="roleDesc" label="描述">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog :visible.sync="asignRoleDialogVisible" title="分配权限">
      <!-- 树形结构 node-key 勾选后选中id  默认勾选default-checked-keys-->
      <el-tree ref="treeRef" :data="asignRoleArray" show-checkbox :default-checked-keys="defaultKeys" node-key="id" :default-expand-all="true" :props="defaultProps"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="asignRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitAsignRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      roleList: [],
      addRoleDialogVisible: false,
      deleteRoleDialogVisible: false,
      editRoleDialogVisible: false,
      // 控制分配权限对话框显示
      asignRoleDialogVisible: false,
      roleID: 0,
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      asignRoleArray: [],
      // 树形组件绑定对象
      defaultProps: {
        // 显示名称
        label: 'authName',
        // 父子嵌套结构
        children: 'children'
      },
      // 默认选中的权限
      defaultKeys: [],
      editRoleForm: {},
      addRoleRules: {
        roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
      }
    }
  },
  // 加载角色数据
  created() {
    this.getRoleList()
  },
  methods: {
    // 添加角色
    addRole() {
      this.$refs['addRoleRef'].validate(async (valid) => {
        if (valid) {
          const { data: result } = await this.$http.post('roles', this.addRoleForm)
          if (result.meta.status !== 201) {
            return this.$message.error(result.meta.msg)
          }
          this.addRoleDialogVisible = false
          this.$message.success(result.meta.msg)
          this.getRoleList()
        }
      })
    },
    // 删除角色
    deleteRoleDialog(id) {
      this.deleteRoleDialogVisible = true
      this.roleID = id
    },
    async deleteRole() {
      const { data: result } = await this.$http.delete('roles/' + this.deleteRoleID)
      console.log(this.deleteRoleID)
      if (result.meta.status === 200) {
        // 关闭对话框
        this.deleteRoleDialogVisible = false
        // 刷新列表
        this.getRoleList()
        return this.$message.success(result.meta.msg)
      } else {
        return this.$message.error(result.meta.msg)
      }
    },
    // 编辑角色
    async editRoleDialog(id) {
      this.editRoleDialogVisible = true
      // 查询数据并绑定到editRoleForm
      const { data: result } = await this.$http.get('roles/' + id)
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg)
      }
      this.editRoleForm = result.data
    },
    editRole() {
      // console.log(this.editRoleForm)
      // 点击确定时进行验证和提交
      this.$refs['editRoleRef'].validate(async (valid) => {
        const { data: result } = await this.$http.put('roles/' + this.editRoleForm.roleId, {
          roleName: this.editRoleForm.roleName,
          roleDesc: this.editRoleForm.roleDesc
        })
        if (result.meta.status !== 200) {
          return this.$message.error(result.meta.msg)
        }
        // 关闭对话框
        this.editRoleDialogVisible = false
        // 刷新列表
        this.getRoleList()
        // 提示信息
        return this.$message.success('修改成功')
      })
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
    // 删除权限
    async removeRightsById(role, rightId) {
      const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消删除')
      }
      const { data: result } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg)
      }
      // 接口有返回最新的权限 更新数据即可
      role.children = result.data
    },
    // 分配权限
    async showAsignRoleDialog(role) {
      // 获取所有权限数据
      // 需要清空数组
      this.defaultKeys = []
      // 获取角色ID
      this.roleID = role.id
      const { data: result } = await this.$http.get('rights/tree')
      // console.log(result)
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg)
      }
      this.asignRoleArray = result.data
      this.getDefaultKeys(role, this.defaultKeys)
      this.asignRoleDialogVisible = true
    },
    // 获取默认勾选的权限数据
    getDefaultKeys(node, arr) {
      // 递归调用
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach((item) => {
        this.getDefaultKeys(item, arr)
      })
    },
    // 提交权限
    async submitAsignRole() {
      let keys = []
      const rightHalf = this.$refs['treeRef'].getHalfCheckedKeys()
      // console.log(rightHalf)
      const rightNode = this.$refs['treeRef'].getCheckedKeys()
      keys = [...rightHalf, ...rightNode]
      const { data: result } = await this.$http.post(`roles/${this.roleID}/rights`, {
        rids: keys.join(',')
      })
      // console.log(result)
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg)
      }
      this.$message.success(result.meta.msg)
      this.getRoleList()
      this.asignRoleDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 15px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.v-center {
  display: flex !important;
  // justify-content: center;
  align-items: center;
}
</style>