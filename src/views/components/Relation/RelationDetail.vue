<template>
<div class="ant-modal-root" :class="{ hide: !currentNode }">
  <!-- 实体节点 -->
  <div v-if="currentNode && currentNode.type !== 'P'" tabindex="-1" role="dialog" aria-labelledby="rcDialogTitle0" class="ant-modal-wrapmain">
    <div role="document" class="ant-modal">
      <div tabindex="0" aria-hidden="true" style="width: 0px; height: 0px; overflow: hidden;"></div>
      <div class="ant-modal-content">
        <button type="button" aria-label="Close" class="ant-modal-close" @click="closeWindow()">
          <span class="ant-modal-close-x">
            <i aria-label="icon: close" class="anticon anticon-close ant-modal-close-icon">
              <svg viewBox="64 64 896 896" data-icon="close" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false" class="">
                <path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path>
              </svg>
            </i>
          </span>
        </button>
        <div class="ant-modal-header detail-title">公司信息</div>
        <div class="ant-modal-header">
          <div class="ant-modal-title">
            <div class="company-header-info">
              <div class="company-header-info-name">
                <span>{{ currentNode.name }}</span>
                <span class="company-hearer-info-state">存续（在营、开业、在册）</span>
                <span class="ant-modal-add">
                  <i aria-label="icon: add" class="anticon anticon-add ant-modal-add-icon">
                    <svg t="1675235595985" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="25449" width="16" height="16">
                      <path d="M600.777 743.564h246.768v48H600.777z" p-id="25450" fill="#008bf8"></path>
                      <path d="M700.161 644.181h48v246.768h-48z" p-id="25451" fill="#008bf8"></path>
                      <path d="M433.969 893.734H242.126c-48.61 0-88.158-39.547-88.158-88.157V229.892c0-48.61 39.547-88.157 88.158-88.157h480.685c48.61 0 88.157 39.547 88.157 88.157v227.843c0 13.255-10.745 24-24 24s-24-10.745-24-24V229.892c0-22.143-18.015-40.157-40.157-40.157H242.126c-22.143 0-40.158 18.015-40.158 40.157v575.685c0 22.143 18.015 40.157 40.158 40.157h191.842c13.255 0 24 10.745 24 24s-10.744 24-23.999 24z" p-id="25452" fill="#008bf8"></path>
                      <path d="M305.969 301.735h368.71v48h-368.71zM305.969 493.734h246.768v48H305.969z" p-id="25453" fill="#008bf8"></path>
                    </svg>
                  </i>
                  找关系
                </span>
              </div>
              <div class="company-header-info-item">
                <span class="company-header-info-item-key">法定代表人：</span>
                <span class="company-header-info-item-value">刘斌</span>
              </div> 
              <div class="company-header-info-item">
                <span class="company-header-info-item-key">注册资本：</span>
                <span class="company-header-info-item-value">210 万人民币</span>
              </div>
              <div class="company-header-info-item">
                <span class="company-header-info-item-key">成立日期：</span>
                <span class="company-header-info-item-value">2009-12-30</span>
              </div>
              <div class="company-header-info-item">
                <span class="company-header-info-item-key">行业领域：</span>
                <span class="company-header-info-item-value">其他技术推广服务</span>
              </div>
            </div>
          </div>
        </div>
        <div class="ant-modal-body">
          <div class="company-info">
            <van-tabs v-model:active="activeName" color="#ee0a24">
              <van-tab title="股东" name="1">
                <div class="company-info-tab">
                  <a-table :dataSource="dataSource" :columns="columns" bordered :pagination="false" />
                </div>
              </van-tab>
              <van-tab title="投资" name="2">
                <div class="company-info-tab">
                  <a-table :dataSource="dataSource" :columns="columns" bordered :pagination="false" />
                </div>
              </van-tab>
              <van-tab title="主要人员" name="3">
                <div class="company-info-tab">
                  <a-table :dataSource="dataSource" :columns="columns" bordered :pagination="false" />
                </div>
              </van-tab>
            </van-tabs>
          </div>
        </div>
      </div>
      <div tabindex="0" aria-hidden="true" style="width: 0px; height: 0px; overflow: hidden;">
      </div>
    </div>
  </div>
  <!-- 自然人节点 -->
  <div v-else-if="currentNode && currentNode.type == 'P'" tabindex="-1" role="dialog" aria-labelledby="rcDialogTitle0" class="ant-modal-wrapmain">
    <div role="document" class="ant-modal">
      <div tabindex="0" aria-hidden="true" style="width: 0px; height: 0px; overflow: hidden;"></div>
      <div class="ant-modal-content">
        <button type="button" aria-label="Close" class="ant-modal-close" @click="closeWindow()">
          <span class="ant-modal-close-x">
            <i aria-label="icon: close" class="anticon anticon-close ant-modal-close-icon">
              <svg viewBox="64 64 896 896" data-icon="close" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false" class="">
                <path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path>
              </svg>
            </i>
          </span>
        </button>
        <div class="ant-modal-header">{{ currentNode.name }}</div>
        <div class="ant-modal-header">
          <div class="ant-modal-title">
            <div class="person-header-logo clearfix">
                <span class="large-logo enterprise">{{ currentNode.name[0] }}</span>
            </div>
            <div class="person-header-info">
              <div class="person-header-info-item">
                <span class="person-header-info-item-key">合作伙伴：</span>
                <span class="person-header-info-item-value">黎万强、刘德、洪峰、许达来、刘芹</span>
              </div>
            </div>
          </div>
          <div class="person-header-introduce">
            <div style="max-height: 64px; overflow-y:auto">
              <span class="person-header-info-item-key">简介：</span>
              <span class="person-header-info-item-value">功能维护中功能维护中功能维护中功能维护中功能维护中功能维护中功能维护中功能维护中功能维护中功能维护中功能维护中功能维护中功能维护中功能维护中功能维护中功能维护中功能维护中功能维护中功能维护中功能维护中功能维护中功能维护中</span>
            </div>
          </div>
        </div>
        <div class="ant-modal-body">
          <div class="company-info">
            <van-tabs v-model:active="activeName" color="#ee0a24">
              <van-tab title="担任法人" name="1">
                <div class="company-info-tab">
                  <a-table :dataSource="dataSource" :columns="legalPersonHeader" bordered :pagination="false" />
                </div>
              </van-tab>
              <van-tab title="担任股东" name="2">
                <div class="company-info-tab">
                  <a-table :dataSource="dataSource" :columns="legalPersonHeader" bordered :pagination="false" />
                </div>
              </van-tab>
              <van-tab title="担任高管" name="3">
                <div class="company-info-tab">
                  <a-table :dataSource="dataSource" :columns="seniorExecutiveHeader" bordered :pagination="false" />
                </div>
              </van-tab>
            </van-tabs>
          </div>
        </div>
      </div>
      <div tabindex="0" aria-hidden="true" style="width: 0px; height: 0px; overflow: hidden;">
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
import {
  ref,
  reactive,
  computed,
  defineProps,
  defineEmits,
  defineExpose,
  onMounted
} from "vue";
import store from "../../../store";
const currentNode = computed(() => store.state.currentNode)
const activeName = ref('1')
const dataSource = reactive([
  {
    key: '1',
    name: '胡彦斌',
    shareRatio: 32,
    company: '小米影业有限责任公司',
    ziben: '1500万元人民币',
    state: '存续',
    zhiwei: '负责人'
  },
          {
            key: '2',
            name: '胡彦祖',
            shareRatio: 42,
            company: '小米影业有限责任公司',
            ziben: '1500万元人民币',
            state: '存续',
            zhiwei: '负责人'
          },
          {
            key: '3',
            name: '胡彦祖',
            shareRatio: 42,
            company: '小米影业有限责任公司',
            ziben: '1500万元人民币',
            state: '存续',
            zhiwei: '负责人'
          },
          {
            key: '4',
            name: '胡彦祖',
            shareRatio: 42,
            company: '小米影业有限责任公司',
            ziben: '1500万元人民币',
            state: '存续',
            zhiwei: '负责人'
          },
          {
            key: '5',
            name: '胡彦祖',
            shareRatio: 42,
            company: '小米影业有限责任公司',
            ziben: '1500万元人民币',
            state: '存续',
            zhiwei: '负责人'
          }
        ]);

       const columns = reactive([
          {
            title: '姓名/企业名称',
            dataIndex: 'name',
            key: 'name',
          },
          {
            title: '股比',
            dataIndex: 'shareRatio',
            key: 'shareRatio',
          },
      ])
      // 担任法人、股东
      const legalPersonHeader = reactive([
        {
          title: '企业名称',
          dataIndex: 'company',
          key: 'company',
        },
        {
          title: '注册资本',
          dataIndex: 'ziben',
          key: 'ziben',
        },
        {
          title: '经营状态',
          dataIndex: 'state',
          key: 'state',
        },
      ])
      
      // 担任高管
      const seniorExecutiveHeader = reactive([
        {
          title: '企业名称',
          dataIndex: 'company',
          key: 'company',
        },
        {
          title: '注册资本',
          dataIndex: 'ziben',
          key: 'ziben',
        },
        {
          title: '职位',
          dataIndex: 'zhiwei',
          key: 'zhiwei',
        },
      ])
      
/**
 * 关闭
 */
function closeWindow() {
  store.commit('setCurrentNode', null)
}
</script>
<style lang="scss" scoped>
::v-deep .ant-table-tbody > tr.ant-table-row:hover > td, .ant-table-tbody > tr > td.ant-table-cell-row-hover{
  background: #e6f5ff;

}
.ant-modal-root {
  user-select: none;
   &.hide {
    display: none;
  }
}
.ant-modal-wrapmain{
  position: fixed;
  top: 105px;
  left: 0;
  width: 350px;
  z-index: 1001;
  box-shadow: rgb(0 0 0 / 20%) 0px 2px 4px 0px;
  background-color: #fff;
  z-index: 999;
  .ant-modal {
    box-sizing: border-box;
    color: rgba(0,0,0,.65);
    font-size: 14px;
    font-variant: tabular-nums;
    line-height: 1.5;
    list-style: none;
    -webkit-font-feature-settings: "tnum";
    font-feature-settings: "tnum";
    position: relative;
    top: 100px;
    width: auto;
    margin: 0 auto;
    padding: 0 0 24px;
    pointer-events: none;
    width: 350px;
    top: auto;
    padding-bottom: 0;
  }
  .ant-modal-content {
    position: relative;
    background-color: #f5f5f5;
    background-clip: padding-box;
    border: 0;
    border-radius: 4px;
    pointer-events: auto;
    box-shadow: 0 2px 7px 0 hsl(0deg 0% 61% / 50%);
  }
  .ant-modal-header {
    padding: 15px;
    color: rgba(0,0,0,.65);
    background: #fff;
    border-bottom: 1px solid #e8e8e8;
    border-radius: 4px 4px 0 0;
    
  }
  .detail-title{
    color: #333;
    font-size: 16px;
    line-height: 1;
  }
  .ant-modal-title {
    margin: 0;
    color: rgba(0,0,0,.85);
    font-weight: 500;
    font-size: 16px;
    line-height: 22px;
    word-wrap: break-word;
    .person-header-logo {
      float: left;
    }
  }
  .company-header-info {
    font-size: 16px;
  }
  .company-hearer-info-state{
    font-size: 12px;
    color: #999;
    background: #f5f5f5;
    padding: 4px 5px;
    margin: 0 5px;
  }
  .person-header-info {
    padding-left: 50px;
    font-size: 16px;
  }
  .company-header-info-name {
    margin-bottom: 10px;
  }
  .person-header-info-name {
    max-width: 240px;
    margin-bottom: 3px;
  }
  a {
    color: #1578f0;
    text-decoration: none;
    background-color: rgba(0,0,0,0);
    outline: none;
    cursor: pointer;
    -webkit-transition: color .3s;
    -o-transition: color .3s;
    transition: color .3s;
    -webkit-text-decoration-skip: objects;
    touch-action: manipulation;
  }
  .company-header-info-item {
    font-size: 14px;
    color: #999;
    border-top: 1px solid #e8e8e8;
    padding: 8px 0;
    color: #333;
  }
  .company-header-info-item-key{
    width: 100px;
    display: inline-block;
  }
  .person-header-info-item{
    font-size: 14px;
    color: #333;
  }
  .person-header-info-item-key{
    color: #111;
  }
  .person-header-introduce{
    border-top: 1px solid #e8e8e8;
    margin-top: 10px;
    padding-top: 10px;
  }
  .ant-modal-body {
    padding: 0;
    font-size: 14px;
    line-height: 1.5;
    word-wrap: break-word;
    .company-info {
      margin-top: 10px;
      background: #fff;
      .company-info-tab {
        max-height: 200px;
        padding: 10px 15px;
        overflow-y: auto;
      }
    }
  }
  .ant-modal-close-x {
    display: block;
    width: 47px;
    height: 47px;
    font-size: 16px;
    font-style: normal;
    line-height: 47px;
    text-align: center;
    text-transform: none;
    text-rendering: auto;
  }
  .ant-modal-add{
    color: #008bf8;
    font-size: 12px;
    display: inline-block;
    line-height: 16px;
    cursor: pointer;
  }
}
.clearfix:before {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both;
}
.enterprise {
  background-color: #467fd7;
}
.person {
  background-color: #7686dd;
}
.large-logo.enterprise, .large-logo.person {
  width: 40px;
  height: 40px;
  border-radius: 2px;
  font-size: 14px;
  color: #fff;
  display: inline-block;
  text-align: center;
}
.large-logo.enterprise {
  line-height: 40px;
}
</style>