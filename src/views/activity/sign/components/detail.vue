<template>
  <el-drawer
    :title="Number(type)===4? '摄影师信息': '达人信息'"
    :visible.sync="isDetailShow"
    direction="rtl"
    :close="close"
    :before-close="close"
    >
    <div class="drawer__content">
      <el-form ref="form" :model="mediaForm" label-position="right" label-width="78px" v-if="Object.keys(info).length>0">
        <el-form-item label="ID:">{{info.id}}</el-form-item>
        <el-form-item label="手机号:">{{info.user.mini_phone}}</el-form-item>
        <template v-if="Number(type)!==4">
          <el-form-item label="达人等级:">{{info.user.star_level? info.user.star_level: '暂无'}}</el-form-item>
          <el-form-item label="粉丝数量:">{{info.user.fans_num}}</el-form-item>
          <el-form-item label="获赞数量:">{{info.user.favour_num}}</el-form-item>
        </template>
        <template v-else>
          <el-form-item label="摄影师工作年限:">{{info.user.working_hours? info.user.working_hours: '暂无'}}</el-form-item>
          <el-form-item label="摄影师擅长领域:">{{info.user.good_at}}</el-form-item>
          <el-form-item label="摄影师工作设备:">{{info.user.equipment}}</el-form-item>
        </template>
        <el-form-item label="报名时间:">{{info.sign_time}}</el-form-item>
        <el-form-item label="链接:" v-if="info.status===5 && info.task_url.length>0">
          {{info.task_url[0].url}} <el-button type="text" v-clipboard:copy="info.task_url[0].url" v-clipboard:success="onCopy" v-clipboard:error="onError">点击复制</el-button>
        </el-form-item>
      </el-form>
      <div class="drawer__footer">
        <template v-if="info.status===0 && act_type!==1">
          <el-button type="primary" @click="auditActivity('ActivitySignAudit',info,1)">通过</el-button>
          <el-button @click="auditActivity('ActivitySignAudit',info,0)">拒绝</el-button>
        </template>
        <template v-if="info.status===5 && info.is_submit_link===1 && info.task_url[0].is_failure===0">
          <el-button type="primary" @click="$emit('audit')">审核</el-button>
          <el-button @click="close">取消</el-button>
        </template>
      </div>
    </div>
  </el-drawer>
</template>

<script>
export default {
  props: {
    isDetailShow: {
      type: Boolean,
      default: false
    },
    info: {
      type: Object,
      default(){}
    },
    type: {
      type: [Number, String]
    }
  },
  data () {
    return {
      fileList: [], // 上传列表
      mediaForm: {
        activity_id: '',
        medias: []
      },
    }
  },
  mounted () {
  },
  computed: {
    act_type(){
      return this.$route.query.type
    }
  },
  methods: {
    auditActivity (apiName,row,type) {
      this.apiBtn(apiName, { id: row.id, is_audit: type }).then(res => {
        this.$message.success('操作成功')
        this.close()
        this.$emit('updata')
      })
    },
    close () {
      this.$emit('close')
    },
    // 复制活动链接
    onCopy(e) {
      this.$message({
        type: 'success',
        message: '链接复制成功'
      })
    },

    onError(e) {
      this.$message({
        type: 'error',
        message: '该浏览器不支持自动复制'
      })
    }
    }
  }
</script>

<style lang="scss" scoped>
.drawer__content {
  width: 100%;
  height: calc(100vh - 45px);
  padding: 0 20px 80px;
  overflow-y: auto;
  .drawer__footer {
    position: fixed;
    right: 20px;
    bottom: 20px;
    text-align: right;
  }
}
</style>
