<template>
  <el-dialog
    :visible.sync="isDialogVisible"
    title="核销卡券"
    :fullscreen="false"
    top="7vh"
    width="500px"
    @close="close"
  >
    <el-form ref="from" :rules="rulesForm" :model="from" :label-width="formLabelWidth">
      <el-form-item label="卡劵核销码" prop="id">
        <el-input v-model="from.id" placeholder="请输入卡劵核销码" />
      </el-form-item>
      <div class="tip-font" :style="tipStyle">
        *已过期卡劵将无法核销
      </div>
      <el-form-item>
        <el-button type="primary" @click="submitForm('from')">核销</el-button>
        <el-button @click="close()">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>
<script>

export default {
  name: 'CardCheckDialog',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      formLabelWidth: '100px',
      isDialogVisible: false,
      from: {
        id: ''
      },
      rulesForm: {
        id: [
          { required: true, message: '请输入卡劵核销码', trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    isVisible: function(newV, oldV) {
      this.isDialogVisible = newV
      if (newV) {
        this.from.id = ''
      }
    }
  },
  created() {
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.apiBtn('CardChecked', { ...this.from })
            .then(res => {
              this.$emit('refresh')
              this.close()
            })
        }
      })
    },
    close() {
      this.$emit('close')
    }
  }
}
</script>
<style lang='scss' scoped>
</style>

