<template>
  <div>
    <el-upload
    :action="upload_url"
    :data="params"
    :headers="headers"
    :multiple="multiple"
    :file-list="fileList"
    :before-upload="beforeUpload"
    :on-success="handleSuccess"
    :on-error="handleError"
    :on-remove="handleRemove"
    :on-preview="handlePreview">
       <el-button type="primary" size="mini" class="el-icon-upload">本地上传</el-button>
       <div slot="tip" class="el-upload__tip">上传视频只能是 mp4 格式,建议上传1080p,且上传大小不能超过 {{ this.sizeLimit }}MB</div>
    </el-upload>
    <!-- 预览 -->
    <preview-dialog :is-visible="dialogVisible" :type="fileType" :src="previewSrc" @close="dialogVisible = false" />
  </div>
</template>

<script>
import PreviewDialog from '../Dialog/PreviewDialog.vue'
import request from '@/utils/request'
import { getToken } from '@/utils/auth'
export default {
  name: 'UploadCompt',
  components: { PreviewDialog },
  props: {
    // 多文件上传
    multiple: {
      type: Boolean,
      default: true
    },
    // 限制上传图片个数，默认为10
    limit: {
      type: Number,
      default: 1
    },
    // 上传列表
    list: {
      type: [Array, Object, String],
      default() {}
    },
    // 上传大小限制 单位为 KB
    sizeLimit: {
      type: Number,
      default: 1024 * 20
    },
    disabled: {
      type: Boolean,
      default: false
    },
    // 返回参数
    rParams: {
      type: Object,
      default() {
        return {}
      }
    },
    // 是否使用个人的
    isSelf: {
      type: Boolean,
      default: false
    },
    // 是否添加水印
    hasWatermark: {
      type: Boolean,
      default: false
    },
    // 是否是拖拽上传
    drag: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      fileList: [],
      fileListId: [],
      dialogVisible: false,
      previewSrc: '',
      uploadId: 'upload' + new Date().getTime()
    }
  },
  computed: {
    params: function() {
      const config = this.$store.state.config
      const token = this.type === 1 ? config.audioToken : config.imgToken
      if (config.auto_open && this.type !== 5) {
        return {
          token: token,
          'x:type': this.type
        }
      } else {
        return {
          token: token,
          type: this.type
        }
      }
    },
     // 上传地址
    upload_url: function() {
      // 海报必须上传服务器，不上传七牛
      // 若上传七牛，在h5页面上渲染canvas时，ios设备会因为图片跨域，不显示海报
      const config = this.$store.state.config
      if (config.auto_open) return this.type === 5 ? config.local_url : config.upload_url
      else return config.local_url
    },
    headers: function() {
      return {
        Authorization: 'Bearer ' + getToken()
      }
    },
    // 文件类型
    fileType() {
      return 'video'
    },
    // 组件使用允许上传的文件类型
    accept() {
      const accept = {
        audio: 'audio/mp3,audio/mpeg',
        video: 'video/mp4',
        img: 'image/png, image/jpeg, image/jpg'
      }
      return accept[this.fileType]
    },
    // 校验使用允许上传的文件类型
    acceptList() {
      const acceptList = {
        audio: ['audio/mp3', 'audio/mpeg'],
        video: ['video/mp4'],
        img: ['image/png', 'image/jpeg', 'image/jpg']
      }
      return acceptList[this.fileType]
    },
    flieSize () {
      return this.sizeLimit*1024
    },
    // 信息提示
    messageType() {
      const messageType = {
        audio: '上传音乐只能是 mp3 或 mpeg 格式',
        video: '上传视频只能是 mp4 格式,建议上传1080p',
        img: '上传图片只能是 JPG 或 PNG 格式'
      }
      return messageType[this.fileType]
    },
    messageSize() {
      const sizeStr = this.sizeLimit < 1024 ? this.sizeLimit + 'KB' : this.sizeLimit / 1024 + 'MB'
      return '上传大小不能超过 ' + sizeStr
    }
  },
  watch: {
  },
  created() {
    if (this.$store.state.config.auto_open && !this.uploadSafe) this.$store.dispatch('config/GetQiniuToken', { file_type: this.fileType })

  },
  mounted() {
  },
  methods: {
    // 上传限制
    beforeUpload (file) {
      // 文件名
      const isLt2M = (file.size / 1048576) < this.sizeLimit
      console.log('isLt2M', isLt2M)
      if (!isLt2M) {
        // const sizeStr = this.sizeLimit < 1024 ? this.sizeLimit + 'KB' : (this.sizeLimit / 1024) + 'MB'
        this.$message.error('文件大小不能超过 ' + this.sizeLimit + 'MB!')
      }
      const isVideo = file.type === 'video/mp4'
      if (!isVideo) {
        const msg ='MP4格式'
        this.$message.error('上传文件只能是' + msg)
      }
      return isVideo && isLt2M
    },
    // 上传成功
    handleSuccess(res, file, list) {
      if (res.code === 0) {
        const obj = {
          id: res.data.id,
          path: res.data.path,
          name: file.name,
          size: file.size,
          add_time: Date.parse(new Date())
        }
        this.$emit('add',obj)
        // this.list.unshift(obj)
      } else {
        this.$message({
          type: 'error',
          message: res.message || '网络错误，请重新尝试'
        })
      }
    },
    // 上传失败
    handleError(err, file, list) {
      err = JSON.parse(JSON.stringify(err))
      if (err.status === 401) {
        const params = {
          type: this.type,
          other: true
        }
        this.$store.dispatch('GetQiniuToken', params)
          .then(res => {
            const formData = new FormData()
            const config = this.$store.state.config
            const token = this.type === 1 ? config.audioToken : config.imgToken
            formData.append('token', token)
            if (config.auto_open) {
              formData.append('x:type', this.type)
            } else {
              formData.append('type', this.type)
            }
            formData.append('file', file.raw, file.name)
            request({
              baseURL: '',
              url: this.upload_url,
              method: 'post',
              data: formData
            })
          })
      } else this.$message.error('文件上传失败')
    },
    // 获取文件后缀
    getSuffix(name) {
      const arr = name.split('.')
      return '.' + arr[arr.length - 1]
    },
    // 获取随机名称
    getRandomName(name) {
      return this.randomString(20) + this.getSuffix(name)
    },
    // 预览已上传点击文件列表中已上传的文件时的钩子
    handlePreview(file) {
      // 图片预览的钩子
      this.dialogVisible = true
      this.previewSrc = file.path || file.response.data.path || file.url
    },
    // 删除文件的钩子
    handleRemove(file, fileList) {
      // this.$emit('remove', file.response ? file.response.data : file, this.rParams)
      this.$emit('remove',file)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
