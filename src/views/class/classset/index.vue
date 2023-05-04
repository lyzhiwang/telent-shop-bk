<template>
  <div class="app-container">
    <complex-table
      :page-name="'分类管理'"
      :table-header="tableHeader"
      :table-data="tagList"
      :pagination="pagination"
      :hasSearch="false"
      @refreshTable="getList"
    >
      <!-- <template v-slot:search>
        <el-select v-model="formSearch.type" placeholder="请选择分类类型" clearable @change="search">
          <el-option v-for="item in tagTypeList" :key="item.id+item.name" :label="item.name" :value="item.id" />
        </el-select>
        <el-button type="primary" icon="el-icon-search" @click="search">搜索</el-button>
      </template> -->
      <template v-slot:btn>
        <el-button v-has="'CategStore'" type="primary" size="medium" @click="addTag">添加分类</el-button>
      </template>
      <!-- 类型 -->
      <template v-slot:type="slotProps">
        <el-tag v-if="slotProps.scope.row.type===1" effect="dark">达人</el-tag>
        <el-tag v-else-if="slotProps.scope.row.type===2" type="success" effect="dark">摄影师</el-tag>
        <el-tag v-else type="warning" effect="dark">活动</el-tag>
      </template>
      <!-- 操作 -->
      <template v-slot:action="slotProps">
        <el-button
          v-has="'CategPut'"
          type="primary"
          size="small"
          @click="editCate(slotProps.scope.row)"
        >编辑</el-button>
        <!-- <el-button
          v-has="'TagDestory'"
          type="danger"
          size="small"
          @click="deleteRole(slotProps.scope.row)"
        >删除</el-button> -->
      </template>
    </complex-table>
    <cate-dialog :is-visible="isShow" :tag-form="tagForm" @close="isShow=false" @change="search" />
  </div>
</template>

<script>
import ComplexTable from '@/components/Table/ComplexTable'
import CateDialog from '@/components/Dialog/CateDialog.vue'
export default {
  components: { ComplexTable, CateDialog },
  data() {
    return {
      formSearch: {
        type: null
      },
      pagination: {
        page: 1, // 当前页数
        size: 10, // 每页显示条目个数
        total: 0
      },
      tagForm: {
        name: ''
      },
      tagTypeList: [{ id: 1, name: '达人' }, { id: 2, name: '摄影师' }, { id: 3, name: '活动' }],
      tableHeader: [
        {
          prop: 'id',
          label: 'ID',
          sortable: true,
          width: 80
        },
        {
          prop: 'name',
          label: '分类名称'
        },
        // {
        //   prop: 'type',
        //   label: '类型',
        //   width: 250,
        //   isCustomize: true
        // },
        {
          prop: 'action',
          label: '操作',
          width: 160,
          isCustomize: true
        }
      ],
      tagList: [],
      listLoading: true,
      isShow: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    search() {
      this.pagination.page = 1
      this.getList(this.formSearch)
    },
    // 用户列表
    getList(formSearch) {
      const params = {
        ...this.pagination, ...formSearch
      }
      // 页面table加载
      this.listLoading = true
      this.apiBtn('CategIndex', params)
        .then(res => {
          this.tagList = res.data
          this.pagination.total = res.meta.total
          this.listLoading = false
        })
    },
    addTag() {
      this.tagForm = {
        name: ''
      }
      this.isShow = true
    },
    editCate(row){
      this.tagForm = {...row}
      this.isShow = true
    },
    deleteRole(row) {
      this.$confirm('此操作将删除该数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }).then(() => {
        this.apiBtn('TagDestory', { id: row.id }).then(res => {
          this.$message.success('删除成功!')
          this.getList()
        })
      }).catch(() => {

      })
    }
  }
}
</script>

<style>

</style>
