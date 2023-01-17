<template>
  <div class="app-container">
    <complex-table
      :page-name="'活动管理'"
      :table-header="tableHeader"
      :table-data="tagList"
      :pagination="pagination"
      @refreshTable="getList"
    >
      <template v-slot:search>
        <el-select v-model="formSearch.type" placeholder="请选择活动类型" clearable @change="search">
          <el-option v-for="item in tagTypeList" :key="item.id+item.name" :label="item.name" :value="item.id" />
        </el-select>
        <el-button type="primary" icon="el-icon-search" @click="search">搜索</el-button>
      </template>
      <template v-slot:btn>
        <el-button v-has="'ActivityStore'" type="primary" size="medium" @click="toRedirect('ActivityStore')">添加活动</el-button>
      </template>
      <!-- 类型 -->
      <template v-slot:title="slotProps">
        {{ slotProps.scope.row.title }}
        <div class="tag">
          <el-tag v-if="slotProps.scope.row.type===1" size="mini" effect="dark">云剪</el-tag>
          <el-tag v-else-if="slotProps.scope.row.type===2" size="mini" type="success" effect="dark">实探</el-tag>
          <el-tag v-else-if="slotProps.scope.row.type===3" size="mini" type="warning" effect="dark">置换</el-tag>
          <el-tag v-else size="mini" type="danger" effect="dark">摄影师</el-tag>
        </div>

      </template>

      <!-- 参与人数限制 -->
      <template v-slot:join_num="slotProps">
        {{ slotProps.scope.row.join_num }}
      </template>

      <!-- 时间 -->
      <template v-slot:time="slotProps">
        {{ slotProps.scope.row.start_time + ' ~ ' + slotProps.scope.row.end_time }}
      </template>
      <!-- 操作 -->
      <template v-slot:action="slotProps">
        <div class="btns">
          <el-button
          v-has="'TypeIndex'"
          type="primary"
          size="mini"
          v-if="slotProps.scope.row.type===1"
          @click="toRedirect('TypeIndex',{id:slotProps.scope.row.id})"
        >素材列表</el-button>
        <el-button
          v-has="'SignIndex'"
          type="warning"
          size="mini"
          @click="toRedirect('SignIndex',{id:slotProps.scope.row.id,type:slotProps.scope.row.type})"
        >报名列表</el-button>
        <el-button
          v-has="'ActivityPut'"
          type="primary"
          size="mini"
          @click="editActivity(slotProps.scope.row)"
        >编辑</el-button>
        <el-button
          v-has="'ActivityDestory'"
          type="danger"
          size="mini"
          @click="deleteActivity(slotProps.scope.row)"
        >删除</el-button>
        </div>

      </template>
    </complex-table>
    <tag-dialog :is-visible="isShow" :type-list="tagTypeList" :tag-form="tagForm" @close="isShow=false" @change="search" />
  </div>
</template>

<script>
import ComplexTable from '@/components/Table/ComplexTable'
import TagDialog from '@/components/Dialog/TagDialog.vue'
export default {
  components: { ComplexTable, TagDialog },
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
        name: '',
        type: 1
      },
      tagTypeList: [{ id: 1, name: '云剪' }, { id: 2, name: '实探' }, { id: 3, name: '置换' },{id: 4,name: '摄影师'}],
      tableHeader: [
        {
          prop: 'id',
          label: 'ID',
          sortable: true,
          width: 80
        },
        {
          prop: 'title',
          label: '活动名称',
          isCustomize: true
        },
        // {
        //   prop: 'type',
        //   label: '类型',
        //   width: 250,
        //   isCustomize: true
        // },
        {
          prop: 'join_num',
          label: '参与人数',
          width: 200
        },
        {
          prop: 'shop_name',
          label: '商家名称'
        },
        {
          prop: 'time',
          label: '活动时间',
          width: 300,
          isCustomize: true
        },
        {
          prop: 'action',
          label: '操作',
          width: 250,
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
      this.apiBtn('ActivityIndex', params)
        .then(res => {
          this.tagList = res.data
          this.pagination.total = res.meta.total
          this.listLoading = false
        })
    },
    addTag() {
      this.isShow = true
    },
    editActivity (row) {
      this.toRedirect('ActivityStore',{id: row.id})
    },
    deleteRole(row) {
      this.$confirm('此操作将删除该数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }).then(() => {
        this.apiBtn('TagDestory', { id: row.id }).then(res => {
          this.$message.success('删除成功!')
        })
      }).catch(() => {

      })
    }
  }
}
</script>

<style lang="scss" scoped>
.tag{
  position: absolute;
  top: -2px;
  left: 0;
  ::v-deep .el-tag{
    border-radius: 0;
  }
}
.btns{
  ::v-deep .el-button{
    margin-bottom: 5px;
  }
}

</style>
