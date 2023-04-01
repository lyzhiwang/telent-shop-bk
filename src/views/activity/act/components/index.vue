<template>
  <div>
    <el-card>
      <template #header>
        <div>
          <span>{{ $route.query.id?'编辑任务':'创建任务' }}</span>
        </div>
      </template>
      <div>
        <el-form ref="formRule" :model="form" :rules="rules" label-width="250px">
          <tip title="基础信息" />
          <el-form-item label="任务名称" prop="title">
            <el-input v-model="form.title" clearable></el-input>
          </el-form-item>
          <el-form-item label="任务类型" prop="type">
            <el-radio-group v-model="form.type">
              <el-radio v-for="(item,index) in actType" :key="index" :disabled="$route.query.id? true: false" :label="item.id">{{ item.name }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="任务人数" prop="join_num">
            <el-input-number :min="1" v-model="form.join_num" :controls="false"></el-input-number>
          </el-form-item>

          <el-form-item label="任务时间" prop="date">
            <el-date-picker
              v-model="value1"
              type="datetimerange"
              value-format="yyyy-MM-dd HH:mm:ss"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :picker-options="pickerOptions"
              :unlink-panels="true"
              @change="changeDate">
            </el-date-picker>
          </el-form-item>

          <el-form-item label="主推套餐" prop="main_package" v-if="form.type!==4">
            <el-input v-model="form.main_package" clearable></el-input>
          </el-form-item>
          <el-form-item label="任务完成限制(小时)" prop="time_int">
            <el-input-number :min="1" v-model="form.time_int" :controls="false"></el-input-number>
            <p class="tips">*注: 此时间应填写为活动结束前多少小时必须完成任务.</p>
          </el-form-item>

          <el-form-item label="任务区域" prop="area">
            <el-cascader
              v-model="userArea"
              :options="agentAreaList"
              :props="areaProps"
              placeholder="请选择用户所在地区"
              @change="changeArea"
              clearable
            />
          </el-form-item>
          <el-form-item label="任务报名费用(元)" prop="activity_sing_money" v-if="![3,5].includes(form.type)">
            <el-input-number :min="0" v-model="form.activity_sing_money" :controls="false"></el-input-number>
            <p class="tips">*注: 当为0时表示不收费.大于0表示任务报名费用金额</p>
          </el-form-item>
          <el-form-item label="摄影师佣金(元)" prop="photo_man_money" v-if="form.type===4">
            <el-input-number :min="0.1" v-model="form.photo_man_money" :controls="false"></el-input-number>
          </el-form-item>

          <el-form-item label="轮播图" prop="img">
            <Upload :multiple="true" :limit="3" :imgUrl="imgUrl" :params="{type: 1}" @remove="removeSwiper" @change="changeSwiper"></Upload>
          </el-form-item>

          <el-form-item label="活动规则" prop="activity_rule">
            <Tinymce :html="form.activity_rule" @change="changeRule" />
          </el-form-item>

          <el-form-item label="任务详情" prop="detail">
            <Tinymce :html="form.detail" @change="changeDetail" />
          </el-form-item>

          <el-form-item label="注意事项" prop="careful_detail">
            <Tinymce :html="form.careful_detail" @change="changeCarefulDetail" />
          </el-form-item>

          <template v-if="form.type!==4">
          <tip title="达人要求" />
          <template v-if="[1,5].includes(form.type)">
            <el-form-item label="素材下载收费" prop="source_pay_money">
              <el-input-number v-model="form.source_pay_money" :min="0" :max="100" :controls="false"></el-input-number>
              <p class="tips">*注: 当为0时表示不收费.大于0表示素材收费金额,最大可设置100</p>
            </el-form-item>
          </template>
          <el-form-item label="带货佣金比" prop="brokerage_rate">
            <el-input v-model.number="form.brokerage_rate" :min="1" placeholder="请输入带货佣金比">
              <template slot="append">%</template>
            </el-input>
          </el-form-item>
          <el-form-item label="最高带货佣金(元)" prop="tallest_brokerage">
            <el-input-number :min="0" v-model="form.tallest_brokerage" :controls="false"></el-input-number>
          </el-form-item>
          <el-form-item label="团购等级" prop="start_level">
            <el-input v-model.number="form.start_level" :min="1" placeholder="请输入团购等级">
              <template slot="prepend">LV</template>
              <template slot="append">以上</template>
            </el-input>
          </el-form-item>
          <el-form-item label="任务类型" prop="award_rule">
            <el-button type="primary" @click="addItem" size="mini"  v-if="![3,5].includes(form.type)">新增类型</el-button>
            <br v-if="[3,5].includes(form.type)"/>
            <el-row v-for="(item, index) in form.award_rule" :key="index" class="liBox">
              <el-col :span="2">粉丝数量(人)：</el-col>
              <el-col :span="4" class="fans_box">
                <el-input-number v-model="item.fans_num" :min="1" :controls="false">
                </el-input-number>
              </el-col>
              <template v-if="![3,5].includes(form.type)">
                <el-col :span="2">任务金额(元)：</el-col>
                <el-col :span="4" class="fans_box">
                  <el-input-number v-model="item.money" :min="0.1" :controls="false">
                </el-input-number>
                </el-col>
              </template>
              <template v-if="index!==0 && form.award_rule.length===index+1">
                <el-button type="danger" icon="el-icon-delete" circle @click.prevent="removeItem(item)"></el-button>
              </template>
            </el-row>
          </el-form-item>
          </template>


          <template v-if="form.type===3">
            <tip title="置换" />
            <el-form-item label="提供产品" prop="goods_name">
              <el-input v-model="form.substitution_good[0].goods_name" placeholder="请输入产品名称" />
            </el-form-item>
            <el-form-item label="产品价格" prop="shop_name">
              <el-input-number v-model="form.substitution_good[0].goods_price" :min="1" placeholder="请输入产品价格" :controls="false"></el-input-number>
            </el-form-item>
          </template>

          <tip title="商家信息" />
           <!-- 代理帮商家创建任务 -->
          <el-form-item label="选择商家" v-if="roles===4" prop="create_admin_user_id">
            <el-select v-model="form.create_admin_user_id" placeholder="请选择任务归属商家" :disabled="$route.query.id? true: false" @change="changeShop">
              <el-option v-for="(item,index) in userList" :key="index" :label="`${item.username}(id:${item.id})`" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="商家名称" prop="shop_name">
            <el-input v-model="form.shop_name" maxlength="10" placeholder="长度在 1 到 10 个字符" />
          </el-form-item>
          <el-form-item label="商家手机" prop="shop_phone">
            <el-input v-model.number="form.shop_phone" type="number" maxlength="11" placeholder="请输入商家联系方式" />
          </el-form-item>
          <el-form-item label="抖音poi门店名称" prop="poi">
            <el-input placeholder="请填写正确的门店名称" v-model="form.poi">
              <!-- <el-button slot="append" @click="parseUrl" v-if="!dyPoiDis">解析地址</el-button>
              <el-button slot="append" @click="resetPoi" v-if="dyPoiDis">重置</el-button> -->
            </el-input>
            <!-- <div class="tips">*注:请抖音搜索框搜门店地点，点开正确的门店，右上角箭头里面复制链接，然后点击解析地址 </div> -->
        </el-form-item>
          <el-form-item label="商家地址" prop="shop_address">
            <el-input v-model="form.shop_address" disabled placeholder="请点击选择位置按钮" />
            <el-button type="primary" @click="isMapShow=true" style="margin-left: 20px">选择位置</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit('formRule')">立即{{$route.query.id? '更新': '创建'}}</el-button>
            <el-button @click="$router.go(-1)">取消</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-dialog
        title="选择位置"
        :visible.sync="isMapShow"
        width="60%">
        <Map :form="form"  @change="updateForm" @hide="isMapShow=false"></Map>
      </el-dialog>
    </el-card>

  </div>
</template>

<script>
import { mapState } from "vuex";
import { validateDouYinURL } from '@/utils/validate'
import Tinymce from '@/components/Tinymce/index'
import Map from "@/components/Tool/Map.vue";
  import Upload from "@/components/Upload/index";
  export default {
  components: { Tinymce, Upload, Map },
  computed: {
    ...mapState({
        shop_info: state => state.user.shop_info,
        roles: state => state.user.roles[0],
        userId: state => state.user.userId,
        create_admin_user_id: state => state.user.create_admin_user_id
      })
  },

  created () {
    if (this.$route.query.id) {
      this.apiBtn('ActivityShow', { id: this.$route.query.id }).then(res => {
        this.form = res.data
        this.form.start_level = Number(this.form.start_level)
        this.value1 = [this.form.start_time, this.form.end_time]
        this.form.create_admin_user_id = res.data.belong_to_admin_id
        this.form.activity_sing_money = Number(res.data.activity_sing_money)
        this.form.brokerage_rate= Number(res.data.brokerage_rate)
        this.imgUrl = res.data.upload
        this.form.img = []
        this.form.upload.map(v => {
          this.form.img.push({upload_id:v.id})
        })

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

      })
    }
    //代理商拿自己userid 商家拿代理id
    let currentId = Number(this.roles) === 4 ? this.userId : this.create_admin_user_id
      this.apiBtn('GetOemArea', { id: currentId }).then(res => {
        let list = [...res.data]
        // list.map(v => {
        //   v.disabled = true
        //   v.children.map(i => {
        //     i.disabled = true
        //   })
        // })
        this.agentAreaList = list
      })
    if (this.roles === 4) { // 代理获取商家列表
       this.apiBtn('AdminIndex', {page: 1, size: 1000}).then(res => {
        this.userList = res.data.list
      })
    } else {
      this.form.create_admin_user_id = this.userId
    }
  },
  data () {
    const validateDate = (rule, val, callback) => {
      if (this.value1.length === 0) callback(new Error('请选择任务时间'))
      else callback()
    }
    const validateJoinNum = (rule, val, callback) => {
      if (val <= 0) callback(new Error('请输入正确的人数'))
      else callback()
    }
    const validateAwardRule = (rule, val, callback) => {
      if (this.form.award_rule.length > 1) {
        for (let i = 0; i <= this.form.award_rule.length-2; i++){
          if (this.form.award_rule[i].fans_num >= this.form.award_rule[i + 1].fans_num) {
            callback(new Error('粉丝数量后一个必须大于前一个!'))
            break;
          } else {
            if (i === this.form.award_rule.length - 2) {
              callback()
            }
          }
        }
      }else callback()
    }
    const validateArea = (rule, val, callback) => {
      if (this.userArea.length === 0) callback(new Error('请设置任务区域'))
      else callback()
    }

    const validateImg = (rule, val, callback) => {
      if (this.form.img && this.form.img.length === 0) callback(new Error('请上传轮播图'))
      else callback()
    }

    const validateShopAddress = (rule, val, callback) => {
      if (this.form.shop_address && Object.keys(this.form.location).length===2) callback()
      else callback(new Error('请填写地址并获取地理位置!'))
    }
    return {
      pickerOptions: {
          shortcuts: [{
            text: '选择一个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              end.setTime(end.getTime() + 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '选择三个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              end.setTime(end.getTime() + 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          },{
            text: '选择一年',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              end.setTime(end.getTime() + 3600 * 1000 * 24 * 365);
              picker.$emit('pick', [start, end]);
            }
          }],
          disabledDate(time) {
            let now = new Date();   //获取此时的时间
            let nowData = new Date(  //获取此时年月日的后一天
              now.getFullYear()+ 1,
              now.getMonth(),
              now.getDate() + 1 //获取明天
            );

            return (
              time.getTime() > nowData.getTime() - 1000  //可以选择到今天的xxx:xxx:xxx:23:59:59，只有的全部disabled
            );
          }
        },
      agentAreaList: [], // 地理位置数据
      userArea: [],
      areaProps: {
        value: 'id',
        label: 'name',
        multiple: true
        // checkStrictly: true
      },
      isMapShow: false, // 地图选择位置
      dyPoiDis: false, // poi解析禁用
      actType: [{ id: 1, name: '云剪' }, { id: 2, name: '实探' }, { id: 3, name: '置换' }, { id: 4, name: '摄影师' }, { id: 5, name: '纯佣' }], // { id: 5, name: '纯佣' }
      value1: [],
      imgUrl: [],
      userList: [],
      form: {
        title: '',
        type: 1,
        detail: '',
        careful_detail: '',
        activity_rule: '',
        join_num: 10,
        area: '',
        start_time: '',
        end_time: '',
        tallest_brokerage: 0, //最高带货佣金
        activity_sing_money: 0, // 任务报名费用
        award_rule: [{fans_num: 100, money: 1}],
        create_admin_user_id: '',//代理商创建任务- 传商家ID，商家创建-传自己ID
        img: [],//轮播图
        source_pay_money: 0, // 开启素材下载收费金额 大于0代表开启收费
        photo_man_money: null, // 摄影师佣金
        shop_name: '',
        shop_phone: '',
        shop_address: '',
        location: {},
        poi: '', // poi
        main_package: '', // 主推套餐
        time_int: 48, // 任务限制完成时间
        brokerage_rate: '',// 带货佣金比
        start_level: '', //团购等级
        substitution_good: [{
          goods_name: '', // 提供产品名称
          goods_price: '', // 产品价值
        }], // 置换 提供商品信息
      },
      rules: {
        title: [
          { required: true, message: '请输入任务名称', trigger: 'blur' },
          { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' }
        ],
        main_package: [
          { required: true, message: '请输入主推套餐', trigger: 'blur' }
        ],
        date: [
          { required: true, trigger: 'change', validator: validateDate}
        ],
        area: [
          { required: true, trigger: 'change', validator: validateArea}
        ],
        img: [
          {required: true, trigger: 'change', validator: validateImg}
        ],
        award_rule: [
          { required: true, trigger: 'change', validator: validateAwardRule}
        ],
        activity_rule: [{
          required: true, message: '请输入活动规则', trigger: 'blur'
        }],
        detail: [
          { required: true, message: '请输入任务详情', trigger: 'blur' }
        ],
        careful_detail: [
          { required: true, message: '请输入注意事项', trigger: 'blur' }
        ],
        join_num: [
          { required: true, validator: validateJoinNum, trigger: 'blur' },
        ],
        brokerage_rate: [
          { required: true, message: '请输入带货佣金比', trigger: 'blur' },
          { type: 'number', message: '必须为数字值'}
        ],
        start_level: [
          { required: true, message: '请输入团购等级', trigger: 'blur' },
          { type: 'number', message: '必须为数字值'}
        ],
        photo_man_money: [
          { required: true, message: '请输入摄影师佣金', trigger: 'blur' }
        ],
        shop_name: [
          { required: true, message: '请输入商家名称', trigger: 'blur' }
        ],
        shop_phone: [
          { required: true, message: '请输入商家手机', trigger: 'blur' }
        ],
        create_admin_user_id: [
          { required: true, message: '请选择任务归属商家', trigger: 'blur' }
        ],
        poi: [
          { required: true, message: '请填写正确的门店名称', trigger: 'blur' }
        ],
        // shop_address: [
        //   { required: true, validator: validateShopAddress, trigger: 'blur' }
        // ]
      }
    }
  },
  mounted(){
    if (Object.keys(this.shop_info).length > 0) {
      this.form.shop_name = this.shop_info.shop_name
      this.form.shop_phone = this.shop_info.shop_phone
      this.form.location = this.shop_info.location
      console.log('this.shop_info', this.shop_info)
      this.form.shop_address = this.shop_info.shop_address
    }
  },
  methods: {
    // 代理切换商家回显商家信息
    changeShop(e){
      const obj = this.userList.find(v=>{ return v.id === e})
      console.log('obj', obj)
      if(Object.keys(obj).length>0){
        this.form.shop_name = obj.shop_name
        this.form.shop_phone = obj.shop_phone
        this.form.location = obj.location
        this.form.shop_address = obj.shop_address
      }
    },
    //添加
    addItem () {
      const lastNum = (this.form.award_rule[this.form.award_rule.length-1].fans_num) + 50
      const obj = { fans_num: lastNum, money: 5 }
      this.form.award_rule.push(obj)
    },
    removeItem (item) {
      if (this.form.award_rule.length===1) {
        this.$message.error('至少保留一条规则!');
      } else {
        const index = this.form.award_rule.indexOf(item)
        if (index !== -1) {
          this.form.award_rule.splice(index, 1)
        }
      }
    },
    // 解析抖音poi
    parseUrl () {
      if (validateDouYinURL(this.form.poi)) {
         this.apiBtn('ParseRedirect', { type: 2, page: this.form.poi }).then(res => {
          this.form.poi = res.data.id
          this.dyPoiDis = true
          this.$message.success('解析成功!')
      })
      } else {
        this.$message.error('请输入正确的抖音链接')
      }
    },
    // 重置poi
    resetPoi () {
      this.form.poi = ''
      this.dyPoiDis = false
    },
    updateForm (e,val) {
      this.form[e] = val
     },
    // 选择地区
    changeArea (e) {
      let arr = this._.uniq(this._.flattenDeep([...e]))
      this.form.area = arr.toString()
      console.log('area', this.form.area)
      console.log('userArea', this.userArea)
    },
    // 详情
    changeDetail (e) {
      this.form.detail = e
    },
    // 活动规则
    changeRule(e){
      this.form.activity_rule = e
    },
    changeCarefulDetail (e) {
     this.form.careful_detail = e
    },
    // 日期
    changeDate (e) {
      this.form.start_time = e[0]
      this.form.end_time = e[1]
    },
    // 上传图片
    changeSwiper (e) {
      this.form.img.push({upload_id: e.id})
    },
    onSubmit (formName) {
      if(this.$route.query.id){
        this.form.id = this.$route.query.id
      }
      if (this.form.type === 4) {
        let arr = ['award_rule', 'brokerage_rate', 'main_package', 'source_pay_money', 'start_level', 'substitution_good', 'tallest_brokerage']
        for (let i = 0; i < arr.length - 1; i++){
          delete this.form[arr[i]]
        }
      }
      if([3,5].includes(this.form.type)){ // 置换
        this.form.award_rule[0].money =0
      }
      console.log('this.form', this.form)
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.apiBtn(this.form.id?'ActivityPut' :'ActivityStore', this.form).then(res => {
            this.$message.success('操作成功!')
             this.$router.go(-1)
          })
        } else {
            // console.log('3333')
            console.log('error submit!!');
          }
        });
    },
    removeSwiper (file) {
      const fileId = file.response.data.id
      const index = this.form.img.findIndex(v => { return v.upload_id === fileId })
      if (index >= 0) {
       this.form.img.splice(index,1)
      }
    }
    }
  }
</script>
<style lang="scss" scoped>
.liBox{
  padding: 10px 0;
}
.fans_box{
  ::v-deep .el-input{
    width: 90%;
  }
}
.dyPoi_box{
  ::v-deep .el-input{
    width: 600px;
  }
}
.tips{
  color: red;
  font-weight: bold;
}
</style>

