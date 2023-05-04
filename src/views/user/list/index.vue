<template>
  <div class="app-container">
    <complex-table
      :page-name="'报名列表'"
      :table-header="tableHeader"
      :table-data="tagList"
      :pagination="pagination"
      :hasSelection="false"
      :hasSearch="roles<5"
      @changeMultipleSelection="changeSelection"
      @refreshTable="getList"
    >
      <template v-slot:search>
        <div class="content">
          <div class="box box1" @click="star(1)">
            <div class="title">达人待审核</div>
            <div class="num">{{userCount.sCount}}</div>
          </div>
          <div class="box box2" @click="star(2)">
            <div class="title">摄影师待审核</div>
            <div class="num">{{userCount.pCount}}</div>
          </div>
        </div>
      </template>
      <template v-slot:btn>
        <div class="select-box">
          <el-radio-group v-model="tabPosition" size="small" @change="changeType">
            <el-radio-button :label="0">达人</el-radio-button>
            <el-radio-button :label="1">摄影师</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      <!-- 用户信息 -->
      <template v-slot:mini_phone="slotProps">
        <div class="userInfo">
          <!-- <el-tag :type="slotProps.scope.row.is_star? '' : 'success'" effect="dark" size="mini" class="user-tag">{{ slotProps.scope.row.is_star? '达人': '摄影师' }}</el-tag> -->
        <img :src="slotProps.scope.row.mini_avatar" class="avatar" />
        {{ slotProps.scope.row.mini_phone }}(昵称:{{slotProps.scope.row.mini_nickname}})
        </div>

      </template>

      <!-- 达人等级-->
      <template v-slot:star_level="slotProps">
        {{ slotProps.scope.row.star_level? slotProps.scope.row.star_level: '暂无'}}
      </template>

       <!-- 达人等级截图-->
      <template v-slot:level_img="slotProps">
        <el-image
          v-if="slotProps.scope.row.level_img!==null"
          fit="fill"
          style="width: 100px; height: 100px"
          :src="slotProps.scope.row.level_img.full_path"
          :preview-src-list="[slotProps.scope.row.level_img.full_path]">
        </el-image>
        <span v-else>暂无图片</span>
        <!-- {{ slotProps.scope.row.star_level? slotProps.scope.row.star_level: '暂无'}} -->
      </template>

      <!-- 粉丝数量-->
      <template v-slot:fans_num="slotProps">
        {{ slotProps.scope.row.fans_num }}
      </template>

      <!-- 获赞数量-->
      <template v-slot:favour_num="slotProps">
        {{ slotProps.scope.row.favour_num }}
      </template>

      <!-- 摄影师工作年限-->
      <template v-slot:working_hours="slotProps">
        {{ slotProps.scope.row.working_hours }}
      </template>

      <!-- 摄影师擅长领域-->
      <template v-slot:good_at="slotProps">
        <span >{{JSON.parse(slotProps.scope.row.good_at).join('、')}}</span>
      </template>

      <!-- 摄影师工作设备-->
      <template v-slot:equipment="slotProps">
        {{ slotProps.scope.row.equipment }}
      </template>

      <!-- 状态 -->
      <template v-slot:status="slotProps">
        {{ keyText(slotProps.scope.row.status) }}
      </template>

      <!-- 抖音授权状态 -->
      <template v-slot:is_authorization_expires="slotProps">
        {{ slotProps.scope.row.is_authorization_expires && slotProps.scope.row.is_wait===0? '通过': '未通过' }}
      </template>

      <!-- 操作 -->
      <template v-slot:action="slotProps">
        <div class="btns">
            <!-- v-if="(oem_info.star_is_auth&&slotProps.scope.row.is_star===0 &&!tabPosition) || (tabPosition&&oem_info.photo_is_auth&&slotProps.scope.row.is_photo_man===0)" -->
        <el-button
          v-has="'UserAudit'"
          v-if="(slotProps.scope.row.is_star===0 &&!tabPosition) || (tabPosition&&slotProps.scope.row.is_photo_man===0)"
          type="warning"
          size="mini"
          @click="auditActivity('UserAudit',slotProps.scope.row)"
        >审核</el-button>
        </div>

      </template>
    </complex-table>
  </div>
</template>

<script>
import ComplexTable from '@/components/Table/ComplexTable'
import { mapState } from "vuex";
export default {
  components: { ComplexTable},
  data() {
    return {
      tabPosition: 0,
      dialogVisible: false,
      urlAuditShow: false,
      tableHeader: [],
      formSearch: {
        star: 1
      },
      pagination: {
        page: 1, // 当前页数
        size: 10 // 每页显示条目个数
      },
      // tagTypeList: [{ id: 1, name: '云剪' }, { id: 2, name: '实探' }, { id: 3, name: '置换' },{id: 4,name: '摄影师'}],
      tagList: [],
      listLoading: true,
      isShow: false,
      info: {},
      currentId: null,
      userCount: {}, // 待审核数量
      oem_info: {} // oem配置信息
    }
  },
  created () {
    this.getList()
    if(this.roles<5){
      this.getUserCount()
    //   this.apiBtn('OemConfigShow', { id: this.userId }).then(res => {
    //     console.log(res,'res')
    //   this.oem_info = res.data
    //   console.log(res.data,'res.data')
    // })
    }

  },
  computed: {
     ...mapState({
        userId: state => state.user.userId,
        roles: state => state.user.roles[0]
      })
  },
  watch: {
    'tabPosition': {
      immediate: true,
      handler(newV) {
      if (newV === 0) {
        this.tableHeader = [
          {prop: 'id',label: 'ID',sortable: true, width: 80},
          {prop: 'mini_phone', label: '用户信息', width: 300, isCustomize: true },
          {prop: 'star_level', label: '达人等级', isCustomize: true },
          {prop: 'level_img',label: '达人等级截图',isCustomize: true},
          {prop: 'fans_num',label: '粉丝数量',isCustomize: true},
          {prop: 'favour_num',label: '获赞数量',isCustomize: true},
          {prop: 'status',label: '状态',width: 150,isCustomize: true},
          {prop: 'is_authorization_expires',label: '抖音授权',width: 150,isCustomize: true}
        ]
      } else {
        this.tableHeader = [
          {prop: 'id',label: 'ID',sortable: true, width: 80},
          {prop: 'mini_phone', label: '用户信息', width: 300, isCustomize: true },
          {prop: 'working_hours',label: '摄影师工作年限',isCustomize: true},
          {prop: 'good_at',label: '摄影师擅长领域',isCustomize: true},
          {prop: 'equipment',label: '摄影师工作设备',isCustomize: true},
          {prop: 'status',label: '状态',width: 150,isCustomize: true}
        ]
      }
    //   if(this.roles<4) this.tableHeader.push({prop: 'action',label: '操作',width: 250,isCustomize: true})
    if( [1, 2, 4].includes(this.roles)) this.tableHeader.push({prop: 'action',label: '操作',width: 250,isCustomize: true})
   
    }
    }
  },
  methods: {
    // 切换列表类型
    changeType (e) {
      this.tabPosition = e
      this.pagination.page = 1
      if (e === 0) {
        this.formSearch = {
          star: 1
        }
      } else {
        this.formSearch = {
          photo: 1
        }
      }
      this.getList()
    },
    star (type) {
      if (type === 1) {
        this.tabPosition = 0
        this.formSearch = {
          star: 0,
          submit: 1
        }
      } else {
        this.tabPosition = 1
        this.formSearch = {
          photo: 0,
          psubmit: 1
        }
      }
      this.getList()
    },

    // 用户列表
    getList() {
      const params = {
        ...this.pagination, ...this.formSearch
      }
      // 页面table加载
      this.listLoading = true
      this.apiBtn('UserIndex', params)
        .then(res => {
          this.tagList = res.data
          this.pagination.total = res.meta.total
          this.listLoading = false
        })
    },

    // 达人/摄影师 待审核数量统计
    getUserCount () {
      this.apiBtn('UserCount').then(res => {
        console.log(res,'res')
        this.userCount = res.data
      })
    },
    // 多选
    changeSelection (e) {
      console.log('e', e)
    },
    auditActivity (apiName,row) {
      this.$confirm('是否通过此用户审核?', '提示', {
          // distinguishCancelAndClose: true,
          confirmButtonText: '通过',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.apiBtn(apiName, { id: row.id, is_star: this.tabPosition===0? 1: '0' }).then(res => {
            this.$message.success('操作成功')
            this.getList()
            this.getUserCount()
          })
        }).catch(action => {

        })
    },
    keyText (status) {
      let str = ''
      switch (status) {
        case 1:
          str="正常"
          break;
        case 2:
          str="冻结"
          break;
      }
      return str
    }
  }
}
</script>

<style lang="scss" scoped>
.tag{
  position: absolute;
  top: -1px;
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

.userInfo{
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  // position: relative;
  .user-tag{
   position: absolute;
    top: -2px;
    left: 0;
  }
}
.avatar{
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 5px;
}

.content{
  display: flex;
  .box{
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    padding: 15px 40px;
    border: 1px solid #cdcdcd;
    border-radius: 8px;
    margin-right: 20px;
    cursor: pointer;
    .num{
      font-size: 50px;
      font-weight: bold;
      padding-top: 10px;
      color: #cdcdcd;
    }
  }
  .box1{
    border-color: #409eff;
    .num{
    color: #409eff;
    }
  }

  .box2{
    border-color: #67c23a;
    .num{
color: #67c23a;
    }

  }
}
</style>
