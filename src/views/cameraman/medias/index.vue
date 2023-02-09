<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div>
          <div style="margin-bottom: 20px;">
            <el-button size="small" type="primary" @click="save">确认完成上传通知商家</el-button>
            <div class="tips">注:所有视频分类完成上传后,点击<<确认完成上传通知商家>>按钮</div>
          </div>
            <el-tabs v-model="form.type_id" type="card" @tab-click="select">
              <el-tab-pane
                v-for="(item, index) in typeList"
                :key="index"
                :label="item.name"
                :name="String(item.id)"
              >
              <div class="media-box">
                <div class="marginR">
                  <el-card>
                    <div slot="header" class="clearfix">
                      <span>素材上传:</span>
                    </div>
                  <!-- <span class="marginR spanmove">请选择移动</span>
                  <el-select  v-model="selectIndex" placeholder="请选择模块" clearable @change="selectIndexBtn">
                    <el-option v-for="(title,value) in blockList" :key="value" :label="title.label" :value="value" />
                  </el-select>
                  <el-button  size="small" type="primary" plain @click="selectAll">全选</el-button> -->
                  <!-- <el-button size="small" type="primary" @click="isDrawer=true">上传视频</el-button> -->
                  <el-row>
                    <el-col :span="8">
                      <video-upload ref="videoUpload" :list="fileList" @add="addVideo" :sizeLimit="50" @remove="removeVideo"></video-upload>
                    </el-col>
                    <el-col :span="12">
                      <el-button size="mini" type="danger" v-if="mediaForm.media.length > 0" @click="submit">保存上传视频</el-button>
                    </el-col>
                  </el-row>

                  </el-card>
                </div>
                <template v-if="Object.keys(mediaList).length>0">
                  <el-card style="margin-top:20px">
                    <div slot="header" class="clearfix">
                      <span>素材上传记录:</span>
                    </div>
                    <div class="videoList" v-for="(item,key,index) in mediaList" :key="index">
                      <div class="time">上传时间: {{key}}</div>
                      <!-- {{item}} -->
                      <div class="video-box">
                        <div class="li" v-for="(item1,index) in item" :key="index">
                          <div class="top-left">id: {{ item1.id }}</div>
                          <div class="img-box">
                            <el-image :src="`${item1.upload.full_path}?vframe/png/offset/1`" fit="contain" class="li-image"></el-image>
                            <i class="el-icon-video-play playVideo" @click="previewVideo(item1)"></i>

                          </div>
                          <!-- <div class="deleteBox">
                            <i class="el-icon-delete top-right" @click="removeVideo(item1)"></i>
                          </div> -->
                          <div class="reason" v-if="item1.status">拒绝理由: {{item1.reason}}</div>
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
    <video-drawer :isDrawer="isDrawer" @close="isDrawer=false" :typeId="form.type_id" @change="getTypeMediaList"></video-drawer>
    <preview-dialog :is-visible="dialogVisible" type="video" :src="previewSrc" @close="dialogVisible = false" />
  </div>
</template>

<script>
import VideoDrawer from "./components/videoDrawer.vue";
import PreviewDialog from '@/components/Dialog/PreviewDialog.vue'
import VideoUpload from '@/components/Upload/videoUpload.vue'
export default {
  components: {
    VideoUpload,
    VideoDrawer,
    PreviewDialog
  },
  created () {
    this.form.id = this.$route.query.task_id
    this.task_id = this.$route.query.task_id
    this.form.activity_id = this.$route.query.id
    this.mediaForm.id = this.$route.query.task_id
    this.getTypeIndex(this.$route.query.id)
  },
  data () {
    return {
      task_id: null, // 任务id 确认完成需传
      dialogVisible: false,
      previewSrc: '',
      typeList: [],
      fileList: [], // 上传列表
      form: {
        id: '',
        activity_id: '',
        type_id: '',
        page: 1,
        size: 10
      },
      mediaForm: {
        id: '',
        media: []
      },
      mediaList: {},
      selectIndex: [],
      blockList: [],
      isDrawer: false
    }
  },
  methods: {
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

    // 新建分类
    save () {
      this.$confirm('确认提交当前上传素材?', '提示', {
          // distinguishCancelAndClose: true,
          confirmButtonText: '通过',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
               this.apiBtn('PhotomanUpdateStatus',{id: this.task_id}).then(res => {
                 this.$message.success('操作成功')
                this.$router.go(-1)
          })
        }).catch(action => {

        })
    },

    // 选择分类
    select (e) {
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
      this.mediaForm.id = this.$route.query.task_id
      if (this.mediaForm.media.length > 0) {
        this.apiBtn('PhotomanUpdate', this.mediaForm).then(res => {
          this.$message.success('操作成功!')
          this.select()
          this.fileList = []
          this.mediaForm.media = []
          this.$refs.videoUpload.fileList = []
          this.$forceUpdate()
        })
      } else {
        this.$message.error('请上传视频!')
      }
    },
    addVideo (e) {
      this.fileList.unshift(e)
      this.changeVideo(this.fileList)
    },
     // 删除分类下视频
    // removeVideo (item) {

    // },
    removeVideo (e) {
      let index = this.fileList.findIndex(v => v.id === e.response.data.id)
      this.fileList.splice(index, 1)
      this.changeVideo(this.fileList)
    },
    changeVideo (arr) {
      this.mediaForm.media = []
      arr.map(v => {
          let obj = { upload_id: v.id, type_id: this.form.type_id, activity_id: this.$route.query.id }
          this.mediaForm.media.push(obj)
      })
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
      min-height: 140px;
      // border: 1px solid red;
      margin: 10px 5px 5px 10px;
      background-color: #F2F6FC;
      position: relative;
      .reason{
        width: 100%;
        padding: 5px;
        min-height: 20px;
        font-size: 13px;
        // position: absolute;
        // bottom: -20px;
        line-height: 20px;
        color: #e75555;
      }
      .img-box{
        width: 100%;
        height: 140px;
        position: relative;
      }
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
        padding: 3px;
        position: absolute;
        top: 0px;
        right: 0px;
        z-index: 2000;
        cursor: pointer;
        background-color: #F78989;

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
</style>
