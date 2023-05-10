<template>
  <div class="app-container">
    <!-- <tip title="暂无" /> -->
    <el-card class="box-card" v-if="[1,6].indexOf(roles[0])===-1">
      <div slot="header" class="clearfix">
        <span>资金信息</span>
      </div>
      <el-row :gutter="20">
        <el-col :span="12">
          <div>
            <el-statistic  title="余额">
              <template slot="formatter">{{ (Number(dashboardData.total) - Number(dashboardData.withdrew)).toFixed(2) }}</template>
            </el-statistic>
          </div>
        </el-col>
        <el-col :span="12">
            <el-statistic title="待入账金额">
              <template slot="formatter">{{ dashboardData.wait_money }}</template>
            </el-statistic>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="box-card" v-if="roles[0]!=1">
      <el-tabs v-model="activeName">
        <el-tab-pane label="小程序二维码" name="first" >
        <div slot="header" class="clearfix">
        <!-- <span>小程序二维码</span> -->
      </div>
      <el-image :src="dashboardData.mini_qrcode"></el-image>
    </el-tab-pane>
    <el-tab-pane v-if="roles[0]===3" label="阿里支付配置" name="second">
        <el-form ref="from" :rules="rulesForm" :model="from" class="form-racharge" label-width="251px">
            <el-form-item label="pid" prop="pid">
                <el-input v-model="from.pid" ></el-input>
          </el-form-item>
          <el-form-item label="appid" prop="appid">
            <el-input v-model="from.appid" ></el-input>
          </el-form-item>
          <el-form-item label="应用私钥" prop="private_key">
            <el-input v-model="from.private_key" ></el-input>
          </el-form-item>
          <el-form-item label="证书" prop="cert_path">
            <el-input v-model="from.cert_path" ></el-input>
          </el-form-item>
          <el-form-item label="根证书" prop="root_cert">
            <el-input v-model="from.root_cert" ></el-input>
          </el-form-item>
          <el-form-item label="应用公钥证书" prop="key_path">
            <el-input v-model="from.key_path" ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button @click="Submit('from')">保存</el-button>
          </el-form-item>
        </el-form>
    </el-tab-pane>
    
  </el-tabs>
    </el-card>
   
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { validate } from '@/utils/validate'


export default {
  name: 'Dashboard',
  components: {validate},
  data() {
    // return {
    //     activeName: 'first',
    // }
    return {
        activeName: 'first',
        from: {
            pid: '',
            appid: '',
            private_key: '',
            cert_path:'',
            root_cert:'',
            key_path:'',

      },
      rulesForm: {
        pid: [
        { required: true, message: '请输入pid', trigger: 'change' }
        ],
        appid: [
          { required: true,message: '请输入appid', trigger: 'blur' }
        ],
        private_key: [
        { required: true, message: '请输入应用私钥', trigger: 'blur' },
        ],
        cert_path: [
          { required: true,message: '请输入证书', trigger: 'blur' }
        ],
        root_cert: [
          { required: true,message: '请输入根证书', trigger: 'blur' }
        ],
        key_path: [
          { required: true,message: '请输入应用公钥证书', trigger: 'blur' }
        ],
      },
    }
    
  },
  computed: {
    ...mapState({
      dashboardData: (state)=>state.user.dashboardData,
      roles: (state)=>state.user.roles,
      userId: state => state.user.userId,
      getInfo:state =>state.user
    })
  },
  created() {
       this.$store.dispatch('user/getInfo')
  },
  mounted() {
    // console.log(this.userId,this.roles,'this.userId')
    if (this.roles[0]===3) {
         this.apiBtn('AliConfigShow', { id: this.userId }).then(res => {
            this.from = res.data
            this.from.pid = res.data.pid
            this.from.appid = res.data.appid
            this.from.private_key = res.data.private_key
            this.from.cert_path = res.data.cert_path
            this.from.root_cert = res.data.root_cert
            this.from.key_path = res.data.key_path
        })
    }
  },
  methods: {
    Submit(formName) { 
        //  console.log(this.from,'from')
        this.$refs[formName].validate((valid) => {
        if (valid) {
            this.apiBtn('AliConfigUpdate', { ...this.from,id: this.userId })
            .then(res => {
                this.$message.success('保存成功!')
                
            })
        }else {
            console.log('error submit!!');
            return false;
          }
      })
    },
  }
}
</script>

<style lang="scss" scoped>
.box-card{
  margin-bottom: 20px;
}
</style>
