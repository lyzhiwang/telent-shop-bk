<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div>
            <el-tabs v-model="form.type_id" type="card" @tab-click="select">
              <el-tab-pane
                v-for="(item, index) in typeList"
                :key="index"
                :label="item.name"
                :name="String(item.id)"
              >
              <div class="media-box">
                <template v-if="Object.keys(mediaList).length>0">
                  <el-card style="margin-top:20px">
                    <div slot="header" class="clearfix">
                      <div class="titleBox">
                        <span>素材上传记录:</span>
                        <el-button v-has="'ActivityMakeZip'" type="danger" size="small" @click="makeZip">素材打包</el-button>
                      </div>
                    </div>
                    <div class="videoList" v-for="(item,key,index) in mediaList" :key="index">
                      <div class="time">上传时间: {{key}}</div>
                      <el-row v-if="mediaForm.ids.length>0 && index===0">
                        <el-col :span="10">
                          <el-button type="danger" @click="reasonShow=true" size="mini">拒绝</el-button>
                        </el-col>
                      </el-row>
                      <div class="video-box">
                        <div class="li" v-for="(item1,index1) in item" :key="index1" @click="selectItem(item1,index)" :class="{'action':mediaForm.ids.includes(item1.id)}">
                          <div class="top-left">id: {{ item1.id }}</div>
                          <el-image :src="`${item1.upload.full_path}?vframe/png/offset/1`" fit="contain" class="li-image"></el-image>
                          <div class="deleteBox" v-if="index===0">
                            <i class="el-icon-check top-right" @click="removeVideo(item1)"></i>
                          </div>
                          <i class="el-icon-video-play playVideo" @click.stop="previewVideo(item1)"></i>
                        </div>
                      </div>
                    </div>
                  </el-card>
                </template>
                <template v-if="mediaList.length===0">
                  <div class="nodata">暂无资源,请上传视频</div>
                </template>
                <template v-else>

                </template>
              </div>
              </el-tab-pane>
            </el-tabs>
        </div>
      </template>
    </el-card>
    <el-dialog
    title="提示"
    :visible.sync="reasonShow"
    width="30%"
    @close="closeReason">
    <el-input v-model="mediaForm.reason" type="textarea" :rows="3" placeholder="请输入拒绝理由"></el-input>
    <span slot="footer" class="dialog-footer">
      <el-button @click="closeReason">取 消</el-button>
      <el-button type="primary" @click="submit">确 定</el-button>
    </span>
  </el-dialog>
    <preview-dialog :is-visible="dialogVisible" type="video" :src="previewSrc" @close="dialogVisible = false" />
  </div>
</template>

<script>
import PreviewDialog from '@/components/Dialog/PreviewDialog.vue'
export default {
  components: {
    // VideoUpload,
    // VideoDrawer,
    PreviewDialog
  },
  created () {
    this.form.id = this.$route.query.task_id
    this.mediaForm.task_id = this.$route.query.task_id
    // this.mediaForm.id = this.$route.query.id
    this.getTypeIndex(this.$route.query.id)
  },
  data () {
    return {
      reasonShow: false,
      dialogVisible: false,
      previewSrc: '',
      typeList: [],
      fileList: [], // 上传列表
      form: {
        id: '',
        type_id: ''
      },
      mediaForm: {
        ids: [],
        task_id: '',
        reason: ''
      },
      mediaList: {},
      selectIndex: [],
    }
  },
  methods: {
    // 素材打包
    makeZip () {
      const info = this.typeList.find(v => { return v.id === Number(this.form.type_id) })
      const params = {
        activity_id: this.$route.query.id,
        type_id: Number(this.form.type_id),
        task_id: this.$route.query.task_id,
        type_name: info.name
      }
      this.$confirm('此操作将提交该分类下素材打包, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.apiBtn('ActivityMakeZip', params).then(res => {
            this.$message.success('提交该分类素材打包成功,请前往素材下载页面下载素材!')
          })
        }).catch(() => {
          this.$message.warning('已取消提交该分类素材打包!')
        })
    },
    // 获取素材分类
    getTypeIndex (id) {
      this.apiBtn('TypeIndex', { activity_id: id }).then(res => {
        if (res.data.length>0) {
          this.form.type_id = String(res.data[0].id)
          this.getTypeMediaList()
        }
        this.typeList = res.data
      })
    },

    selectIndexBtn () {

    },
    selectAll () {

    },

    // 选择分类
    select (e) {
      this.mediaForm.ids = []
      this.mediaForm.reason= ''
      this.form.id = this.$route.query.task_id
      this.getTypeMediaList()
    },

    // 查询分类下素材
    getTypeMediaList () {
      this.apiBtn('PhotomanShow', this.form).then(res => {
        this.mediaList = res.data
      })
    },

    // 提交上传视频
    submit () {
      if (this.mediaForm.reason) {
        this.apiBtn('RefuseMedia', this.mediaForm).then(res => {
          this.$message.success('操作成功!')
          this.mediaForm.ids = []
          this.closeReason()
        })
      } else {
        this.$message.error('请输入拒绝理由!')
      }
    },
    // addVideo (e) {
    //   this.fileList.unshift(e)
    //   this.changeVideo(this.fileList)
    // },
    // removeVideo (e) {
    //   let index = this.fileList.findIndex(v => v.id === e.response.data.id)
    //   console.log('index', index)
    //   this.fileList.splice(index, 1)
    //   this.changeVideo(this.fileList)
    // },
    // changeVideo (arr) {
    //   this.mediaForm.media = []
    //   arr.map(v => {
    //       let obj = { upload_id: v.id, type_id: this.form.type_id, activity_id: this.$route.query.id }
    //       this.mediaForm.media.push(obj)
    //   })
    // },

    // 多选视频
    selectItem (item, key) {
      if (key === 0) {
        if (this.mediaForm.ids.length === 0) {
        this.mediaForm.ids.push(item.id)
      } else {
        let index = this.mediaForm.ids.findIndex(v => v === item.id)
        if (index >= 0) {
          this.mediaForm.ids.splice(index, 1)
        } else {
          this.mediaForm.ids.push(item.id)
        }
      }
      }

      console.log('this.mediaForm', this.mediaForm);
    },
    closeReason () {
      this.mediaForm.reason = ''
      this.reasonShow = false
    },

    // 预览视频
    previewVideo (item) {
      this.previewSrc = item.upload.full_path
      this.dialogVisible = true
    },
  }
}
</script>
<style lang="scss" scoped>
.media-box{
  width: 100%;
  min-height: 400px;
  .marginR{

  }
  .videoList{
    width: 100%;
    display: flex;
    flex-direction: column;
    // align-items: center;
    .time{
      padding: 20px 0;
      font-size: 13px;
      color: #606266;
    }
    .video-box{
      display: flex;
      flex-wrap: wrap;
    }
    .li{
      width: 200px;
      height: 140px;
      // border: 1px solid red;
      margin: 10px 5px 5px 10px;
      background-color: #F2F6FC;
      position: relative;
      .li-image{
        width: 100%;
        height: 100%;
      }
      .top-left{
        padding: 3px 5px;
        background: #66b1ff;
        color: #fff;
        font-size: 12px;
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        top: 0;
        left: 0;
        z-index: 2000;
      }
      .deleteBox{
        width: 18px;
        height: 18px;
        border: 1px solid #000;
        border-radius: 3px;
        // padding: 3px;
        position: absolute;
        top: 0px;
        right: 0px;
        z-index: 2000;
        cursor: pointer;
        background-color: #fff;

      }
      .top-right{
        color: #fff;
      }
      .playVideo{
        font-size: 45px;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-left: -22.5px;
        margin-top: -22.5px;
        background: #fff;
        border-radius: 50%;
      }
    }
    .action{
      border-radius: 3px;
      border:2px solid #66b1ff;
      .deleteBox{
        border: 1px solid #66b1ff;
        background-color: #66b1ff;
      }
    }
  }
  .nodata{
    display: flex;
    align-items: center;
    justify-content: left;
    padding: 20px 10px;
    font-size: 14px;
    color: #606266;
  }
}
.tips{
  font-size: 15px;
  color: red;
  font-weight: bold;
  padding: 10px 0;
}
.titleBox{
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
