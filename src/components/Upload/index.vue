<template>
  <div>
    <el-upload
      :id="uploadId"
      :on-preview="handlePictureCardPreview"
      :on-remove="handleRemove"
      :on-exceed="handleExceed"
      :on-success="uploadSuccess"
      :on-err="uploadError"
      :before-upload="beforeAvatarUpload"
      :on-change="changeUpload"
      :file-list="imgList"
      :limit="limit"
      :auto-upload="isAuto"
      :action="action"
      :data="data"
      accept="image/png, image/jpeg, image/jpg"
      list-type="picture-card"
    >
      <i class="el-icon-plus" />
    </el-upload>
    <el-dialog :visible.sync="dialogVisible" :fullscreen="$store.state.app.device === 'mobile' ? true : false" class="dialog">
      <img :src="dialogImageUrl" class="yulan" alt>
    </el-dialog>
  </div>
</template>
<script>
import request from '@/utils/request'
import Watermark from '@/utils/watermark.js'

export default {
  name: 'upload',
  props: {
    // 限制上传图片格式，默认为1
    limit: {
      type: Number,
      default: 1
    },
    // 图片列表
    imgUrl: {
      type: Array,
      default: []
    },
    // 图片大小 单位为 KB
    imgSize: {
      type: Number,
      default: 1024
    },
    // 指定上传方式 其他 1七牛云  后台 2
    uploadType: {
      type: Number,
      default: 1
    },
    text: {
      type: String,
      default: '该证件仅用于*****使用,15个字'
    },
    // 图片宽高 单位为像素
    size: {
      type: Number,
      default: 1600
    },
    // 是否添加水印
    hasWatermark: {
      type: Boolean,
      default: false
    },
    // 请求携带参数 type 0:本地,1音乐，2顶部背景，3公众号二维码，4富文本框，5海报，6用户信息，7商品图，8分享图片，9招商二维码
    params: {
      type: Object,
      default() { return {} }
    },
    // 返回参数
    rParams: {
      type: Object,
      default() { return {} }
    }
  },
  data() {
    return {
      dialogImageUrl: '',
      dialogVisible: false,
      uploadId: 'upload' + new Date().getTime(),
      // 展示上传过的图片需要遵循以下格式 name可以不传
      // [{name: 'food.jpeg', url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100'}, {name: 'food2.jpeg', url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100'}]
      imgList: []
    }
  },
  computed: {
    // 是否自动上传 七牛云需要自动上传 后台需要手动上传
    isAuto: function() {
      // 若设定了上传类型为2 上传到服务器，则不自动上传，其他则根据整体设置进行
      if (this.uploadType === 2) return false
      else return !!this.$store.state.config.auto_open
    },
    // 图片上传传参 r若为七牛云上传需要传参数
    data: function() {
      if (this.isAuto) {
        var obj = { ...this.params, token: this.$store.state.config.imgToken || '' }
        obj['x:type'] = obj['type']
        delete obj['type']
        return obj
      } else return this.params
    },
    // 上传地址
    action: function() {
      if (this.isAuto) return this.$store.state.config.upload_url
      else return this.$store.state.config.local_url
    }
  },
  watch: {
    // 监听图片列表 只展示一个图片
    imgList: {
      deep: true,
      handler: function(newV, oldV) {
        // this.limitOne()
      }
    },
    imgUrl (newV, oldV) {
      if (newV){
        newV.map(v => {
          this.imgList.push({url: v.full_path})
        })
      }
      else this.imgList = []
    }
  },
  created() {
    if (this.isAuto) this.$store.dispatch('config/GetQiniuToken', { file_type: 'img'})
    // if (this.imgUrl) this.imgList = [{ url: this.imgUrl }]
  },
  mounted() {
    // this.limitOne()
  },
  methods: {
    // 重置组件
    init(file) {
      if (!file) file = {}
      // 校验失败重置组件
      this.$emit('change', {}, this.rParams)
      this.imgList = []
    },
    // 删除文件的钩子
    handleRemove(file, fileList) {
      this.init(file)
    },
    // 自动上传成功的钩子
    uploadSuccess(response, file, fileList) {
      this.$emit('change', response.data, this.rParams)
    },
    // 自动上传失败的回调
    uploadError(err, file, fileList) {
      err = JSON.parse(JSON.stringify(err))
      // token 过期
      if (err.status === 401) {
        // 重新请求token
        this.$store.dispatch('config/GetQiniuToken')
          .then(res => {
            // 重新上传
            this.req(file.raw, this.qn_upload_url)
          })
      } else {
        this.$message.error('请上传正确的图片格式')
      }
    },
    // 自动上传失败的钩子
    handlePictureCardPreview(file) {
      // 图片预览的钩子
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    // 图片上传前的校验
    beforeAvatarUpload(file) {
      const isJPG = (file.type === 'image/jpeg') || (file.type === 'image/png')
      const isLt2M = file.size / 1024 < this.imgSize
      if (!file.type || !isJPG) {
        this.$message.error('上传图片只能是 JPG 或 PNG 格式!')
      }
      if (!isLt2M) {
        const sizeStr = this.imgSize < 1024 ? this.imgSize + 'KB' : (this.imgSize / 1024) + 'MB'
        this.$message.error('上传图片大小不能超过 ' + sizeStr + '!')
      }
      return isJPG && isLt2M
    },
    // 图片改变 上传事件 用于手动图片上传
    changeUpload(file) {
      if (!this.isAuto) {
        // 校验格式
        if (this.beforeAvatarUpload(file.raw)) {
          // 判断是否加水印
          if (this.hasWatermark) {
            // 添加水印
            this.makeWatermarke(file)
              .then((imgurl) => {
                file = this.dataURLtoFile(imgurl, 'img' + new Date().getTime())
                // 上传
                this.req(file, this.action)
              })
          } else this.req(file.raw, this.action)
        } else {
          // 校验失败重置组件
          this.init(file)
          return false
        }
      }
    },
    // 为图片添加水印
    makeWatermarke(file) {
      return new Promise((resolve, reject) => {
        Watermark.toWatermark(file.raw, (imgurl) => {
          this.imgList = [{ url: imgurl }]
          resolve(imgurl)
        }, {
          cwOption: { text: this.text },
          imgOption: { size: this.size }
        })
      })
    },
    // 手动触发上传到服务器
    req(file, url) {
      const formData = new FormData()
      formData.append('file', file)
      for (var key in this.data) {
        formData.append(key, this.data[key])
      }
      request({
        baseURL: '',
        url,
        method: 'post',
        data: formData
      }).then(res => {
        this.$emit('change', res.data, this.rParams)
      }).catch(res => {
        this.init(file)
      })
    },
    handleExceed(files, fileList) {
      this.$message.warning(`当前限制选择 ${this.limit} 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`)
    },
    limitOne() {
      const obj = document.querySelector(`#${this.uploadId} .el-upload--picture-card`)
      const condition = this.limit === 1 && this.imgList && this.imgList.length === 1
      obj.style.display = condition ? 'none' : 'inline-block'
    },
    dataURLtoFile(dataurl, filename) {
      var arr = dataurl.split(',')
      var mime = arr[0].match(/:(.*?);/)[1]
      var bstr = atob(arr[1])
      var n = bstr.length
      var u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      // 转换成file对象
      return new File([u8arr], filename, {
        type: mime
      })
      // 转换成成blob对象
      // return new Blob([u8arr],{type:mime});
    }
  }
}
</script>

<style scoped>
.dialog {
  text-align: center;
}
.yulan {
  max-width: 100%;
}
</style>
