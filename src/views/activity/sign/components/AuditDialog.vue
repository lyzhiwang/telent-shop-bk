<template>
  <el-dialog
    :visible.sync="isDialogVisible"
    title="审核"
    :fullscreen="$store.state.app.device === 'mobile' ? true : false"
    top="7vh"
    width="500px"
    @close="close"
  >
    <el-form ref="form" :rules="rulesForm" :model="form" label-width="150px">
      <el-form-item label="是否通过审核" prop="is_adopt">
        <el-radio-group v-model="form.is_adopt" @input="radioChange">
          <el-radio :label="1">通过</el-radio>
          <el-radio :label="0">拒绝</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="拒绝理由" prop="reason" v-if="form.is_adopt===0">
        <el-input v-model="form.reason" type="textarea" :rows="2" label="请输入拒绝理由" />
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
        is_adopt: 1,
        reason: null
      },
      rulesForm: {
        reason: [
          { required: true, message: '请输入拒绝理由', trigger: 'blur' }
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
          this.apiBtn('ActivityUrlAudit', { ...this.form })
            .then(res => {
              this.init()
              this.$emit('refresh')
              this.close()
            })
        }
      })
    },
    init () {
      this.form = {
        is_adopt: 1,
        reason: null
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

