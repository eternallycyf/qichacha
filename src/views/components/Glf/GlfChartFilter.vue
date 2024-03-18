<template>
	<div id="search-box" class="box-detail" :class="{ hide : !visiable }">
		<div class="m_search-box animated fadeIn">
			<div class="ma_top-bar e_close-bar">
				<span v-if="nodetype === 'ALL-C' || nodetype === 'ALL-P'" class="ea_title">
					<span v-for="(item,index) in tabList" :key="index" class="ma_bar-all" :class="currentTab === index ? 'current': ''" @click="tabClick(index)">{{ item }}</span>
				</span>
				<span v-else class="ea_title">
					<span class="ma_bar-text">{{ currentNode.Title }}</span>
					<span class="ma_bar-text">{{ currentNode.Total }}</span>
				</span>
				<span class="ea_close" @click="close">×</span>
			</div>
			<div class="ma_search-group input-group">
  			<a-input v-model:value="currentSearchText" placeholder="请输入筛选名称" class="ma_search-input form-control headerKey">
					<template #suffix>
            <span v-if="currentSearchText" class="close-btn"  @click="clearSearchText">×</span>
          </template>
				</a-input>
				<label :class="isOpen ? 'active' : ''">
					<span class="label-span" @click="openAll">
						<span style="margin:0 5px 0 -10px">{{ isOpen ? '全部收起' : '全部展开' }}</span>
						<span class="iconfont" :class="isOpen ? 'icon-top' : 'icon-bottom'"></span>
					</span>
				</label>
			</div>
			<div v-if="list && list.length" class="ma_items-container">
				<div v-for="(item, index) in list" :key="item.Id" class="ma_item">
					<div v-if="currentNode && currentNode.type === 'Company'" class="ma_item-top">
						<span class="company-img">{{ item.name.slice(0,4) }}</span>
						<a href="https://www.qcc.com/firm/1ea557c511d6c06423d0519a364ae0a5.html" target="_blank"
							class="ma_name">
							<span>{{index + 1}}. {{ item.name }}</span>
						</a>
						<span>
							<span class="ma_tag ntag tooltip-br" :class="item.Status === '注销' ? 'text-danger': 'text-success'">{{ item.Status}}</span>
						</span>
						<span class="ma_arrow pull-right text-muted" :class="item.isOpen ? 'active' : ''" @click="itemOpen(index)">
							<span class="iconfont" :class="item.isOpen ? 'icon-top' : 'icon-bottom'"></span>
						</span>
					</div>
					<div v-else class="ma_item-top">
						<span class="name-img">{{ item.name[0] }}</span>
						<a href="https://www.qcc.com/firm/1ea557c511d6c06423d0519a364ae0a5.html" target="_blank"
							class="ma_name">
							<span>{{index + 1}}. {{ item.name }}</span>
						</a>
						<span class="ma_arrow pull-right text-muted" :class="item.isOpen ? 'active' : ''" @click="itemOpen(index)">
							<span class="iconfont" :class="item.isOpen ? 'icon-top' : 'icon-bottom'"></span>
						</span>
					</div>
					<!-- 折叠版 -->
					<div v-show="item.isOpen" class="fold-detail-company">
						<div class="ma_item-detail">
							<div v-if="currentTab === 0">
								<div class="detail-cell">
									<span>法定代表人：</span>
									<a href="https://www.qcc.com/firm/pr838adcb9d2819d3e0cd67b9d6ce429.html" target="_blank">林世伟</a>
								</div>
								<div class="detail-cell">
									<span>注册资本：</span>
									<span class="val">20000万元人民币</span>
								</div>
								<div class="detail-cell">
									<span>成立日期：</span>
									<span class="val">2019-06-05</span>
								</div>
							</div>
							<div v-else>
								<div class="detail-cell">
									<span>担任法人：</span>
									<span>-</span>
								</div>
								<div class="detail-cell">
									<span>对外投资：</span>
									<span>-</span>
								</div>
								<div class="detail-cell">
									<span>在外任职：</span>
									<span>-</span>
								</div>
								<div class="detail-cell">
									<span>控股企业：</span>
									<span>-</span>
								</div>
							</div>
						</div>
						<div class="ma_item-path">
							<div class="e_path">
								<div class="ea_path-title">
									关联方认定详情
									<span v-if="wrapTab === 0" class="ntag text-primary">上交所</span>
									<span v-else-if="wrapTab === 1" class="ntag text-warning">深交所</span>
									<span v-else-if="wrapTab === 2" class="ntag text-pl">会计准则</span>
								</div>
								<div v-for="(ele,idx) in item.Path" :key="idx" class="single-path">
									<span v-for="(path,i) in ele" :key="i">
										<span v-if="path.name">
											<a href="https://www.qcc.com/firm/fa902aeb2eab4ef9b9fcd1ef109ec54a.html" target="_blank">{{ path.name }}</a>
										</span>
										<span v-else>
											<span>
												<span class="e_lang-arrow">
													<span class="ea_text">{{ path.Operation }}</span>
													<span class="ea_text">{{ path.Reason }}</span>
													<span class="ea_line"></span>
													<span v-if="path.Direction === 'OUT'" class="ea_arrow-wrap ea_left iconfont icon-caret-left"></span>
													<span v-else class="ea_arrow-wrap ea_right iconfont icon-caret-right"></span>
												</span>
											</span>
										</span>
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div v-else style="margin-top:80px">
  			<a-empty description="没有找到相关数据" />
			</div>
		</div>
	</div>
</template>

<script setup>
import {
  ref,
  reactive,
  defineProps,
	defineEmits,
	watch,
  defineExpose,
  toRaw,
  computed
} from "vue";

const props = defineProps({
	visiable: Boolean,
	wrapTab: Number,
	data: Array,
	nodetype: String,
	currentNode: Object
});
const emit = defineEmits(['update:visiable'])
// 当前菜单
let tabList = ref([])
tabList.value = ['所有关联企业', '所有关联自然人']

const currentSearchText = ref('')

const currentTab = ref(0)

// 调用接口获取搜索所有list

const list = computed(() => {
	return !currentSearchText.value ?
	props.data : 
	props.data.filter(a => a.name.indexOf(currentSearchText.value) >=0)
})


function clearSearchText() {
  currentSearchText.value = ''
}

watch(
  () => props.nodetype,
  (newVal, oldVal) => {
		isOpen.value = false
		clearSearchText()
  }
)

// 展开收起
let isOpen = ref(false)
function openAll() {
	if (list.value) {
		const bool = !isOpen.value
		isOpen.value = bool
		list.value.forEach(item => {
			item.isOpen = bool
			return item
		})
	}
}


function itemOpen(i) {
	list.value[i].isOpen = !list.value[i].isOpen
}

// 头部切换
function tabClick(index) {
	currentTab.value = index
	clearSearchText()
}

// 搜索弹框关闭
function close() {
	isOpen.value = false
	clearSearchText()
	emit('update:visiable', false);
}

</script>

<style lang="scss" scoped>
	.toolbox {
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

			li {
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

				&:hover {
					color: #fff;
					background-color: #128BED;
				}

				&:first-child {
					border-top: 0;
				}

				.icon {
					display: flex;
					justify-content: center;
				}

				.text {
					line-height: 18px;
					margin-top: 3px;
				}
			}
		}
	}


label {
  display: inline-block;
  max-width: 100%;
  margin-bottom: 5px;
  font-weight: 700;
}

.form-control {
	height: 34px;
	padding: 6px 12px;
	font-size: 14px;
	line-height: 1.42857143;
	color: #555555;
	background-color: #fff;
	background-image: none;
	border: 1px solid #ddd;
	border-radius: 4px;
}
.box-detail {
	user-select:none;
	width: 500px;
	height: 600px;
	border-radius: 5px;
	position: fixed;
	right: 80px;
	top: 125px;
	z-index: 9999;
	background: #ffffff;
	-webkit-box-shadow: 0 0 10px rgb(0 0 0 / 50%);
	-moz-box-shadow: 0 0 10px rgba(0,0,0,0.5);
	box-shadow: rgb(0 0 0 / 20%) 0px 2px 4px 0px;
	&.hide {
		display: none;
	}
	.close-btn {
		cursor: pointer;
		// color: #bbb;
	}
	.input-group {
		position: relative;
		display: table;
		border-collapse: separate;
		.form-control {
			width: 340px;
			position: relative;
			z-index: 2;
			float: left;
			margin-bottom: 0;
		}
	}
	.animated {
		-webkit-animation-fill-mode: both;
		-moz-animation-fill-mode: both;
		-ms-animation-fill-mode: both;
		-o-animation-fill-mode: both;
		animation-fill-mode: both;
		-webkit-animation-duration: 0.5s;
		-moz-animation-duration: 0.5s;
		-ms-animation-duration: 0.5s;
		-o-animation-duration: 0.5s;
		animation-duration: 0.5s;
	}
  .fadeIn {
    display: block !important;
    -webkit-animation-name: fadeIn-data-v-5f846fb4;
    -moz-animation-name: fadeIn-data-v-5f846fb4;
    -o-animation-name: fadeIn-data-v-5f846fb4;
    animation-name: fadeIn-data-v-5f846fb4;
  }
  .e_close-bar {
    height: 52px;
    border-bottom: #E5E5E5 1px solid;
    padding: 0px 15px;
  }
   .m_search-box .ma_top-bar {
    position: relative;
  }
  .ma_bar-all {
    font-size: 16px;
    position: relative;
    cursor: pointer;
    height: 51px;
    padding: 0px;
    display: inline-block;
    margin-right: 30px;
    &.current {
    color: #128bed;
    border-bottom: 2px solid #128bed;
	}
}

	.ma_bar-text{
    font-size: 16px;
    position: relative;
    height: 51px;
    padding: 0px;
    display: inline-block;
    margin-right: 30px;
    color: #128bed;
	}
  .e_close-bar{
    .ea_title {
      color: #333;
      font-size: 18px;
      line-height: 52px;
      float: left;
      font-weight: bold;
    }
      .ea_close {
      color: #128BED;
      font-size: 30px;
      line-height: 52px;
      float: right;
      cursor: pointer;
    }
  }
  .ma_search-group {
    border-bottom: 1px solid #EEEEEE;
    position: relative;
    height: 66px;
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 15px;

    .input {
      width: 300px;
    }
		span.label-span {
			position: relative;
			display: inline-block;
			color: #666666;
			font-size: 14px;
			top: 6px;
			font-weight: normal !important;
			&:hover{
				cursor: pointer;
			}
		}
    a.clear-searchkey {
      background: url(//qcc-static.qichacha.com/qcc/pc-web/prod-23.01.239/images/icon_delete_xs-575db988.png) no-repeat;
      background-size: 16px 16px;
      width: 16px;
      height: 16px;
      position: absolute;
      opacity: 1;
      top: 49%;
      transform: translate(0, -50%);
      left: 290px;
      z-index: 5;
    }
    label {
      cursor: pointer;
      position: relative;
    }
    .fa {
      display: inline-block;
      font: normal normal normal 14px/1 FontAwesome;
      font-size: inherit;
      text-rendering: auto;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .fa-fw {
      width: 1.28571429em;
      text-align: center;
    }
  }
  .m_search-box .ma_items-container {
    height: 480px;
    overflow-y: auto;
  }
  .ma_item .ma_item-top {
    padding: 14px 15px;
    height: 60px;
    position: relative;
    .name-img {
    width: 30px;
    height: 30px;
    display: block;
    border-radius: 3px;
    float: left;
    border: 1px solid #eee;
    object-fit: contain;
    text-align: center;
    line-height: 30px;
    background: #51a3d8;
    color: #fff;
	}
	.company-img{
		width: 35px;
    height: 35px;
    background: #70a7d1;
    padding-top: 3px;
    text-align: center;
    color: #fff;
    display: block;
    border-radius: 3px;
    float: left;
    border: 1px solid #eee;
    object-fit: contain;
		line-height: 15px;
	}
.ma_name {
    font-size: 14px;
    color: #333333;
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
      font-size: 12px;
      margin-top: 5px;
      margin-left: 5px;
    }
		.ntag {
			height: 22px;
			font-weight: normal;
			display: inline-block;
			line-height: 14px;
			font-size: 12px;
			padding: 4px 8px 4px 8px;
			border-radius: 2px;
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
	.ntag.text-pl {
		color: #6f77d1;
		background: #edeef9;
	}
	.ntag.text-success {
		color: #00ad65;
		background: #e3f6ee;
	}

	.ntag.text-primary {
		color: #128bed;
		background: #e5f2fd;
	}
	.ntag.text-warning {
		color: #ff8900;
		background: #ffeed5;
	}
	.ntag.text-danger {
    color: #FF6060;
    background: #ffecec;
	}
	.active span{
		color: #128bed;	
	}
}
.e_lang-arrow {
	position: relative;
	top: 10px;
	border: red 0px solid;
	display: inline-block;
	height: 32px;
	padding: 0px 5px;
	margin-left: 10px;
	margin-right: 10px;
	max-width: 160px;
}
.ea_text {
	position: relative;
	display: inline-block;
	height: 12px;
	line-height: 12px;
	color: #128bed;
	text-align: center;
	font-size: 12px;
	width: 100%;
	margin-bottom: 7px;
	float: left;
	max-width: 150px;
	word-break: keep-all;
	text-overflow: ellipsis;
	overflow: hidden;
}
.ea_line {
	position: absolute;
	width: 100%;
	height: 2px;
	background-color: #ddd;
	top: 15px;
	left: 0px;
}
.ea_arrow-wrap {
	position: absolute;
	top: 2px;
	font-size: 15px;
	color: #999;
	width: 15px;
	height: 100%;
	z-index: 99;
	&.ea_left {
		left: -5px;
	}
	&.ea_right {
    right: -10px;
	}
}
.fold-detail-company{
	.ma_item-detail {
    padding: 10px 15px 0px 15px;
    background: #F3F9FD;
		&>div {
			border-bottom: 1px #EEEEEE solid;
			padding-bottom: 10px;
			.detail-cell{
				display: inline-block;
				margin-right: 15px;
				font-size: 14px;
				line-height: 22px;
				span {
					font-size: 12px;
					font-size: 14px;
					color: #999;
					&.val {
    				color: #333;
					}
				}
				a {
					font-size: 14px;
					color: #128BED;
				}
			}
		}
	}
	.ma_item-path {
    background: #F3F9FD;
    padding: 10px 15px 0;
		.e_path {
			line-height: 28px;
			margin-bottom: 6px;
			a {
				word-break: break-all;
				color: #333333;
			}
		}
		.ea_path-title {
			color: #333333;
			font-weight: bold;
			font-size: 12px;
		}
		.single-path {
			color: #666;
			padding-bottom: 10px;
			border-bottom: 1px solid #eee;
		}
		.ntag {
			padding: 4px 6px;
			margin-left: 5px;
		}
	}
}
</style>
