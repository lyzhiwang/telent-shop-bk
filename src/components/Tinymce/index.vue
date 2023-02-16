<template>
  <div class="tinymce-container">
    <textarea
      :id="tinymceId"
      ref="tinymce"
      v-model="html"
      :class="['tinymce-textarea', disabled ? 'disabled' : '']"
    />
  </div>
</template>

<script>
import { toolbar_default, toolbar_easy } from './toolbar'
import { plugins_default, plugins_easy } from './plugins'
import { getToken } from '@/utils/auth'
import axios from 'axios'

export default {
  name: 'Tinymce',
  props: {
    mode: {
      type: String,
      default: 'default'
    },
    html: {
      type: String,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      tinymceId: 'tinymceId-' + new Date().getMilliseconds() + Math.ceil(Math.random() * 10),
      hasInit: false,
      hasChange: false,
      templates: [],
      size: 1024 * 2,
      type: 4, // 上传文件类型
      newImgUrl: [], // 存储上传的图片
      loading: null, // loading加载弹框
      loadingImg: { }, // 用于校验图片是否上传
      checkImgRepet: []// 用于校验图片是否重复
    }
  },
  computed: {
    toolbar() {
      if (this.mode === 'default') return toolbar_default
      else return toolbar_easy
    },
    plugins() {
      if (this.mode === 'default') return plugins_default
      else return plugins_easy
    },

    config: function() {
      // 上传配置
      return this.$store.state.config
    },
    // 是否是七牛云 1七牛 0本地
    open: function() {
      return this.$store.state.config.auto_open
    },
    token: function() {
      // 上传token
      return this.$store.state.config.imgToken || ''
    },
    params: function() {
      // 上传参数
      if (this.open) {
        return {
          token: this.token,
          'x:type': this.type
        }
      } else {
        return {
          token: this.token,
          type: this.type
        }
      }
    }
  },
  watch: {
    html: function(val) {
      // 组件和tinymce都渲染完成，但数据为空时，重新设置富文本内容
      if (!this.hasChange && this.hasInit) {
        this.setContent()
      }
    },
    disabled: function() {
      this.setMode()
    },
    hasInit: function() {
      this.setMode()
      const self = window.tinyMCE.activeEditor.getContent()
      if (self !== this.html) this.setContent()
    },
    loadingImg: {
      deep: true,
      handler(newV) {
        let res = false
        for (const item in this.loadingImg) {
          res = res && item
        }
        if (!res) {
          console.log('完成')
          this.$emit('change', this.replaceImage(this.html))
          this.setContent()
          setTimeout(() => {
            this.loading.close()
          }, 2000)
        }
      }
    }
  },
  created() {
  },
  mounted() {
    if (this.mode === 'default') {
      axios.get('https://common.zwwltkl.com/tinymce/template.json?' + new Date()).then(res => {
        this.templates = res.data
        if (!this.token) {
          this.$store.dispatch('config/GetQiniuToken', { file_type: 'img' }).then(() => {
            this.initTinymce()
          })
        } else this.initTinymce()
      })
    } else this.initTinymce()
  },
  destroyed() {
    // 为使TinyMCE下次能正常初始化，必须销毁
    this.destroyTinymce()
  },
  methods: {
    initTinymce() {
      const that = this
      window.tinymce.init({
        selector: '#' + this.tinymceId,
        width: 500,
        autoresize_overflow_padding: 20,
        autoresize_bottom_margin: 50,
        toolbar: this.toolbar,
        plugins: this.plugins,
        language: 'zh_CN',
        language_url: 'https://common.zwwltkl.com/tinymce/langs/zh_CN.js',
        convert_urls: false, // 控制TinyMCE智能将URL还原为其原始值(默认true浏览器将修改链接，false不让浏览器修改链接)
        autosave_ask_before_unload: false, // 关闭当前窗口时，提示用户建议他们有未保存的更改
        // autosave_interval: '20s', // 保存到本地存储之间应等待的时间
        // autosave_restore_when_empty: true, // 当内容初始值为空时，是否自动恢复存储在本地存储中的内容
        // https://www.jianshu.com/p/b9f3e566a9ce
        powerpaste_word_import: 'merge', // 参数可以是propmt, merge, clear，效果自行切换对比
        powerpaste_html_import: 'merge', // propmt, merge, clear
        powerpaste_allow_local_images: true,
        paste_data_images: true, // 是否禁止用户粘贴图片(false为禁止)
        // 允许指定在WebKit中粘贴时要保留的样式
        paste_webkit_styles: 'all',
        // 允许指定在粘贴 MS Word 和 类似Office套件产品中的内容时要保留的样式。
        paste_retain_style_properties: 'all',
        font_formats: `
          微软雅黑=微软雅黑;
          宋体=宋体;
          黑体=黑体;
          仿宋=仿宋;
          楷体=楷体;
          隶书=隶书;
          幼圆=幼圆;
          Verdana=verdana,geneva;
          Times New Roman=times new roman,times;
          Arial=arial, helvetica,
          sans-serif;`,
        formats: {
          // 给居中元素加类名
          aligncenter: {
            selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img',
            classes: 'center'
          }
        },
        // 预览模型
        plugin_preview_width: 375,
        plugin_preview_height: 600,
        // 引入外部CSS
        content_css: [
          'https://res.wx.qq.com/open/libs/weui/1.1.2/weui.min.css',
          'https://common.zwwltkl.com/tinymce/tinycss.css?0323'
        ],
        // 模板
        templates: this.templates,
        // 初始化结束后执行
        init_instance_callback: editor => {
          if (this.html) {
            editor.setContent(this.html)
          }
          this.hasInit = true
          editor.on('NodeChange Change KeyUp SetContent', () => {
            this.hasChange = true
            this.$emit('change', editor.getContent())
          })
        },
        // 文件管理 相关配置字段
        filery_dialog_height: '402px',
        filery_api_url: process.env.VUE_APP_BASE_API + '/upload', // 获取文件的url
        filery_api_token: 'Bearer ' + getToken(), // 获取用户的token 本地token
        filery_upload_api_url: this.config.upload_url, // 上传地址
        filery_upload_params: this.params, // 上传参数
        filery_show_images: true, // false显示默认图标,true显示图像
        filery_update_qn_token: this.handleUploadError, // 更新七牛云token
        filer_multiple: this.open, // 是否是多图上传 0 本地 单图上传 1 七牛云 多图上传
        // 图片插件的图片上传处理
        images_upload_handler: (blobInfo, success, failure) => {
          const xhr = new XMLHttpRequest()
          const formData = new FormData()
          console.log('进入图片上传')
          xhr.withCredentials = false
          xhr.open('POST', this.config.upload_url)
          xhr.setRequestHeader('Authorization', 'Bearer ' + getToken())

          formData.append('token', this.token)
          formData.append('file', blobInfo.blob(), this.config.upload_url)
          if (this.config.auto_open) formData.append('x:type', this.type)
          else formData.append('type', this.type)

          xhr.onload = () => {
            if (xhr.status === 401) {
              this.handleUploadError(blobInfo.blob()).then(res => {
                failure('页面超时，请刷新页面后，重新上传文件')
                return
              })
            } else if (xhr.status === 413) {
              failure('文件大小超出范围')
              return
            } else if (xhr.status !== 200) {
              failure('网络错误：' + xhr.status)
              return
            } else {
              const json = JSON.parse(xhr.responseText)
              json.location = json.data.path
              if (!json || typeof json.location !== 'string') {
                failure('json不存在或格式错误：' + xhr.status)
                return
              }
              success(json.location)
            }
          }
          console.log('图片上传成功',formData)
          xhr.send(formData)
        },
        //  https://www.jianshu.com/p/1e910124eacf
        // 处理url替换
        urlconverter_callback: (url, node, on_save, name) => {
          console.log('处理图像url')
          // 'https://static.zwwlhb.cn',
          const assignUrl = ['https://static.zwmstk.cn', 'https://static.lyskedas.cn', 'https://common.zwwltkl.com/']// 设置白名单
          let isInnerUrl = false // 默认不是内部链接
          try {
            assignUrl.forEach(item => {
              if (url.indexOf(item) > -1) {
                isInnerUrl = true
                throw new Error('EndIterate')
              }
            })
          } catch (e) {
            if (e.message !== 'EndIterate') throw e
          }
          if (!isInnerUrl && (name === 'style' || (name === 'src' && node === 'img'))) {
            // 打开加载弹框
            // that.loading = that.$loading({
            //   lock: true,
            //   text: '文章图片上传中，请稍后',
            //   spinner: 'el-icon-loading',
            //   background: 'rgba(0, 0, 0, 0.7)'
            // })
            // 兼容部分图片不带https头，手动校验添加
            const urlregex = /^(https?):.*/
            if (!urlregex.test(url)) url = 'https:' + url
            console.log('urlurl', url)
            that.$set(that.loadingImg, url, true)
            console.log('that.checkImgRepet.includes(url)', that.checkImgRepet.includes(url))
            if (that.checkImgRepet.includes(url)) { // 避免重复上传
              that.checkImgRepet.push(url)
              // 上传图片
              this.apiBtn('QnFetch', { url }).then(res => {
                this.newImgUrl.push({ oriUrl: url, filePath: res.data })
                that.$set(that.loadingImg, url, false)
              }).catch(() => {
                // 上传失败移除验证重复以及loading加载字段
                delete that.loadingImg[url]
                that.checkImgRepet.splice(that.checkImgRepet.indexOf(url), 1)
              })
            } else {
              // 查询对应图片
              this.newImgUrl.map((item) => {
                console.log('item', item)
                if (url === item.oriUrl) {
                  url = item.filePath
                  that.$set(that.loadingImg, url, false)
                }
              })
            }
          }
          // 返回替换后的url
          return url
        },
        setup: function(editor) {
          editor.on('change', function(e) {
            that.$emit('change', window.tinyMCE.activeEditor.getContent())
            // 将外部内容中图片的路径合并成一个数组
            // const imgs = []
            // const pre = that.$refs.tinymce.previousSibling
            // const iframe = pre.getElementsByTagName('iframe')[0]
            // const iframeDoc = iframe.contentWindow.document
            // const HTMLCollection = iframeDoc.getElementsByTagName('img')
            // for (const item of HTMLCollection) {
            //   imgs.push(item.src)
            // }
          })
        }
      })
    },
    destroyTinymce() {
      window.tinymce.remove({
        selector: '#' + this.tinymceId
      })
    },
    // 设置模式 是否禁用
    setMode() {
      if (this.hasInit) {
        this.$nextTick(() =>
          window.tinymce.editors[this.tinymceId].setMode(this.disabled ? 'readonly' : 'design')
        )
      }
    },
    // 赋初始化值
    setContent() {
      if (this.hasInit) {
        this.$nextTick(() =>
          window.tinymce.get(this.tinymceId).setContent(this.html || '')
        )
      }
    },
    // 因token失效而上传失败
    handleUploadError(file) {
      return new Promise((resolve, reject) => {
        // 1.清空原来的失效token
        this.$store.commit('config/SET_IMG_TOKEN', '')
        this.$store.commit('config/SET_AUDIO_TOKEN', '')
        // 2.重新请求token
        this.$store
          .dispatch('config/GetQiniuToken', { other: true })
          .then(res => {
            resolve(res)
            // 3.重新上传图片
            // TODO：解决第一次上传失败的处理，并将第二次请求的结果抛出去
            // const formData = new FormData()
            // formData.append('token', this.config.imgToken)
            // formData.append('file', file, file.name)
            // if (this.config.auto_open) {
            //   formData.append('x:type', this.type)
            // } else {
            //   formData.append('type', this.type)
            // }
            // request({
            //   baseURL: '',
            //   url: this.config.upload_url,
            //   method: 'post',
            //   data: formData
            // }).then(res => {
            //   resolve(res)
            //   return
            // })
          })
          .catch(res => {
            reject(res)
            return
          })
      })
    },
    // 替换图片
    replaceImage(content) {
      if (!this.newImgUrl.length) return content // 匹配并替换 img中src图片路径
      content = content.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/gi, (mactch, capture) => {
        let current = ''
        this.newImgUrl.forEach(item => {
          if (capture === item.oriUrl) {
            current = item.filePath
          }
        })
        current = current || capture
        return mactch.replace(/src=[\'\"]?([^\'\"]*)[\'\"]?/i, 'src=' + current)
      }) // 匹配并替换 任意html元素中 url 路径
      content = content.replace(/url\(['"](.+)['"]\)/gi, (mactch, capture) => {
        let current = ''
        this.newImgUrl.forEach(item => {
          if (capture === item.oriUrl) {
            current = item.filePath
          }
        })
        current = current || capture
        return mactch.replace(/url\((['"])(.+)(['"])\)/i, `url($1${current}$3) `)
      })
      return content
    }
  }
}
</script>

<style>
.mce-container.mce-toolbar.mce-stack-layout-item.mce-first {
  border-bottom: 1px solid #e2e4e7;
}

/* 禁用 */
.disabled .mce-container-body {
  background-color: #f5f7fa;
  cursor: not-allowed;
}

/* .mce-tinymce.mce-container.mce-panel {
  min-width: 780px;
} */

/* 表情 */
.mytab ul {
  height: 40px;
  margin: 15px;
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-around;
}
.mytab ul li {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-bottom: 1px solid #ccc;
}
.mytab ul li.active {
  border: 1px solid #ccc;
  border-bottom: none;
}
.mytab .mytabCotent {
  padding: 0 12px 12px 12px;
  width: 500px;
  height: 300px;
  overflow-y: auto;
}
.mytab .mytabCotent > div {
  display: none;
}
.mytab .mytabCotent > div.active {
  display: flex;
  flex-wrap: wrap;
}
.mytab .mytabCotent > div.active > div {
  width: 50px;
  height: 50px;
  margin: 0 10px 10px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.scrollbar {
  width: 30px;
  height: 425px;
  margin: 0 auto;
}
.mytabCotent::-webkit-scrollbar {
  /*滚动条整体样式*/
  width: 10px; /*高宽分别对应横竖滚动条的尺寸*/
  height: 1px;
}
.mytabCotent::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 2px;
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1);
  background: #999;
}
.mytabCotent::-webkit-scrollbar-track {
  /*滚动条里面轨道*/
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1);
  border-radius: 2px;
  background: #eee;
}
</style>
