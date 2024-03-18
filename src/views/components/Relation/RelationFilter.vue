<template>
  <div class="equity-filter-container nmodal" :class="{ hide: !visiable }">
    <div class="equity-filter-header">
      筛选
      <span class="ntag vip-n m-l-n-xxs"></span>
      <a type="button" class="nclose">
        <span class="close-btn" @click="closeWindow()">×</span>
        <!-- <i class="iconfont icon-icon_guanbixx close-btn"></i> -->
      </a>
    </div>

    <div class="equity-filter-body">
      <a-form>
        <a-form-item label="层级">
          <span class="ant-btn2" :class="formState.layer == 0 ? 'active' : ''" @click="stateChange(0, 'layer')">全部</span>
          <span class="ant-btn2" :class="formState.layer == 1 ? 'active' : ''" @click="stateChange(1, 'layer')">一层</span>
          <span class="ant-btn2" :class="formState.layer == 2 ? 'active' : ''" @click="stateChange(2, 'layer')">二层</span>
        </a-form-item>
        <a-form-item label="状态">
          <span class="ant-btn2" :class="formState.status == 0 ? 'active' : ''" @click="stateChange(0, 'status')">全部</span>
          <span class="ant-btn2" :class="formState.status == 1 ? 'active' : ''" @click="stateChange(1, 'status')">吊销</span>
          <span class="ant-btn2" :class="formState.status == 2 ? 'active' : ''" @click="stateChange(2, 'status')">注销</span>
          <span class="ant-btn2" :class="formState.status == 3 ? 'active' : ''" @click="stateChange(3, 'status')">存续</span>
        </a-form-item>
        <a-form-item label="持股">
          <a-slider
            :default-value="0"
            :min="0"
            :max="100"
            v-model:value="formState.shareholding"
            @afterChange="stateChange($event, 'shareholding')"
          />
          <span class="range-value value-0">0</span>
          <span class="range-value value-float">{{
            formState.shareholding ? formState.shareholding + "%" : "未选择"
          }}</span>
          <span class="range-value value-100">100%</span>
        </a-form-item>
        <a-form-item label="关系">
          <span class="ant-btn2" :class="formState.relation == 0 ? 'active' : ''" @click="stateChange(0, 'relation')">全部</span>
          <span class="ant-btn2" :class="formState.relation == 1 ? 'active' : ''" @click="stateChange(1, 'relation')">直接投资</span>
          <span class="ant-btn2" :class="formState.relation == 2 ? 'active' : ''" @click="stateChange(2, 'relation')">股东投资</span>
          <span class="ant-btn2" :class="formState.relation == 3 ? 'active' : ''" @click="stateChange(3, 'relation')">董监高法投资</span>
        </a-form-item>
      </a-form>
    </div>

    <div class="list">
      <div class="ma_search-group input-group">
        <a-input class="input" v-model:value="currentSearchText" placeholder="请输入您想查询的公司/个人" >
          <template #suffix>
            <span v-if="currentSearchText" class="close-btn"  @click="clearSearchText">×</span>
          </template>
        </a-input>
        <a-button type="primary" :disabled="!currentSelectedId" @click="focusSelected">{{ searchButtonText }}</a-button>
      </div>
      <div>
        
          <div class="ma_items-container">
              
<div v-for="(item,index) in list" :key="item.id" class="ma_item">
  <div class="ma_item-top">
    <a-checkbox @change="checkboxChange" :value="item.id" v-model:checked="item.checked"></a-checkbox>
    <img
      alt="company"
      src="https://image.qcc.com/logo/fa902aeb2eab4ef9b9fcd1ef109ec54a.jpg?x-oss-process=style/logo_120"
      onerror="this.src='//qcc-static.qcc.com/resources/web/omaterial/company.jpeg'"
    />
    <!---->
    <div class="block" @click="selected(item)">
      <span class="ma_name">{{index+1}}. {{ item.name }}</span>
      <!---->
      <span v-if="item.status" class="ma_tag ntag text-success tooltip-br">{{ item.status }}</span>
    </div>
  </div>
</div>

          </div>
        
        
      </div>
      <!---->
      <!---->
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  defineProps,
  defineEmits,
  defineExpose,
  toRaw,
  computed
} from "vue";

const props = defineProps({
  visiable: Boolean,
  data: Array
});
const emit = defineEmits(['update:visiable', 'stateChange', 'focusSelected', 'resetState', 'checkboxChange']);
const formState = reactive({
  layer: 0,
  status: 0,
  shareholding: 0,
  relation: 0,
});
const currentSearchText = ref('');
const currentSelectedId = ref(0);
const searchButtonText = ref('聚焦')


const list = computed(() => {
    return !currentSearchText.value ?
    props.data : 
    props.data.filter(a => a.name.indexOf(currentSearchText.value) >=0)
})

function selected(item) {
  _resetState()
  currentSearchText.value = item.name
  currentSelectedId.value = item.id 
}


function clearSearchText() {
  currentSearchText.value = ''
  currentSelectedId.value = 0
  searchButtonText.value = '聚焦';
}

/**
 * 
 */
function checkboxChange(e) {
  _resetState()
  emit('checkboxChange', )
}

/**
 * 聚焦
 */
function focusSelected() {
  if( searchButtonText.value === '取消') {
    clearSearchText()
  } else {
    searchButtonText.value = '取消';
  } 
  emit('focusSelected', toRaw(currentSelectedId.value))
}

/**
 * 关闭
 */
function closeWindow() {
  emit("update:visiable", false);
}

/**
 * 
 */
function stateChange(value, field) {
  formState[field] = value;

  const checked = new Set();
  props.data.forEach(a => {
     a.checked && checked.add(a.id)
  });

  emit('stateChange', Object.assign(toRaw(formState), {
      checked
  }))
}

/**
 * 重置状态
 */
function resetState() {
  formState.layer = 0;
  formState.status = 0;
  formState.shareholding = 0;
  formState.relation = 0;
}

function _resetState() {
  resetState()
  const checked = new Set();
  props.data.forEach(a => {
     a.checked && checked.add(a.id)
  });
  
  emit('resetState', Object.assign(toRaw(formState), {
      checked
  }))
}

defineExpose({
  resetState
})
</script>


<style scoped lang="scss">
.equity-filter-container {
  font-family: "Microsoft YaHei", Arial, sans-serif;
  width: 500px;
  height: 600px;
  box-shadow: rgb(0 0 0 / 20%) 0px 2px 4px 0px;
  border-radius: 5px;
  background-color: #fff;
  position: absolute;
  z-index: 20;
  right: 70px;
  bottom: 50px;
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
    padding: 15px 15px 0;

    .ant-btn2 {
      margin-left: 10px;
      line-height: 1.5715;
      position: relative;
      display: inline-block;
      font-weight: 400;
      white-space: nowrap;
      text-align: center;
      background-image: none;
      border: 1px solid transparent;
      box-shadow: 0 2px 0 rgb(0 0 0 / 2%);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      -webkit-user-select: none;
      -moz-user-select: none;
      user-select: none;
      touch-action: manipulation;
      height: 32px;
      padding: 4px 15px;
      font-size: 14px;
      border-radius: 2px;
      color: rgba(0, 0, 0, 0.85);
      border-color: #d9d9d9;
      background: #fff;

      &:not([disabled]).active {
        outline: 0;
        box-shadow: none;
      }

      &.active {
        text-decoration: none;
        color: #128bed;
        border-color: #128bed;
        background: #fff;
      }
    }
  }
  .range-value {
    color: #999;
    font-size: 14px;
    display: inline-block;
  }
  .range-value.value-float {
    position: absolute;
    // color: #128bed;
    left: 50%;
    transform: translate(-50%, 0);
  }
  .range-value.value-100 {
    float: right;
  }
}

.list {
  width: 500px;
  height: 600px;
  border-top: 10px solid #eee;

  .close-btn {
      cursor: pointer;
      // color: #bbb;
    }

  .ma_search-group {
    display: flex;
    justify-content: space-between;
    padding: 20px 20px 0;

    .input {
      width: 380px;
    }

    // .button {
    //   background: #ccc;
    //   color: #fff;
    // }
  }

  .ma_items-container {
    height: 200px;
    overflow-y: auto;
  }
  .ma_item {
    cursor: pointer;
    color: #333333;

    &:hover {
      background-color: #F3F9FD;
      color: #128BED;
    }

    .ma_item-top {
      display: flex;
      align-items: center;
      padding: 0 15px;
      height: 60px;

      .block {
        display: flex;
        align-items: center;
        width: 400px;
        height: 100%;
      }

      img {
        width: 30px;
        height: 30px;
        display: block;
        border-radius: 3px;
        float: left;
        // border: 1px solid #eee;
        object-fit: contain;
      }
      .ma_name {
        font-size: 14px;
        max-width: 300px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        height: 32px;
        line-height: 32px;
        margin-left: 10px;
        float: left;
      }
      .ma_tag {
        padding: 2px 5px;
        font-size: 12px;
        margin-left: 5px;
      }
      .ntag.text-success {
        color: #00ad65;
        background: #e3f6ee;
      }
      .ma_arrow {
        font-size: 14px;
        color: #666666;
        float: right;
        cursor: pointer;
        position: absolute;
        right: 15px;
        top: 50%;
        transform: translate(0, -50%);
      }
    }
  }
}

.nmodal {
  &.hide {
    display: none;
    // background: red;
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
      cursor: pointer;
      font-size: 36px;
      // color: #bbb;
    }
  }
}
:deep {
  .ant-checkbox-wrapper {
    margin-right: 10px;
  }
}
</style>