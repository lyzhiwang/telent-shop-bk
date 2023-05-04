<template>
  <div class="footer">Copyright 2014-{{years}} 智网网络. All Rights Reserved</div>
</template>

<script>
export default {
  name: 'Footer',
  computed: {
    years () {
      let num = 2023
      let date = new Date()
      if (date.getFullYear()) {
        num = date.getFullYear()
      }
      return num
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/variables.scss";
.footer {
  box-sizing: border-box;
  width: 100%;
  height: 30px;
  line-height: 30px;
  text-align: center;
  background: #F0F2F5;
  font-size: $fontSizeExtraExtraSmall;
  // 浮动底部
  // position: fixed;
  // bottom: 0;
  // right: 0;
}
</style>
