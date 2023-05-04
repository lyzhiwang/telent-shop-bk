<template>
  <div>
    <el-form ref="form" :model="form" :rules="formRules" :label-position="$store.state.app.labelPosition" label-width="251px">
      <el-form-item label="是否全国">
        <el-switch key="is_all" v-model="is_all" @change="allChange" />
      </el-form-item>
      <el-form-item label="是否省级代理" v-if="!is_all">
        <el-switch key="is_province" v-model="is_province" @change="areaInit" />
      </el-form-item>
      <el-form-item label="地区" prop="area" v-if="!is_all">
        <!-- <el-cascader
          v-model="userArea"
          :options="areaList"
          :props="areaProps"
          placeholder="请选择用户所在地区"
          clearable
        /> -->
            <el-select v-model="province" placeholder="请选择省份" @change="changeProvince" clearable >
              <el-option
                v-for="item in areaList"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
            <template v-if="!is_province && this.cityArr.length>1">
              <br/><br/>
            <el-select v-model="citys" placeholder="请选择市" multiple  @change="changeCitys" clearable>
              <el-option
                v-for="item in cityArr"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
            </template>


      </el-form-item>
      <el-form-item label="使用时间" prop="date">
        <DatePicker
          :value="form.date"
          type="datetimerange"
          value-format="yyyy-MM-dd HH:mm:ss"
          :default-time="['00:00:00', '23:59:59']"
          :has-shortcuts="true"
          :shortcuts="shortcuts"
          @changeTime="changeTime"
        />
      </el-form-item>

      <el-form-item label="项目名称" prop="project_name">
        <el-input v-model="form.project_name" placeholder="项目名称" clearable autocomplete="off" />
      </el-form-item>

      <el-form-item label="项目logo" prop="logo">
        <FileManager key="logo" :value="logo" :type="1" :size="1024" @change="changeCode" />
      </el-form-item>

    </el-form>
  </div>
</template>

<script>
import { getCity } from '@/utils/area'
import DatePicker from '@/components/Tool/DatePicker'
import FileManager from '@/components/FileManager/index'

export default {
  name: 'UserBaseAgent',
  components: { DatePicker, FileManager },
  props: {
    form: {
      type: Object,
      default() {
        return {
          area: '', // 地区
          date: [], // 使用时间
          project_name: '', // 项目名称
          logo: '', // 项目logo
        }
      }
    },
    areaList: {
      type: Array,
      default() {}
    }
  },
  data() {
    const validateArea = (rule, val, callback) => {
      if (this.userArea.length === 0) callback(new Error('请设置用户所属区域'))
      else if(!this.is_province && this.citys.length===0) callback(new Error('请选择市级区域'))
      else callback()
      // console.log('userArea', userArea)
      // if (userArea.length === 0) callback(new Error('请设置用户所属区域'))
      // else if (userArea.length === 1) callback(new Error('请设置正确的地区'))
      // else callback()
    }
    const validateDate = (rule, val, callback) => {
      if (val.length) {
        callback()
      } else {
        callback(new Error('请设置使用时间'))
      }
    }
    const validateFile = (rule, value, callback) => {
      if (this.logo && this.logo.id && this.logo.path) callback()
      else callback(new Error('请上传项目logo'))
    }
    return {
      province: '',
      cityArr: [],
      citys: [], // 所选市级
      is_all: false, // 是否全国
      is_province: false, // 是否省级代理
      userArea: [], // 地区绑定数据
      areaProps: {
        value: 'id',
        label: 'name',
        disabled: 'status',
        checkStrictly: true,
        expandTrigger: 'hover'
      },
      logo: {path: ''},
      shortcuts: [ // 快速选择使用时间
        {
          text: '三天',
          onClick(picker) {
            const start = new Date()
            const end = new Date()
            end.setTime(start.getTime() + 3600 * 1000 * 24 * 3)
            picker.$emit('pick', [start, end])
          }
        },
        {
          text: '一年',
          onClick(picker) {
            const start = new Date()
            const end = new Date()
            end.setFullYear(start.getFullYear() + 1)
            picker.$emit('pick', [start, end])
          }
        }
      ],
      agentList: [], // 客服列表
      formRules: {
        project_name: [
            { required: true, message: '请输入项目名称', trigger: 'blur' },
            { min: 2, max: 5, message: '长度在 2 到 5 个字符', trigger: 'blur' }],
        area: [{ required: true, trigger: 'change', validator: validateArea }],
        date: [{ required: true, trigger: 'blur', validator: validateDate }],
        logo: [{ required: true, trigger: 'change', validator: validateFile }]
      }
    }
  },
  mounted() {
    // this.$store.dispatch('config/GetQiniuToken', {file_type: 'img'})
  },
  computed: {
  },
  watch: {
    // 根据表单数据变化 修改组件绑定数据
    // 'form.area': function() {
    //   if (this.form.area > 0) this.userArea = this.countFullAdcode(this.form.area)
    //   else this.userArea = []
    // },
    // 监听地区改变修改表单数据
    // 'userArea': function(newVal) {
    //   this.$emit('area', newVal[newVal.length - 1])
    // }
  },
  created () {
    this.cityArr = []
    // this.getAgentList()
    if (this.form.area > 0) this.userArea = this.countFullAdcode(this.form.area)
  },
  methods: {
    // 省份切换
    changeProvince (e) {
      this.userArea = []
      this.cityArr = []
      this.citys = []
      if (e) {
        this.userArea.push(e)
        this.keyCity(e)
      }
    },

    // 市级选择
    changeCitys (e) {
      this.userArea = []
      this.userArea.push(this.province)
      e.map(v => {
        this.userArea.push(v)
        let arr = this.cityArr.filter(i=> i.id === v)
        if (arr[0].children) {
            arr[0].children.map(l =>{this.userArea.push(l.id)})
          }
      })
      console.log('e',e)
      console.log('this.userArea', this.userArea)
      this.$emit('change', { key: 'area', val: this.userArea.toString() })
    },

    // 筛选市级
    keyCity (code) {
      let arr = this.areaList.filter(v => v.id === code)
      this.cityArr = arr[0].children
      if (this.is_province) { // 省级代理
        this.keyAllCode()
      }
    },

    // 如果所选省级单位
    keyAllCode () {
      if (this.cityArr.length === 1) { // 市辖区
        const obj = this.cityArr[0]
        this.userArea.push(obj.id)
        obj.children.map(v => { this.userArea.push(v.id) })
      } else { // 多个
        this.cityArr.map(v => {
          this.userArea.push(v.id)
          if (v.children) {
            v.children.map(i =>{this.userArea.push(i.id)})
          }
        })
      }
      console.log('this.userArea', this.userArea)
      this.$emit('change', { key: 'area', val: this.userArea.toString() })
    },

    //初始化area
    areaInit () {
      this.province = ""
      this.userArea = []
      this.cityArr = []
      this.citys = []
    },
    allChange (value) {
      if (value) {
        this.$emit('change', { key: 'area', val: 0 })
      } else {
        this.areaInit()
      }
    },
    // 计算完整的地区
    countFullAdcode(code) {
      const arr = getCity(code, true)
      const adcode = []
      for (const item of arr) {
        adcode.push(item.id)
      }
      return adcode
    },
    // 时间插件修改回调
    changeTime(val) {
      this.$emit('change', { key: 'date', val })
    },
    // // 获取客服列表
    // getAgentList() {
    //   this.apiBtn('AdminIndex', { page: 1, size: 100, role_id: 5 }).then(res => {
    //     this.agentList = res.data.list
    //   })
    // },
    // 选择文件
    changeCode (val) {
      this.logo = val
      // 将图片路径同步到父组件
      this.$emit('change', { key: 'logo', val:val.id })
      // 重新验证
      this.$refs['form'].validateField('logo')
    },
    // 表单验证
    validateForm: function() {
      var result = false
      this.$refs['form'].validate(valid => {
        result = valid
      })
      return result
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-input-number .el-input__inner{
  text-align: left;
}
.tips{
  color: red;
  font-weight: bold;
}
</style>
