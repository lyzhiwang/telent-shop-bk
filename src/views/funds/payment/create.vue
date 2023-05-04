<template>
  <div class="app-container">
    <el-card v-show="step===0">
      <template #header>
        <div class="card-header">
          <span>充值&nbsp;<small class="tip-font">(在线充值微信公众平台将收取1%的手续费)</small></span>
        </div>
      </template>
      <div>
        <el-form ref="form" class="form-racharge" label-width="251px">
          <el-form-item label="金额">
            <el-input-number v-model="money" :step="1" step-strictly :min="100" :max="1000" :controls="false" />
            <small class="tip-font">（在线充值金额为100~1000元）</small>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit">充值</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <transition name="el-fade-in-linear">
      <el-card v-show="step===1" class="transition-box">
        <template #header>
          <div class="card-header">
            <span>收银台</span>
          </div>
        </template>
        <div class="recharge-money">
          <div class="recharge-info">
            <div class="recharge-info-content">
              <div>
                <div>订单编号：{{ order.out_trade_no }}</div>
                <div>订单类型：充值</div>
                <div>订单金额：￥{{ order.money }}</div>
                <div>微信公众平台收取手续费：￥{{ order.charge }}</div>
              </div>
              <div class="recharge-info-right">
                <div>应付金额：<b>￥<span class="money">{{ order.orderPrice }}</span></b></div>
              </div>
            </div>
          </div>
          <div class="recharge-weixin">
            <div class="wepay">
              <img src="@/assets/recharge/wepay_logo.png" alt="" srcset="">
            </div>
            <div class="recharge-weixin-right">
              <img :src="codeUrl" alt="" srcset="" class="code">
              <img src="@/assets/recharge/tip.png" alt="" srcset="">
              <div class="action-div">
                <el-button type="primary" @click="racharge(1)">支付成功</el-button>
                <el-button @click="racharge(0)">关闭订单</el-button>
              </div>
            </div>
          </div>

        </div>
      </el-card>
    </transition>

  </div>
</template>
<script>
import QRCode from 'qrcode'

export default {
  name: 'RechargeCreate',
  data() {
    return {
      step: 0,
      money: 1000,
      codeUrl: '',
      order: {
        code_url: '0',
        money: 0,
        out_trade_no: '0',
        orderPrice: '0',
        charge: '0'
      }
    }
  },
  methods: {
    // 输入充值金额充值
    onSubmit() {
      if (!this.money) this.$message('请输入充值金额')
      // this.step = 1
      // this.getQrcode(this.order.code_url)
      this.apiBtn('PaymentOrder', { money: this.money })
        .then((res) => {
          this.step = 1
          this.order.out_trade_no = res.data.orderId
          this.order.code_url = res.data.codeUrl
          this.order.money = res.data.money
          this.order.orderPrice = res.data.orderPrice
          this.order.charge = res.data.charge
          this.getQrcode(this.order.code_url)
        })
    },
    // 扫码支付成功  status 1成功 0关闭
    racharge(status) {
      this.apiBtn('PaymentEnd', { out_trade_no: this.order.out_trade_no, status })
        .then((res) => {
          this.$router.push('/funds/payment')
        })
    },
    // 生成二维码
    getQrcode(link) {
      QRCode.toDataURL(link, { margin: 0 }, (err, url) => {
        if (err) console.error(err)
        this.codeUrl = url
      })
    }
  }

}
</script>
<style lang="scss" scoped>
.form-racharge{
  margin: 30px 0;
}
.recharge-money{
  line-height: 30px;
  font-size: 13.5px;
  .recharge-info{
    background: #efefef;
    .recharge-info-content{
      padding: 30px 20px;
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .recharge-info-right{
        .money{
          font-size: 25px;
        }

      }
    }
  }
  .recharge-weixin{
    padding: 30px 20px;
    display: flex;
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    .wepay{
      width: 250px;
      img{
        width: 100%;
      }

    }
    .recharge-weixin-right{
      width: 210px;
      margin-left: 30px;
      img{
        width: 100%;
        display: block;
        margin: 15px 0;
      }
      .action-div{
        display: flex;
        justify-content: space-between;
      }

    }
  }

}

::v-deep{
  .el-card__body{
    padding: 0;
  }
  .el-input-number .el-input__inner{
    text-align: left;
  }
}
</style>
