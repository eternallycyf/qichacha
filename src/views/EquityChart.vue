<!-- 股权穿透图 -->
<template>
  <!-- <Header title="小米科技有限责任公司" :active="3" /> -->
  <div id="borrow" style="width: 100%;height: 100%;background-color: #fff;">
    <div id="mountNode" style="width: 100%;height: 100%;"></div>
    <ToolBox
        v-model:isShowFilter="isShowFilter"
        v-model:isShowSimple="isShowSimple"
        v-model:isShowEdit="isShowEdit"
        :buttonGroup="buttons"
        @simpleChange="simpleChange"
        @editChange="editChange"
        @maoScale="maoScale"
        @refresh="refresh"
        @exportImg="exportImg"/>

    <!-- <DetailContent /> -->
        <transition name="v">
          <ChartDetail v-if="isShowDetail" :data="detailData" :position="detailPosition"></ChartDetail>
        </transition>
        <EquityChartFilter ref="eqFilter" v-model:visiable="isShowFilter" @stateChange="filterStateChange" />
  </div>
</template>
<script>
import Header from '../components/Header/index.vue'
import ToolBox from './components/ToolBox/index.vue'
import EquityChartFilter from './components/Equity/EquityChartFilter.vue'
import DetailContent from './components/DetailContent.vue'
import RelationDetail from '@/views/components/Relation/RelationDetail.vue'
import ChartDetail from './components/CompanyChart/ChartDetail.vue';
import { drawing, simpleChange1, zoomClick, editChange1, updateByFilter, register } from './components/Equity/index.js'
import D3Mixin from '@/hooks/D3Mixin'
import { ref, onMounted } from 'vue'
import EquityJson from '@/api/EquityJson.json'
import Buttons from './components/ToolBox/buttons.js'
let { downloadImpByChart } = D3Mixin()
export default {
  components: {
    Header,
    ToolBox,
    DetailContent,
    RelationDetail,
    ChartDetail,
    EquityChartFilter
  },
  setup() {
    const isShowFilter = ref(false);
    const isShowSimple = ref(false);
    const isShowEdit = ref(false);
    const buttons = ref(Buttons.FILTER | Buttons.ABBREVIATE | Buttons.EDIT | Buttons.ZOOMIN | Buttons.ZOOMOUT | Buttons.REFRESH | Buttons.FULLSCREEN | Buttons.SAVE);
    const isShowDetail = ref(false)
    const detailData = ref({});
    const detailPosition = ref({
        top: 0,
        left: 0
     });
    const eqFilter = ref();
    const exportImg = () => {
      downloadImpByChart('股权穿透图谱', EquityJson.data.enterprise.name)
    }
    const simpleChange = (val) => {
      isShowSimple.value = val
      simpleChange1(val)
    }
    const maoScale = (val) => {
      zoomClick(val)
    }
    const editChange = (val) => {
      isShowEdit.value = val
      editChange1(val)
    }
    const refresh = () => {     
      eqFilter.value.resetState();
      isShowEdit.value = false;
      isShowFilter.value = false;
      isShowSimple.value = false;
      drawing(jsonData)
    }

    // const x = ['' ,'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
    // const convertToHierarchy = (data) => {
    //   function uuid() {
    //   function s4() {
    //     return Math.floor((1 + Math.random()) * 0x10000)
    //         .toString(16)
    //         .substring(1);
    //   }

    //   return (
    //       s4() +
    //       s4() +
    //       "-" +
    //       s4() +
    //       "-" +
    //       s4() +
    //       "-" +
    //       s4() +
    //       "-" +
    //       s4() +
    //       s4() +
    //       s4()
    //   );
    //   }
    //      // 获取子元素
    //     function getChildren(level, name) {
    //         if(level > 10) {
    //           return [];
    //         }
    //         const current = s[level].get(name);    
    //         if(!current) {
    //           return []
    //         }
    //         const children = [];
    //         current.stock_holder.forEach(item => {
    //               children.push({
    //                 "id": uuid(),
    //                 "short_name": item.name,
    //                 "level": level,
    //                 "isKey":level == 1 && item.stock_type.indexOf('法人')>=0,
    //                 "amount": item.amount,
    //                 "has_problem": "0",
    //                 "percent": item.percent,
    //                // "pid": "77bd1a4a4459cafe587269a271c2261a",
    //                 "sh_type": item.invest_type,
    //                 "children": getChildren(level+1, item.name),
    //               //  "eid": "",
    //                // "identifier": "2",
    //                 "name": item.name,
    //                 "type": item.stock_type.indexOf('法人')>=0 ? "P" : "E"
    //               });
    //         })

    //         return children;
    //     }

    //     let c_trees = [], p_trees = [];
    //     let s = [null];
    //     for(let i = 1 ;i < 11;i ++) {
    //       s.push(new Map());
    //       data['stock_holder_' + x[i]].forEach(item => {
    //         s[i].set(item.name, item);
    //       });
    //     }
    //     getChildren(1, data.enterprise.name).forEach(item => {
    //         if(item.isKey) p_trees .push(item)
    //         else c_trees.push(item)
    //     });
    //     return {
    //       root: data.enterprise,
    //       c_trees,
    //       p_trees,
    //       // rawMap: s 
    //     }
    // }

    let jsonData = EquityJson.data
    // let jsonData = convertToHierarchy(EquityJson.data);
    /**
     * 筛选
     * @param {   } state 
     */
    const filterStateChange = (state) => {
      updateByFilter(data => {
        let result = true;
         // 存续
        // 其他
        result =  (state.status[0] && data.status == '存续') ||
          (state.status[1] && data.status !== '存续');
       
        // 持股
        const percent = parseInt ((data.percent || data.percent != '-') ? data.percent : 0) ;       
        result = result && (percent >= state.shareholding );
        // 对外投资比例
        // TODO 
        return result && (state.investment == 0)
      })
    }

    onMounted(() => {
      let hoverTimer, bgHoverTimer;
      register({
        backgroundHover() {
            if(isShowDetail.value) {
              bgHoverTimer && clearTimeout(bgHoverTimer)

              bgHoverTimer = setTimeout(() => {
              isShowDetail.value = false;
            }, 300);
          }
        },
        backgroundOut() {          
          bgHoverTimer && clearTimeout(bgHoverTimer)
        },
        nodeHover: function(e) {   
          let dom =  document.getElementById(e.id);
          let rect = dom.getBoundingClientRect();
          hoverTimer && clearTimeout(hoverTimer);
          hoverTimer = setTimeout(() => {
            isShowDetail.value = true;

            if(e.name =="origin") {
              detailData.value = {
              short_name: e.data.short_name,
              name: e.data.name,
              oper_name: e.data.oper_name,
              reg_capi: e.data.regist_capi,
              start_date: e.data.start_date,
              status: e.data.status
              }
            } else {
              detailData.value = {
              short_name: e.short_name,
              name: e.name,
              oper_name: e.oper_name,
              status: e.status
              }
            }
            
            detailPosition.value = {
              top: rect.top - 130,
              left: rect.left < ((window.innerWidth - rect.width) / 2) ? rect.right : (rect.left - 300) 
            }
          }, 500);
        },
	      nodeOut: () => {
          hoverTimer && clearTimeout(hoverTimer);
          // isShowDetail.value = false;
        }
      })
      drawing(jsonData);
    })

    return {
      isShowFilter,
      isShowSimple,
      isShowEdit,
      isShowDetail,
      close,
      eqFilter,
      simpleChange,
      maoScale,
      editChange,
      refresh,
      exportImg,
      filterStateChange,
      detailData,
      detailPosition,
      buttons
    }
  }
};
</script>

<style lang="scss" scoped>
.downwardNode text,
.upwardNode text {
  font: 10px sans-serif;
}

.downwardLink {
  fill: none;
  stroke-width: 1px;
  /* opacity: 0.5; */
}

.upwardLink {
  fill: none;
  stroke-width: 1px;
  /* opacity: 0.5; */
}
::v-deep .downLine {
  stroke: #128bed;
  stroke-dasharray: 6, 2;
  stroke-dashoffset: 20;
  animation: 1s down-lines infinite linear;
  z-index: 999;
  opacity: 1;
  stroke-width: 2px;
}
::v-deep .upLine {
  stroke: #128bed;
  stroke-dasharray: 6, 2;
  stroke-dashoffset: 20;
  animation: 1s up-lines infinite linear;
  z-index: 999;
  opacity: 1;
  stroke-width: 2px;
}
@keyframes down-lines {
  0% {
    stroke-dashoffset: 10;
  }

  100% {
    stroke-dashoffset: -10;
  }
}
@keyframes up-lines {
  0% {
    stroke-dashoffset: -10;
  }

  100% {
    stroke-dashoffset: 10;
  }
}
::v-deep .isExpand {
  dominant-baseline: middle;
  text-anchor: middle;
}

::v-deep .linkname {
  text-anchor: middle;
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

