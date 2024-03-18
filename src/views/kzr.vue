<!-- 实际控制人 -->
<template>
	<!-- <Header v-if="!screenfull" title="小米科技有限责任公司" :active="8" /> -->
	<ToolBox @screenfullChange="screenfullChange" @maoScale="maoScale" @refresh="refresh" @exportImg="exportImg" />
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
	import { init } from "./components/Kzr/index";
	import { onMounted  } from 'vue';
	export default {
		components: {
			Header,
			ToolBox
		},
		setup() {
			// 导出png
			const exportImg = () => {
				const blobUrl = cy.png({
						bg: '#fff',
						full: true,
						scale: 3
				})
				console.log('png', blobUrl)
				const filename = '企业关系图谱.png';
				const a = document.createElement('a');
				a.href = blobUrl;
				a.download = filename;;
				a.click();
				window.URL.revokeObjectURL(blobUrl);
			}
			const refresh = () => {
				cy.layout({
					name: 'preset',
					randomize: false,
					animate: true,
				}).run();
			}
			onMounted(init)
			return { exportImg , refresh }
		}
	}
</script>

<style scoped>
	.box {
		width: 100vw;
		height: 100vh;
		background-color: #cbe8ff;
	}
</style>
