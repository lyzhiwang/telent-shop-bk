<template>
  <div class="app-container">
    <!-- <tip title="暂无" /> -->
    <el-card class="box-card" v-if="[1,6].indexOf(roles[0])===-1">
      <div slot="header" class="clearfix">
        <span>资金信息</span>
      </div>
      <el-row :gutter="20">
        <el-col :span="12">
          <div>
            <el-statistic  title="余额">
              <template slot="formatter">{{ (Number(dashboardData.total) - Number(dashboardData.withdrew)).toFixed(2) }}</template>
            </el-statistic>
          </div>
        </el-col>
        <el-col :span="12">
            <el-statistic title="待入账金额">
              <template slot="formatter">{{ dashboardData.wait_money }}</template>
            </el-statistic>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="box-card" v-if="roles[0]!=1">
      <div slot="header" class="clearfix">
        <span>小程序二维码</span>
      </div>
      <el-image :src="dashboardData.mini_qrcode"></el-image>
    </el-card>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Dashboard',
  components: {},
  data() {
    return {
    }
  },
  computed: {
    ...mapState({
      dashboardData: (state)=>state.user.dashboardData,
      roles: (state)=>state.user.roles,
    })
  },
  created() {
  },
  mounted() {
  },
  methods: {}
}
</script>

<style lang="scss" scoped>
.box-card{
  margin-bottom: 20px;
}
</style>
