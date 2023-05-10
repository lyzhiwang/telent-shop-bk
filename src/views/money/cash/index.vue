<template>
    <div class="app-container">
        <complex-table
            :page-name="'提现管理'"
            :table-header="tableHeader"
            :table-data="tableData"
            :pagination="pagination"
            @refreshTable="getList"
            :hasSelection="false"
            :has-selection="searchStore">
             <!-- 搜索框 -->
            <template v-slot:search>
                <el-select v-model="formSearch.status" placeholder="请选择状态" clearable>
                    <el-option v-for="(item,key) of statusOptions" :key="key" :label="item" :value="key" />
                </el-select>
                <!-- 选取时间 -->
                <DatePicker
                    :value="formSearch.time"
                    :has-shortcuts="true"
                    value-format="timestamp"
                    @changeTime="changeTime"/>
                <el-input
                    v-model="otherSearch.keywords"
                    placeholder="ID|用户名|备注"
                    clearable
                    class="search-item"
                    @keyup.native.enter="search"
                    @clear="search"/>
                <el-button type="primary" icon="el-icon-search" class="search-item" @click="search">搜索</el-button>
            </template>
            <!-- 按钮 -->
            <template v-slot:btn>
                <el-button v-has="'CashStore'" type="primary" size="medium" @click="toRedirect('CashStore')">发起提现</el-button>
            </template>
             <!-- 用户信息 -->
             <template v-slot:admin="slotProps">
                <div class="admin">
                  <span>id:{{ slotProps.scope.row.admin.id }}</span> <br/>
                  <span>备注:{{ slotProps.scope.row.admin.remark }}</span><br/>
                  <span>代理用户:{{ slotProps.scope.row.admin.username }}</span><br/>
                </div>
                 
            </template>
            <!-- 充值状态 -->
            <template v-slot:status="slotProps">
                <span :class="'point point-'+statusColorOptions[slotProps.scope.row.status]" />
                {{ statusOptions[slotProps.scope.row.status] }}
            </template>
            
            <template v-slot:operation="slotProps">
                <el-button
                v-has="'CashShow'"
                type="primary"
                size="mini"
                @click="toDetail(slotProps.scope.row)"
                >详情</el-button>
                <el-button v-if="roles[0]===3 && slotProps.scope.row.status === 1" v-has="'CashAudit'"  size="mini" type="primary" @click="handlePass(2,slotProps.scope.row)">通过</el-button>
                <el-button v-if="roles[0]===3 && slotProps.scope.row.status === 1" v-has="'CashAudit'"  size="mini" type="warning" @click="handlePasss(3,slotProps.scope.row)">驳回</el-button>
            </template>
        </complex-table>
    </div>
</template>
<script>
import ComplexTable from '@/components/Table/ComplexTable'
import DatePicker from '@/components/Tool/DatePicker'
import { mapState } from 'vuex'
export default {
//   name: 'LogPic',
  components: { ComplexTable, DatePicker },
  data() {
    return {
      rechargeShow: false,
      currentId: null,
      formSearch: {
        time: [],
        status: '',
        keywords: '',
      },
      otherSearch: {
        keywords: '',
      
      },
    //   tagTypeList: [{ id: 1, name: '提现申请成功' }, { id: 2, name: '提现打款成功' }, { id: 3, name: '提现审核拒绝' },{id: 4,name: '撤回'},{id: 5,name: '打款失败'}],
      statusOptions: {
        // 0: '全部状态',
        1: '提现申请成功',
        2: '提现打款成功',
        3: '提现审核拒绝',
        4: '撤回',
        5:'打款失败'
      },
      statusType: {
        2: '通过',
        3: '驳回'
      },
      statusColorOptions: {
        1: 'success',
        2: 'warning',
        3: 'default',
        4: 'danger'
      },
      searchStore: function() {
      return this.checkRole(['store'], this.formSearch.role_id)
    },
      tableHeader: [
        { prop: 'id', label: 'ID', width: 70, sortable: true },
        { prop: 'admin', label: '提现代理商信息',isCustomize: true },
        { prop: 'name', label: '真实姓名', },
        { prop: 'phone', label: '联系方式', isCustomize: true },
        { prop: 'amount', label: '提现金额', isCustomize: true },
        { prop: 'status', label: '提现状态', isCustomize: true },
        { prop: 'created_at', label: '创建时间',  isCustomize: true, },
        { prop: 'cash_money', label: '到账金额',  },
        { prop: 'operation', label: '操作', width: 210, isCustomize: true }

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
   
    //   typeOptions: {
    //     1: '微信充值'
    //   },
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
  computed: {
    ...mapState({
      roles: (state)=>state.user.roles,
    })
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
        if (pagination) this.pagination = { ...pagination }
      else this.initPagination()
      var searchObj = {
        ...this.pagination,
        ...this.formSearch,
        ...this.otherSearch
      }
      delete searchObj.total
      this.apiBtn('CashIndex', this.removeProperty({ ...searchObj })).then((res) => {
        this.tableData = res.data.list
        this.pagination.total = res.data.total
      })
    },
     //详情
     toDetail(row){
        this.toRedirect('CashStore',{id: row.id})
    },
       // 通过驳回方法
       handlePass(statusOptions,row) {
      this.defalultConfirm(this.statusType[statusOptions] + '该用户的提现申请', () => {
        this.apiBtn('CashAudit', { id: row.id, status: statusOptions })
          .then((res) => {
            this.$message.success('操作成功')
            this.getList()
      }).catch(action => {
        this.getList()
        })
    })
    },
    //拒绝审核
    handlePasss(statusOptions,row){
        // console.log(statusOptions,row.id,'statusOptions')   
        this.$prompt('请输入驳回原因', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^[0-9a-zA-Z\u4E00-\u9FA5_]{1,40}$/,
        inputErrorMessage: '最长40个字符'
      }).then(({ value }) => {
        // console.log(value,'value')
        this.apiBtn('CashAudit', { id: row.id, status: statusOptions, refuse_cause: value }).then((res) => {
            this.$message.success(res.data)
            this.getList()
        })
      }).catch(action => {
        this.getList()
        })
    },
    // 审核
    // toAudit(row){
    //     console.log(row,'row')
    //     this.$confirm('是否通过此用户审核?', '提示', {
    //       // distinguishCancelAndClose: true,
    //       confirmButtonText: '通过',
    //       cancelButtonText: '驳回',
    //       type: 'warning'
    //     }).then(() => {
    //       this.apiBtn('CashAudit', { id: row.id, status:3 }).then(res => {
    //         this.$message.success('操作成功')
    //         this.getList()
    //       })
    //     }).catch(action => {
    //         this.$prompt('请输入驳回原因', '提示', {
    //         confirmButtonText: '确定',
    //         cancelButtonText: '取消',
    //         inputPattern: /^[0-9a-zA-Z\u4E00-\u9FA5_]{1,40}$/,
    //         inputErrorMessage: '最长40个字符'
    //          })
    //     })
    // },
    changeTime(val) {
      this.formSearch.time = val
    },
    initPagination() {
      this.pagination = {
        page: 1,
        size: 10,
        total: 0
      }
    },
  
   // 充值
   recharge (row) {
      this.currentId = row.id
      this.rechargeShow = true
    },


  }
}

</script>
<style lang="scss" scoped>
.admin{
    text-align: center;
    .span{
       text-align: left;
    }


}
</style>