<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div>
          <div style="margin-bottom: 20px;">
            <el-button size="small" type="primary" @click="addTab">新建分类</el-button>
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
                  <!-- <span class="marginR spanmove">请选择移动</span>
                  <el-select  v-model="selectIndex" placeholder="请选择模块" clearable @change="selectIndexBtn">
                    <el-option v-for="(title,value) in blockList" :key="value" :label="title.label" :value="value" />
                  </el-select>
                  <el-button  size="small" type="primary" plain @click="selectAll">全选</el-button> -->
                  <el-button size="small" type="primary" @click="isDrawer=true">上传视频</el-button>
                </div>
                <div class="videoList">
                  <div class="li" v-for="(item,index) in mediaList" :key="index">
                    <div class="top-left">id: {{ item.id }}</div>
                    <el-image :src="`${item.upload.full_path}?vframe/png/offset/1`" fit="contain" class="li-image"></el-image>
                    <div class="deleteBox">
                      <i class="el-icon-delete top-right" @click="removeVideo(item)"></i>
                    </div>
                    <i class="el-icon-video-play playVideo" @click="previewVideo(item)"></i>
                  </div>
                </div>
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

    <el-dialog title="添加分类" width="25%" :visible.sync="dialogFormVisible">
      <el-form :model="form1" ref="formRule" :rules="rules" label-width="100px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form1.name"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="close">取 消</el-button>
        <el-button type="primary" @click="submit('formRule')">确 定</el-button>
      </div>
    </el-dialog>
    <video-drawer :isDrawer="isDrawer" @close="isDrawer=false" :typeId="form.type_id" @change="getTypeMediaList"></video-drawer>
    <preview-dialog :is-visible="dialogVisible" type="video" :src="previewSrc" @close="dialogVisible = false" />
  </div>
</template>

<script>
import VideoDrawer from "./components/videoDrawer.vue";
import PreviewDialog from '@/components/Dialog/PreviewDialog.vue'
export default {
  components: {
    VideoDrawer,
    PreviewDialog
  },
  created () {
    this.form.activity_id = this.$route.query.id
    this.form1.activity_id = this.$route.query.id
    this.getTypeIndex(this.$route.query.id)
  },
  data () {
    return {
      dialogVisible: false,
      previewSrc: '',
      dialogFormVisible: false,
      typeList: [],
      form1: {
        activity_id: '',
        name: ''
      },
      form: {
        activity_id: '',
        type_id: '',
        page: 1,
        size: 10
      },
      mediaList: [],
      rules: {
        name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      },
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
    addTab () {
      if (this.typeList.length < 10) {
      this.dialogFormVisible = true
      } else {
        this.$message.error('分类最多创建10个!')
      }
    },

    // 选择分类
    select (e) {
      this.getTypeMediaList()
    },
    // 删除分类
    removeTab () {

    },
    // 关闭弹窗
    close () {
      this.dialogFormVisible = false
      this.form1.name = ''
    },

    // 查询分类下素材
    getTypeMediaList () {
      this.apiBtn('ActivityIndexMedia', this.form).then(res => {
        this.mediaList = res.data
      })
    },

    // 删除分类下视频
    removeVideo (item) {

    },

    // 预览视频
    previewVideo (item) {
      this.previewSrc = item.upload.full_path
      this.dialogVisible = true
    },

    submit (formName) {
      this.$refs[formName].validate((valid) => {
          if (valid) {
            this.apiBtn('TypeStore', this.form1).then(res => {
              this.form1.name = ''
              this.dialogFormVisible = false
              this.getTypeIndex(this.$route.query.id)
              this.$message.success('操作成功!')
           })
          } else {
            console.log('error submit!!');
            return false;
          }
        });
    }
  }
}
</script>
<style lang="scss" scoped>
.media-box{
  width: 100%;
  min-height: 400px;
  .videoList{
    width: 100%;
    display: flex;
    align-items: center;
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
</style>
