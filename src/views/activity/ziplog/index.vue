<template>
  <div class="app-container">
    <ComplexTable :table-header="tableHeader" :table-data="tableData" :pagination="pagination" :page-name="'压缩素材日志'" @refreshTable="getList">
      <!-- 搜索 -->
      <!-- <template v-slot:search>
        <el-input v-model="otherSearch.activities_id" placeholder="请输入活动ID" clearable @keyup.native.enter="search" @clear="getList" />
        <el-input v-model="otherSearch.users_id" placeholder="请输入用户ID" clearable @keyup.native.enter="search" @clear="getList" />
        <el-select v-model="formSearch.used" placeholder="请选择核销状态" clearable>
          <el-option v-for="(title, value) in usedOption" :key="value" :label="title" :value="value" />
        </el-select>
        <el-input v-model="otherSearch.checked_admin_users_id" placeholder="请输入核销人ID" clearable @keyup.native.enter="search" @clear="getList" />
        <el-button icon="el-icon-search" type="primary" @click="search">搜索</el-button>
      </template> -->

      <!-- 按钮 -->
      <!-- <template slot="btn">
        <div>
          <el-button v-has="'ExportUserCard'" size="medium" @click="exportCard">导出</el-button>
          <el-button v-has="'CardChecked'" type="primary" size="medium" @click="isCheckShow = true">核销</el-button>
        </div>
      </template> -->

      <!-- 核销 -->
      <template v-slot:status="props">
        <span v-if="props.scope.row.status ===1">成功</span>
        <span v-else>失败</span>
      </template>
      <template v-slot:action="props">
        <el-button type="primary" size="mini" icon="el-icon-bottom" plain @click="downzip(props.scope.row)">下载压缩素材</el-button>
      </template>
    </ComplexTable>
    <card-check-dialog :is-visible="isCheckShow" @close="isCheckShow = false" @refresh="getList" />
  </div>
</template>

<script>
import ComplexTable from '@/components/Table/ComplexTable'
import CardCheckDialog from '@/components/Dialog/CardCheckDialog.vue'

export default {
  components: { ComplexTable, CardCheckDialog },
  data() {
    return {
      isInit: true, // 防止初始化搜索数据重复请求
      formSearch: {
        used: ''
      },
      otherSearch: {
        activities_id: '',
        users_id: '',
        checked_admin_users_id: ''
      },
      tableData: [],
      pagination: {
        total: 0, // 总条数
        size: 10, // 每页显示条目个数
        page: 1 // 当前页数
      },
      tableHeader: [
        { prop: 'id', label: 'ID' },
        { prop: 'activity_id', label: '活动ID' },
        { prop: 'job_id', label: '任务ID' },
        { prop: 'name', label: '名称' },
        // { prop: 'path', label: '路径' },
        { prop: 'status', label: '状态', isCustomize: true },
        { prop: 'action', label: '操作', width: 180, isCustomize: true }
      ],
      usedOption: {
        0: '未核销',
        1: '已核销'
      },
      isCheckShow: false
    }
  },
  watch: {
    formSearch: {
      deep: true,
      handler(newVal) {
        if (this.isInit) return
        this.getList()
        this.$store.commit('search/SearchUpdate', { name: 'cardlog', key: 'formSearch', value: newVal })
      }
    },
    otherSearch: {
      deep: true,
      handler(newVal, oldVal) {
        this.$store.commit('search/SearchUpdate', { name: 'cardlog', key: 'otherSearch', value: newVal })
      }
    },
    pagination: {
      deep: true,
      handler(newVal, oldVal) {
        this.$store.commit('search/SearchUpdate', { name: 'cardlog', key: 'pagination', value: newVal })
      }
    }
  },
  created() {
    this.initSearch()
  },
  methods: {
    // 初始化搜索
    initSearch() {
      this.formSearch = { ...this.$store.state.search.cardlog.formSearch }
      this.otherSearch = { ...this.$store.state.search.cardlog.otherSearch, activities_id: this.$route.query.id || '' }
      this.getList(this.$store.state.search.cardlog.pagination)
    },
    search() {
      this.getList()
    },
    // 获取投诉列表
    getList(pagination) {
      if (pagination) this.pagination = { ...pagination }
      else this.initPagination()
      this.apiBtn('ActivityZipIndex', this.removeProperty({ ...this.formSearch, ...this.otherSearch, size: this.pagination.size, page: this.pagination.page })).then(res => {
        this.tableData = res.data
        this.pagination.total = res.meta.total
        if (this.isInit) this.isInit = false
      })
    },
    initPagination() {
      this.pagination = {
        page: 1,
        size: 10,
        total: 0
      }
    },
    downzip(row) {
      window.open(row.path)
    }

  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
.user {
  color: #00aaed;
  cursor: pointer;
}
</style>
