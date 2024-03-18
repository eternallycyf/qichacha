import d3 from './d3.min.js'
import deepcopy from 'deepcopy'
import SKRJson from '@/api/suspectedSKRJson.json'

// 是否全称
let shortNameShow = false
// 是否显示编辑按钮
let editShow = false

var zoom,treeG
/* 如果需要将页面的整体高度拉伸
 *（折线的高度拉伸，公司长方体的块也的Y距也需要调整及所有标签Y轴都需要调整，
 * 始终保证折线的端点在长方形的中心点）
 */

// json数据结构改变

var rootData ,rootName;
let width = 0
let height = 0
let d3GenerationChart
var _this = this;
var rootRectWidth = 0; //根节点rect的宽度
var forUpward = true
let eventOpts = {
	nodeHover: null,
	nodeOut: null,
	backgroundHover: null,
	backgroundOut: null
}

export function register(opts) {
	Object.assign(eventOpts, opts)
}

// 数据重置
function resizeData(data) {
	shortNameShow = false
	editShow = false
	// 重新获取json数据
	init(data);
}
// 递归把key为items修改为children
function changeId(objAry, key, newkey) {
	if (objAry != null) {
		objAry.forEach((item) => {
			Object.assign(item, {
				[newkey]: item[key],
			});
			delete item[key];
			changeId(item.children, key, newkey);
		});
	}
}
// 初始化
export function init(data) {
	const upward = deepcopy(data.p_trees)
	const downward = deepcopy(data.c_trees)
	changeId(upward, "items", "children"); 
	changeId(downward, "items", "children");
	// 添加最终受益人标记
	upward.forEach(item => {
		SKRJson.data.nodes.forEach(ele => {
			if (item.name === ele.name && ele.isKey) {
				item.isKey = true
			}
		})
		return item
	})
	
	 rootData = {
		downward: {
			"direction": "downward",
			"name": "origin",
			"data": data,
			"children": downward
		},
		upward: {
			"direction": "upward",
			"name": "origin",
			"data": data,
			"children": upward
		}
	}
	rootName = data.name;
}

export function drawing(data) {
	if (d3.select('#svg')) {
		d3.select('#svg').remove();
		resizeData(data)
	} else {
		init(data);
	}
	width = document.getElementById('mountNode').scrollWidth
	height = document.getElementById('mountNode').scrollHeight
	d3GenerationChart = new treeChart(d3);
	d3GenerationChart.drawChart();
}

/**
 * 
 * @param {*} filter 
 */
export function updateByFilter (filter) {

	// 过滤节点
	function filterNodes(d, originData) { 

		if(!d._originChildren) {
			d._originChildren = d.children || d._children;
		}
		const children = d._originChildren.filter(a => {
			if(filter(a)) {
				filterNodes(a, originData);
				return true;
			} 
			return false;
		});

		if(d._children) {
			d._children = children.length > 0 ? children:null;	
		} else{
			d.children = children.length > 0 ? children:null;	
		}
		d3GenerationChart.update(d, originData, treeG);
	  }

	  d3GenerationChart.directions.forEach(function(direction) {
	  	filterNodes(rootData[direction], rootData[direction]);	
	  });	
}
// 简称 全称切换
export function simpleChange1(val) {
	shortNameShow = val
	if (shortNameShow) {
		d3.selectAll(".text-g").attr('visibility', 'hidden');
		d3.selectAll(".short-text-g").attr('visibility', 'visible');
	} else {
		d3.selectAll(".text-g").attr('visibility', 'visible');
		d3.selectAll(".short-text-g").attr('visibility', 'hidden');
	}
}
// 编辑
export function editChange1(val) {
	editShow = val
	if (editShow) {
		d3.selectAll(".edit").attr('visibility', 'visible');
	} else {
		d3.selectAll(".edit").attr('visibility', 'hidden');
	}
}

	// 缩放
export function zoomClick(type) {
	// var clicked = d3.event.target,
		var direction = 1,
		factor = 0.3,
		target_zoom = 1,
		center = [width / 2, height / 2],
		extent = zoom.scaleExtent(),
		translate = zoom.translate(),
		translate0 = [],
		l = [],
		view = {
			x: translate[0],
			y: translate[1],
			k: zoom.scale()
		};

	// d3.event.preventDefault();
	direction = type === 1 ? 1 : -1;

	target_zoom = Number(zoom.scale() + factor * direction).toFixed(1)

	if (target_zoom === extent[0] || target_zoom === extent[1]) {
		return false
	}
	if (target_zoom < extent[0]) {
		target_zoom = extent[0]
	}
	if (target_zoom > extent[1]) {
		target_zoom = extent[1]
	}
	translate0 = [(center[0] - view.x) / view.k, (center[1] - view.y) / view.k];
	view.k = target_zoom;
	l = [translate0[0] * view.k + view.x, translate0[1] * view.k + view.y];

	view.x += center[0] - l[0];
	view.y += center[1] - l[1];
	// var d3GenerationChart = new treeChart(d3);
	// d3GenerationChart.drawChart();
	interpolateZoom([view.x, view.y], view.k);
}

// 重置刷新
export function refresh(data) {
	drawing(data)
}
	// d3.select("#reset").on("click", function(d) {
	// 	interpolateZoom([0, 0], 1);
	// });

	function interpolateZoom(translate, scale) {
		return d3
			.transition()
			.duration(350)
			.tween("zoom", function() {
				var iTranslate = d3.interpolate(zoom.translate(), translate),
					iScale = d3.interpolate(zoom.scale(), scale);
				return function(t) {
					zoom.scale(iScale(t)).translate(iTranslate(t));
					redraw();
				};
			});
}
function redraw() {
	treeG.attr('transform', 'translate(' + zoom.translate() + ')' +
		' scale(' + zoom.scale() + ')');
}

// 上下两棵树
var treeChart = function(d3Object) {
	this.d3 = d3Object;
	this.directions = ['upward', 'downward'];
};

// 分辨绘制
treeChart.prototype.drawChart = function() {
	// First get tree data for both directions.
	this.treeData = {};
	var self = this;
	self.directions.forEach(function(direction) {
		self.treeData[direction] = rootData[direction];
	});
	rootRectWidth = rootName.length * 15;
	self.graphTree(self.getTreeConfig());
};
// 基础配置
treeChart.prototype.getTreeConfig = function() {
	var treeConfig = {};
	treeConfig.chartWidth = width
	treeConfig.chartHeight = height
	treeConfig.centralHeight = treeConfig.chartHeight / 2;
	treeConfig.centralWidth = treeConfig.chartWidth / 2;
	treeConfig.linkLength = 160; //箭头长度(上下节点距离)
	treeConfig.duration = 500; //动画时间
	return treeConfig;
};

// 绘图
treeChart.prototype.graphTree = function(config) {
	var self = this;
	var d3 = this.d3;
	var linkLength = config.linkLength;
	var duration = config.duration;
	var hasChildNodeArr = [];
	var id = 0;
	//折线
	var diagonal = function(obj) {
		var s = obj.d.source;
		var t = obj.d.target;
		return ("M" + s.x + "," + (s.y) + "L" + s.x + "," + (s.y + (t.y - s.y) / 2) + "L" + t.x + "," + (s.y + (t.y - s.y) / 2) + "L" + t.x + "," + (t.y));
		// return ("M" + s.x + "," + (s.y + 20) + "L" + s.x + "," + (s.y + 20 + (t.y - s.y) / 2) + "L" + t.x + "," + (s.y + 20 + (t.y - s.y) / 2) + "L" + t.x + "," + (t.y + 20));
	};
	zoom = d3.behavior.zoom().scaleExtent([0.5, 2]).on('zoom', redraw);
	var svg = d3.select('#mountNode')
	
	.on("mouseover", (e) => {
		typeof eventOpts.backgroundHover == 'function' && eventOpts.backgroundHover(e)
   })
   .on("mouseout", (e) => {
	   typeof eventOpts.backgroundOut == 'function' && eventOpts.backgroundOut(e)
   })
		.append('svg')
		.attr('id', 'svg')
		.attr('width', '100%')
		.attr('height', '100%')
		.attr('viewBox', '0 0 ' + config.chartWidth + ' ' + config.chartHeight)
		.attr('xmlns', 'http://www.w3.org/2000/svg')
		// .on('mousedown', disableRightClick)
		.call(zoom)
		.on('dblclick.zoom', null)
	treeG = svg.append('g')
		.attr('class', 'gbox')
		.attr('transform', 'translate(0,0)');


	
	self.update = function(source, originalData, g) {
		var direction = originalData["direction"];
		forUpward = direction == "upward";
		var node_class = direction + "Node";
		var link_class = direction + "Link";
		var downwardSign = forUpward ? -1 : 1;
		var isExpand = false;
		var nodeSpace = 200;
		var tree = d3.layout.tree().sort(sortByDate).nodeSize([nodeSpace, 0]);
		var nodes = tree.nodes(originalData);
		var links = tree.links(nodes);
		var offsetX = -config.centralWidth;
		nodes.forEach(function(d) {
			d.y = downwardSign * (d.depth * linkLength) + config.centralHeight;
			d.x = d.x - offsetX;
			if (d.name == "origin") {
				d.x = config.centralWidth;
				d.y += downwardSign * 0; // 上下两树图根节点之间的距离
			}
		});

		// Update the node.
		var node = g.selectAll('g.' + node_class)
			.data(nodes, function(d) {
				return d.id || (d.id = ++id);
			})
		var nodeEnter = node.enter().append('g')
			.attr('class', node_class)
			.attr('transform', function(d) {
				return 'translate(' + source.x0 + ',' + source.y0 + ')';
			})
			.style('cursor', function(d) {
				return d.name == "origin" ?
					"" :
					d.children || d._children ?
					"pointer" :
					"";
			})
			.on('click', d => {
				if (d.direction == 'upward' || d.direction == 'downward') {
					// _this.$router.push({
					//   path: '/search/detail',
					//   name: 'search-detail',
					//   query: {
					//     companyId: d.direction == 'upward' ? d.beijingCrid : d.pbeijingCrid
					//     }
					//   })
				}
			})
			.on("mouseenter", nodeHover)
			.on("mouseleave", nodeOut);

		const rectG = nodeEnter.append("g")
		// 公司或股东长方形样式
		const rect = rectG.append("svg:rect")
			.attr("id", d => d.id)
			.attr("x", function(d) {
				return d.name == 'origin' ? -(rootRectWidth / 2) : -90;
			})
			.attr("y", function(d) {
				return d.name == "origin" ? -20 : forUpward ? -31 : -40;
			})
			.attr("width", function(d) {
				return d.name == 'origin' ? rootRectWidth : 180;
			})
			.attr("height", function(d) {
				return d.name == 'origin' ? 40 : 70;
			})
			.attr("rx", 0)
			.style('cursor', "pointer")
			// 边框线
			.style("stroke", "#128bed")
			// 字体填充颜色
			.style("fill", function(d) {
				if (d.name == 'origin') {
					return "#128bed"
				} else {
					return "#fff"
				}
			})
			.on("mouseenter", nodeHover);

		// 公司名称文本第一行  全称
		const textG = rectG.append("g")
			.attr('class', 'text-g')
			.attr('visibility', 'visible')
		textG.append("text")
			.attr("x", 0)
			.attr('dy', function(d) {
				if (d.name == 'origin') {
					return '.35em'
				} else if (forUpward) {
					return d.name.length > 10 ? '-1' : '10';
				} else {
					return d.name.length > 10 ? '-10' : '0';
				}
				// 后续方框底部有融资轮次，样式需要用这个
				//  else if (d.financingRound) {
				//   if (forUpward) {
				//     return d.name.length > 10 ? '0' : '0';
				//   } else {
				//     return d.name.length > 10 ? '-20' : '-10';
				//   }
				// } else {
				//   if (forUpward) {
				//     return d.name.length > 10 ? '-1' : '10';
				//   } else {
				//     return d.name.length > 10 ? '-10' : '0';
				//   }
				// }
			})
			.attr("text-anchor", "middle")
			.attr("fill", "#333")
			.text(function(d) {
				if (d.name == "origin") {
					return d.data.name;
				}
				if (d.repeated) {
					return "[Recurring] " + d.name;
				}
				return d.name.length > 10 ? d.name.substr(0, 10) : d.name;
			})
			.style({
				'fill': function(d) {
					if (d.name == 'origin') {
						return '#fff';
					}
				},
				'font-size': 14,
				'cursor': "pointer"
			})
			.on('click', Change_modal)

		// 公司名称文本第二行  全称
		textG.append("text")
			.attr("x", "0")
			.attr("dy", function(d) {
				if (d.name == 'origin') {
					return '.35em'
				} else if (forUpward) {
					return d.name.length > 10 ? '20' : '40';
				} else {
					return d.name.length > 10 ? '10' : '40';
				}
				// 后续方框底部有融资轮次，样式需要用这个
				//  else if (d.financingRound) {
				//   if (forUpward) {
				//     return d.name.length > 10 ? '-40' : '40';
				//   } else {
				//     return d.name.length > 10 ? '0' : '40';
				//   }
				// } else {
				//   if (forUpward) {
				//     return d.name.length > 10 ? '20' : '40';
				//   } else {
				//     return d.name.length > 10 ? '10' : '40';
				//   }
				// }
			})
			.attr("text-anchor", "middle")
			.text(function(d) {
				let name = d.name;
				if(name == "origin") {
					name = d.data.name;
				} 
				return name.length > 20 ? name.substr(10, 10) + '...' : name.substr(10, name.length);
			})
			.style({
				'fill': "#333", // 第二行字体颜色
				"font-size": 14,
				'cursor': "pointer"
			})

		// 公司名称文本第一行  简称
		const shortTextG = rectG.append("g")
			.attr('class', 'short-text-g')
			.attr('visibility', 'hidden')

		shortTextG.append("text")
			.attr("x", "0")
			.attr("dy", function(d) {
				if (d.name == 'origin') {
					return '.35em'
				} else {
					return forUpward ? 10 : 0
				}
				// 后续方框底部有融资轮次，样式需要用这个
				//  else if (d.financingRound) {
				//   if (forUpward) {
				//     return d.name.length > 10 ? '-40' : '40';
				//   } else {
				//     return d.name.length > 10 ? '0' : '40';
				//   }
				// } else {
				//   if (forUpward) {
				//     return d.name.length > 10 ? '20' : '40';
				//   } else {
				//     return d.name.length > 10 ? '10' : '40';
				//   }
				// }
			})
			.attr("text-anchor", "middle")
			.text(function (d) {
				return d.name == 'origin' ? rootName : d.short_name.length > 10 ? d.short_name.substr(0, 10) + '...' : d.short_name.substr(0, d.short_name.length);
			})
			.style({
				'fill': function (d) {
					return d.name == 'origin' ? '#fff' : "#333"
				},
				"font-size": 14,
				'cursor': "pointer",
			})
		
		// 最终受益人红色背景框 isKey
		const personTopRect = rectG.append("svg:rect")
			.attr("x", -40)
			.attr("y", -56)
			.attr("width", 80)
			.attr("height", function(d) {
				return d.isKey ? 18 : 0;
			})
			.attr("rx", 2)
			.style("stroke", "#FA6B64")
			.style("fill", "#FA6B64")
		// 最终受益人红色小三角形 isKey
		rectG
			.append("svg:path")
			.attr("fill", d => {
				return d.isKey ? "#FA6B64" : ""
			})
			.attr("d", function(d) {
				return d.isKey ? "M0 -33 L-5 -38 L5 -38 Z" : ""
			})
		// 最终受益人 文本 isKey
		rectG.append("text")
			.attr("x", 0)
			.attr("dy", -43)
			.attr("text-anchor", "middle")
			.style("fill", "#fff")
			.style('font-size', 10)
			.text(function(d) {
				return d.isKey ? "最终受益人" : '';
			});
		// 融资轮次背景框 financingRound
		const financingRoundRect = rectG.append('svg:rect')
			.attr("x", "-89")
			.attr("y", function(d) {
				return forUpward ? 18 : 9;
			})
			.attr("rx", 2)
			.attr("width", function(d) {
				return d.financingRound ? 178 : 0;
			})
			.attr("height", function(d) {
				return d.financingRound ? 20 : 0;
			})
			.style("fill", "#e9f3ff")

		// 融资轮次文字  financingRound
		rectG.append("text")
			.attr("x", "0")
			.attr("dy", () => {
				return forUpward ? 29 : 20
			})
			.attr("text-anchor", "middle")
			.attr("dominant-baseline", "middle")
			.style("fill", "#128bed")
			.style('font-size', 12)
			.text(function(d) {
				return d.financingRound ? "融资轮次：天使轮" : "";
			});
		// 注销红色标签背景 state
		const holdingCompanyRect = rectG.append('svg:rect')
			.attr("x", "55")
			.attr("y", function(d) {
				return d.name == 'origin' ? '.35em' : forUpward ? '-40' : '-50';
			})
			.attr("rx", 2)
			.attr("width", function(d) {
				return d.state ? 30 : 0;
			})
			.attr("height", function(d) {
				return d.state ? 18 : 0;
			})
			.style("fill", "#FFEEE5")

		// 注销红色标签文字
		rectG.append("text")
			.attr("x", "70")
			.attr("dy", function(d) {				
				return (d.name == 'origin') ? '.35em' : forUpward ? '-27' : '-37';
			})
			.attr("text-anchor", "middle")
			.style("fill", "#FF722D")
			.style('font-size', 11)
			.text(function(d) {
				return d.state ? "注销" : "";
			});

		// 持资占比文字
		rectG
			.append("text")
			.attr("x", "28")
			.attr("dy", function(d) {
				return d.name == "origin" ? ".35em" : forUpward ? "50" : "-48";
			})
			.attr("text-anchor", "start")
			.attr("class", "linkname")
			.style("fill", "#128bed") //比例颜色（55%）
			.style("font-size", 10)
			.text(function(d) {
				if (d.percent != "0" && d.percent != "") {
					// return d.name == "origin" ? "" : d.percent;
					return d.name == "origin" ? "" : (parseFloat(d.percent) * 100).toFixed(4) + '%';
				}
			})
			.on("mouseenter", nodeOut)
			.on("mouseleave", nodeOut);

		// 加减号圈
		rectG
			.append("circle")
			.attr('r', function(d) {
				return d.name == 'origin' ? 0 : (d.children && d.children.length || d._children && d._children
					.length) ? 10 : 0
			})
			.attr('cy', function(d) {
				return (d.name == 'origin') ? -20 : (forUpward) ? -42 : 41;
			})
			.style('fill', function(d) {
				return (d.children && d.children.length || d._children && d._children.length) ? "#fff" :
					"" //展开按钮背景颜色
			})
			.style("stroke", function(d) {
				// ＋号的外圈颜色 展开按钮背景颜色
				return hasChildNodeArr.indexOf(d) != -1 ?
					"#128bed" :
					""
			})
			.style('stroke-width', function(d) {
				if (d.repeated) {
					return 5;
				}
			})
			.on("mouseenter", nodeOut)
			.on("mouseleave", nodeOut);
		// + - 号样式及绑定点击事件
		rectG
			.append("svg:text")
			.attr("class", "isExpand")
			.attr("x", "0")
			.attr("dy", function(d) {
				return forUpward ? -40 : 42.5;
			})
			.attr("text-anchor", "middle")
			.style("fill", function(d) {
				return d.type != "P" ? "#128bed" : "#FF4D4D";
			})
			.style('cursor', 'pointer')
			.style('font-size', 20)
			//+、-字体颜色
			.text(function(d) {
				if (d.name == "origin") {
					return "";
				}
				return d._children ? "+" : ''
			})
			.on("click", click)
			.on("mouseenter", nodeOut)
			.on("mouseleave", nodeOut);
		
		// 编辑按钮圈
		const treeC = rectG.append("g")
			.attr('class', 'edit')
			.attr('visibility', 'hidden')
		
		treeC.append("circle")
			.attr('r', function(d) {
				return d.name == 'origin' ? 0 : 10
			})
			.attr('cx', function (d) {
				return (d.name == 'origin') ? 0 : 90;
			})
			.attr('cy', function(d) {
				return (d.name == 'origin') ? -20 : (forUpward) ? -35 : -40;
			})
			.style('fill', "#FF6060")
			.on("mouseenter", nodeOut)
			.on("mouseleave", nodeOut);
		// 编辑按钮×号样式及绑定点击事件
		treeC
			.append("svg:text")
			.attr("class", "isExpand")
			.attr("x", "0")
			.attr("dx", 90)
			.attr("dy", function(d) {
				return forUpward ? -33.5 : -38;
			})
			.attr("text-anchor", "middle")
			.style("fill", '#fff')
			.style('cursor', 'pointer')
			.style('font-size', 20)
			.text(function(d) {
				return d.name == "origin"? '':'×'
			})
			.on("click", editBtnClick)
			.on("mouseenter", nodeOut)
			.on("mouseleave", nodeOut);

		// Transition nodes to their new position.原有节点更新到新位置
		var nodeUpdate = node.transition()
			.duration(duration)
			.attr('transform', function(d) {
				return 'translate(' + d.x + ',' + d.y + ')';
			});

		nodeUpdate.select('text').style('fill-opacity', 1)

		nodeUpdate.select('text').style('fill-opacity', 1)

		var nodeExit = node.exit().transition()
			.duration(duration)
			.attr('transform', function(d) {
				return 'translate(' + source.x + ',' + source.y + ')';
			})
			.remove();
		nodeExit.select('circle')
			.attr('r', 1e-6)
		nodeExit.select('text')
			.style('fill-opacity', 1e-6);

		var link = g.selectAll('path.' + link_class)
			.data(links, function(d) {
				return d.target.id;
			});

		//箭头(下半部分)
		var markerDown = svg
			.append("marker")
			.attr("id", "resolvedDown")
			.attr("markerUnits", "strokeWidth") //设置为strokeWidth箭头会随着线的粗细发生变化
			.attr("markerUnits", "userSpaceOnUse")
			.attr("viewBox", "0 -5 10 10") //坐标系的区域
			.attr("refX", 51) //箭头坐标
			.attr("refY", 0)
			.attr("markerWidth", 10) //标识的大小
			.attr("markerHeight", 10)
			.attr("orient", "90") //绘制方向，可设定为：auto（自动确认方向）和 角度值
			.attr("stroke-width", 2) //箭头宽度
			.append("path")
			.attr("d", "M0,-5L10,0L0,5") //箭头的路径
			.attr("fill", "#128bed")
			.attr("fill-opacity", 1); //箭头颜色
		//箭头(上半部分)
		var markerUp = svg
			.append("marker")
			.attr("id", "resolvedUp")
			.attr("markerUnits", "strokeWidth") //设置为strokeWidth箭头会随着线的粗细发生变化
			.attr("markerUnits", "userSpaceOnUse")
			.attr("viewBox", "0 -5 10 10") //坐标系的区域
			.attr("refX", -50) //箭头坐标
			.attr("refY", 0)
			.attr("markerWidth", 10) //标识的大小
			.attr("markerHeight", 10)
			.attr("orient", "90") //绘制方向，可设定为：auto（自动确认方向）和 角度值
			.attr("stroke-width", 2) //箭头宽度
			.append("path")
			.attr("d", "M0,-5L10,0L0,5") //箭头的路径
			.attr("fill", "#128bed")
			.attr("fill-opacity", 1); //箭头颜色

		// 折线及三角形样式
		link.enter()
			.insert("path", "g")
			.attr("class", link_class)
			.attr("stroke", function(d) {
				return "#bbb";
			})
			.attr("fill", "none")
			.attr("stroke-width", "1px")
			.attr("opacity", 0.5)
			.attr("d", function(d) {
				var o = {
					x: source.x0,
					y: source.y0,
				};
				return diagonal({
					source: o,
					target: o,
					d,
				});
			})
			.attr("marker-end", function(d) {
				return forUpward ? "url(#resolvedUp)" : "url(#resolvedDown)";
			}) //根据箭头标记的id号标记箭头;
			.attr("id", function(d, i) {
				return "mypath" + i;
			});
		link.transition()
			.duration(duration)
			.attr('d', function(d) {
				return diagonal({
					d
				});
			});
		link.exit().transition()
			.duration(duration)
			.attr('d', function(d) {
				var o = {
					x: source.x,
					y: source.y
				};
				return diagonal({
					source: o,
					target: o,
					d
				});
			})
			.remove();
		nodes.forEach(function(d) {
			d.x0 = d.x;
			d.y0 = d.y;
		});

		//添加动态关系线
		function nodeHover(d, i) {		
			typeof eventOpts.nodeHover === 'function' && eventOpts.nodeHover(d);
			if (d.name != "origin") {
				if (d.parent.direction == "downward") {
					var links = d3.selectAll(".downwardLink")[0];
					//当前节点的子级节点
					links.map((item, index) => {
						if (item.__data__.source.id == d.id) {
							if (d.children) {
								d.children.forEach((citem) => {
									if (item.__data__.target.id == citem.id) {
										d3.select(item).attr(
											"class",
											"downwardLink downLine"
										);
									}
								});
							}
						} else if (
							item.__data__.source.id == d.parent.id &&
							item.__data__.target.id == d.id
						) {
							d3.select(item).attr("class", "downwardLink downLine");
						}
					});
					//递归处理当前节点的祖先节点
					function changeUpLink(d) {
						links.map((item, index) => {
							if (d.name != "origin") {
								if (
									item.__data__.source.id == d.parent.id &&
									item.__data__.target.id == d.id
								) {
									d3.select(item).attr("class", "downwardLink downLine");
								}
							}
						});
						if (d.depth > 1) {
							if (!d.parent) {
								return;
							} else {
								changeUpLink(d.parent);
							}
						}
					}
					// changeUpLink(d, true);
				} else {
					var links = d3.selectAll(".upwardLink")[0];
					for (let i = 0; i < links.length; i++) {
						let item = links[i];
						if (item.__data__.source.id == d.id) {
							if (d.children) {
								d.children.forEach((citem) => {
									if (item.__data__.target.id == citem.id) {
										// console.log(item)
										d3.select(item).attr("class", "upwardLink upLine");
									}
								});
							}
						} else if (
							item.__data__.source.id == d.parent.id &&
							item.__data__.target.id == d.id
						) {
							d3.select(item).attr("class", "upwardLink upLine");
						}
					}

					function cancelUpLink(d) {
						for (let i = 0; i < links.length; i++) {
							let item = links[i];
							if (d.name != "origin") {
								if (
									item.__data__.source.id == d.parent.id &&
									item.__data__.target.id == d.id
								) {
									d3.select(item).attr("class", "upwardLink upLine");
								}
							}
						}
						if (d.parent) {
							cancelUpLink(d.parent);
						}
					}
					// cancelUpLink(d);
				}
			}
		}

		function nodeOut(d, i) {
			typeof eventOpts.nodeOut === 'function' && eventOpts.nodeOut.call(d);
			if (d.name != "origin") {
				if (d.parent.direction == "downward") {
					var links = d3.selectAll(".downwardLink")[0];
					for (let i = 0; i < links.length; i++) {
						let item = links[i];
						if (
							d3.select(item).attr("class").indexOf("downLine") != "-1"
						) {
							d3.select(item).attr("class", "downwardLink");
						}
					}
				} else {
					var links = d3.selectAll(".upwardLink")[0];
					for (let i = 0; i < links.length; i++) {
						let item = links[i];
						if (d3.select(item).attr("class").indexOf("upLine") != "-1") {
							d3.select(item).attr("class", "upwardLink");
						}
					}
				}
			}
		}

		function Change_modal() {
			_this.Modal = true
		}

		function click(d) {
			event.stopPropagation()
			if (forUpward) {} else {
				if (d._children) {
					console.log('对外投资--ok')
				} else {
					console.log('对外投资--no')
				}
			}
			isExpand = !isExpand;
			if (d.name == 'origin') {
				return;
			}
			if (d.children) {
				d._children = d.children;
				d.children = null;
				d3.select(this).text('+')
				self.update(d, originalData, g);
			} else {
				if (d._children && d._children.length > 0) {
					d.children = d._children;
					d._children = null;
					if (d.name == 'origin') {
						d.children.forEach(expand);
					}
					d3.select(this).text('-')
					self.update(d, originalData, g);
					simpleChange1(shortNameShow)
					editChange1(editShow)
				} else {
					// gqctt({
					// 	beijingCrid: d.direction == 'upward' ? d.beijingCrid : d.pbeijingCrid,
					// 	direction: d.direction
					// }).then(res => {
					// 	if (res.code === 0) {
					// 		if (d.direction == 'upward') {
					// 			d.children = res.result.investorList
					// 			d.children.map(item => {
					//   		item.amount = Number(item.subConAm).toFixed(2)
					// 				item.isKey = true
					// 				item.percent = item.subComBl.length > 6 ?
					// 					calculation.accMul(item.subComBl, 100).toFixed(2) + '%' :
					// 					calculation.accMul(item.subComBl, 100) + '%'
					//     item.name = item.entName
					// 				item.type = item.bz === '企业' ? 2 : 1
					// 				item.isKey = item.subComBl >= 0.25 && item.type == 1
					// 				item.direction = direction
					// 				item.holderPercent = item.percent
					// 			})
					// 		} else {
					// 			d.children = res.result.holderList
					// 			d.children.map(item => {
					// 				item.amount = Number(item.subConAm).toFixed(2)
					// 				item.isKey = true
					// 				item.percent = item.subComBl.length > 6 ?
					// 					calculation.accMul(item.subComBl, 100).toFixed(2) + '%' :
					// 					calculation.accMul(item.subComBl, 100) + '%'
					// 				item.name = item.pentName
					// 				item.type = item.bz === '企业' ? 2 : 1
					// 				item.isKey = item.subComBl >= 0.25 && item.type == 1
					// 				item.direction = direction
					// 				item.holderPercent = item.percent
					// 			})
					// 		}
					// 		d._children = null;
					// 		if (d.name == 'origin') {
					// 			d.children.forEach(expand);
					// 		}
					// 		d3.select(this).text('-')
					// 		update(d, originalData, g)
					// 	}
					// })
				}
			}
		}
		function editBtnClick(d) {
			if (d.name == 'origin') {
				return;
			} else {
				const filterId = (data, id) => {
					if (!Array.isArray(data)) {
						return data
					}
					return data.filter(item => {
						if ('children' in item) {
							item.children = filterId(item.children, id)
						} else if ('_children' in item) {
							item._children = filterId(item._children, id)
						}
						return (item.id === undefined || item.id !== id)
					})
				}
				const filtredData = filterId([originalData], d.id)				
				self.update(d, filtredData[0], g);
			}
		}

	}

	function expand(d) {
		if (d._children) {
			d.children = d._children;
			d.children.forEach(expand);
			d._children = null;
		}
	}

	function collapse(d) {
		if (d.children && d.children.length != 0) {
			d._children = d.children;
			d._children.forEach(collapse);
			d.children = null;
			hasChildNodeArr.push(d);
		}
	}

	

	function disableRightClick() {
		// stop zoom
		if (d3.event.button == 2) {
			console.log('No right click allowed');
			d3.event.stopImmediatePropagation();
		}
	}

	function sortByDate(a, b) {
		var aNum = a.name.substr(a.name.lastIndexOf('(') + 1, 4);
		var bNum = b.name.substr(b.name.lastIndexOf('(') + 1, 4);
		return d3.ascending(aNum, bNum) ||
			d3.ascending(a.name, b.name) ||
			d3.ascending(a.id, b.id);
	}

	for (var d in this.directions) {
		var direction = this.directions[d];
		var data = self.treeData[direction];
		data.x0 = config.centralWidth;
		data.y0 = config.centralHeight;
		data.children.forEach(collapse);
		self.update(data, data, treeG);
	}

};

