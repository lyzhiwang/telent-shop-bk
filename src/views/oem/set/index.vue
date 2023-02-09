<template>
  <div>
    <el-card>
          <template #header>
            <div>
              <span>OEM设置</span>
            </div>
          </template>
          <div>
            <el-form ref="formRule" :model="form" :rules="rules" label-width="250px">
              <tip title="基础信息" />
              <el-form-item label="轮播图" prop="img">
                <Upload key="oemimg" :multiple="true" :limit="3" :imgUrl="imgUrl" :params="{type: 1}" @remove="removeSwiper" @change="changeSwiper"></Upload>
              </el-form-item>
              <el-form-item label="达人审核">
                <el-switch key="is_all" v-model="form.star_is_auth" :active-value="1" :inactive-value="0" />
              </el-form-item>
              <el-form-item label="摄影师审核">
                <el-switch key="is_all" v-model="form.photo_is_auth" :active-value="1" :inactive-value="0" />
              </el-form-item>
              <el-form-item label="达人须知" prop="star_contract">
                <Tinymce :html="form.star_contract" @change="changeStar" />
              </el-form-item>
               <el-form-item label="小程序二维码">
                  <FileManager :value="form.mini_img" :page-size="8" :type="1" :size="1024" @change="changeMiniPic" />
                </el-form-item>
              <!-- <el-form-item label="摄影师须知" prop="photo_contract">
                <Tinymce :html="form.photo_contract" @change="changePhoto" />
              </el-form-item> -->

              <tip title="分享信息" />
              <template>
                <el-form-item label="首页分享标题" prop="share_title" class="activity-share_title">
                  <el-input v-model="form.share_title" type="textarea" maxlength="40" show-word-limit clearable style="width: 350px"/>
                </el-form-item>
                <div class="tip-font">推荐40个汉字以内</div>
              </template>

              <!-- <template>
                <el-form-item label="分享描述" prop="share_desc" class="activity-share_desc">
                  <el-input v-model="form.share_desc" type="textarea" maxlength="30" show-word-limit clearable style="width: 350px" />
                </el-form-item>
                <div class="tip-font">推荐30个汉字以内</div>
              </template> -->

              <template>
                <el-form-item label="首页分享图片" class="activity-share_image">
                  <FileManager :value="form.share_img" :page-size="8" :type="1" :size="500" @change="changeSharePic" />
                </el-form-item>
                <div class="tip-font">1.图片尺寸：1:1；2.图片大小必须小于100KB</div>
              </template>

              <tip title="客服信息" />
              <el-form-item label="电话" prop="cs_phone">
                <el-input v-model="form.cs_phone" maxlength="11" placeholder="电话" />
              </el-form-item>
              <el-form-item label="客服二维码" prop="cs_img">
                <FileManager key="cs_img" :value="form.cs_img" :type="1" :size="1024" @change="changeCode" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="onSubmit('formRule')">保存</el-button>
              </el-form-item>
            </el-form>
          </div>
      </el-card>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Upload from "@/components/Upload/index";
import FileManager from '@/components/FileManager/index'
import Tinymce from '@/components/Tinymce/index'

export default {
    components: { Upload, FileManager, Tinymce},
    data () {
      const validateImg = (rule, val, callback) => {
        if (this.form.img && this.form.img.length === 0) callback(new Error('请上传轮播图'))
        else callback()
      }
      const validateFile = (rule, value, callback) => {
        if (value && value.id && value.path) callback()
        else callback(new Error('请上传微信二维码'))
      }
      // const validatePic = (rule, val, callback) => {
      //   if (this.form.share_img && this.form.share_img.path && this.form.share_img.id) callback()
      //   else callback(new Error('请上传分享图片'))
      // }
      return {
        form: {
          img: [],
          cs_phone: '',
          star_contract: '',
          // photo_contract: '',
          star_is_auth: 1,
          photo_is_auth: 1,
          share_title: '',
          // share_desc: '',
          share_img:{},
          cs_img: {},
          mini_img: {} // 小程序二维码
        },
        rules: {
          img: [{required: true, trigger: 'change', validator: validateImg}],
          share_title: [{ required: true, min: 1, max: 430, trigger: 'change', message: '请设置分享标题' }],
          // share_desc: [{ required: true, min: 1, max: 30, trigger: 'change', message: '请设置分享描述' }],
          // share_img: [{ required: true, trigger: 'change', validator: validatePic }],
          cs_phone: [{ required: true, trigger: 'change', message: '请设置正确的客服电话' }],
          cs_img: [{ required: true, trigger: 'change', validator: validateFile }],
          star_contract: [{ required: true, message: '请输入达人须知', trigger: 'blur' }],
          // photo_contract: [{ required: true, message: '请输入摄影师须知', trigger: 'blur' }]
        },
        imgUrl: [],
      };
    },

  computed: {
      ...mapState({
        userId: state => state.user.userId
      })
    },
    mounted () {
      this.apiBtn('OemConfigShow', { id: this.userId }).then(res => {
        this.form = res.data
        this.imgUrl = res.data.upload
        this.form.img = []
        res.data.upload.map(v => {
          this.form.img.push({upload_id:v.id})
        })
        if (this.form.cs_img!==null) {
          this.form.cs_img.path = this.form.cs_img.full_path
        } else {
          this.form.cs_img = {}
        }
        if (this.form.share_img !== null) {
          this.form.share_img.path = this.form.share_img.full_path
        } else {
          this.form.share_img = {}
        }
        if (this.form.mini_img !== null) {
          this.form.mini_img.path = this.form.mini_img.full_path
        } else {
          this.form.mini_img = {}
        }
      })
    },

  methods: {
    onSubmit (formName) {
      let query = { ...this.form }
      query.share_img = this.form.share_img.id
      query.cs_img = this.form.cs_img.id
      query.mini_img = this.form.mini_img.id
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.apiBtn('OemConfigUpdate', query).then(res => {
            this.$message.success('操作成功!')
          })
          } else {
            console.log('error submit!!');
            return false;
          }
        });
    },
       // 上传图片
    changeSwiper (e) {
      this.form.img.push({ upload_id: e.id })
    },
    removeSwiper (file) {
      const fileId = file.response.data.id
      const index = this.form.img.findIndex(v => { return v.upload_id === fileId })
      if (index >= 0) {
       this.form.img.splice(index,1)
      }
    },
      changeCode (e) {
        this.form.cs_img = e
      },
      changeSharePic (e) {
        this.form.share_img = e
    },
      changeMiniPic (e) {
        this.form.mini_img = e
      },
        // 达人须知
      changeStar (e) {
        this.form.star_contract = e
      },
      //   // 达人须知
      // changePhoto (e) {
      //   this.form.photo_contract = e
      // },
    },

  }

</script>
<style lang='scss' scoped>
.tip-font{
  margin-left: 250px;
}
</style>
