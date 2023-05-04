<template>
  <el-dialog
    :visible.sync="isDialogVisible"
    title="充值"
    :fullscreen="$store.state.app.device === 'mobile' ? true : false"
    top="7vh"
    width="500px"
    @close="close"
  >
    <el-form ref="form" :rules="rulesForm" :model="form" label-width="100px">
      <el-form-item label="充值金额" prop="money">
        <el-input-number v-model="form.money" :min="1" :controls="false"></el-input-number>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm('form')">提交</el-button>
        <el-button @click="close">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>
<script>

export default {
  name: 'AuditDialog',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    id: {
      type: Number,
      default: ''
    }
  },
  data() {
    return {
      isDialogVisible: false,
      form: {
        money: 1
      },
      rulesForm: {
        money: [
          { required: true, message: '请输入充值金额', trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    isVisible: function(newV, oldV) {
      this.isDialogVisible = newV
      if (this.isVisible === false) {
        this.close()
      }
    }
  },
  created() {
  },
  methods: {
    radioChange (value) {
      if (value) {
        this.form.reason = null
      }
    },
    submitForm (formName) {
      this.form.id = this.id
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.apiBtn('PrestoredStore', { ...this.form })
            .then(res => {
              this.$message.success('充值成功!')
              this.init()
              this.$emit('refresh')
              this.close()
            })
        }
      })
    },
    init () {
      this.form = {
        money: 1
      }
    },
    close () {
      this.init()
      this.$emit('close')
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

