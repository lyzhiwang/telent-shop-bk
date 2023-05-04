<template>
    <div class="app-container">
      <complex-table
      :page-name="'达人邀请'"
      :table-header="tableHeader"
      :table-data="tableData"
      :pagination="pagination"
      @refreshTable="getList"
      :hasSelection="false"
      :hasSearch="false"
    >
        <template v-slot:btn>
        <el-button v-has="'InviterStore'" type="primary" size="medium" @click="toRedirect('InviterStore')">新建</el-button>
      </template>
       <!-- 开启奖励 -->
      <template v-slot:is_reward="slotProps">
        {{ slotProps.scope.row.is_reward===1?'是': '否' }}
      </template>
      <!-- 是否开启 -->
      <template v-slot:is_open="slotProps">
            <el-switch v-model="slotProps.scope.row.is_open" :active-value="1" :inactive-value="0" @change="changeSwitch('InviterClose', slotProps.scope.row)" />
      </template>
        <!-- 返还 -->
        <template v-slot:is_return="slotProps">
            {{ slotProps.scope.row.is_return===1?'是': '否' }}
        </template>
            <!-- 操作 -->
      <template v-slot:action="slotProps">
        <div class="btns">
        <!-- <el-button
          v-has="'InviterUpdate'"
          type="primary"
          size="mini"
          @click="editInviter(slotProps.scope.row)"
        >编辑</el-button> -->
        <el-button
          v-has="'InviterShow'"
          type="primary"
          size="mini"
          @click="toDetail(slotProps.scope.row)"
        >详情</el-button>
        <el-button
          v-has="'InviterPrestoredStore'"
          type="danger"
          size="mini"
          @click="recharge(slotProps.scope.row)"
        >充值</el-button>
        <el-button
          v-has="'InviterReturnBalance'"
          type="danger"
          size="mini"
          @click="returnBalance(slotProps.scope.row)"
        >返还金额</el-button>
        </div>

      </template>

    </complex-table>
    <recharge-dialog :isVisible="rechargeShow" :id="currentId" @close="rechargeShow=false"></recharge-dialog>
    </div>
</template>

<script>
import ComplexTable from '@/components/Table/ComplexTable'
import RechargeDialog from './components/RechargeDialog.vue'

export default {
  name: 'LogPic',
  components: { ComplexTable, RechargeDialog },
  data() {
    return {
      rechargeShow: false,
      currentId: null,
      formSearch: {
        time: [],
        status: ''
      },
      otherSearch: {
        keywords: ''
      },
      tableHeader: [
        {label:'id',prop:'id',  sortable: true,width:160},
        { label: '是否开启奖励', prop: 'is_reward',isCustomize: true, },
        { label: '是否开启', prop: 'is_open',isCustomize: true },
        { label: '预计参与邀请达人数量', prop: 'number' },
        { label: '充值总数量', prop: 'total', isCustomize: true },
        { label: '余额', prop: 'balance', isCustomize: true },
        { label: '是否已经返还', prop: 'is_return', isCustomize: true},
        { label: '操作', prop: 'action',width: 300,isCustomize: true}

      ],
      pagination: {
        // 当前是第几页
        page: 1,
        // 一页几条
        size: 10,
        // 一共多少页
        total: 1
      },
      tableData: [
      ],
    //   statusOptions: {
    //     // 0: '全部状态',
    //     1: '支付成功',
    //     2: '未支付',
    //     3: '订单关闭',
    //     4: '支付失败'
    //   },
    //   statusColorOptions: {
    //     1: 'success',
    //     2: 'warning',
    //     3: 'default',
    //     4: 'danger'
    //   },
      typeOptions: {
        1: '微信充值'
      },
      userId: this.$store.getters.userId
    }
  },
  watch: {
    formSearch: {
      deep: true,
      handler() {
        this.getList()
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 搜索
    search() {
      this.getList()
    },
    // 用户列表
    getList(pagination) {
      this.initPagination = {
        page: 1,
        size: 22,
      }
      this.apiBtn('InviterIndex', this.initPagination).then((res) => {
        this.tableData = res.data
        this.pagination.total = res.meta.total
      })
    },
    // 开关
    changeSwitch (name, row) {
      const msg = (row.is_open === 1 ? '将要开启' : '将要关闭')   + '(id:' + row.id + ')的活动”,是否继续？'
      const params = {
        id: row.id,
        is_open: row.is_open
      }
      const catchBack = () => {
        this.$set(row, 'is_open', row.is_open = row.is_open===1?true:false)
      }
      const callBack = () => {
        this.apiBtn(name, params)
          .then(res => {
            this.$set(row, 'is_open', row.is_open)
            this.getList()
          })
          .catch(res => {
            catchBack()
          })
      }
      this.defalultConfirm(msg, callBack, catchBack)
    },
    //详情
    toDetail(row){
        this.toRedirect('InviterStore',{id: row.id})
    },
   
    // 编辑
    editInviter (row) {
      this.toRedirect('InviterStore',{id: row.id})
    },
   // 充值
   recharge (row) {
      this.currentId = row.id
      this.rechargeShow = true
    },

   // 活动返还金额
   returnBalance (row) {
      this.$confirm('此操作将返还该活动金额, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }).then(() => {
        this.apiBtn('InviterReturnBalance', { id: row.id }).then(res => {
          this.$message.success('操作成功!')
        })
      }).catch(() => {
      })
    },

  }
}
</script>

<style lang="scss" scoped>
.el-form-item {
  margin-bottom: 0;
}
.el-date-editor {
  width: 380px;
}
</style>