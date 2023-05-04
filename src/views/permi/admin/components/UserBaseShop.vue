<template>
  <el-form ref="form" :model="form" :rules="formRules" :label-position="$store.state.app.labelPosition" label-width="251px">
    <el-form-item label="是否托管" prop="is_trusteeship">
      <el-switch v-model="form.is_trusteeship" :active-value="1" :inactive-value="0" />
      <p class="tips">* 开启托管后代理可帮助商家发布活动</p>
    </el-form-item>
    <el-form-item label="商家分类" prop="shop_tag_id">
      <el-select v-model="form.shop_tag_id" placeholder="请选择分类类型" clearable>
        <el-option v-for="item in cateList" :key="item.id+item.name" :label="item.name" :value="item.id" />
      </el-select>
    </el-form-item>
    <el-form-item label="商家名称" prop="shop_name">
      <el-input v-model="form.shop_name" maxlength="10" placeholder="长度在 1 到 10 个字符" />
    </el-form-item>
    <el-form-item label="商家手机" prop="shop_name">
      <el-input v-model.number="form.shop_phone" type="number" maxlength="11" placeholder="请输入商家联系方式" />
    </el-form-item>
    <el-form-item label="商家地址" prop="shop_address">
      <el-input v-model="form.shop_address" disabled placeholder="请输入商家地址" />
      <el-button type="primary" @click="isMapShow=true" style="margin-left: 20px">选择位置</el-button>
    </el-form-item>
    <!-- <el-form-item label="活动报名金额">
      <el-input-number v-model="form.activity_sing_money" :controls="false"></el-input-number>
    </el-form-item> -->
    <el-dialog
        title="选择位置"
        :visible.sync="isMapShow"
        width="60%">
        <Map :form="form"  @change="updateForm" @hide="isMapShow=false"></Map>
      </el-dialog>
  </el-form>
</template>
<script>
import Map from "@/components/Tool/Map.vue";
export default {
  components: { Map },
  props: {
    form: {
      type: Object,
      default() {
        return {
          is_trusteeship: 0, //是否托管
          shop_name: '', // 商家名称
          shop_phone: '', // 商家电话
          shop_address: '', // 商家地址
          location:{}
          // activity_sing_money: 0
        }
      }
    }
  },
  data () {
     const validateLoaction = (rule, val, callback) => {
      if (val && Object.keys(this.form.location).length>0) {
        callback()
      } else {
        callback(new Error('请点击'))
      }
    }
    return {
      isMapShow: false,
      cateList: [],
      formRules: {
        shop_tag_id: [{required: true, message: '请选择商家分类', trigger: 'blur'}],
        shop_name: [{ required: true, message: '请输入商家名称', trigger: 'blur' }],
        shop_phone: [{ required: true, message: '请输入商家电话', trigger: 'blur' }],
        shop_address: [{ required: true, trigger: 'blur', validator: validateLoaction }]
      }
    }
  },
  mounted() {
    this.apiBtn('CategIndex', {page: 1,size: 1000,})
      .then(res => {
        this.cateList = res.data
      })
  },
  methods: {
    // 表单验证
    validateForm: function() {
      var result = false
      this.$refs['form'].validate(valid => {
        result = valid
      })
      return result
    },
    updateForm (e,val) {
      this.form[e] = val
     },
  }
}
</script>
<style scoped>
.tips{
  color: red;
  font-weight: bold;
}
</style>
