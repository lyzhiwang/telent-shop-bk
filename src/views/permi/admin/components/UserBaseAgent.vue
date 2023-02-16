<template>
  <div>
    <el-form ref="form" :model="form" :rules="formRules" :label-position="$store.state.app.labelPosition" label-width="251px">
      <el-form-item label="地区" prop="area" v-if="!is_all">
        <el-cascader
          v-model="userArea"
          :options="areaList"
          :props="areaProps"
          placeholder="请选择用户所在地区"
          @change="changeArea"
          clearable
        />


      </el-form-item>

    </el-form>
  </div>
</template>

<script>
export default {
  props: {
    form: {
      type: Object,
      default() {
        return {
          area: '', // 地区
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
      else callback()
    }
    return {
      province: '',
      cityArr: [],
      citys: [], // 所选市级
      is_all: false, // 是否全国
      is_province: false, // 是否省级代理
      userArea: [], // 地区绑定数据
      formRules: {
        area: [{ required: true, trigger: 'change', validator: validateArea }]
      },
      areaProps: {
        value: 'id',
        label: 'name',
        multiple: true,
        // checkStrictly: true
      }
    }
  },
  computed: {
  },
  created () {
    this.cityArr = []
    // this.getAgentList()
    if (this.form.area) {
      let arr = this.form.area.split(',')
      let newArr = arr.map(Number)
      if (newArr.length === 3) {
        this.userArea.push(newArr)
      } else {
        for (let i = 2; i < newArr.length - 2; i++){
          let arr1 = [newArr[0], newArr[1], newArr[i]]
          this.userArea.push(arr1)
        }
      }
    }
  },
  methods: {
    changeArea (e) {
      let arr = this._.uniq(this._.flattenDeep([...e]))
      this.$emit('change', { key: 'area', val: arr.toString() })
    },
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
