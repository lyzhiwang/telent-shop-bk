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
      <!-- id -->
      <template v-slot:id="slotProps">
        {{ slotProps.scope.row.activity.id }}
      </template>
      <!-- 类型 -->
      <template v-slot:title="slotProps">
        {{ slotProps.scope.row.activity.title }}
      </template>


      <!-- 商家反选-->
      <template v-slot:shop_is_adopt="slotProps">
        {{ slotProps.scope.row.shop_is_adopt===1?'通过': '拒绝' }}
      </template>

      <!-- 是否打卡 -->
      <template v-slot:is_punch_clock="slotProps">
        {{ slotProps.scope.row.is_punch_clock===1?'已打卡': '未打卡' }}
      </template>

      <!-- 任务佣金 -->
      <template v-slot:photo_man_money="slotProps">
        {{ slotProps.scope.row.activity.photo_man_money}}
      </template>

      <!-- 时间 -->
      <template v-slot:time="slotProps">
        {{ slotProps.scope.row.created_at + ' ~ ' + slotProps.scope.row.end_time }}
      </template>

      <!-- 活动暂停功能 -->
      <template v-slot:status="slotProps">
        {{keyText(slotProps.scope.row.status)}}
      </template>
      <!-- 操作 -->
      <template v-slot:action="slotProps">
        <div class="btns">
          <el-button
          v-has="'PhotomanUpdate'"
          type="primary"
          size="mini"
          v-if="slotProps.scope.row.shop_is_adopt && !slotProps.scope.row.is_punch_clock && !slotProps.scope.row.material_is_submit"
          @click="toRedirect('PhotomanUpdate',{id:slotProps.scope.row.activity.id,task_id: slotProps.scope.row.id})"
        >上传素材</el-button>
        </div>

      </template>
    </complex-table>
    <!-- <tag-dialog :is-visible="isShow" :type-list="tagTypeList" :tag-form="tagForm" @close="isShow=false" @change="search" />
    <recharge-dialog :isVisible="rechargeShow" :id="currentId" @close="rechargeShow=false"></recharge-dialog> -->
  </div>
</template>

<script>
import ComplexTable from '@/components/Table/ComplexTable'

export default {
  components: { ComplexTable },
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
          isCustomize: true,
          sortable: true,
          width: 80
        },
        {
          prop: 'title',
          label: '任务名称',
          isCustomize: true
        },
        {
          prop: 'shop_is_adopt',
          label: '商家反选状态',
          width: 200,
          isCustomize: true
        },
        {
          prop: 'is_punch_clock',
          label: '是否打卡',
          isCustomize: true
        },
        {
          prop: 'photo_man_money',
          label: '任务佣金',
          isCustomize: true
        },
        {
          prop: 'time',
          label: '任务时间',
          width: 300,
          isCustomize: true
        },
        {
          prop: 'status',
          label: '状态',
          width: 150,
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
      currentId: null
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
      this.apiBtn('PhotomanIndex', params)
        .then(res => {
          this.tagList = res.data
          this.pagination.total = res.meta.total
          this.listLoading = false
        })
    },
    keyText (status) {
      let str = ''
      switch (status) {
        case 0:
          str="等待中"
          break;
        case 1:
          str="进行中"
          break;
        case 2:
          str="已完成"
          break;
        case 3:
          str="已失效"
          break;
        case 4:
          str="已取消"
          break;
        case 5:
          str="审核中"
          break;
        case 6:
          str="已驳回"
          break;
        case 7:
          str="报名未通过"
          break;
      }
      return str
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
    },
    // 充值
    recharge (row) {
      this.currentId = row.id
      this.rechargeShow = true
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
