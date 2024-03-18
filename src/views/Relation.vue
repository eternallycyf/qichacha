<!-- 关系图谱 -->
<template>
  <ToolBox v-model:isShowFilter="isShowFilter"
           v-model:isShowWords="isShowWords"
           :buttonGroup="buttons"
           @maoScale="maoScale"
           @refresh="refresh"
           @exportImg="exportImg"/>
  <RelationFilter ref="filter" :data="list" v-model:visiable="isShowFilter" @resetState="resetFilterState" @focusSelected="focusSelected" @stateChange="filterStateChange"/>
  <Legend/>
  <!-- <transition name="v">
    <ChartDetail v-if="isShowDetail" :data="detailData" :position="detailPosition"></ChartDetail>
  </transition> -->
  <RelationDetail ref="detail" @stateChange="filterStateChange" />
  <div style="width: 100%;height: 100%;">
    <div id="MainCy" style="width: 100%;height: 100%;"></div>
    <div id="MainD3" scale="1" class="no-padding tp-container">
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve">
			</svg>
		</div>
  </div>
</template>
<script>
import Header from '../components/Header/index.vue'
import ToolBox from './components/ToolBox/index.vue'
import Legend from './components/Relation/Legend.vue'
import RelationDetail from '@/views/components/Relation/RelationDetail.vue'
import RelationFilter from '@/views/components/Relation/RelationFilter.vue';
import ChartDetail from './components/CompanyChart/ChartDetail.vue';

// import { relation } from './components/Relation/index.js'
import $ from 'jquery'
import cytoscape from 'cytoscape'
import * as d3 from 'd3'
import Buttons from '@/views/components/ToolBox/buttons';
import Painter from '@/views/components/Relation/index.js';
import relativeJson from "@/api/relativeJson.json";
import store from '../store';

export default {
  components: {
    Header,
    ToolBox,
    Legend,
    RelationDetail,
    RelationFilter,
    ChartDetail
  },
  data() {
    return {
      buttons: Buttons.FILTER | Buttons.WRITTENWORDS | Buttons.ZOOMIN | Buttons.ZOOMOUT | Buttons.REFRESH | Buttons.FULLSCREEN | Buttons.SAVE,
      isShowDetail: false,
      isShowFilter: false,
      isShowWords: true,
      list: [],
      detailPosition: {
        top: 0,
        left: 0
      },
      detailData: {}
    }
  },
  watch: {
    isShowWords(newVal, oldVal) {
      Painter.wordsChange(newVal)
    }
  },
  created() {
    // HTTP 请求
  },
  mounted() {
    let hoverTimer, bgHoverTimer, that = this;

    Painter.init('MainCy');
    Painter.register({
      backgroudHover: () => {
        if( that.isShowDetail) {
              bgHoverTimer && clearTimeout(bgHoverTimer)
              bgHoverTimer = setTimeout(() => {
              that.isShowDetail = false;
            }, 300);
          }
      },
      backgroudOut: () => {
        bgHoverTimer && clearTimeout(bgHoverTimer)
      },
      backgroudClick: () => {
        const preStatus =   this.isShowFilter ;
        this.isShowFilter = false;          
        return preStatus;
      },
      nodeHover: function(e) {       
          hoverTimer && clearTimeout(hoverTimer);
          hoverTimer = setTimeout(() => {
            const data = e.target._private.data
            that.isShowDetail = true;
            that.detailData = {
              short_name: data.name,
              name: data.name,
              oper_name: '-',
              status:  '-',
            }
            that.detailPosition = {
              top: e.position.y ,
              left: e.position.x 
            }
          }, 500);
        },
	      nodeOut: () => {
          hoverTimer && clearTimeout(hoverTimer);
          // that.isShowDetail = false;
        }
    })
    this.getData(relativeJson.data);
  },
  methods: {
    getData(data) {
      this.list = data.nodes.map(a => Object.assign(a, { checked: true }))
      Painter.getData(data, "534472fd-7d53-4958-8132-d6a6242423d8");
    },
    /**
     * 图谱缩放
     * type == 1  放大
     * type == -1  缩小
     */
    maoScale(type) {
      Painter.maoScale(type);
    },
    // 导出png
    exportImg() {
      Painter.exportImg();
    },
    resetFilterState(event) {
        Painter.cancelAllHighLight();
        Painter.allLinkHighLight(event.checked);
    },
    refresh() {
      this.isShowFilter = false;
      this.isShowWords = true;
      this.$refs.filter.resetState();
      this.getData(relativeJson.data);
      store.commit('setCurrentNode', null)
      // Painter.refresh({
      //   name,
      //   randomize,
      //   animate,
      // })
    },
    focusSelected(id){
        Painter.focusSelected(id)
    },
    filterStateChange(event) {
      Painter.filter(event);
    }
  }
}
</script>

<style scoped>
.box {
  width: 100vw;
  height: 100vh;
  background-color: #cbe8ff;
}
.v-enter-from,
.v-leave-to {
  opacity: 0;
}
/* 离开和进入过程中的样式 */
.v-enter-active,
.v-leave-active {
  /* 添加过渡动画 */
  transition: opacity 0.6s ease;
}
/* 进入之后和离开之前的样式 */
.v-enter-to,
.v-leave-from {
  opacity: 1;
}
</style>
