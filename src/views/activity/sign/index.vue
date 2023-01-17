<template>
  <div class="app-container">
    <complex-table
      :page-name="'报名列表'"
      :table-header="tableHeader"
      :table-data="tagList"
      :pagination="pagination"
      :hasSelection="true"
      @changeMultipleSelection="changeSelection"
      @refreshTable="search"
    >
      <template v-slot:search>
        <!-- <el-select v-model="formSearch.type" placeholder="请选择活动类型" clearable @change="search">
          <el-option v-for="item in tagTypeList" :key="item.id+item.name" :label="item.name" :value="item.id" />
        </el-select> -->
        <template v-if="act_type!==4">
          <el-button type="primary" size="mini" @click="search" v-if="act_type!==1">达人报名待审核</el-button>
          <el-button type="primary" size="mini" @click="search">达人提交链接待审核</el-button>
        </template>
        <template v-else>
          <el-button type="primary" size="mini" @click="search">摄影师报名待审核</el-button>
          <el-button type="primary" size="mini" @click="search">摄影师上传素材待审核</el-button>
        </template>

      </template>
      <template v-slot:btn>
        <el-button v-has="'ActivityStore'" type="primary" size="medium" @click="toRedirect('ActivityStore')">添加活动</el-button>
      </template>
      <!-- 手机号 -->
      <template v-slot:mini_phone="slotProps">
        {{ slotProps.scope.row.user.mini_phone }}
      </template>

      <!-- 达人等级-->
      <template v-slot:star_level="slotProps">
        {{ slotProps.scope.row.user.star_level? slotProps.scope.row.user.star_level: '暂无'}}
      </template>

      <!-- 粉丝数量-->
      <template v-slot:fans_num="slotProps">
        {{ slotProps.scope.row.user.fans_num }}
      </template>

      <!-- 获赞数量-->
      <template v-slot:favour_num="slotProps">
        {{ slotProps.scope.row.user.favour_num }}
      </template>

      <!-- 摄影师工作年限-->
      <template v-slot:working_hours="slotProps">
        {{ slotProps.scope.row.user.working_hours }}
      </template>

      <!-- 摄影师擅长领域-->
      <template v-slot:good_at="slotProps">
        {{ slotProps.scope.row.user.good_at }}
      </template>

      <!-- 摄影师工作设备-->
      <template v-slot:equipment="slotProps">
        {{ slotProps.scope.row.user.equipment }}
      </template>

      <!-- 状态 -->
      <template v-slot:status="slotProps">
        {{ keyText(slotProps.scope.row.status) }}
      </template>
      <!-- 操作 -->
      <template v-slot:action="slotProps">
        <div class="btns">
          <el-button
          type="primary"
          size="mini"
          @click="toDetail(slotProps.scope.row)"
        >详情</el-button>
        <el-button
          v-has="'ActivityPut'"
          type="primary"
          size="mini"
          @click="editActivity(slotProps.scope.row)"
        >审核</el-button>
        </div>

      </template>
    </complex-table>
    <detail :isDetailShow="dialogVisible" :type="act_type" :info="info" @close="dialogVisible = false"></detail>
  </div>
</template>

<script>
import ComplexTable from '@/components/Table/ComplexTable'
import Detail from './components/detail.vue'
export default {
  components: { ComplexTable, Detail },
  data() {
    return {
      dialogVisible: false,
      formSearch: {
        type: null, // 活动类型 1:云剪 2：实探 3 置换 4 摄影师任务
        status: null, // 任务状态 0等待中 1进行中 2已完成 3已失效 4已取消-针对用户 5审核中 6 已驳回
        is_submit_link: 0, // 链接是否提交
        material_is_submit: 0 // 素材是否提交[摄影师]
      },
      pagination: {
        page: 1, // 当前页数
        size: 10, // 每页显示条目个数
        total: 0
      },
      // tagTypeList: [{ id: 1, name: '云剪' }, { id: 2, name: '实探' }, { id: 3, name: '置换' },{id: 4,name: '摄影师'}],
      tagList: [],
      listLoading: true,
      isShow: false,
      info: {}
    }
  },
  computed: {
    act_type () {
      return Number(this.$route.query.type)
    },
    tableHeader(){
      let arr = [
        {
          prop: 'id',
          label: 'ID',
          sortable: true,
          width: 80
        },
        {
          prop: 'mini_phone',
          label: '用户手机号',
          width: 150,
          isCustomize: true
        },
        {
          prop: 'status',
          label: '状态',
          width: 150,
          isCustomize: true
        },
        {
          prop: 'sign_time',
          label: '报名时间'
        },
        {
          prop: 'action',
          label: '操作',
          width: 250,
          isCustomize: true
        }
      ]
      let new_arr = []
      if (this.act_type === 4) { // 摄影师
        new_arr = [
          {
            prop: 'working_hours',
            label: '摄影师工作年限',
            width: 250,
            isCustomize: true
          },
          {
            prop: 'good_at',
            label: '摄影师擅长领域',
            width: 250,
            isCustomize: true
          },
          {
            prop: 'equipment',
            label: '摄影师工作设备',
            width: 250,
            isCustomize: true
          }
        ]
      } else {
        new_arr = [
          {
            prop: 'star_level',
            label: '达人等级',
            width: 250,
            isCustomize: true
          },
          {
            prop: 'fans_num',
            label: '粉丝数量',
            width: 250,
            isCustomize: true
          },
          {
            prop: 'favour_num',
            label: '获赞数量',
            width: 250,
            isCustomize: true
          }
        ]
      }
      arr.splice(2, 0, ...new_arr)
      return arr
    }
  },
  created () {
    this.formSearch.id = this.$route.query.id
    this.formSearch.type = this.$route.query.type
    this.getList(this.formSearch)
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
      console.log('this.formSearch', params)
      // 页面table加载
      this.listLoading = true
      this.apiBtn('SignIndex', params)
        .then(res => {
          this.tagList = res.data
          this.pagination.total = res.meta.total
          this.listLoading = false
        })
    },
    // 多选
    changeSelection (e) {
      console.log('e', e)
    },
    toDetail (row) {
      this.info = row
      this.dialogVisible = true
    },
    editActivity (row) {
      this.toRedirect('ActivityStore',{id: row.id})
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
      }
      return str
    }
    // deleteRole(row) {
    //   this.$confirm('此操作将删除该数据, 是否继续?', '提示', {
    //     confirmButtonText: '确定',
    //     cancelButtonText: '取消',
    //     type: 'error'
    //   }).then(() => {
    //     this.apiBtn('TagDestory', { id: row.id }).then(res => {
    //       this.$message.success('删除成功!')
    //     })
    //   }).catch(() => {

    //   })
    // }
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
