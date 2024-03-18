<template>
<div class="collapse-main">
  <div class="left">
    <div class="left">
      <!-- 股东信息 -->
      <div>
        <div class="rule-btn rule-btn-radius" :class="[activeIndex == 0 ? 'active' : '',]" @click="clickTab(0)">股东信息</div>
        <div class="filter-panel gd-filter">
          <div v-if="activeIndex == 0" translate="">
            <div class="single-filter">
              <a-space>
                <a-select
                  ref="select"
                  v-model:value="obj.gdtype"
                  style="width: 130px"
                  @change="handleChange"
                >
                  <a-select-option v-for="item in menuList[0].subItems[0].children" :key="item.name" :value="item.name">{{ item.name + item.tips }}</a-select-option>
                </a-select>
              </a-space>
            </div>
            <div class="single-filter">
              <a-space>
                <a-select
                  ref="select"
                  v-model:value="obj.gdratio"
                  style="width: 130px"
                  @change="handleChange"
                >
                  <a-select-option v-for="item in menuList[0].subItems[1].children" :key="item.name" :value="item.name">{{ item.name + item.tips }}</a-select-option>
                </a-select>
              </a-space>
            </div>
          </div>
        </div>
      </div>
      <!-- 对外投资 -->
      <div>
        <div class="rule-btn rule-btn-radius" :class="[activeIndex == 1 ? 'active' : '',]" @click="clickTab(1)">对外投资</div>
        <div class="filter-panel gd-filter">
          <div v-if="activeIndex == 1" translate="">
            <div class="single-filter">
              <a-space>
                <a-select
                  ref="select"
                  v-model:value="obj.tztype"
                  style="width: 130px"
                  @change="handleChange"
                >
                  <a-select-option v-for="item in menuList[1].subItems[0].children" :key="item.name" :value="item.name">{{ item.name + item.tips }}</a-select-option>
                </a-select>
              </a-space>
            </div>
            <div class="single-filter">
              <a-space>
                <a-select
                  ref="select"
                  v-model:value="obj.tzratio"
                  style="width: 130px"
                  @change="handleChange"
                >
                  <a-select-option v-for="item in menuList[1].subItems[1].children" :key="item.name" :value="item.name">{{ item.name + item.tips }}</a-select-option>
                </a-select>
              </a-space>
            </div>
          </div>
        </div>
      </div>
      <!-- 历史股东信息 -->
      <div>
        <div class="rule-btn rule-btn-radius" :class="[activeIndex == 2 ? 'active' : '',]" @click="clickTab(2)">历史股东信息</div>
      </div>
      
    </div>
  </div>
</div>

</template>
<script setup>
import { reactive, ref } from 'vue';
const emit = defineEmits(['clickTab', 'searchData'])
const activeIndex = ref(0);
const obj = reactive({
  gdtype: '全部类型',
  gdratio: '持股比例不限',
  tztype: '全部类型',
  tzratio: '持股比例不限',
  current: 0
})
const menuList = ref([])
menuList.value = [
  {
    title: '股东信息', subItems:
    [
      {
        name: '全部类型', type: 'type', children: [{ name: '全部类型', tips: '' }, { name: '自然人股东', tips: '' }, { name: '企业法人', tips: '' }, { name: '法人股东', tips: '' }, { name: '外国(地区)企业', tips: '' }]
      },
      {
        name: '持股比例不限', type: 'ratio', children: [{ name: '持股比例不限', tips: '' }, { name: '5%以上', tips: '' }, { name: '25%以上', tips: '(超过25%的为最终受益人)' }, { name: '50%以上', tips: '' }, { name: '90%以上', tips: '' }]
      }
    ]
  },
  {
    title: '对外投资', subItems:
    [
      {
        name: '控股类型不限', type: 'type', children: [{ name: '控股类型不限', tips: '' }, { name: '控股', tips: '' }, { name: '非控股', tips: '' }]
      },
      {
        name: '持股比例不限', type: 'ratio', children: [{ name: '持股比例不限', tips: '' }, { name: '100%', tips: '' }, { name: '66.66%以上', tips: '' }, { name: '50%以上', tips: '' }, { name: '20%以上', tips: '' }, { name: '5%以上', tips: '' }, { name: '不到5%', tips: '' }]
      }
    ]
  },
  {
    title: '历史股东信息', subItems:null
  }
]

const clickTab = (active) => {
  activeIndex.value = active
  emit('clickTab')
}

const handleChange = () => {
  obj.current = activeIndex.value
  emit('searchData', obj)
}

</script>

<style lang="scss" scoped>
.collapse-main{
  position: fixed;
  left: 30px;
  top: 156px;
  display: inline-block;
  z-index: 1;
  border-radius: 2px;
  border-left: 1px solid #eee;
  border-right: 1px solid #eee;
  border-top: 1px solid #eee;
  .left {
    .rule-btn {
      width: 130px;
      height: 40px;
      line-height: 40px;
      color: #333;
      background-color: #fff;
      text-align: center;
      cursor: pointer;
      font-weight: bold;
      border-bottom: 1px solid #eee;
    }
    .rule-btn.active {
      color: #fff;
      border: 1px solid #128bed;
      background-color: #128bed;
    }
  }
  .single-filter {
    position: relative;
    background-color: #fafafa;
    .value {
      font-weight: 400;
      position: relative;
      width: 130px;
      height: 40px;
      line-height: 40px;
      color: #808080;
      background-color: #fff;
      text-align: center;
      cursor: pointer;
      border-radius: 2px;
      border-bottom: 1px solid #eee;
      .rotate{
        transform: rotate(180deg);
        transition: transform .2s;
      }
    }
    .caret {
      position: relative;
      top: -2px;
      margin-left: 4px;
    }
    .option {
      position: absolute;
      left: 0;
      top: 34px;
      min-width: 130px;
      background-color: #fff;
      box-shadow: 0 2px 8px rgb(0 0 0 / 15%);
      border-radius: 4px;
      z-index: 1;
      div {
        display: block;
        padding: 5px 12px;
        overflow: hidden;
        color: rgba(0,0,0,0.65);
        font-weight: 400;
        font-size: 14px;
        line-height: 22px;
        white-space: nowrap;
        text-overflow: ellipsis;
        cursor: pointer;
      }
      .active {
        background-color: #fafafa;
        color: #128bed;
      }
    }
  }
  .filter-panel{
    height: unset;
    transition: all 0.3s linear;
    will-change: height;
 
    &.up {
      height: 0;
    }
    &.down {
      height: 80px;
    }
  }
}
.caret {
  display: inline-block;
  width: 0;
  height: 0;
  margin-left: 2px;
  vertical-align: middle;
  border-top: 4px dashed;
  border-right: 4px solid transparent;
  border-left: 4px solid transparent;
}
::v-deep .ant-select:not(.ant-select-customize-input) .ant-select-selector{
  border: none;
  border-bottom: 1px solid #eee;
  padding: 0 11px 0 0;
  text-align: center;
}
</style>