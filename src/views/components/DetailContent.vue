<template>
  <div class="person-container detail-popover">
    <div>
      <div class="top-panel">
        <div class="avatar" style="background-image: url(&quot;https://image.qcc.com/person/p6d7e0b8f1d5f085cef08c25afc20309.jpg?x-oss-process=style/person_200&quot;);"></div> 
        <div class="avatar-empty color-1" style="display: none;"></div> 
        <div class="content-container">
          <div class="">
            <a target="_blank" href="https://www.qichacha.com/pl_p6d7e0b8f1d5f085cef08c25afc20309.html" class="peron-link">刘德</a>
          </div>
          <div class="row-item">
            <span class="label-text">企业：</span>
            <span class="content">
              <a target="_blank" href="https://www.qichacha.com/firm_9cce0780ab7644008b73bc2120479d31.html" class="person-link">小米科技有限责任公司</a>
            </span>
          </div>
          <div class="row-item">
            <span class="label-text">职位：</span>
            <span class="content">监事</span>
            </div>
          </div>
          <div style="clear: both;"></div>
      </div> 
      <div class="gap"></div>
      <div class="summary-container">
        <div class="row-item col-item">
          <span class="label-text">担任法人：</span>
          <span class="content">4家</span>
        </div>
        <div class="row-item col-item">
          <span class="label-text">对外投资：</span>
          <span class="content">18家</span>
        </div>
        <div class="row-item col-item">
          <span class="label-text">在外任职：</span>
          <span class="content">113家</span>
        </div>
        <div class="row-item col-item">
          <span class="label-text">控股企业：</span>
          <span class="content">5家</span>
        </div>
      </div>
    </div>
  </div>
  <div class="company-container detail-popover">
    <div>
      <div class="wrap">
        <span class="app-auto-logo logo" style="width: 50px; height: 50px;">
          <img src="https://image.qcc.com/logo/4df48f20fd5c568ec641748320400fcf.jpg?x-oss-process=style/logo_120" alt="成都集善健康科技有限公司" style="width: 50px; height: 50px; border: 1px solid rgb(238, 238, 238); border-radius: 4px;" /> 
        </span> 
        <div class="content-container">
          <div class="title-container">
            <a target="_blank" href="https://www.qichacha.com/firm_4df48f20fd5c568ec641748320400fcf.html" class="company-link">
            成都集善健康科技有限公司
            </a>
            <span class="app-tag nstatus text-warning">存续</span>
          </div> 
          <div class="row-item margin-top-3">
            <span class="app-tag margin-t-4 ntag text-gray">曾用名</span>
            <span class="app-tag margin-t-4 ntag text-ming-qing">天使轮</span>
            <span class="app-tag margin-t-4 ntag text-tech-blue">高新技术企业</span>
            <span class="app-tag margin-t-4 ntag text-blue-violet">猎豹移动</span>
            <span class="app-tag margin-t-4 ntag text-tech-blue">小微企业</span>
          </div> 
          <div class="row-item">
            <span class="label-text">法定代表人：</span> 
            <span class="content">
              <a target="_blank" href="https://www.qichacha.com/pl_pdb3c35733d4e1398319bb6ea1450739.html" class="person-link">孙锋</a>
            </span>
          </div> 
          <div class="row-item">
            <span class="label-text">注册资本：</span>
            <span class="content">200万元人民币</span>
            </div> 
            <div class="row-item">
            <span class="label-text">成立日期：</span> 
            <span class="content">2014-06-09</span>
          </div>
        </div>
        <div style="clear: both;"></div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.person-container {
  position: fixed;
  top: 100px;
  left: 0;
  z-index: 999;
  font-family: "Microsoft YaHei", Arial, sans-serif;
  width: 340px;
  padding: 15px;
  box-shadow: rgb(0 0 0 / 20%) 0px 2px 4px 0px;
  background-color: #fff;
  border-radius: 6px;
  .top-panel {
    position: relative;
    .avatar{
      width: 50px;
      height: 50px;
      background-size: cover;
      float: left;
      border-radius: 8px;
    }
  }
  .avatar-empty {
    width: 50px;
    height: 50px;
    float: left;
    border-radius: 8px;
    text-align: center;
  }
  .avatar-empty.color-1 {
    background-color: #9EB5DE;
  }
  .content-container {
    width: 260px;
  }
  .content-container, .summary-container {
    float: left;
    padding-left: 15px;
    .row-item, .row-item {
      margin-top: 7px;
      .label-text {
        color: #999;
        font-size: 14px;
      }
      .content {
        color: #333;
        font-size: 14px;
      }
    }
  }
  a{
    color: #128BED;
    text-decoration: none;
  }
  .peron-link {
    font-size: 16px;
    word-break: break-all;
  }
  .gap {
    margin-top: 11.5px;
    margin-bottom: 7.5px;
    margin-left: -15px;
    margin-right: -15px;
    height: 5px;
    background: #f6f6f6;
  }
  .summary-container {
    float: unset;
    padding-left: 0;
    .content-container, .summary-container {
      .row-item{
        margin-top: 7px;
      }
    }
    .col-item {
      width: 50%;
      display: inline-block;
    }
  }
}

.company-container{
  position: fixed;
  top: 300px;
  left: 0;
  z-index: 999;
  font-family: "Microsoft YaHei", Arial, sans-serif;
  width: 340px;
  box-shadow: rgb(0 0 0 / 20%) 0px 2px 4px 0px;
  background-color: #fff;
  border-radius: 6px;
  .wrap {
    padding: 15px;
  }
  .app-auto-logo {
    display: inline-block;
    background-size: contain;
    background-position: center center;
    background-repeat: no-repeat;
    position: relative;
    &>img {
    border: solid 1px #f1f1f1;
    object-fit: contain;
    }
  }
  .logo {
    float: left;
  }
  .content-container {
    float: left;
    min-height: 65px;
    padding-left: 15px;
    width: 260px;
    .title-container {
      line-height: 24px;
      vertical-align: middle;
    }
    a {
      color: #128BED;
      text-decoration: none;
    }
    .company-link {
      font-size: 16px;
      word-break: break-all;
    }
    .app-tag {
      margin-top: 4px;
    }
    .nstatus {
      font-weight: normal;
      display: inline-block;
      line-height: 16px;
      font-size: 14px;
      padding: 4px 8px 4px 8px;
      border-radius: 2px;
      border-style: solid;
      border-width: 1px;
      background: #fff;
      user-select: none;
      &.text-success {
        color: #009944;
      }
      &.text-warning {
        color: #ff8900;
      }
    }
    .app-tag.nstatus {
      padding: 0px 8px 0px 8px;
      line-height: 18px;
      font-size: 12px;
      position: relative;
      top: -2px;
    }

    .row-item {
      margin-top: 7px;
      &.margin-top-3 {
        margin-top: 3px;
      }
    }
    .content {
      color: #333;
      font-size: 14px;
    }
  }
  
  .ntag {
    height: 22px;
    font-weight: normal;
    display: inline-block;
    line-height: 14px;
    font-size: 12px;
    padding: 4px 8px 4px 8px;
    margin-right: 4px;
    border-radius: 2px;
    &.text-gray {
      background: #f6f6f6;
    }
    &.text-ming-qing {
      color: #00A3CC;
      background: #DFF3F8;
    }
    &.ntag.text-tech-blue {
      color: #367dff;
      background: #e6efff;
    }
    &.text-blue-violet {
      color: #845FFF;
      background: #F0EBFF;
    }
    &.text-tech-blue {
      color: #367dff;
      background: #e6efff;
    }
  }
}

</style>