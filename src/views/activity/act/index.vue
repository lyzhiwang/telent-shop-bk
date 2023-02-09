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

      <!-- 活动暂停功能 -->
      <template v-slot:status="props">
        <el-tooltip :content="props.scope.row.status === 1 ? '当前状态：开启' : '当前状态：暂停'" placement="top">
          <el-switch v-model="props.scope.row.status" :active-value="1" :inactive-value="2" @change="changeSwitch('ActivityPause', props.scope.row)" />
        </el-tooltip>
      </template>
      <!-- 操作 -->
      <template v-slot:action="slotProps">
        <div class="btns">
          <el-button
          v-has="'TypeIndex'"
          type="primary"
          size="mini"
          v-if="slotProps.scope.row.type===1"
          @click="toRedirect('TypeIndex',{id:slotProps.scope.row.id,type:1})"
        >素材列表</el-button>
        <el-button
          v-has="'TypeIndex'"
          type="primary"
          size="mini"
          v-if="slotProps.scope.row.type===4"
          @click="toRedirect('TypeIndex',{id:slotProps.scope.row.id,type:2})"
        >素材分类</el-button>
        <el-button
          v-has="'SignIndex'"
          type="warning"
          size="mini"
          @click="toRedirect('SignIndex',{id:slotProps.scope.row.id,type:slotProps.scope.row.type})"
        >报名列表</el-button>
        <el-button
          v-has="'PrestoredStore'"
          type="danger"
          size="mini"
          @click="recharge(slotProps.scope.row)"
        >充值</el-button>
        <!-- <el-button
          v-has="'ActivityPut'"
          type="primary"
          size="mini"
          @click="editActivity(slotProps.scope.row)"
        >编辑</el-button> -->
        <!-- <el-button
          v-has="'ActivityDestory'"
          type="danger"
          size="mini"
          @click="deleteActivity(slotProps.scope.row)"
        >删除</el-button> -->
        </div>

      </template>
    </complex-table>
    <tag-dialog :is-visible="isShow" :type-list="tagTypeList" :tag-form="tagForm" @close="isShow=false" @change="search" />
    <recharge-dialog :isVisible="rechargeShow" :id="currentId" @close="rechargeShow=false"></recharge-dialog>
  </div>
</template>

<script>
import ComplexTable from '@/components/Table/ComplexTable'
import TagDialog from '@/components/Dialog/TagDialog.vue'
import RechargeDialog from './components/RechargeDialog.vue'

export default {
  components: { ComplexTable, TagDialog, RechargeDialog },
  data() {
    return {
      rechargeShow: false,
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
      isShow: false,
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
    },
    // 充值
    recharge (row) {
      this.currentId = row.id
      this.rechargeShow = true
    },
    // 开始暂停按钮
    showPause(val) {
      return !('24'.indexOf(val) >= 0 && this.$_has('ActivityPause'))
    },
    // 开关控制 码上拓客没有活动暂停
    changeSwitch (name, row) {
      console.log('row.status', row.status)
      const msg = (row.status === 2 ? '将要暂停' : '将要开启') + '活动“' + row.title + '(' + row.id + ')”,是否继续？'
      const params = {
        id: row.id,
        status: row.status
      }
      const catchBack = () => {
        this.$set(row, 'status', row.status = row.status===2?1:2)
      }
      const callBack = () => {
        this.apiBtn(name, params)
          .then(res => {
            this.$set(row, 'status', row.status)
          })
          .catch(res => {
            catchBack()
          })
      }
      this.defalultConfirm(msg, callBack, catchBack)
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
