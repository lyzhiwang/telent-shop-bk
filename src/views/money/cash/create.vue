<template>
    <div class="app-container">
        <el-card class="aliReturn" v-if="from.aliReturn || from.refuse_cause">
            <div v-if="from.aliReturn">
                <span class="status">{{ statusOptions[from.status] }}:</span>
                <span> {{ from.aliReturn.msg }}</span>
            </div>
            <div v-if="from.refuse_cause" class="refuse">
                <span  class="status"> 驳回原因:</span>
                <span>{{ from.refuse_cause }}</span>
            </div>
        </el-card>
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>{{ $route.query.id?'提现详情':'发起提现' }}</span>
                </div>
            </template>
            <div>
                <el-form ref="from" :rules="rulesForm" :model="from" class="form-racharge" label-width="251px">
                    <el-form-item label="姓名" prop="name">
                        <el-input v-model="from.name" :disabled="$route.query.id? true: false"></el-input>
                    </el-form-item>
                    <el-form-item label="手机号" prop="phone">
                        <el-input v-model="from.phone" :disabled="$route.query.id? true: false"></el-input>
                    </el-form-item>
                    <el-form-item label="金额" prop="amount">
                        <el-input-number  v-model="from.amount"  :min="0.1" :max="1000" :controls="false"  :disabled="$route.query.id? true: false"/>
                        <small class="tip-font">（提现金额为0.1~1000元）</small>
                    </el-form-item>
                    <el-form-item>
                        <el-button v-if="!$route.query.id" type="primary" @click="onSubmit('from')">提现</el-button>
                        <el-button @click="$router.go(-1)">取消</el-button>
                    </el-form-item>
                </el-form>
            </div>  
        </el-card>
    </div>
</template>
<script>
import { validatePhone } from '@/utils/validate'

export default {
  name: 'RechargeCreate',
  data() {
    const validatPhoneNumber = (rule, value, callback) => {
      if (value && (!validatePhone(value))) {
        callback(
          new Error('请输入正确的手机号')
        )
      } else {
        callback()
      }
    }
    return {
        from: {
        name: '',
        amount: 0.1,
        phone: ''
      },
      rulesForm: {
        name: [
        { required: true, message: '请输入真实姓名', trigger: 'change' }
        ],
        amount: [
          { required: true,message: '请输入提现金额', trigger: 'blur' }
        ],
        phone: [
        { required: true, message: '请输入联系电话', trigger: 'blur' },
          { validator: validatPhoneNumber, trigger: 'blur' }
        ]
      },
      statusOptions: {
        // 0: '全部状态',
        1: '提现申请成功',
        // '5': {
        //   icon: 'review',
        //   html: '打款失败'
        // },
        2: '提现打款成功',
        3: '提现审核拒绝',
        4: '撤回',
        5:'打款失败'
      },
    }
  },
  created() {
        if (this.$route.query.id) {
      this.apiBtn('CashShow', { id: this.$route.query.id }).then(res => {
        this.from = res.data
        this.from.phone = res.data.phone
        this.from.amount = res.data.amount
        this.from.name = res.data.name
        })
        }
        },
  methods: {
    // 输入充值金额充值
    onSubmit(formName) { 
        //  console.log(this.from,'from')
        this.$refs[formName].validate((valid) => {
        if (valid) {
            this.apiBtn('CashStore', { ...this.from })
            .then(res => {
                this.$message.success('提现申请成功!')
                this.$router.go(-1)
            
            })
        }
      })
    },
 

  }

}
</script>
<style lang="scss" scoped>
 .refuse{
    font-size: 15px;
    color: rgb(212, 146, 64);
    margin-bottom: 10px;
    font-weight: 600;
 }
 .aliReturn {
    font-size: 15px;
    color:  rgb(212, 146, 64);
    margin-bottom: 10px;
    font-weight: 600;
    .status{
        color: rgb(238, 0, 0);
    }
 
}
</style>