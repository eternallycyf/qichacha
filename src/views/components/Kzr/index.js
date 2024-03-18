import kzrJson from "@/api/kzrJson.json";
import $ from 'jquery'
import cytoscape from 'cytoscape'
import * as d3 from 'd3'
var cy;
// 声明变量
const length = (kzrJson.data.totalPercent + '').length - 4
const totalPercent = (kzrJson.data.totalPercent * 100).toFixed(length) + '%'
var activeNode;
var graphDatas; //接口返回的原始数据
var _rootData, _rootNode; //原始数据转换成的graph数据,根节点数据

var _COLOR = {
  node: {
    person: 'rgb(255, 96, 96)',
    company: 'rgb(78, 162, 240)',
    current: 'rgb(255, 158, 0)'
  },
  border: {
    person: 'rgb(255, 96, 96)',
    company: 'rgb(78, 162, 240)',
    current: '#EF941B'
  },
  line: {
    invest: 'rgb(255, 96, 96)',
    employ: 'rgb(78, 162, 240)'
  }
};
var _companyRadius = 35, _personRadius = 15, _circleMargin = 10, _circleBorder = 3, _layoutNode = {}, _isFocus = false;
var _maxChildrenLength = 0;
var _currentKeyNo = "9eda1ceb-4d50-4b02-9ef0-ad1437d24f75";

/** 解决浏览器标签切换排列问题 */
var _isNeedReload = false;
var _isGraphLoaded = false;
var state, visibilityChange;
export function init() {
  /** 网页当前状态判断 (解决没布局完就切换页面造成点聚集在一起)*/
  if (typeof document.hidden !== "undefined") {
    visibilityChange = "visibilitychange";
    state = "visibilityState";
  } else if (typeof document.mozHidden !== "undefined") {
    visibilityChange = "mozvisibilitychange";
    state = "mozVisibilityState";
  } else if (typeof document.msHidden !== "undefined") {
    visibilityChange = "msvisibilitychange";
    state = "msVisibilityState";
  } else if (typeof document.webkitHidden !== "undefined") {
    visibilityChange = "webkitvisibilitychange";
    state = "webkitVisibilityState";
  }
	document.addEventListener(visibilityChange, function() {
		// console.log(document[state]);
		if (document[state] == 'visible') {
			if (_isNeedReload) {
				$("#MainCy").html('');
				$('#TrTxt').removeClass('active');
				getData();
			}
		} else {
			if (!_isGraphLoaded) {
				_isNeedReload = true;
			}
		}
	}, false);
	/** end 解决浏览器标签切换排列问题 */
	$(document).ready(function() {
		// 获取数据
		getData();

		// 监听容器的滚动事件
		document.getElementById("MainCy").addEventListener("wheel", function(e) {
			var type = 1;
			if (e.wheelDelta > 0) {
				type = 1;
			} else {
				type = 2;
			}
			maoScale(type);
		});
	});
}

function maoScale(type) {
	var rate = 0.2;
	var scale = cy.zoom();
	if (type == 1) {
		scale += rate;
	} else if (type == 2) {
		scale -= rate;
	}
	cy.zoom({
		level: scale, // the zoom level
	});
}

function getData() {
	// 模拟数据
	graphDatas = kzrJson.data
	_rootData = getRootData(graphDatas);
	domUpdate(_rootData);
}

// 图谱、筛选面板更新
function domUpdate(graphData) {
	console.log(graphData);
	getD3Position(graphData);

	setTimeout(function() {
		drawGraph(transformData(graphData));
	}, 500);

}

// ---------------------------- domUpdate 调用的方法 ---- Begin
function getD3Position(graph) {
	getLayoutNode(graph);

	function filterLinks1(graph) {
		// 筛选用于布局的links
		var layoutLinks = [];
		for (var i = 0; i < graph.links.length; i++) {
			var link = graph.links[i];
			var sourceLevel = link.sourceNode.layout.level;
			var targetLevel = link.targetNode.layout.level;
			var sourceNode = link.sourceNode;
			var targetNode = link.targetNode;
			if ((sourceLevel == 1 && targetLevel == 2) || (sourceLevel == 2 && targetLevel == 1)) {
				layoutLinks.push(link);
			}
			if ((sourceLevel == 2 && targetLevel == 3) || (sourceLevel == 3 && targetLevel == 2)) {
				layoutLinks.push(link);
			}
		}
		layoutLinks.forEach(function(link, i) {
			if (link.targetNode.layout.level == 3) {
				layoutLinks.forEach(function(alink, j) {
					if (alink.linkId != link.linkId &&
						(alink.targetNode.nodeId == link.targetNode.nodeId || alink
							.sourceNode
							.nodeId == link.targetNode.nodeId)) {
						layoutLinks.splice(j, 1);
					}
				})
			}

			if (link.sourceNode.layout.level == 3) {
				layoutLinks.forEach(function(alink, j) {
					if (alink.linkId != link.linkId &&
						(alink.targetNode.nodeId == link.sourceNode.nodeId || alink
							.sourceNode
							.nodeId == link.sourceNode.nodeId)) {
						layoutLinks.splice(j, 1);
					}
				})
			}
		})
		return layoutLinks;
	}

	function initD3Data(graph) {
		function getIndex(val, arr) {
			var index = 0;
			for (var i = 0; i < arr.length; i++) {
				var obj = arr[i];
				if (val == obj.nodeId) {
					index = i;
					break;
				}
			}
			return index;
		}

		/*封装符合d3的数据*/
		for (var i = 0; i < graph.nodes.length; i++) {
			var node = graph.nodes[i];
			node.id = node.nodeId;
		}

		for (var i = 0; i < graph.links.length; i++) {
			var link = graph.links[i];
			link.source = getIndex(link.sourceNode.nodeId, graph.nodes);
			link.target = getIndex(link.targetNode.nodeId, graph.nodes);
			link.index = i; //
		}

		graph.layoutLinks = filterLinks1(graph);
		// 围绕节点最大数值
		setSingleLinkNodes(graph.layoutLinks);
		// graph.nodes.forEach(function(node, i) {
		// 	if (node.layout.singleLinkChildren.length && _maxChildrenLength < node.layout
		// 		.singleLinkChildren.length) {
		// 		_maxChildrenLength = node.layout.singleLinkChildren.length
		// 	}
		// })
	}

	initD3Data(graph);

	var width = $("#MainD3 svg").width();
	var height = $("#MainD3 svg").height();
	var strength = -600,
	distanceMax = 330,
	theta = 0,
	distance = 180,
	colideRadius = 35,
	distanceMin = 400;
	// 根据节点数量调节
	if (graph.nodes.length < 50) {
		strength = -800;
		distanceMax = 400;
	} else if (graph.nodes.length > 50 && graph.nodes.length < 100) {
		strength = -800;
		distanceMax = 350;
		distance = 130;
		colideRadius = 35;
	} else if (graph.nodes.length > 100 && graph.nodes.length < 150) {
		strength = -900;
		distanceMax = 450;
	} else if (graph.nodes.length > 150 && graph.nodes.length < 200) {
		strength = -1000;
		distanceMax = 500;
	} else if (graph.nodes.length > 200) {
		strength = -1600;
		distanceMax = 500;
		theta = 0.6, distance = 100, colideRadius = 35;
	}
	// 根据围绕数量调节
	if (_maxChildrenLength > 50 && _maxChildrenLength < 100) {
		strength = -2000;
		distanceMax = 500;
	} else if (_maxChildrenLength > 1000 && _maxChildrenLength < 2000) {
		strength = -4000;
		distanceMax = 1500;
	}

	d3.forceSimulation(graph.nodes)
	.force('charge', d3.forceManyBody().strength(strength).distanceMax(distanceMax).theta(theta))
	.force('link', d3.forceLink(graph.layoutLinks).distance(distance))
	.force('center', d3.forceCenter(width / 2, height / 2))
	.force('collide', d3.forceCollide().radius(function() {
		return colideRadius;
	}))
	//.on('tick',ticked);
}
	









//设置符合Layout的node
function getLayoutNode(graphData) {
	var layoutNode = {
		current: _rootNode,
		level1: [],
		level2: [],
		level3: [],
		level4: [],
		level5: [],
		other: []
	};

	graphData.nodes.forEach(function(node, i) {
		switch (node.layout.level) {
			case 1:
				layoutNode.level1.push(node);
				break;
			case 2:
				layoutNode.level2.push(node);
				break;
			case 3:
				layoutNode.level3.push(node);
				break;
			case 4:
				layoutNode.level4.push(node);
				break;
			case 5:
				layoutNode.level5.push(node);
				break;
			default:
				layoutNode.other.push(node);
				break;
		}
	});
	_layoutNode = layoutNode;
	return layoutNode;
}

// 数据处理：设置唯一孩子
function setSingleLinkNodes(links) {
	function isSingleLink(nodeId, links) {
		var hasLinks = 0;
		var isSingle = true;
		for (var i = 0; i < links.length; i++) {
			var link = links[i];
			if (link.targetNode.nodeId == nodeId || link.sourceNode.nodeId == nodeId) {
				hasLinks++;
			}
			if (hasLinks > 1) {
				isSingle = false;
				break;
			}
		}
		return isSingle;
	} // isSingleLink

	links.forEach(function(link, i) {
		if (isSingleLink(link.sourceNode.nodeId, links)) {
			link.targetNode.layout.singleLinkChildren.push(link.sourceNode);
		}
		if (isSingleLink(link.targetNode.nodeId, links)) {
			link.sourceNode.layout.singleLinkChildren.push(link.targetNode);
		}
	});
}
// 绘制图谱
function drawGraph(elements) {
	_currentKeyNo,
	_companyRadius = 35,
	_personRadius = 15,
	_circleMargin = 10,
	_circleBorder = 3;
	cy = cytoscape({
		container: document.getElementById('MainCy'),
		motionBlur: false,
		textureOnViewport: false,
		wheelSensitivity: 0,
		elements: elements,
		minZoom: 0.4,
		maxZoom: 5,
		zoomingEnabled: true, //是否可缩放，改为false图谱的位置会靠左不居中
		userZoomingEnabled: false, //是否允许用户事件(例如鼠标轮、按下缩放)缩放图形.缩放的编程更改不受此选项的影响  -- 这里改为false,然后通过自定义事件来控制图谱的缩放
		layout: {
			name: 'preset',
			padding: 10,
			stop: function(e) {
				//解决浏览器标签切换排列问题
				if (document[state] == 'hidden') {
					_isNeedReload = true;
					// console.log('stop _isNeedReload=true');
				} else {
					_isNeedReload = false;
				}
				setTimeout(function() {
					if (document[state] == 'hidden') {
						_isGraphLoaded = false;
						console.log('stop _isGraphLoaded=false');
					} else {
						_isGraphLoaded = true;
					}
				}, 1000);
			}
		},
		style: [{
				// 节点样式
				selector: 'node',
				style: {
					shape: 'ellipse',
					width: function(ele) {
						//普通
						if (ele.data("type") == 'E' || ele.data("type") == 'UE') {
							return 60;
						}
						return 45;
					},
					height: function(ele) {
						//普通
						if (ele.data("type") == 'E' || ele.data("type") == 'UE') {
							return 60;
						}
						return 45;
					},
					'background-color': function(ele) {
						return ele.data('color');
					},
					'background-fit': 'cover',
					'border-color': function(ele) {
						return ele.data("borderColor");
					},
					'border-width': 1,
					'border-opacity': 1,
					label: function(ele) {
						var label = ele.data("name");
						var length = label.length;
						if (length <= 5) { // 4 5 4排列
							return label;
						} else if (length >= 5 && length <= 9) {
							return label.substring(0, length - 5) + '\n' + label.substring(
								length -
								5, length);
						} else if (length >= 9 && length <= 13) {
							return label.substring(0, 4) + '\n' + label.substring(4, 9) +
								'\n' +
								label.substring(9, 13);
						} else {
							return label.substring(0, 4) + '\n' + label.substring(4, 9) +
								'\n' +
								label.substring(9, 12) + '..';
						}
					},
					'z-index-compare': 'manual',
					'z-index': 20,
					color: "#fff",
					'padding': function(ele) {
						if (ele.data("type") == 'E' || ele.data("type") == 'UE') {
							return 3;
						}
						return 0;
					},
					'font-size': 12,
					'font-family': 'microsoft yahei',
					'text-wrap': 'wrap',
					'text-max-width': 60,
					'text-halign': 'center',
					'text-valign': 'center',
					'overlay-color': '#fff',
					'overlay-opacity': 0,
					'background-opacity': 1,
					'text-background-color': '#000',
					'text-background-shape': 'roundrectangle',
					'text-background-opacity': 0,
					'text-background-padding': 0,
					'text-margin-y': function(ele) {
						if (ele.data("type") == 'E' || ele.data("type") == 'UE') {
							return 4;
						}
						return 2;
					}
				},
			},
			{
				// 连接线的样式
				selector: 'edge',
				style: {
					// 'text-rotation': 'autorotate',
					/*标签方向*/
					'line-style': function(ele) {
						return 'solid';
					},
					'curve-style': 'bezier',
					'control-point-step-size': 20,
					'target-arrow-shape': 'triangle',
					/*箭头样式*/
					'target-arrow-color': function(ele) {
						return ele.data("color");
					},
					'arrow-scale': 0.5,
					'line-color': function(ele) {
						return ele.data("color");
					},
					label: function(ele) {
						return ele.data("label");
					},
					'font-size': 12,
					'background-color': function(ele) {
						return ele.data("color");
					},
					'width': 0.3,
					'color': function(ele) {
						return ele.data("color");
					},
					'overlay-color': '#fff',
					'overlay-opacity': 0,
					'font-family': 'microsoft yahei',
					'text-opacity': 1,
					'text-background-color': '#fff',
					'text-background-opacity': 1,
					'text-background-padding': 3,
					'source-text-margin-y': 20,
					'target-text-margin-y': 20,
					}
				},
				{
					selector: '.hidetext',
					style: {
						'text-opacity': 0,
						label: function(ele) {
							return '';
						}
					}
				},
				{
					selector: '.dull',
					style: {
						'z-index': 1,
						opacity: 0.2,
					}
				},
				{
					selector: '.edgeLevel1',
					style: {
						label: function(ele) {
							return ele.data("label");
						},
					}
				},
				{
					selector: '.lineFixed', // 加载完成后，加载该类，修复线有锯齿的问题
					style: {
						'overlay-opacity': 0,
					}
				},
			],
		});
		/**
		 * 鼠标点击节点后触发
		 */
		cy.on('click', 'node', function(evt) {
			console.log(111111)
			if (evt.target._private.style['z-index'].value == 20) { // 非暗淡状态
				_isFocus = true;
				var node = evt.target;
				var nodeData = node._private.data;
				if (nodeData.type == 'E' || nodeData.type == 'UE') {
					showDetail2(nodeData.keyNo, 'company_muhou3');
					cy.collection("node").addClass('nodeDull');
				} else {
					showDetail2(nodeData.keyNo, 'company_muhou3', 'person');
					cy.collection("node").addClass('nodeDull');
				}
				activeNode = node;
				node.neighborhood("edge").removeClass("opacity");
				node.neighborhood("edge").connectedNodes().removeClass("opacity");
			//_firstTab = false;
			} else {
				_isFocus = false;
				activeNode = null;
				$('.tp-detail').fadeOut();
			}
		});
		/**
		 * 图谱缩放后触发
		 */
		cy.on('zoom', function() {
			console.log(cy.zoom());
			if (cy.zoom() < 0.5) {
				cy.collection("node").addClass("hidetext");
				cy.collection("edge").addClass("hidetext");
			} else {
				cy.collection("node").removeClass("hidetext");
				cy.collection("edge").removeClass("hidetext");
			}
			// 加载完成后，加载该类，修复线有锯齿的问题
			setTimeout(function() {
				cy.collection("edge").removeClass("lineFixed");
				cy.collection("edge").addClass("lineFixed");
			}, 200);
		})
		// 定位
	cy.nodes().positions(function (node, i) {
		console.log('position----', node, i)
			// 保持居中
			if (node._private.data.keyNo == _currentKeyNo) {
				var position = cy.pan();
				cy.pan({
					x: position.x - node._private.data.d3x,
					y: position.y - node._private.data.d3y
				});
			}
			return {
				x: node._private.data.d3x,
				y: node._private.data.d3y
			};
		});

		cy.ready(function () {
			if (!$('#TrTxt').hasClass('active')) {
				$('#TrTxt').click();
			}
			cy.zoom({
				level: 1, // the zoom level
			});
			$("#load_data").hide();
			//cy.$('#'+id).emit('tap');
			//cy.center(cy.$('#'+id));

			// 禁止对节点进行移动或拖拽
			cy.nodes().ungrabify()
			// 加载完成后，加载该类，修复线有锯齿的问题
			setTimeout(function() {
				cy.collection("edge").addClass("lineFixed");
			}, 400);

		});

		cy.nodes(function(node) {
			/*
			// 当前查询节点关系文字显示
			if(node._private.data.nodeId == _rootNode.nodeId){
					node.neighborhood("edge").addClass("edgeLevel1");
			}*/
		});
	}
//将rootData转换成cy图谱框架所需要的数据结构
function transformData(graphData) {
	function getLinkColor(type) {
		if (type == 'SH') {
			return _COLOR.line.invest;
		} else if (type == 'EXEC' || type == 'LR') {
			return _COLOR.line.employ;
		}
	}

	function getLinkLabel(link) {
		return totalPercent
	}
	//getLayoutNode(graphData);
	var els = {};
	els.nodes = [];
	els.edges = [];

	graphData.links.forEach(function(link, i) {
		var color = getLinkColor(link.data.type);
		var label = getLinkLabel(link);
		els.edges.push({
			data: {
				data: link.data,
				color: color,
				id: link.linkId,
				label: label,
				source: link.sourceNode.nodeId,
				target: link.targetNode.nodeId
			},
		});
	});

	graphData.nodes.forEach(function(node) {
		els.nodes.push({
			data: {
				nodeId: node.nodeId,
				type: node.data.type,
				keyNo: node.data.uid,
				data: node.data,
				id: node.nodeId,
				name: node.data.name,
				category: node.data.category,
				color: node.data.color,
				borderColor: node.data.strokeColor,
				layout: node.layout,
				d3x: node.x,
				d3y: node.y,
				//   hasImage:node.data.properties.hasImage,
				//labelLine:1 // 解决文字行距问题，第1行
			}
		});
	});
	return els;
}
function showDetail2(keyNo, tupuUrl, type) {
	console.log(keyNo)
}

// ---------------------------- domUpdate 调用的方法 ---- End

// 数据处理：将原始数据转换成graph数据
function getRootData(list) {
	// console.log(list);
	var graph = {}
	graph.nodes = [];
	graph.links = [];

	//graph.nodes
	var nodes = list.nodes;
	for (var j = 0; j < nodes.length; j++) {
		var node = nodes[j];
		var o = {};
		o.nodeId = node.id;
		o.data = {};
		o.data = node;
		//o.data.showStatus = 'NORMAL'; // NORMAL HIGHLIGHT DULL
		o.data.showStatus = null; // NORMAL HIGHLIGHT DULL
		o.layout = {}
		o.layout.level = null; // 1 当前查询节点
		o.layout.singleLinkChildren = []; // 只连接自己的node
		graph.nodes.push(o);

		// 设置_rootNode
		if (_currentKeyNo == o.data.uid) {
			_rootNode = o;
		}
	}
	//graph.links
	var relationships = list.links;
	for (var k = 0; k < relationships.length; k++) {
		var relationship = relationships[k];
		var o = {}
		o.data = {};
		o.data = relationship;
		//o.data.showStatus = 'NORMAL'; // NORMAL HIGHLIGHT DULL
		o.data.showStatus = null; // NORMAL HIGHLIGHT DULL
		o.sourceNode = getGraphNode(relationship.sourceId, graph.nodes);
		o.targetNode = getGraphNode(relationship.targetId, graph.nodes);
		// o.linkId = relationship.id;
		o.source = getNodesIndex(relationship.sourceId, graph.nodes);
		o.target = getNodesIndex(relationship.targetId, graph.nodes);
		graph.links.push(o);
	}
	setLevel(graph.nodes, graph.links);
	setCategoryColor(graph.nodes, graph.links);
	return graph;
}
//  --------------------------- getRootData()引用的函数 ----- Begin
//去重操作,元素为对象
function uniqeByKeys(array, keys) {
	//将对象元素转换成字符串以作比较
	function obj2key(obj, keys) {
		var n = keys.length,
			key = [];
		while (n--) {
			key.push(obj[keys[n]]);
		}
		return key.join('|');
	}

	var arr = [];
	var hash = {};
	for (var i = 0, j = array.length; i < j; i++) {
		var k = obj2key(array[i], keys);
		if (!(k in hash)) {
			hash[k] = true;
			arr.push(array[i]);
		}
	}
	return arr;
};
// 数据处理：根据nodeId获取node
function getGraphNode(nodeId, nodes) {
	var node = null;
	for (var i = 0; i < nodes.length; i++) {
		if (nodes[i].nodeId == nodeId) {
			node = nodes[i];
			break;
		}
	}
	return node;
}
// 数据处理：根据nodeId获取node 索引
function getNodesIndex(nodeId, nodes) {
	var index = 0;
	for (var i = 0; i < nodes.length; i++) {
		var node = nodes[i];
		if (nodeId == node.nodeId) {
			index = i;
			break;
		}
	}
	return index;
}
// 数据处理：设置节点层级
function setLevel(svg_nodes, svg_links) {
	function getNextNodes(nodeId, links, parentLevel) {
		var nextNodes = [];
		for (var i = 0; i < links.length; i++) {
			var link = links[i];
			if (nodeId == link.sourceNode.nodeId && !link.targetNode.layout.level) {
				link.targetNode.layout.level = parentLevel;
				nextNodes.push(link.targetNode);
			} else if (nodeId == link.targetNode.nodeId && !link.sourceNode.layout.level) {
				link.sourceNode.layout.level = parentLevel;
				nextNodes.push(link.sourceNode);
			}
		}
		nextNodes = uniqeByKeys(nextNodes, ['nodeId']);
		return nextNodes;
	}
	var level = 1;
	var nodes = [];
	nodes.push(_rootNode);
	while (nodes.length) {
		var nextNodes = [];
		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i] || {};
			node.layout.level = level;
			nextNodes = nextNodes.concat(getNextNodes(node.nodeId, svg_links, level));
		}
		level++;
		nodes = nextNodes;
	}
}
// 数据处理：设置节点角色
function setCategoryColor(nodes, links) {
	for (var i = 0; i < links.length; i++) {
		var sameLink = {}; // 两点间连线信息
		sameLink.length = 0; // 两点间连线数量
		sameLink.currentIndex = 0; // 当前线索引
		sameLink.isSetedSameLink = false;
		links[i].sameLink = sameLink;
	}
	/*链接相同两点的线*/
	for (var i = 0; i < links.length; i++) {
		var baseLink = links[i];

		if (baseLink.sameLink.isSetedSameLink == false) {
			baseLink.sameLink.isSetedSameLink = true;
			var nodeId1 = baseLink.sourceNode.nodeId;
			var nodeId2 = baseLink.targetNode.nodeId;
			var sameLinks = [];
			sameLinks.push(baseLink);
			for (var j = 0; j < links.length; j++) {
				var otherLink = links[j];
				if (baseLink.linkId != otherLink.linkId && !otherLink.sameLink.isSetedSameLink) {
					if ((otherLink.sourceNode.nodeId == nodeId1 && otherLink.targetNode.nodeId ==
							nodeId2) ||
						(otherLink.sourceNode.nodeId == nodeId2 && otherLink.targetNode.nodeId == nodeId1)
					) {
						sameLinks.push(otherLink);
						otherLink.sameLink.isSetedSameLink = true;
					}
				}
			}
			for (var k = 0; k < sameLinks.length; k++) {
				var oneLink = sameLinks[k];
				oneLink.sameLink.length = sameLinks.length; // 两点间连线数量
				oneLink.sameLink.currentIndex = k; // 当前线索引
			}
		}
	}
	for (var i = 0; i < nodes.length; i++) {
		var node = nodes[i];
		if (_currentKeyNo == node.data.uid) { // 当前节点
			node.data.color = _COLOR.node.current;
			node.data.strokeColor = _COLOR.border.current;
		} else if (node.data.type == 'E' || node.data.type == 'UE') {
			node.data.color = _COLOR.node.company;
			node.data.strokeColor = _COLOR.border.company;
		} else {
			node.data.color = _COLOR.node.person;
			node.data.strokeColor = _COLOR.border.person;
		}
	}
}