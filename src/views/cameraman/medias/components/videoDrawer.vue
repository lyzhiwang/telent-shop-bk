<template>
  <el-drawer
    title="视频素材"
    :visible.sync="isDrawer"
    direction="rtl"
    :close="close"
    :before-close="close"
    >
    <div class="drawer__content">
      <el-form ref="form" :rules="rulesForm" :model="mediaForm" label-position="right" label-width="78px">
        <el-form-item label="视频素材" prop="list">
         <video-upload ref="videoUpload" :list="fileList" @add="addVideo" :sizeLimit="50" @remove="removeVideo"></video-upload>
        </el-form-item>
      </el-form>
      <div class="drawer__footer">
        <el-button type="primary" @click="submit()">提交</el-button>
        <el-button @click="close">取消</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script>
import VideoUpload from '@/components/Upload/videoUpload.vue'
export default {
  components: { VideoUpload },
  props: {
    isDrawer: {
      type: Boolean,
      default: false
    },
    typeId: {
      type: [Number, String]
    }
  },
  data () {
    return {
      rulesForm: {},
      fileList: [], // 上传列表
      mediaForm: {
        id: '',
        media: []
      },
    }
  },
  mounted () {
    this.mediaForm.id = this.$route.query.id
  },
  methods: {
    close () {
      this.fileList = []
      this.mediaForm.media = []
      this.$refs.videoUpload.fileList = []
      this.$emit('close')
    },
    addVideo (e) {
      this.fileList.unshift(e)
      this.changeVideo(this.fileList)
    },
    removeVideo (e) {
      let index = this.fileList.findIndex(v => v.id === e.response.data.id)
      console.log('index', index)
      this.fileList.splice(index, 1)
      this.changeVideo(this.fileList)
    },
    changeVideo (arr) {
      this.mediaForm.media = []
      arr.map(v => {
          let obj = { upload_id: v.id, type_id: this.typeId, activity_id: this.$route.query.id }
          this.mediaForm.media.push(obj)
      })
    },
    submit () {
      if (this.mediaForm.media.length > 0) {
        this.apiBtn('PhotomanUpdate', this.mediaForm).then(res => {
          this.$message.success('操作成功!')
          this.$emit('change')
          this.close()
        })
      } else {
        this.$message.error('请上传视频!')
      }
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
