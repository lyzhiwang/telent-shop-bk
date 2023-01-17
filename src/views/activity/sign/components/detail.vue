<template>
  <el-drawer
    :title="Number(type)===4? '摄影师信息': '达人信息'"
    :visible.sync="isDetailShow"
    direction="rtl"
    :close="close"
    :before-close="close"
    >
    <div class="drawer__content">
      <el-form ref="form" :model="mediaForm" label-position="right" label-width="78px">
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
      </el-form>
      <div class="drawer__footer">
        <el-button type="primary" @click="submit()">通过</el-button>
        <el-button @click="close">返回</el-button>
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
  methods: {
    close () {
      this.$emit('close')
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
