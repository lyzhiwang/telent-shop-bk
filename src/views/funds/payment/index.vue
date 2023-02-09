<template>
  <div class="app-container">
    <complex-table
      :page-name="'充值记录'"
      :table-header="tableHeader"
      :table-data="tableData"
      :pagination="pagination"
      @refreshTable="getList"
    >
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
          @changeTime="changeTime"
        />
        <el-input
          v-model="otherSearch.keywords"
          placeholder="ID|用户名|备注"
          clearable
          class="search-item"
          @keyup.native.enter="search"
          @clear="search"
        />
        <el-button type="primary" icon="el-icon-search" class="search-item" @click="search">搜索</el-button>
      </template>
      <!-- 按钮 -->
      <template v-slot:btn>
        <div>
          <el-button v-has="'PaymentExport'" size="medium" icon="el-icon-download" @click="exportToExcel()">导出</el-button>
          <el-button v-has="'PaymentOrder'" type="primary" size="medium" @click="toRedirect('PaymentStore')">发起充值</el-button>
        </div>
      </template>

      <template v-slot:add_time="slotProps">{{ slotProps.scope.row.add_time|parseTime() }}</template>
      <template v-slot:pay_time="slotProps">
        <span v-if="slotProps.scope.row.pay_time">{{ slotProps.scope.row.pay_time|parseTime() }}</span>
        <span v-else>未支付</span>
      </template>
      <!-- 充值状态 -->
      <template v-slot:status="slotProps">
        <span :class="'point point-'+statusColorOptions[slotProps.scope.row.status]" />
        {{ statusOptions[slotProps.scope.row.status] }}
      </template>
      <!-- 操作 -->
      <template v-slot:action="slotProps">
        <el-button v-show="slotProps.scope.row.status===2" v-has="'PaymentEnd'" size="small" @click="patch(slotProps.scope.row)">关闭订单</el-button>
      </template>
    </complex-table>
  </div>
</template>

<script>
import ComplexTable from '@/components/Table/ComplexTable'
import DatePicker from '@/components/Tool/DatePicker'

export default {
  name: 'LogPic',
  components: { ComplexTable, DatePicker },
  data() {
    return {
      formSearch: {
        time: [],
        status: ''
      },
      otherSearch: {
        keywords: ''
      },
      tableHeader: [
        { label: '订单号', prop: 'out_trade_no', width: 160 },
        { label: '订单金额', prop: 'money' },
        { label: '到账金额', prop: 'Recharge_money' },
        { label: '充值时间', prop: 'add_time', isCustomize: true, sortable: true, width: 160 },
        { label: '状态', prop: 'status', isCustomize: true },
        { label: '支付时间', prop: 'pay_time', isCustomize: true, sortable: true, width: 160 },
        { label: '用户', prop: 'name' },
        { label: '操作', prop: 'action', isCustomize: true }
      ],
      pagination: {
        // 当前是第几页
        page: 1,
        // 一页几条
        size: 10,
        // 一共多少页
        total: 100
      },
      tableData: [
        {
          out_trade_no: 0,
          money: 0,
          Recharge_money: 0,
          add_time: 123,
          status: 1,
          pay_time: 123,
          name: '123'
        }
      ],
      statusOptions: {
        // 0: '全部状态',
        1: '支付成功',
        2: '未支付',
        3: '订单关闭',
        4: '支付失败'
      },
      statusColorOptions: {
        1: 'success',
        2: 'warning',
        3: 'default',
        4: 'danger'
      },
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
      if (pagination) this.pagination = { ...pagination }
      else this.initPagination()
      var searchObj = {
        ...this.pagination,
        ...this.formSearch,
        ...this.otherSearch
      }
      delete searchObj.total
      this.apiBtn('PaymentIndex', this.removeProperty({ ...searchObj })).then((res) => {
        this.tableData = res.data.list
        this.pagination.total = res.data.total
      })
    },
    patch(row) {
      this.defalultConfirm(`将要关闭订单${row.out_trade_no},是否继续？`, () => {
        // status 1成功 0关闭
        this.apiBtn('PaymentEnd', { out_trade_no: row.out_trade_no, status: 0 })
          .then((res) => {
            row.status = res.data.status
          }).catch((res) => {
            if (res && res.data.status) row.status = res.data.status
          })
      })
    },
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
    // 导出Excel
    exportToExcel() {
      if (this.pagination.total === 0) {
        this.$message('暂无数据，无法导出')
        return
      }
      const params = {
        ...this.formSearch,
        ...this.otherSearch
      }
      this.apiBtn('PaymentExport', params)
        .then(res => {
          // excel数据导出
          require.ensure([], () => {
            const {
              export_json_to_excel
            } = require('@/excel/Export2Excel')

            const tHeader = ['订单', '充值时间', '支付时间', '用户', '订单金额', '到账金额', '状态']
            const filterVal = ['out_trade_no', 'add_time', 'pay_time', 'name', 'money', 'Recharge_money', 'status']
            const list = res.data.list
            const data = this.formatJson(filterVal, list)
            export_json_to_excel(tHeader, data, '充值列表' + this.parseTime(new Date(), '{y}-{m}-{d}'))
          })
        })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => v[j]))
    }
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
