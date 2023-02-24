<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div>
          <span>{{ $route.query.id?'编辑用户':'新增用户' }}</span>
        </div>
      </template>
      <div>
        <!-- 基础 所有-->
        <tip title="基础信息" />
        <user-base ref="userBase" :form="form" @change="changeForm" />
        <template v-if="form.role_id===3">
          <!-- 基础 oem-->
          <user-base-oem ref="userBaseOem" :area-list="areaList" :form="form" @change="changeForm" />
        </template>

        <template v-if="form.role_id===4">
        <!-- 代理 -->
          <user-base-agent ref="userBaseAgent" :area-list="agentAreaList" :form="form" @change="changeForm"></user-base-agent>
        </template>
        <template v-if="form.role_id===5">
        <!-- 商家 -->
          <user-base-shop  ref="userBaseShop" :form="form" @change="changeForm"></user-base-shop>
        </template>


        <div style="padding-left:251px">
          <el-button type="primary" @click="submit">提交</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { getAreaStorage } from '@/utils/storage'
import { mapState } from "vuex";
import UserBase from './UserBase.vue'
import UserBaseOem from './UserBaseOem.vue'
import UserBaseAgent from './UserBaseAgent.vue'
import UserBaseShop from "./UserBaseShop.vue";
import UserBaseOperation from './UserBaseOperation.vue'

export default {
  name: 'Base',
  components: { UserBase, UserBaseOem, UserBaseAgent, UserBaseShop, UserBaseOperation },
  data() {
    return {
      form: {
        // 基础字段
        username: '', // 用户名
        password: '', // 密码
        remark: '', // 备注
        role_id: '', // 角色
        area: '', // 地区
        date: '', // 使用时间
        // 客服填写
        project_name: '', // 项目名称
        logo: '', // 项目logo
        is_trusteeship: 0, // 是否托管(针对商家)
        shop_tag_id: '', // 商家分类
        shop_name: '', // 商家名称
        shop_phone: '', // 商家电话
        shop_address: '', // 商家地址
        location: {},
        activity_sing_money: 0 // 活动报名金额
      },
      areaList: [],
      agentAreaList: [] // 代理区域
    }
  },
  computed: {
    ...mapState({
      userId: state => state.user.userId,
      role_id: state => state.user.roles[0]
    })
  },
  created () {
    if (this.role_id ===3) {
      this.apiBtn('GetOemArea', { id: this.userId }).then(res => {
        let list = [...res.data]
        // list.map(v => {
        //   v.disabled = true
        //   v.children.map(i => {
        //     i.disabled = true
        //   })
        // })
        console.log('list', list)
        this.agentAreaList = list
      })
    }

    this.$store.dispatch('config/GetRoleList')
      .then(res => {
        this.$store.dispatch('area/GetArea')
          .then(res => {
            this.getAdminInfo()
            // 获取地区列表
            this.areaList = getAreaStorage()
            console.log('this.areaList', this.areaList)
          })
      })
  },
  methods: {
    // 获取用户详情
    getAdminInfo() {
      if (!this.$route.query.id) return
      this.apiBtn('AdminIndex', { id: this.$route.query.id }).then((res) => {
        this.form = res.data
        this.form.role_id = res.data.role.id
      })
    },
    // 提交数据
    submit () {
      if (this.validateForm()) {
        if (this.form.role_id === 2) {
          delete this.form.date
          delete this.form.is_trusteeship
          delete this.form.shop_name
          delete this.form.shop_phone
          delete this.form.shop_address
          delete this.form.activity_sing_money
          delete this.form.area
          delete this.form.logo
          delete this.form.project_name
          delete this.form.location
          delete this.form.shop_tag_id
        }
        if (this.form.role_id === 3) {
          delete this.form.is_trusteeship
          delete this.form.shop_name
          delete this.form.shop_phone
          delete this.form.shop_address
          delete this.form.activity_sing_money
          delete this.form.location
          delete this.form.shop_tag_id
        }
        if (this.form.role_id === 4) {
          delete this.form.date
          delete this.form.logo
          delete this.form.project_name
          delete this.form.is_trusteeship
          delete this.form.shop_name
          delete this.form.shop_phone
          delete this.form.shop_address
          delete this.form.activity_sing_money
          delete this.form.location
          delete this.form.shop_tag_id
        }
        if (this.form.role_id === 5) {
            delete this.form.date
            delete this.form.area
            delete this.form.logo
            delete this.form.project_name
        }
        this.apiBtn(this.form.id ? 'AdminPut' : 'AdminStore', { ...this.form }).then((res) => {
          this.$message.success('操作成功!')
          this.$router.go(-1)
        })
      }

    },
    // 子组件修改值
    changeForm(obj) {
      this.$set(this.form, obj.key, obj.val)
    },
    // 校验
    validateForm() {
      const list = ['userBase', 'userBaseOem', 'userBaseAgent', 'userBaseShop']
      let result = true
      for (let i = 0; i < list.length; i++) {
        const name = list[i]
        const ref = this.$refs[name]
        // 保证全部检验：一定要用一个&
        result = result & (ref ? ref.validateForm() : true)
      }
      return result
    },
    // 格式化字段
    formateData(data) {
      // 不会删除的字段： const base = ['username', 'password', 'remark', 'role_id']
      const agent = ['account', 'operator_service', 'market_service']
      const store = ['area', 'date']
      const actionStore = ['customer_video', 'is_national', 'is_open_card']
      const actionAgent = ['is_open_authorization', 'is_open_card', 'custom_name', 'custom_icon', 'is_weapp', 'weapp_image']
      const operation = ['name', 'phone', 'service_code']

      // 将要删除的字段
      let delData = []
      // 图片字段
      const pic = ['service_code', 'custom_icon', 'weapp_image']

      if (this.checkRole(['admin', 'operation'])) {
        if (this.checkRole(['admin', 'account'], data.role)) delData = delData.concat(agent, store, actionStore, actionAgent, operation)
        else if (this.checkRole(['operation'], data.role)) delData = delData.concat(agent, store, actionStore, actionAgent)
        else if (this.checkRole(['agent'], data.role)) {
          delData = delData.concat(operation)
          // 代理未打开直接关闭
          if (!data.is_weapp) delete data.weapp_image
        } else if (this.checkRole(['store'], data.role)) {
          delData = delData.concat(agent, actionAgent, operation)
        }
      } else {
        // 此情况下是代理创建门店，只需要填写基本信息
        delData = delData.concat(agent, store, actionAgent, operation)
      }

      // 便利删除对象 修改图片对象格式
      for (const key in data) {
        if (delData.includes(key)) delete data[key]
        else if (pic.includes(key)) data[key] = data.id || 0
      }

      return data
    }

  }

}
</script>
