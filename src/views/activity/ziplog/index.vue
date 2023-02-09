<template>
  <div class="app-container">
    <ComplexTable :table-header="tableHeader" :table-data="tableData" :hasSearch="false" :pagination="pagination" :page-name="'压缩素材日志'" @refreshTable="getList">
      <!-- 核销 -->
      <template v-slot:status="props">
        <span v-if="props.scope.row.status ===1">成功</span>
        <span v-else>失败</span>
      </template>
      <template v-slot:action="props">
        <el-button type="primary" size="mini" icon="el-icon-bottom" plain @click="downzip(props.scope.row)">下载压缩素材</el-button>
      </template>
    </ComplexTable>
  </div>
</template>

<script>
import ComplexTable from '@/components/Table/ComplexTable'

export default {
  components: { ComplexTable },
  data() {
    return {
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
    }
  },
  created() {
    this.getList()
  },
  methods: {
    search() {
      this.getList()
    },
    // 获取投诉列表
    getList(pagination) {
      if (pagination) this.pagination = { ...pagination }
      else this.initPagination()
      this.apiBtn('ActivityZipIndex').then(res => {
        this.tableData = res.data
        this.pagination.total = res.meta.total
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
