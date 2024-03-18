<template>
    <div class="equity-filter-container nmodal" :class="{ hide : !visiable }" >
    <div class="equity-filter-header">
    筛选
    <span class="ntag vip-n m-l-n-xxs"></span> 
    <a type="button" class="nclose">
      <span class="close-btn" @click="closeWindow()">×</span>
      <!-- <i class="iconfont icon-icon_guanbixx close-btn"></i> -->
    </a>
    </div> 
    <div class="equity-filter-body">
      <div class="section">
        <div class="section-header">
          企业登记状态
          <div class="header-option">
            <a-checkbox :checked="formState.isShowStatus" @change="stateChange(!formState.isShowStatus,'isShowStatus')">是否显示企业状态</a-checkbox>
          </div>
        </div> 
        <div class="main">
          <span class="tag btn-default" :class="formState.status[0] ? 'active' : ''" @click="stateChange(!formState.status[0], 'status', 0)">在业/存续</span>
          <span class="tag btn-default" :class="formState.status[1] ? 'active' : ''" @click="stateChange(!formState.status[1], 'status', 1)">其他状态</span>
        </div>
      </div> 
      <div class="section">
        <div class="section-header">持股</div> 
        <div class="slider-container">
          <a-slider id="itxst" @afterChange="stateChange($event, 'shareholding')" :default-value="0" :min="0" :max="50" />
          <span class="range-value value-0">0</span>
          <span class="range-value value-float">{{
            formState.shareholding ? formState.shareholding + "%" : "未选择"
          }}</span> 
          <span class="range-value value-100">高于50%</span>
        </div>
      </div>
      <div class="section">
        <div class="section-header">对外投资比例</div> 
        <div class="slider-container">
          <a-slider id="itxst" @afterChange="stateChange($event, 'investment')" :default-value="0" :min="0" :max="100" />
          <span class="range-value value-0">0</span>
          <span class="range-value value-float">{{
            formState.investment ? formState.investment + "%" : "未选择"
          }}</span>
          <span class="range-value value-100">100%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref,  reactive, defineProps, defineEmits, defineExpose, toRaw } from 'vue';

defineProps({  visiable: Boolean });
const emit = defineEmits(['update:visiable', 'stateChange'])
const formState = reactive({
  status: [true,true],
  shareholding: 0,
  investment: 0,
  isShowStatus: false
});

/**
 * 关闭
 */
function closeWindow() {
    emit('update:visiable', false);
}

/**
 * 重置状态
 */
 function resetState() {
  formState.status = [true,true];
  formState.shareholding = 0;
  formState.investment = 0;
  formState.isShowStatus = false;
}
function stateChange(value, field, index) {
  if(field === 'status') {
    formState[field][index] = value;
  } else {
    formState[field] = value;
  }
  emit('stateChange', toRaw(formState))
}
defineExpose({
  resetState
})
</script>


<style scoped lang="scss">

.equity-filter-container{
  font-family: "Microsoft YaHei", Arial, sans-serif;
  width: 450px;
  height: 350px;
  box-shadow: rgb(0 0 0 / 20%) 0px 2px 4px 0px;
  background-color: #fff;
  position: absolute;
  z-index: 20;
  right: 70px;
  bottom: 100px;
  overflow: hidden;
  background-size: 360px 280px;
  line-height: 1.2;
  .equity-filter-header {
    position: relative;
    height: 56px;
    color: #333;
    font-size: 16px;
    line-height: 56px;
    padding: 0 15px;
    border-bottom: 1px solid #eeeeee;
    font-weight: bold;
  }
  



  .equity-filter-body {
    padding: 0 15px;
    .section {
      padding-top: 20px;
      .section-header {
        color: #666;
        font-size: 14px;
        position: relative;
        .header-option {
          float: right;
          position: relative;
          input {
            position: relative;
            top: 1px;
            cursor: pointer;
          }
        }
      }
      .main {
        width: 100%;
        overflow: hidden;
        .tag {
          box-sizing: border-box;
          font-size: 12px;
          text-align: center;
          line-height: 31px;
          float: left;
          display: block;
          cursor: pointer;
          width: 17.4%;
          height: 32px;
          border-radius: 2px;
          border: 1px solid #d6d6d6;
          margin-right: 15px;
          margin-top: 15px;
        }
        .tag.active {
          color: #128BED !important;
          border-color: #128BED !important;
        }
      }
      .slider-container {
        position: relative;
        margin-top: 15px;
        width: 400px;
        .ant-slider {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          color: #333333;
          font-size: 14px;
          font-variant: tabular-nums;
          line-height: 1.5;
          list-style: none;
          font-feature-settings: 'tnum';
          position: relative;
          height: 12px;
          margin: 14px 6px 10px;
          padding: 4px 0;
          cursor: pointer;
          touch-action: none;
          margin-left: 0;
          margin-right: 0;
          .ant-slider-handle {
            position: absolute;
            width: 14px;
            height: 14px;
            margin-top: -5px;
            background-color: #fff;
            border: solid 2px #8fd8ff;
            border-radius: 50%;
            box-shadow: 0;
            cursor: pointer;
            transition: border-color 0.3s, box-shadow 0.6s, transform 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
            border-color: #128bed;
          }
        }
        .range-value {
          color: #999;
          font-size: 14px;
          display: inline-block;
        }
        .range-value.value-float {
          position: absolute;
          color: #128BED;
          left: 50%;
          transform: translate(-50%, 0);
        }
        .range-value.value-100 {
          float: right;
        }
      }
    }
  }
}

.nmodal {

&.hide {
   display: none;
}

  .nclose {
    color: #128bed;
    float: right;
    width: 22px;
    height: 22px;
    background-size: 22px 22px;
    font-weight: normal;
    background: none;
    .close-btn {
      font-size: 36px;
      color: #bbb;
    }
  }
}
</style>