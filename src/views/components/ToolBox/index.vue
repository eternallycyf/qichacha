<template>
  <div class="toolbox">
    <ul class="mao-title breadcrumb">      

      <li v-if="hasButon(Buttons.FILTER)" :class="isShowFilter ? 'active': ''" @click="showFilter">
        <div class="icon"><span class="iconfont icon-liebiao"></span></div>
        <div class="text">筛选</div>
      </li>
      <li v-if="hasButon(Buttons.ABBREVIATE)" :class="isShowSimple ? 'active': ''" @click="showSimple">
        <div class="icon"><span class="iconfont icon-zitiyanse"></span></div>
        <div class="text">简称</div>
      </li>

      <li v-if="hasButon(Buttons.TEMPLATE)" :class="isShowTemplate ? 'active': ''" @click="openTemplate(true)">
        <div class="icon"><span class="iconfont icon-liebiao"></span></div>
        <div class="text">模板</div>
      </li>

      <!-- 关联方认定图 -->
      <li v-if="hasButon(Buttons.SEARCH)" :class="isShowSearch ? 'active': ''" @click="showSearch">
        <div class="icon"><span class="iconfont icon-sousuo"></span></div>
        <div class="text">搜索</div>
      </li>
      
      <li v-if="hasButon(Buttons.WRITTENWORDS)" :class="isShowWords ? 'active': ''" @click="wordsFilter">
        <div class="icon"><span class="iconfont icon-zitiyanse"></span></div>
        <div class="text">文字</div>
      </li>

      <li v-if="hasButon(Buttons.EDIT)" :class="isShowEdit ? 'active': ''" @click="showEdit">
        <div class="icon"><span class="iconfont icon-sousuo"></span></div>
        <div class="text">编辑</div>
      </li>

      <!-- 股权结构图谱 -->
      <template v-if="hasButon(Buttons.OPENNODE)">
        <li v-if="!isShowOpen" @click="toggleOpenAll">
        <div class="icon"><span class="iconfont icon-plus-square"></span></div>
        <div class="text">展开</div>
      </li>
      <li v-if="isShowOpen" @click="toggleOpenAll">
        <div class="icon"><span class="iconfont icon-minus-square"></span></div>
        <div class="text">收起</div>
      </li>
      </template>

      <li v-if="hasButon(Buttons.ZOOMIN)" @click="maoScale(1)">
        <div class="icon"><span class="iconfont icon-fangda"></span></div>
        <div class="text">放大</div>
      </li>
      <li v-if="hasButon(Buttons.ZOOMOUT)" @click="maoScale(-1)">
        <div class="icon"><span class="iconfont icon-suoxiao"></span></div>
        <div class="text">缩小</div>
      </li>
      <li v-if="hasButon(Buttons.REFRESH)" @click="refresh">
        <div class="icon"><span class="iconfont icon-shuaxin"></span></div>
        <div class="text">刷新</div>
      </li>
      <template v-if="hasButon(Buttons.FULLSCREEN)">
        <li v-if="!isFullscreen" @click="toggleFullScreen">
        <div class="icon"><span class="iconfont icon-quanping"></span></div>
        <div class="text">全屏</div>
      </li>
      <li v-if="isFullscreen" @click="toggleFullScreen">
        <div class="icon"><span class="iconfont icon-tuichuquanping"></span></div>
        <div class="text">退出</div>
      </li>
      </template>
      
      <li v-if="hasButon(Buttons.SAVE)" @click="exportImg">
        <div class="icon"><span class="iconfont icon-xiazai"></span></div>
        <div class="text">保存</div>
      </li>      
    </ul>
  </div>
  
</template>

<script setup>
import { ref, defineExpose, computed  } from 'vue'
import Buttons from './buttons';
import store from "../../../store";

const emit = defineEmits(['maoScale', 'refresh', 'exportImg',
  'update:isShowFilter','update:isShowTemplate','update:isShowWords','toggleOpenAll', 'showSearch', 'simpleChange', 'editChange', 'wordsChange', 'openTemplate'])
const props = defineProps({
    isShowFilter: Boolean,
    isShowTemplate: Boolean,
    isShowWords: Boolean,
    isShowSearch: Boolean,
    isShowSimple: Boolean,
    isShowEdit: Boolean,
    isShowOpen: Boolean,
    buttonGroup: {
        type: Number,
        default() {
            return  Buttons.ZOOMOUT |
                Buttons.ZOOMIN |
                Buttons.REFRESH |
                Buttons.FULLSCREEN |
                Buttons.SAVE;
        }
    }
})

let isFullscreen = computed(() => store.state.isFullScreen)
let shareholding = ref(0)
const state = ref([])
state.value = [true, true]

/**
 * 
 */
function hasButon(type) {  
  return (props.buttonGroup & type) === type;
}


function showFilter() {
    emit('update:isShowFilter', !props.isShowFilter)
}
function showSearch() {
  emit('showSearch', true)
}

function wordsFilter() {
    emit('update:isShowWords', !props.isShowWords)
}

function showSimple() {
  emit('simpleChange', !props.isShowSimple)
}

function showEdit() {
  emit('editChange', !props.isShowEdit)
}

function toggleFullScreen(value) {
  store.commit('toggleFullScreen', value)
}

function toggleOpenAll() { 
  emit('toggleOpenAll', props.isShowOpen)
}

function maoScale(type) {
  emit('maoScale', type)
}
function refresh() {
  emit('refresh')
}
function exportImg() {
  emit('exportImg')
}

function openTemplate() {
   emit('update:isShowTemplate', !props.isShowTemplate)
}

</script>

<style lang="scss" scoped>
.toolbox{
  position: absolute;
  right: 10px;
  bottom: 40px;
  font-size: 18px;
  z-index: 20;
  ul {
    width: 48px;
    margin: 0px;
    padding: 0px;
    box-sizing: border-box;
    border: 1px solid #eee;
    background: #fff;
    border-radius: 4px;
    li{
      width: 46px;
      height: 52px;
      text-align: center;
      box-sizing: border-box;
      font-size: 11px;
      color: #666;
      padding: 7px 0 0 0;
      list-style-type: none;
      cursor: pointer;
      user-select: none;
      position: relative;
      line-height: 20px;
      border-top: 1px solid #eee;
      &:hover{
        color: #fff;
        background-color: #128BED;
      }
      &:first-child{
        border-top: 0;
      }
      .icon{
        display: flex;
        justify-content: center;
      }
      .text{
        line-height: 18px;
        margin-top: 3px;
      }
    }
    .active{
      color: #fff;
      background-color: #128BED;
    }
  }
}

</style>
