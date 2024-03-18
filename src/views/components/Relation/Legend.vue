<template>
  <div class="relation-legend">
    <div class="legend">
      <div>
        <span class="fa iconfont icon-luyin" style="color: rgb(255, 158, 0);"></span>
        <span>当前节点</span>
      </div>
      <div>
        <span class="fa iconfont icon-luyin" style="color: rgb(78, 162, 240);"></span>
        <span>企业</span>
      </div>
      <div>
        <span class="fa iconfont icon-luyin" style="color: rgb(255, 96, 96);"></span>
        <span>人员</span>
      </div>
      <div>
        <span class="fa iconfont icon-jiantou_xiangyou" style="color: rgb(255, 96, 96);"></span>
        <span>投资</span>
      </div>
      <div>
        <span class="fa iconfont icon-jiantou_xiangyou" style="color: rgb(78, 162, 240);"></span>
        <span>任职</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.relation-legend{
  width: 100vw;
  height: 30px;
  position: absolute;
  bottom: 0px;
  background: #fff;
  z-index: 9;
  .legend{
    margin: 0px auto;
    width: 460px;
    line-height: 30px;
    .fa {
      display: inline-block;
      font: normal normal normal 14px/1 FontAwesome;
      font-size: inherit;
      text-rendering: auto;
      -webkit-font-smoothing: antialiased;
    }
    div{
      display: inline-block;
      margin-left: 30px;
    }
  }
}
</style>
