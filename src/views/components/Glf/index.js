import d3 from './d3.min.js'
import EquityJson from '@/api/glf.json'
/* 如果需要将页面的整体高度拉伸
 *（折线的高度拉伸，公司长方体的块也的Y距也需要调整及所有标签Y轴都需要调整，
 * 始终保证折线的端点在长方形的中心点）
 */

// json数据结构改变

const rootData = {
	downward: {
		"direction": "downward",
		"name": "origin",
		"children": EquityJson.data.c_trees
	},
	upward: {
		"direction": "upward",
		"name": "origin",
		"children": EquityJson.data.p_trees
	}
}
const rootName = EquityJson.data.name;

let width = 0
let height = 0
var _this = this;
var rootRectWidth = 0; //根节点rect的宽度
var downwardLength = 0,
	upwardLength = 0;
var forUpward = true
var zoom, treeG
/**
 * 缩放
 * @param {} type
 */
function zoomClick(type) {
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

/**
 * 刷新
 */
function refresh() {
	d3.select('#svg').remove();   //删除整个SVG
	drawing()
}

function drawing() {
	width = document.getElementById('mountNode').scrollWidth
	height = document.getElementById('mountNode').scrollHeight
	var d3GenerationChart = new treeChart(d3);
	d3GenerationChart.drawChart();
}

var treeChart = function(d3Object) {
	this.d3 = d3Object;
	this.directions = ['upward', 'downward'];
};

treeChart.prototype.drawChart = function() {
	// First get tree data for both directions.
	this.treeData = {};
	var self = this;
	self.directions.forEach(function(direction) {
		self.treeData[direction] = rootData[direction];
	});
	rootRectWidth = rootName.length * 15 + 20;
	//获得upward第一级节点的个数
	upwardLength = rootData.upward.children.length;
	//获得downward第一级节点的个数
	downwardLength = rootData.downward.children.length;
	self.graphTree(self.getTreeConfig());
};
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
		// console.log(s,t)
		return (
			("M" + s.x + "," + (s.y) 
			+ "L" + s.x + "," + (s.y + (t.y - s.y) / 2) 
			+ "L" + t.x + "," + (s.y + (t.y - s.y) / 2) 
			+ "L" + t.x + "," + (t.y)));
		// return ("M" + s.x + "," + (s.y + 20) + "L" + s.x + "," + (s.y + 20 + (t.y - s.y) / 2) + "L" + t.x + "," + (s.y + 20 + (t.y - s.y) / 2) + "L" + t.x + "," + (t.y + 20));
	};
	zoom = d3.behavior.zoom().scaleExtent([0.5, 2]).on('zoom', redraw);
	var svg = d3.select('#mountNode')
		.append('svg')
		.attr('id', 'svg')
		.attr('width', config.chartWidth)
		.attr('height', config.chartHeight)
		.attr('xmlns', 'http://www.w3.org/2000/svg')
		// .on('mousedown', disableRightClick)
		.call(zoom)
		.on('dblclick.zoom', null);
	treeG = svg.append('g')
		.attr('class', 'gbox')
		.attr('transform', 'translate(0,0)');

	// 重置刷新
	d3.select("#reset").on("click", function(d) {
		interpolateZoom([0, 0], 1);
	});

	d3.select("#zoomIn").on("click", zoomClick);
	d3.select("#zoomOut").on("click", zoomClick);
	for (var d in this.directions) {
		var direction = this.directions[d];
		var data = self.treeData[direction];
		data.x0 = config.centralWidth;
		data.y0 = config.centralHeight;
		update(data, data, treeG);
	}

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
	// 缩放
	function zoomClick() {
		var clicked = d3.event.target,
			direction = 1,
			factor = 0.2,
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

		d3.event.preventDefault();
		direction = this.id === "zoomOut" ? 1 : -1;

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

		interpolateZoom([view.x, view.y], view.k);
	}

	function update(source, originalData, g) {
		var direction = originalData["direction"];
		forUpward = direction == "upward";
		var node_class = direction + "Node";
		var link_class = direction + "Link";
		var downwardSign = forUpward ? -1: 1;
		var nodeSpace = 320;
		// var tree = d3.layout.tree().sort(sortByDate).nodeSize([nodeSpace, 0]);
		var tree = d3.layout.tree().nodeSize([nodeSpace, 0]);
		var nodes = tree.nodes(originalData);
		var links = tree.links(nodes);
		var offsetX = -config.centralWidth;

		nodes.forEach(function(d) {
			if(d.depth > 1 ) {		
				if(forUpward) {
					d.y = d.parent.y - 180 -  25 * (d.Collection.length > 5 ? 5 + 2 : d.Collection.length + 2)
				} else {
					d.y = d.parent.y + 50 + d.depth * 25 * 7
				}
			} else if(d.depth === 1 ) {
				if(forUpward) {
					d.y = d.parent.y - 100;
				} else {
					d.y = d.parent.y + 100 ;
				}
			} else {
				d.y = config.centralHeight;
			}			
			
			d.x = d.x - offsetX;
			if (d.name == "origin") {
				d.x = config.centralWidth;
				// d.y += downwardSign * 0; // 上下两树图根节点之间的距离
			}
			d.x0 = d.x;
			d.y0 = d.y;
		});
		
		// Update the node.
		var node = g.selectAll('g.' + node_class)
			.data(nodes.filter(a => a.name !=='origin'), function(d) {
				return d.id || (d.id = ++id);
			})
			
		var nodeRoot =  g.selectAll('g.' + node_class)
			.data(nodes.filter(a => a.name =='origin'), function(d) {
			return d.id || (d.id = ++id);
			})

		var nodeEnter = node.enter().append('g')
			.attr('class', node_class)
			.attr('transform', function(d) {	
				return 'translate(' + (source.x0) + ',' + (source.y0) + ')';
			})
			// .on("mouseenter", nodeHover)
			.on("mouseleave", nodeOut);

		var nodeRootEnter = nodeRoot.enter().append('g')
			.attr('class', node_class)
			.attr('transform', function(d) {
				return 'translate(' + source.x0 + ',' + (source.y0 ) + ')';
			})
			// .on("mouseenter", nodeHover)
			.on("mouseleave", nodeOut);

		// 节点
		const nodeG = nodeRootEnter.append('g')
					.attr('class', 'node');
		
		// 根节点  母公司/控股股东  块
		nodeG.append("svg:rect")
			.attr("class", "root")
			.attr("x", function (d) {
				return d.name == 'origin' ? -(rootRectWidth / 2) : -145;
			})
			.attr("y", function(d) {
				return d.name == "origin" ? -20 : forUpward ? -110 : 0;
			})
			.attr("width", function(d) {
				return d.name == 'origin' ? rootRectWidth : 290;
			})
			.attr('transform', function (d) {
				// 非根节点上游节点的子节点长度>1
				return d.name != 'origin' && forUpward && d.Collection.length > 1 ? 'translate(0,-'+ (d.Collection.length - 1) * 40 +')' : 'translate(0,0)'
			})
			.attr("height", function (d) {
				if (d.name == 'origin') {
					return 33
				} else {
					return d.Collection.length > 5 ? 280 : (d.Collection.length + 2) * 40
				}
			})
			.attr("rx", 0)
			.style('cursor', "pointer")
			// 边框线
			.style("stroke", "#fff")
			.style("stroke-width", "1")
			// 字体填充颜色
			.style("fill", function(d) {
				if (d.name == 'origin') {
					return "#128bed"
				} else {
					return "#fff"
				}
			})
		nodeG.append('text')
			.attr("text-anchor", function (d) {
				return d.name == 'origin' ? "middle" : "start"
			})
			.attr("dx", 0)
			.attr("dy", 0)
			.style({
				"fill": "#fff",
				'font-size': 14,
				'cursor': "pointer",
			})
			.text(function(d) {
				if (d.name == "origin") {
					return rootName;
				}
				if (d.repeated) {
					return "[Recurring] " + d.name;
				}
				return d.Title
			})

		// title 块名称  第一行
		// nodeEnter[0].unshift(nodeRootEnter[0][0]);
		const nodeT = nodeEnter.append('g')
			.attr('class', 'node-text')		
			.attr('transform', function(d) {
				return forUpward ? 'translate(0, 130)' : '';
			})
		// 背景
		nodeT.append("rect")
			.attr("x", -145)
			.attr("y", function (d) {
				// const length = d.Collection.length > 5 ? 5 : d.Collection.length ;		
				// if(forUpward) {
				// 	d.dy = d.Collection.length > 1 ? -110 - 60 * length;
				// } else {
				// 	d.dy = forUpward ?  : -110 : 0
				// }
				return forUpward ? -150 - 140 + 10 : 0;
			})
			.attr("width", function (d) {
				return d.name != 'origin' ? 290 : 0;
			})
			.attr("height", function (d) {
				return d.name != 'origin' ? 40 : 0;
			})
			.style('cursor', "pointer")
			.style({
				'fill': function (d) {
					return d.type == 'Person' ? '#FF6060' : '#128BED'
				}
			})
			.on('click', function (evt) {
				events.nodeClick.call(treeG, evt);
			})
		// Title
		nodeT.append("text")
			.attr("dx", function (d) {
				return d.name != 'origin' ? -135 : 0
			})
			.attr('dy', function (d) {				
				return forUpward ? -125 - 140 + 10 : 25;
			})
			.text(function(d) {
				if (d.name == "origin") {
					return rootName;
				}
				if (d.repeated) {
					return "[Recurring] " + d.name;
				}
				return d.Title
			})
			.attr("text-anchor", function (d) {
				return d.name == 'origin' ? "middle" : "start"
			})
			.style({
				"fill": "#fff",
				'font-size': 14,
				'cursor': "pointer",
			})
			.attr("center-node", function (d) {
				const node = d3.select(this.parentNode)
				// 生成中间的所有子节点
				init(d, node)
				return
			})
			.attr("id", function(d, i) {
				return "mypath" + i;
			})
			.on('click', function (evt) {
				events.nodeClick.call(treeG, evt);
			})
		
			function init(data, node) {
				if (data.name == 'origin') return
				
				if (data.Collection && data.Collection.length) {
					const Collection = data.Collection.length > 5 ? data.Collection.slice(0, 5) : data.Collection
					const length =  6 ;//data.Collection.length > 5 ? 5 : data.Collection.length;
					
					Collection.forEach((item, index) => {
						node.append("rect")
						.attr("x", -145)
						.attr("y", function (d) {
							// return forUpward ? index >= 0 ? (d.dy + 40) + 40 * (index) : -70 + 40 * (index) : 40 * (index + 1)
							return  forUpward ? (length - index) * - 40 :  (index + 1) * 40  
						})
						.attr("width", function (d) {
							return d.id === data.id ? 290 : 0
						})
						.attr("height",data.Collection ? 40 : 0)
						.attr('fill', '#fff')
						.attr('stroke', '#eee')
						.attr('stroke-width', 1)
						.style('cursor', "pointer")
						
						node.append("text")
						.attr("dx", -135)
						.attr('dy', function (d) {
							//return forUpward ? index >= 0 ? (d.dy + 65) + 40 * index :  -85 + 40 * (index + 1) : 25 + 40 * (index + 1) 
							return  forUpward ? (length - index) * - 40 + 25 :  (index + 1) * 40  + 25
						})
						.text(function (d) {
							return d.id === data.id ? item.name : ''
						})
						.style({
							"text-anchor": "start",
							"fill": "#999",
							'font-size': 14,
							'cursor': "pointer",
						})
						.on('click', d => {
							window.open("https://www.baidu.com");
						})
					})
				}
			}
		
			// 右上角数字总长度
			nodeT.append("text")
			.attr("dx", function (d) {
				return d.name != 'origin' ? 135 : -(rootRectWidth / 2) + 5
			})
			.attr('dy', function (d) {
				//return d.name != 'origin' ? forUpward ? d.Collection.length > 1 ? -85 - 40 * (d.Collection.length - 1) : -85 : 25 : 0
				return forUpward ? -125 - 140 + 10  : 25;
			})
			.text(function(d) {
				return d.name == "origin" ? "" : d.Total
			})
			.style({
				"text-anchor": "end",
				"fill": "#fff",
				'font-size': 14,
				'cursor': "pointer",
			})
			.on('click', function (evt) {
				events.nodeClick.call(treeG, evt);
			})
		
		// 最后一行背景 查看全部×家企业/人员> 
		nodeT.append("rect")
			.attr("x", -145)
			.attr("y", function (d) {				
				// const index = d.Collection.length > 5 ? 5 : d.Collection.length;
				// return forUpward ? index >= 0 ? (d.dy + 40) + 40 * (index) : -70 + 40 * (index) : 40 * (index + 1)
				let index = d.Collection.length > 5 ? 5 : d.Collection.length;
				let length = 6;
				return  forUpward ? (length - index) * - 40 :  (index + 1) * 40 ;
			})
			.attr("width", function (d) {
				return d.name != 'origin' ? 290 : 0;
			})
			.attr("height", function (d) {
				return d.name != 'origin' ? 40 : 0;
			})
			.style('cursor', "pointer")
			.attr('fill', '#fff')
			.attr('stroke', '#eee')
			.attr('stroke-width', '1')
		//  最后一行文字描述 查看全部×家企业/人员> 
		nodeT.append("text")
			.attr("dx", function (d) {
				return d.name != 'origin' ? -135 : -(rootRectWidth / 2) + 5
			})
			.attr('dy', function (d) {
				// const index = d.Collection.length > 5 ? 5 : d.Collection.length;
				// return forUpward ? index >= 0 ? (d.dy + 65) + 40 * index :  -85 + 40 * (index + 1) : 25 + 40 * (index + 1) 
				let index = d.Collection.length > 5 ? 5 : d.Collection.length;
				let length = 6;
				return  forUpward ? (length - index) * - 40 + 25 :  (index + 1) * 40 + 25
			})
			.text(function(d) {
				if (d.name == "origin") {
					return '';
				}
				return d.type == 'Person' ? "查看全部"+ d.Total + "位人员>" : "查看全部"+ d.Total + "家企业>"
			})
			.style({
				"text-anchor": "start",
				"fill": "#999",
				'font-size': 14,
				'cursor': "pointer",
			})
			.on('click', function (evt) {
        events.nodeClick.call(treeG, evt);
			})
		
		// 控制 影响 + 小箭头 + 白块遮挡折线
		const nodeB = nodeT.append('g')
			.attr('class', 'node-block')
		
		nodeB
			.append("rect")
			.attr("x", "-2")
			.attr("y", function(d) {
				let index = d.Collection.length > 5 ? 5 : d.Collection.length;
				let length = 6;
				if(forUpward) {
					return  (length - index) * - 40 + (d.Direction === 'IN' ? 45 : 65); 
				} 
				return  d.Direction === 'IN' ? -20 : -40
			})
			.attr("width", function (d) {
				return d.Operation ? "4" : 0
			})
			.attr("height", "11")
			.attr("fill", "#fff")
			.attr("stock-width", 0)
		
		nodeB.append("text")
			.attr("x", "0")
			.attr("dy", function(d) {
				let index = d.Collection.length > 5 ? 5 : d.Collection.length;
				let length = 6;
				if(forUpward) {
					return  (length - index) * - 40 + (d.Direction === 'IN' ? 55 : 75); 
				} 
				return  d.Direction === 'IN' ? -10 : -30
			})
			.attr("text-anchor", "start")
			.attr("class", "linkname")
			.style("fill", function (d) {
				return d.Operation === "控制" ? "#128bed" : "#FF6060"
			})
			.style("font-size", 10)
			.text(function (d) {
				return d.Operation
			})
			.on("mouseenter", nodeOut)
			.on("mouseleave", nodeOut);
		
		// 箭头
		nodeB.append("polygon")
		.attr("class", 'trasingle')
		.attr("points", function (d) {
			if (forUpward) {
				let index = d.Collection.length > 5 ? 5 : d.Collection.length;
				let length = 6;
				let dy2 =  (length - index - 1) * -40 + 10;
				let dy1 = dy2 + 20;
				return d.Direction == 'IN' ? `0,${ dy1 } -3,${ dy1 -10} 3,${ dy1 -10}` : `0,${dy2} -3,${dy2+10} 3,${dy2+10}`;
			} else if (d.name != 'origin') {
				let dy1 = -40;
				return d.Direction == 'IN' ? `0,${ dy1 } -3, ${dy1 + 10} 3,${dy1 + 10}` : "0,-4 -3,-14 3,-14"
			}
			return ""
		})
		.attr("fill", function (d) {
			return d.Operation === "控制" ? "#128bed" : "#FF6060"
		})

		// Transition nodes to their new position.原有节点更新到新位置
		var nodeUpdate = node.transition()
			.duration(duration)
			.attr('transform', function(d) {
				return 'translate(' + d.x + ',' + d.y + ')';
			});

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

		// 折线样式
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
				return diagonal({
					d : {
						source: {
							x: d.source.x,
							y: d.source.y + 200
						},
						target: d.target
					},
				});
			})
		link.transition()
			.duration(duration)
			.attr('d', function(d) {

				if(forUpward) {
					return diagonal({
						d
					});
				}

				return diagonal({
					d : {
						source: {
							x: d.source.x,
							y:  d.source.name == 'origin'  ? d.source.y : d.source.y + d.target.Collection.length * 25 -10 
						},
						target: d.target
					},
				});
			});
		link.exit().transition()
			.duration(duration)
			.attr('d', function(d) {
				return diagonal({
					d
				});
			})
			.remove();

		
		//添加动态关系线
		function nodeHover(d, i) {
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
	}
	function redraw() {
		treeG.attr('transform', 'translate(' + zoom.translate() + ')' +
			' scale(' + zoom.scale() + ')');
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
};
let events = {
  nodeClick: null
}
function register(opts) {
	Object.assign(events, opts);
}
export default {
  register,
  drawing,
  zoomClick,
  refresh,
};

