<!-- 股权结构图 -->
<template>
  <!-- <Header title="小米科技有限责任公司" :active="4" /> -->
  <div id="borrow" style="width: 100%;height: 100%;background-color: #fff;">
		<div class="box" style="width: 100%;height: 100%;">
			<div id="MainCy" style="width: 100%;height: 100vh;overflow: hidden;"></div>
		</div>
		 <ToolBox
        v-model:isShowOpen="isShowOpen"
        :buttonGroup="buttons"
				@toggleOpenAll="toggleOpenAll"
        @maoScale="maoScale"
        @refresh="refresh"
        @exportImg="exportImg"/>
		<Collapse @clickTab="clickTab" @searchData="searchData" />
	</div>
</template>

<script>
import Header from '../components/Header/index.vue'
import ToolBox from './components/ToolBox/index.vue'
import Collapse from './components/Structure/Collapse.vue'
import Buttons from './components/ToolBox/buttons.js'
import Painter from './components/Structure/index.js'
import { ref, onMounted } from 'vue'
import D3Mixin from '@/hooks/D3Mixin'
let { downloadImpByChart } = D3Mixin()

export default {
	components: {
		Header,
		ToolBox,
		Collapse
	},
	setup() {
    const buttons = ref(Buttons.OPENNODE | Buttons.ZOOMIN | Buttons.ZOOMOUT | Buttons.REFRESH | Buttons.FULLSCREEN | Buttons.SAVE);
		const isShowOpen = ref(false)
		// 缩放
		const maoScale = (type) => {
			Painter.zoomClick(type)
		}
		// 展开收起
		const toggleOpenAll = (val) => {
      Painter.drawing(val)
			isShowOpen.value = !val
		}
		// 图片导出
		const exportImg = () => {
      downloadImpByChart('股权结构图谱', '北京马六级餐饮')
		}
		// 刷新
		const refresh = () => {
			isShowOpen.value = false
      Painter.drawing()
		}
		// 左侧菜单
		const clickTab = () => {
			isShowOpen.value = false
		}
		/**
     * 筛选
     * @param {   } state 
     */
		const searchData = (state) => {
			console.log(state)
    }

		
		// 初始化
    const init = () => {
      window.addEventListener('resize', function () {
        const svg = document.getElementById('svg')
        svg.setAttribute('width', window.innerWidth)
        svg.setAttribute('height', window.innerHeight)
      })
      Painter.drawing()
    }
		onMounted(init)
		return { buttons, isShowOpen, exportImg, refresh, maoScale, toggleOpenAll, clickTab, searchData }
	}
}
</script>

<style scoped>
 .box {
		width: 100vw;
		height: 100vh;
		overflow: hidden;
	}
.link {
  fill: none;
  stroke: #d8d8d8;
  stroke-width: 0.5px;
}
.bg{
	background: #666;
}
</style>
