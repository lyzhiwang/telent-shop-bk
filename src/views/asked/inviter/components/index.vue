<template>
    <div>
        <el-card>
            <template #header>
                <div>
                    <span>{{ $route.query.id?'查看邀请':'创建邀请' }}</span>
                </div>
            </template>
            <div>
                <el-form ref="formRule" :model="form" :rules="rules" label-width="250px">
                    <tip title="达人模式" />
                    <el-form-item label="是否开启佣金" prop="is_reward" >
                        <el-switch v-model="form.is_reward" :active-value="1" :inactive-value="0" :disabled="$route.query.id? true: false"/>
                        <el-button v-show="form.is_reward" type="primary" icon="el-icon-plus" class="icon-add" circle @click="addSingle" :disabled="$route.query.id? true: false"/>
                    </el-form-item>
                    <div v-if="form.is_reward">
                        <el-form-item
                            v-for="(item,index) in form.award_rule"
                            :key="'award_rule'+index"
                            :inline="true"
                            class="marBot"
                            required>
                            <el-col class="line text-center" :span="2">邀请数量(人)</el-col>
                            <el-col :span="3">
                                <el-form-item
                                    :prop="'award_rule.' + index + '.num'"
                                    :rules="[{required: true,validator: validatenum,trigger: 'blur'}]">
                                    <el-input-number v-model="form.award_rule[index].num" :step="1" step-strictly style="width:100%"  :controls="false" :disabled="$route.query.id? true: false" clearable :min="index===0?0:(form.award_rule[index-1].num+1)" />
                                </el-form-item>
                            </el-col>
                            <el-col class="line text-center" :span="2" style="margin-left: 15%;">奖励(元)</el-col>
                            <el-col :span="3">
                                <el-form-item
                                :prop="'award_rule.' + index + '.money'"
                                :rules="[{required: true, validator: validateRedpacket,trigger: 'blur'}]">
                                <el-input-number v-model="form.award_rule[index].money" :precision="2" :step="0.1" style="width:100%" :disabled="$route.query.id? true: false"  :controls="false" clearable />
                                </el-form-item>
                            </el-col>
                            <el-col class="line text-center" :span="2" style="margin-left: 15%;">
                                <el-button type="danger" icon="el-icon-delete" circle size="40" :disabled="$route.query.id? true: false"  @click="delSingle(index)"/>
                            </el-col>
                        </el-form-item>
                        <el-form-item label="预计参与的人数" prop="number">
                            <el-input-number v-model="form.number" :precision="0" :min="1" :controls="false" :disabled="$route.query.id? true: false" clearable />
                        </el-form-item>
                    </div>
                    <el-form-item label="说明" prop="explain">
                        <el-input
                            type="textarea"
                            :rows="2"
                            width="150px"
                            size="small"
                            placeholder="请输入内容"
                            :disabled="$route.query.id? true: false"
                            v-model="form.explain">
                        </el-input>
                    </el-form-item>
                    <el-form-item>
                        <!-- <el-button  type="primary" @click="submitForm('formRule')">{{$route.query.id? '': '创建'}}</el-button> -->
                        <el-button v-if="!$route.query.id" type="primary" @click="submitForm('formRule')">创建</el-button>
                        <el-button @click="$router.go(-1)">取消</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </el-card>
    </div>
</template>
<script>
  export default {
    data() {
 
      return {    
        form: {
            is_reward: false, 
            award_rule: [{ money: 0.3, num: 1 }],
            number:'1',
            explain:'',
        },
        validateRedpacket: (rule, val, callback) => {
        if (!val) callback(('请输入奖励金额'))
        if (val < 0.3) callback(('金额最少0.3'))
        if (val > 500) callback(('金额最大500'))
        else callback()
      },
      validatenum: (rule, val, callback) => {
        if (!val) {
          callback(new Error('请输入邀请数量'))
        } else {
          callback()
        }
      },
        rules: {
            award_rule: [{ required: true, trigger: 'change'}],
            number: [{ required: true, message: '预计参与人数', trigger: 'blur' },],
            explain: [{ required: true, message: '请填写说明', trigger: 'blur' },],
      },
      }
    },
    
    watch: {
//     'form.award_rule'(val) {
//       if (!this.form.award_rule || this.form.award_rule.length === 0) {
//         // this.award_rule()
//         // var arr = form.award_rule
//         // arr.push({ money: 0.3, num: 15 })
//         console.log(this.form.award_rule,this.form,this.award_rule,'award_rulesssssssssss')
//     }
//   }
},
    created() {
        if (this.$route.query.id) {
      this.apiBtn('InviterShow', { id: this.$route.query.id }).then(res => {
        this.form = res.data
        this.form.number = res.data.number
        this.form.is_reward = res.data.is_reward
        })
        }
        },
    mounted() {
  
  },
  methods: {
       // 添加单个红包
       addSingle() {
        var arr = this.form.award_rule
        arr.push({ money: 0.3, num: 0 })
    },
    // 删除单个红包
    delSingle(index) {
      var arr = this.form.award_rule
      if (arr.length !== 1) {
        arr.splice(index, 1)
        // this.$refs.form.validateField('award_rule')
      } else this.$message('至少需要添加一种')
    },
    // 提交按钮
    submitForm (formName) {
        if(this.$route.query.id){
        this.form.id = this.$route.query.id
      }
        this.$refs[formName].validate((valid) => {
        // console.log('this.form', this.form)
        if (valid) {
          this.apiBtn('InviterStore', this.form).then(res => {
            this.$message.success('操作成功!')
             this.$router.go(-1)
          })
        } else {
            // console.log('3333')
            console.log('error submit!!');
          }
        });

    }
}
  };
</script>
<style rel="stylesheet/scss" lang="scss" scoped>

// ::v-deep .el-form-item__error{
//     margin-left: 20%;
// }
.el-button.is-circle{
    margin-left: 1%;
}

</style>