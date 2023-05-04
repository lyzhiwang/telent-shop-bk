<template>
  <el-dialog
    :visible.sync="isDialogVisible"
    :title="title"
    :fullscreen="$store.state.app.device === 'mobile' ? true : false"
    top="7vh"
    width="30%"
    @close="resetForm('tagForm')"
  >
    <el-form ref="tagForm" :rules="rulesForm" :model="tagForm" label-width="100px">
      <el-form-item label="分类名称" prop="name">
        <el-input v-model="tagForm.name" placeholder="请输入分类名称" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm('tagForm')">提交</el-button>
        <el-button @click="resetForm('tagForm')">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>
<script>

export default {
  name: 'TagDialog',
  props: {
    typeList: {
      type: Array,
      default: () => {
        return []
      }
    },
    title: {
      type: String,
      default: '分类'
    },
    isVisible: {
      type: Boolean,
      default: false
    },
    type: {
      // 1 新增 2 编辑
      type: Number,
      default: 1
    },
    tagForm: {
      type: Object,
      default: function() {
        return {
          id: '',
          name: ''
        }
      }
    }
  },
  data() {
    return {
      isDialogVisible: false,
      rulesForm: {
        name: [
          { required: true, message: '请输入分类的名称', trigger: 'blur' },
          { min: 2, max: 4, message: '长度在 2 到 4 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    isVisible: function(newV, oldV) {
      this.isDialogVisible = newV
      if (this.isVisible === false) {
        this.resetForm('tagForm')
      }
    }
  },
  created() {
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.apiBtn(this.tagForm.id? 'CategPut' : 'CategStore', { ...this.tagForm })
            .then(res => {
              this.$emit('change')
              this.resetForm(formName)
            })
        }
      })
    },
    resetForm(formName) {
      // 清空表单，清空tree,关闭diaglog
      this.$refs[formName].resetFields()
      this.$emit('close', false)
    }
  }
}
</script>
<style lang='scss' scoped>
.el-select {
  width: 100%;
}
.el-form-item:last-child {
  margin: 0;
}
#authorityTree {
  min-height: 42px;
  border: 1px solid #dcdfe6;
  padding-top: 7px;
  border-radius: 4px;
  max-height: 300px;
  overflow: auto;
}
</style>

