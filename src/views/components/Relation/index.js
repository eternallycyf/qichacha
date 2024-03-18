import * as d3 from "d3";
import $ from "jquery";
import cytoscape from "cytoscape";
import store from "../../../store";
// 声明变量
var domId;
var cy;
var activeNode;
var _rootData, _rootNode; //原始数据转换成的graph数据,根节点数据
var hidden, state, visibilityChange;
// 用于保存ajax请求的数据
let relativeData;
// 过滤条件是否改变
let _isFilterConditionChange = false;

const _COLOR = {
  node: {
    person: "rgb(255, 96, 96)",
    company: "rgb(78, 162, 240)",
    current: "rgb(255, 158, 0)",
  },
  border: {
    person: "rgb(255, 96, 96)",
    company: "rgb(78, 162, 240)",
    current: "#EF941B",
  },
  line: { invest: "rgb(255, 96, 96)", employ: "rgb(78, 162, 240)" },
};

var _currentKeyNo,
  _layoutNode = {},
  _isFocus = false;
let relationMap = new Map();

var _maxChildrenLength = 0;
/** 解决浏览器标签切换排列问题 */
var _isNeedReload = false;
var _isGraphLoaded = false;

// 数据处理：设置唯一孩子
function setSingleLinkNodes(links) {
  function isSingleLink(nodeId, links) {
    var hasLinks = 0;
    var isSingle = true;
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      if (
        link.targetNode.nodeId == nodeId ||
        link.sourceNode.nodeId == nodeId
      ) {
        hasLinks++;
      }
      if (hasLinks > 1) {
        isSingle = false;
        break;
      }
    }
    return isSingle;
  } // isSingleLink

  links.forEach(function (link, i) {
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
  
  cy = cytoscape({
    container: document.getElementById("MainCy"),
    motionBlur: false,
    textureOnViewport: false,
    wheelSensitivity: 0,
    elements: elements,
    minZoom: 0.4,
    maxZoom: 5,
    zoomingEnabled: true, //是否可缩放，改为false图谱的位置会靠左不居中
    userZoomingEnabled: false, //是否允许用户事件(例如鼠标轮、按下缩放)缩放图形.缩放的编程更改不受此选项的影响  -- 这里改为false,然后通过自定义事件来控制图谱的缩放
    layout: {
      // zoom: 1,
      name: "preset",
      componentSpacing: 40,
      nestingFactor: 12,
      padding: 10,
      edgeElasticity: 800,
      stop: function (e) {
        //解决浏览器标签切换排列问题
        if (document[state] == "hidden") {
          _isNeedReload = true;
          // console.log('stop _isNeedReload=true');
        } else {
          _isNeedReload = false;
        }
        setTimeout(function () {
          if (document[state] == "hidden") {
            _isGraphLoaded = false;
            console.log("stop _isGraphLoaded=false");
          } else {
            _isGraphLoaded = true;
          }
        }, 1000);
      },
    },
    style: [
      {
        // 节点样式
        selector: "node",
        style: {
          shape: "ellipse",
          width: function (ele) {
            // 当前节点有图片
            //   if(ele.data("type") == 'P' && _currentKeyNo == ele.data('keyNo') && ele.data('hasImage')){
            //       return 80;
            //   }
            // 有图片
            //   if(ele.data('hasImage') && ele.data('type') == 'P'){
            //       return 60;
            //   }
            //普通
            if (ele.data("type") == "E" || ele.data("type") == "UE") {
              return 60;
            }
            return 45;
          },
          height: function (ele) {
            //   //当前节点有图片
            //   if(ele.data("type") == 'P' && _currentKeyNo == ele.data('keyNo') && ele.data('hasImage')){
            //       return 80;
            //   }
            //   //有图片
            //   if(ele.data('hasImage') && ele.data('type') == 'P'){
            //       return 60;
            //   }
            //普通
            if (ele.data("type") == "E" || ele.data("type") == "UE") {
              return 60;
            }
            return 45;
          },
          "background-color": function (ele) {
            return ele.data("color");
          },
          "background-fit": "cover",
          //   'background-image': function (ele) {
          //       var hasImage = ele.data('hasImage');
          //       var keyNo = ele.data('keyNo');
          //       var type = ele.data('type');
          //       if(hasImage && type == 'P'){
          //           return '/proxyimg_'+ keyNo+'.jeg';
          //       } else {
          //           return 'none';
          //       }
          //   },
          // 'background-image-crossorigin': 'use-credentials',
          "border-color": function (ele) {
            return ele.data("borderColor");
          },
          "border-width": function (ele) {
            return 1;
            //   if(ele.data('hasImage') && ele.data('type') == 'P'){
            //       return 3;
            //   } else {
            //       return 1;
            //   }
          },
          "border-opacity": 1,
          label: function (ele) {
            var label = ele.data("name");
            var length = label.length;

            if (length <= 5) {
              // 4 5 4排列
              return label;
            } else if (length >= 5 && length <= 9) {
              return (
                label.substring(0, length - 5) +
                "\n" +
                label.substring(length - 5, length)
              );
            } else if (length >= 9 && length <= 13) {
              return (
                label.substring(0, 4) +
                "\n" +
                label.substring(4, 9) +
                "\n" +
                label.substring(9, 13)
              );
            } else {
              return (
                label.substring(0, 4) +
                "\n" +
                label.substring(4, 9) +
                "\n" +
                label.substring(9, 12) +
                ".."
              );
            }
          },
          "z-index-compare": "manual",
          "z-index": 20,
          color: "#fff",
          //'padding-top':0,
          padding: function (ele) {
            if (ele.data("type") == "E" || ele.data("type") == "UE") {
              return 3;
            }
            return 0;
          },
          "font-size": 12,
          //'min-height':'400px',
          //'ghost':'yes',
          //'ghost-offset-x':300,
          //'font-weight':800,
          //'min-zoomed-font-size':6,
          "font-family": "microsoft yahei",
          "text-wrap": "wrap",
          "text-max-width": 60,
          "text-halign": "center",
          "text-valign": "center",
          "overlay-color": "#fff",
          "overlay-opacity": 0,
          "background-opacity": 1,
          "text-background-color": "#000",
          "text-background-shape": "roundrectangle",
          "text-background-opacity": function (ele) {
            return 0;
            //   if(ele.data('hasImage') && ele.data('type') == 'P'){
            //       return 0.3;
            //   } else {
            //       return 0
            //   }
          },
          "text-background-padding": 0,
          "text-margin-y": function (ele) {
            //当前节点有图片
            //   if(ele.data("type") == 'P' && _currentKeyNo == ele.data('keyNo') && ele.data('hasImage')){
            //       return 23;
            //   }
            //   // 有图片
            //   if(ele.data('hasImage') && ele.data('type') == 'P'){
            //       return 16;
            //   }
            //
            if (ele.data("type") == "E" || ele.data("type") == "UE") {
              return 4;
            }
            return 2;
          },
        },
      },
      {
        // 连接线的样式
        selector: "edge",
        style: {
          /*标签方向*/
          "line-style": function (ele) {
            return "solid";
            /*if(ele.data('data').obj.type == 'INVEST'){
									    return 'solid';
									} else {
									    return 'dashed'
									}*/
          },
          "curve-style": "bezier",
          "control-point-step-size": 20,
          "target-arrow-shape": "triangle",
          /*箭头样式*/
          "target-arrow-color": function (ele) {
            return ele.data("color");
          },
          "arrow-scale": 0.5,
          "line-color": function (ele) {
            //return '#aaaaaa';
            return ele.data("color");
          },
          label: function (ele) {
            return ele.data("label");
          },
          "text-opacity": 0.8,
          "font-size": 12,
          "background-color": function (ele) {
            return ele.data("color");
          },
          width: 0.3,
          color: "#888",
          "overlay-color": "#fff",
          "overlay-opacity": 0,
          "font-family": "microsoft yahei",
        },
      },
      //   悬浮节点样式
      {
        selector: ".nodeActive",
        style: {
          /*'background-color':function (ele) {
								    if(ele.data("category")==1){
								        return "#5c8ce4"
								    }
								    return "#d97a3a";
								},*/
          //'z-index':300,
          "border-color": function (ele) {
            return ele.data("color");
          },
          "border-width": 10,
          "border-opacity": 0.5,
        },
      },
      {
        selector: ".edgeShow",
        style: {
          color: "#999",
          "text-opacity": 1,
          "font-weight": 400,
          label: function (ele) {
            return ele.data("label");
          },
          "font-size": 10,
        },
      },
      //   悬浮在线上的样式
      {
        selector: ".edgeActive",
        style: {
          "arrow-scale": 0.8,
          width: 1.5,
          color: function (ele) {
            return ele.data("color");
          },
          "text-opacity": 1,
          "font-size": 12,
          "text-background-color": "#fff",
          "text-background-opacity": 0.8,
          "text-background-padding": 3,
          "source-text-margin-y": 20,
          "target-text-margin-y": 20,
          //'text-margin-y':3,
          "z-index-compare": "manual",
          "z-index": 1,
          "line-color": function (ele) {
            return ele.data("color");
          },
          "target-arrow-color": function (ele) {
            return ele.data("color");
          },
          label: function (ele) {
            /*if(ele.data('data').type == 'SH'){
									    return 'solid';
									} else {
									    return 'dashed'
									}*/
            return ele.data("label");
          },
        },
      },
      {
        selector: ".hidetext",
        style: {
          "text-opacity": 0,
          label: function (ele) {
            return "";
          },
        },
      },
      {
        selector: ".dull",
        style: {
          "z-index": 1,
          opacity: 0.2,
        },
      },
      {
        selector: ".nodeHover",
        style: {
          shape: "ellipse",
          "background-opacity": 0.9,
        },
      },
      {
        selector: ".edgeLevel1",
        style: {
          label: function (ele) {
            return ele.data("label");
          },
        },
      },
      {
        selector: ".edgeShowText",
        style: {
          label: function (ele) {
            return ele.data("label");
          },
        },
      },
      {
        selector: ".lineFixed", // 加载完成后，加载该类，修复线有锯齿的问题
        style: {
          "overlay-opacity": 0,
        },
      },
    ],
  });
  /**
   * 鼠标点击节点后触发
   */
  cy.on("click", "node", function (evt) {
    // 筛选条件改变屏蔽其他点击事件
    // if(_isFilterConditionChange) {
    //   return;
    // }
    if (evt.target._private.style["z-index"].value == 20) {
      // 非暗淡状态
      _isFocus = true;
      var node = evt.target;

      highLight([node._private.data.id], cy);
      // 显示节点信息
      if (node.hasClass("nodeActive")) {
        store.commit('setCurrentNode', null)
        activeNode = null;
        node.removeClass("nodeActive");
        cy.collection("edge").removeClass("edgeActive");
      } else {
        var nodeData = node._private.data;
        if (nodeData.type == "E" || nodeData.type == "UE") {
          showDetail(nodeData.keyNo, 'url', 'company', nodeData);
          cy.collection("node").addClass("nodeDull");
        } else {
          showDetail(nodeData.keyNo,  'url', 'person', nodeData);
          cy.collection("node").addClass("nodeDull");
        }

        activeNode = node;
        cy.collection("node").removeClass("nodeActive");

        cy.collection("edge").removeClass("edgeActive");
        node.addClass("nodeActive");
        node.neighborhood("edge").removeClass("opacity");
        node.neighborhood("edge").addClass("edgeActive");
        node.neighborhood("edge").connectedNodes().removeClass("opacity");
      }
      //_firstTab = false;
    } else {
      _isFocus = false;
      activeNode = null;
      cy.collection("node").removeClass("nodeActive");
      cancelHighLight();
    }
  });
  /**
   * 鼠标按下时触发
   */
  cy.on("vmousedown", "node", function (evt) {
    var node = evt.target;
    if (!_isFocus) {
      highLight([node._private.data.id], cy);
    }
  });
  /**
   * 鼠标抬起/触摸结束时触发
   */
  cy.on("tapend", "node", function (evt) {
    if (!_isFocus) {
      cancelHighLight();
    }
  });
  /**
   * 鼠标悬停在节点上
   */
  cy.on("mouseover", "node", function (evt) {
  
    if(typeof events.nodeHover === 'function') {
        events.nodeHover.call(cy, evt);
    }
    if (evt.target._private.style["z-index"].value == 20) {
      // 非暗淡状态
      // $("#Main").css("cursor", "pointer");
      var node = evt.target;
      node.addClass("nodeHover");
      if (!_isFocus) {
        cy.collection("edge").removeClass("edgeShow");
        cy.collection("edge").removeClass("edgeActive");
        node.neighborhood("edge").addClass("edgeActive");
      }
    }
  });
  /**
   * 鼠标移开节点
   */
  cy.on("mouseout", "node", function (evt) {
    if(typeof events.nodeOut === 'function') {
      events.nodeOut.call(cy, evt);
    }

    //$("#Main").css("cursor", "default");
    var node = evt.target;
    node.removeClass("nodeHover");
    if (!_isFocus) {
      cy.collection("edge").removeClass("edgeActive");
      // if (moveTimeer) {
      // 	clearTimeout(moveTimeer);
      // }
      // moveTimeer = setTimeout(function() {
      // 	cy.collection("edge").addClass("edgeActive");
      // 	//cy.collection("edge").addClass("edgeShow");
      // }, 300);
      // if (activeNode) {
      // 	activeNode.neighborhood("edge").addClass("edgeActive");
      // }
    }
  });
  /**
   * 鼠标悬停在连线上
   */
  cy.on("mouseover", "edge", function (evt) {
    if (!_isFocus) {
      var edge = evt.target;
      // if (moveTimeer) {
      // 	clearTimeout(moveTimeer);
      // }
      cy.collection("edge").removeClass("edgeActive");
      edge.addClass("edgeActive");
      // if (activeNode) {
      // 	activeNode.neighborhood("edge").addClass("edgeActive");
      // }
    }
  });
  /**
   * 鼠标离开连线
   */
  cy.on("mouseout", "edge", function (evt) {
    if (!_isFocus) {
      var edge = evt.target;
      edge.removeClass("edgeActive");
      // moveTimeer = setTimeout(function() {
      // 	cy.collection("edge").addClass("edgeActive");
      // 	cy.collection("edge").addClass("edgeShow");
      // }, 400);
      if (activeNode) {
        activeNode.neighborhood("edge").addClass("edgeActive");
      }
    }
  });
  /**
   * 鼠标点击连线时触发
   */
  cy.on("click", "edge", function (evt) {
    // 筛选条件改变屏蔽其他点击事件
    // if(_isFilterConditionChange) {
    //   return;
    // }
    _isFocus = false;
    activeNode = null;
    cy.collection("node").removeClass("nodeActive");
    cancelHighLight();
  });
  cy.on('mouseover', (e) => {
    typeof events.backgroudHover ==='function' && events.backgroudHover(e);    
  });
  cy.on('mouseout', (e) => {
    typeof events.backgroudOut ==='function' && events.backgroudOut(e);    
  });

 // document.querySelectorAll('canvas').forEach(ele => {
  //   ele.addEventListener('mouseenter', (e) => {
  //     typeof events.backgroudHover ==='function' && events.backgroudHover(e);    
  //   });
  // })
  // document.querySelectorAll('canvas').forEach(ele => {
  //   ele.addEventListener('mouseover', (e) => {
  //     typeof events.backgroudOut ==='function' && events.backgroudOut(e);    
  //   });
  // })

  /**
   * 点击画布，节点全部恢复高亮
   */
  cy.on("click", function (event) {
    if( typeof events.backgroudClick ==='function' ) {
      const result = events.backgroudClick.call(cy);
      if(result) {
        return;
      }
    }
    // 筛选条件改变屏蔽其他点击事件
    // if(_isFilterConditionChange) {
    //   return;
    // }
    var evtTarget = event.target;
    if (evtTarget === cy) {
      _isFocus = false;
      activeNode = null;
      cy.collection("node").removeClass("nodeActive");

      cancelHighLight();
    }
  });
  /**
   * 图谱缩放后触发
   */
  cy.on("zoom", function () {
    if (cy.zoom() < 0.5) {
      cy.collection("node").addClass("hidetext");
      cy.collection("edge").addClass("hidetext");
    } else {
      cy.collection("node").removeClass("hidetext");
      cy.collection("edge").removeClass("hidetext");
    }

    // 加载完成后，加载该类，修复线有锯齿的问题
    setTimeout(function () {
      cy.collection("edge").removeClass("lineFixed");
      cy.collection("edge").addClass("lineFixed");
    }, 200);
  });
  /**
   * 图谱被移动/拖拽后触发
   */
  cy.on("pan", function () {
    // 加载完成后，加载该类，修复线有锯齿的问题
    setTimeout(function () {
      cy.collection("edge").removeClass("lineFixed");
      cy.collection("edge").addClass("lineFixed");
    }, 200);
  });

  // 定位
  cy.nodes().positions(function (node, i) {
    // 保持居中
    if (node._private.data.keyNo == _currentKeyNo) {
      var position = cy.pan();
      cy.pan({
        x: position.x - node._private.data.d3x,
        y: position.y - node._private.data.d3y,
      });
    }

    return {
      x: node._private.data.d3x,
      y: node._private.data.d3y,
    };
  });

  cy.ready(function () {
    cy.zoom({
      level: 1, // the zoom level
    });

    // 加载完成后，加载该类，修复线有锯齿的问题
    setTimeout(function () {
      cy.collection("edge").addClass("lineFixed");
    }, 400);

    // 首页的插入图谱默认高亮第一层
    if (
      _rootData &&
      _rootData.nodes.length > 30 &&
      typeof _INSERT_URL != "undefined" &&
      _INSERT_URL
    ) {
      highLight([_rootNode.nodeId], cy);
    }
  });

  cy.nodes(function (node) {
    /*
					// 当前查询节点关系文字显示
					if(node._private.data.nodeId == _rootNode.nodeId){
					    node.neighborhood("edge").addClass("edgeLevel1");
					}*/
  });
}

function highLight(nodeIds, cy) {
  cy.collection("node").removeClass("nodeActive");
  cy.collection("edge").removeClass("edgeActive");
  cy.collection("node").addClass("dull");
  cy.collection("edge").addClass("dull");

  for (var i = 0; i < nodeIds.length; i++) {
    var nodeId = nodeIds[i];
    cy.nodes(function (node) {
      var nodeData = node._private.data;
      if (nodeData.id == nodeId) {
        node.removeClass("dull");
        //node.addClass('nodeActive');
        node.neighborhood("edge").removeClass("dull");
        node.neighborhood("edge").addClass("edgeActive");
        node.neighborhood("edge").connectedNodes().removeClass("dull");
        //node.neighborhood("edge").connectedNodes().addClass("nodeActive");
      }
    });
  }
}

function highLightFilter(nodeIds, cy) {
  function isInNodeIds(nodeId) {
    for (var i = 0; i < nodeIds.length; i++) {
      if (nodeId == nodeIds[i]) {
        return true;
        break;
      }
    }
    return false;
  }
  cy.collection("node").removeClass("nodeActive");
  cy.collection("edge").removeClass("edgeActive");
  cy.collection("node").addClass("dull");
  cy.collection("edge").addClass("dull");

  for (var i = 0; i < nodeIds.length; i++) {
    var nodeId = nodeIds[i];
    cy.nodes(function (node) {
      var nodeData = node._private.data;
      if (nodeData.id == nodeId) {
        node.removeClass("dull");
        //node.addClass('nodeActive');
        /* node.neighborhood("edge").removeClass("dull");
							node.neighborhood("edge").addClass("edgeActive");
							node.neighborhood("edge").connectedNodes().removeClass("dull");*/
        //node.neighborhood("edge").connectedNodes().addClass("nodeActive");
      }
    });
  }

  cy.edges(function (edge) {
    var data = edge._private.data;
    if (isInNodeIds(data.target) && isInNodeIds(data.source)) {
      edge.removeClass("dull");
      edge.addClass("edgeActive");
    }
  });
}

function cancelHighLight() {
  cy.collection("node").removeClass("nodeActive");
  cy.collection("edge").removeClass("edgeActive");
  cy.collection("node").removeClass("dull");
  cy.collection("edge").removeClass("dull");
}

//将rootData转换成cy图谱框架所需要的数据结构
function transformData(graphData) {
  function getLinkColor(type) {
    if (type == "SH") {
      return _COLOR.line.invest;
    } else if (type == "EXEC" || type == "LR") {
      return _COLOR.line.employ;
    }
  }

  function getLinkLabel(link) {
    var type = link.data.type,
      role = link.data.properties.relationDescDetail;
    if (type == "SH") {
      return "投资";
    } else if (type == "EXEC" || type == "LR") {
      return role || "任职";
    }
  }
  //getLayoutNode(graphData);
  var els = {};
  els.nodes = [];
  els.edges = [];

  graphData.links.forEach(function (link, i) {
    var color = getLinkColor(link.data.type);
    var label = getLinkLabel(link);
    const linkId = link.sourceNode.nodeId + "" + link.targetNode.nodeId;
    link.linkId = linkId;
    els.edges.push({
      data: {
        data: link.data,
        color: color,
        id: linkId, //link.linkId,
        label: label,
        source: link.sourceNode.nodeId,
        target: link.targetNode.nodeId,
        properties: link.properties,
      },
    });
    relationMap.set(linkId, link);
  });

  graphData.nodes.forEach(function (node) {
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
      },
    });
  });

  getLayoutNode(graphData);
  return els;
}

function showDetail(keyNo, tupuUrl, type, data) {
  store.commit('setCurrentNode', data)
}

// ---------------------------- domUpdate 调用的方法 ---- End

// 数据处理：将原始数据转换成graph数据
function getRootData(list) {
  // console.log(list);
  var graph = {};
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
    o.layout = {};
    o.layout.level = null; // 1 当前查询节点
    o.layout.singleLinkChildren = []; // 只连接自己的node
    graph.nodes.push(o);

    // 设置_rootNode
    if (_currentKeyNo == o.data.uid) {
      _rootNode = o;
    }
  }
  // 去重
  //   graph.nodes = uniqeByKeys(graph.nodes,['nodeId']);

  //graph.links
  var relationships = list.links;
  for (var k = 0; k < relationships.length; k++) {
    var relationship = relationships[k];
    var o = {};
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

  // 去重
  //   graph.links = uniqeByKeys(graph.links,['linkId']);

  //emplyRevert(graph.links);
  //mergeLinks(graph.links);

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
    return key.join("|");
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
}
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
      } else if (
        nodeId == link.targetNode.nodeId &&
        !link.sourceNode.layout.level
      ) {
        link.sourceNode.layout.level = parentLevel;
        nextNodes.push(link.sourceNode);
      }
    }
    nextNodes = uniqeByKeys(nextNodes, ["nodeId"]);

    return nextNodes;
  }
  var level = 1;
  var nodes = [];
  // console.log(_rootNode, "_rootNode");
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
        if (
          baseLink.linkId != otherLink.linkId &&
          !otherLink.sameLink.isSetedSameLink
        ) {
          if (
            (otherLink.sourceNode.nodeId == nodeId1 &&
              otherLink.targetNode.nodeId == nodeId2) ||
            (otherLink.sourceNode.nodeId == nodeId2 &&
              otherLink.targetNode.nodeId == nodeId1)
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
    if (_currentKeyNo == node.data.uid) {
      // 当前节点
      node.data.color = _COLOR.node.current;
      node.data.strokeColor = _COLOR.border.current;
    } else if (node.data.type == "E" || node.data.type == "UE") {
      node.data.color = _COLOR.node.company;
      node.data.strokeColor = _COLOR.border.company;
    } else {
      node.data.color = _COLOR.node.person;
      node.data.strokeColor = _COLOR.border.person;
    }
  }
}

// 图谱、筛选面板更新
function domUpdate(graphData) {
  // console.log(graphData);
  getD3Position(graphData);

  setTimeout(function () {
    drawGraph(transformData(graphData));
  }, 500);

  // selPanelUpdateList(graphData.nodes, graphData.links, true);
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
    other: [],
  };

  graphData.nodes.forEach(function (node, i) {
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

// ---------------------------- domUpdate 调用的方法 ---- Begin
function getD3Position(graph) {
  function filterLinks1(graph) {
    // 筛选用于布局的links
    var layoutLinks = [];
    for (var i = 0; i < graph.links.length; i++) {
      var link = graph.links[i];
      var sourceLevel = link.sourceNode.layout.level;
      var targetLevel = link.targetNode.layout.level;
      var sourceNode = link.sourceNode;
      var targetNode = link.targetNode;
      // sourceNode.layout.isSetLink = false;
      // targetNode.layout.isSetLink = false;
      // if (!sourceNode.layout.isSetLink && !targetNode.layout.isSetLink) {
      if (
        (sourceLevel == 1 && targetLevel == 2) ||
        (sourceLevel == 2 && targetLevel == 1)
      ) {
        // sourceNode.layout.isSetLink = true;
        // targetNode.layout.isSetLink = true;
        layoutLinks.push(link);
      }
      if (
        (sourceLevel == 2 && targetLevel == 3) ||
        (sourceLevel == 3 && targetLevel == 2)
      ) {
        // sourceNode.layout.isSetLink = true;
        // targetNode.layout.isSetLink = true;
        layoutLinks.push(link);
      }
      // }
    }
    layoutLinks.forEach(function (link, i) {
      if (link.targetNode.layout.level == 3) {
        layoutLinks.forEach(function (alink, j) {
          if (
            alink.linkId != link.linkId &&
            (alink.targetNode.nodeId == link.targetNode.nodeId ||
              alink.sourceNode.nodeId == link.targetNode.nodeId)
          ) {
            layoutLinks.splice(j, 1);
          }
        });
      }

      if (link.sourceNode.layout.level == 3) {
        layoutLinks.forEach(function (alink, j) {
          if (
            alink.linkId != link.linkId &&
            (alink.targetNode.nodeId == link.sourceNode.nodeId ||
              alink.sourceNode.nodeId == link.sourceNode.nodeId)
          ) {
            layoutLinks.splice(j, 1);
          }
        });
      }
    });

    return layoutLinks;
  }

  function initD3Data(graph) {
    //
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
    graph.nodes.forEach(function (node, i) {
      if (
        node.layout.singleLinkChildren.length &&
        _maxChildrenLength < node.layout.singleLinkChildren.length
      ) {
        _maxChildrenLength = node.layout.singleLinkChildren.length;
      }
    });
    //console.log('围绕节点最大数值:' + _maxChildrenLength);
  }

  initD3Data(graph);

  var width = $("#MainD3 svg").width();
  var height = $("#MainD3 svg").height();


  var strength = -600,
    distanceMax = 330,
    theta = 0,
    distance = 130,
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
    (theta = 0.6), (distance = 100), (colideRadius = 35);
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
    .force(
      "charge",
      d3
        .forceManyBody()
        .strength(strength)
        .distanceMax(distanceMax)
        .theta(theta)
    )
    .force("link", d3.forceLink(graph.layoutLinks).distance(distance))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force(
      "collide",
      d3.forceCollide().radius(function () {
        return colideRadius;
      })
    );
  //.on('tick',ticked);
}

let zoomCompleted = true;
function maoScale(type) {
  // 防缩放抖动
  // 缩放动画未完成前不允许再次缩放
  if(!zoomCompleted) {
    return;
  }
  zoomCompleted = false;
  let c1 = cy.zoom();
  let c2 = c1 + 0.2 * type;
  dynamicZoom(c1, c2);

  function dynamicZoom(c1, c2) {
    d3 .transition()
    .duration(500)
    .tween("zoom", function () {
      var i = d3.interpolate(c1, c2);
      return function (t) {
        let scale =  i(t);
        if(scale == c2) {
          zoomCompleted = true;
        }
        cy.zoom({
          level: scale
        });
      };
    });
  }
  
}

function init(id) {
  domId = id;
  /** 网页当前状态判断 (解决没布局完就切换页面造成点聚集在一起)*/

  if (typeof document.hidden !== "undefined") {
    hidden = "hidden";
    visibilityChange = "visibilitychange";
    state = "visibilityState";
  } else if (typeof document.mozHidden !== "undefined") {
    hidden = "mozHidden";
    visibilityChange = "mozvisibilitychange";
    state = "mozVisibilityState";
  } else if (typeof document.msHidden !== "undefined") {
    hidden = "msHidden";
    visibilityChange = "msvisibilitychange";
    state = "msVisibilityState";
  } else if (typeof document.webkitHidden !== "undefined") {
    hidden = "webkitHidden";
    visibilityChange = "webkitvisibilitychange";
    state = "webkitVisibilityState";
  }

  document.addEventListener(
    visibilityChange,
    function () {
      if (document[state] == "visible") {
        if (_isNeedReload) {
          getData(relativeData, _currentKeyNo);
        }
      } else {
        if (!_isGraphLoaded) {
          _isNeedReload = true;
        }
      }
    },
    false
  );

  // 监听容器的滚动事件
  document.getElementById(domId).addEventListener("wheel", function (e) {
    maoScale(e.wheelDelta > 0 ? 1 : -1);
  });
}

// 文字的显隐
function wordsChange(newVal) {
  newVal ? cy.collection("edge").removeClass("hidetext") : cy.collection("edge").addClass("hidetext")
}

function getData(relativeJson, currentKeyNo) {
  // 缓存
  relativeData = relativeJson;
  _currentKeyNo = currentKeyNo;

  _rootData = getRootData(relativeJson);
  domUpdate(_rootData);
}

function exportImg() {
  const blobUrl = cy.png({
    bg: "#fff",
    full: true,
    scale: 3,
  });
  // console.log("png", blobUrl);
  const filename = "企业关系图谱.png";
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(blobUrl);
}

/**
 * 白灰色遮罩
 */
function deactiveElements(id) {
  cy.collection("node").removeClass("nodeActive");
  cy.collection("edge").removeClass("edgeActive");
  cy.collection("node").addClass("dull");
  cy.collection("edge").addClass("dull");
}

/**
 * 激活节点
 */
function activeNodeById(id) {
  const node = cy.filter('[id = "' + id + '"]')[0];
  node.removeClass("dull");
}

/**
 * 激活连线
 * @param {*} id
 */
function activeEdgeById(id) {
  const node = cy.filter('[id = "' + id + '"]')[0];
  node.removeClass("dull");
  node.addClass("edgeActive");
}

// 获取节点信息
function nodeDetail(keyNo, data) {
  return data
}

/**
 * 过滤
 *
 * @param {} state
 */
function filter(state) {
  // 检查筛选条件是否改变
  if(state.layer == 0 && state.status == 0 &&state.relation == 0 &&state.shareholding == 0 ) {
    _isFocus = false;
    _isFilterConditionChange = false;

    cancelHighLight();
    return;
  } else {
    _isFocus = true;
    _isFilterConditionChange = true;
  }
  // 设置白灰色遮罩
  deactiveElements();

  // 按层数激活
  recursiveActive( 1,  !state.layer  ? 4 : state.layer , _layoutNode.level1 ,  _layoutNode.level2);

  function recursiveActive(layer, maxLayer, parentLayerNode, childrenLayerNode) {
    if(layer > maxLayer) return;
     const temp = [];

    for (let i = 0; i < parentLayerNode.length; i++) {
      const sourceNode = parentLayerNode[i];
      if (!validateCompany(state, sourceNode)) {
        continue;
      }
      activeNodeById(sourceNode.id);
      for (let j = 0; j <  childrenLayerNode.length; j++) {
        const targetNode = childrenLayerNode[j];
        if (!validateCompany(state, targetNode)) {
          continue;
        }

        const relation = getRelation(layer, state,sourceNode,targetNode );
        if (relation && validateShareholding(state, relation)) {
          activeNodeById(targetNode.id);
          // 列表勾选的
          if (state.checked.has(sourceNode.id) || state.checked.has(targetNode.id)) {
            activeEdgeById(relation.linkId);
          }
          temp.push(targetNode);
        }
      }
    }

    ++layer;
    recursiveActive(layer, maxLayer, temp, _layoutNode['level' + (layer + 1)]);
  }


  function getRelation(level, state, source, target) {

    function _tryGetRelation(source, target) {
      let relation = relationMap.get(`${source.id }${target.id}`);
      if(!relation) {
        relation = relationMap.get(`${target.id }${source.id}`);
      }
      return relation;
    }

    // 全部
    if(state.relation === 0) {
      return _tryGetRelation(source, target);
    }
     // 直接投资
    if (state.relation === 1) {
      const relation = relationMap.get(`${source.id }${target.id}`);
      if(!relation) {
        return  null;
      }
      return relation.data.type === "SH" ? relation: null;
    }
    // 股东投资
    // 董监高法投资
    if (state.relation === 2 || state.relation == 3) {
      let relation;
      if(level === 1) {
        const relation = relationMap.get(`${target.id }${source.id}`);
        return target.data.type === 'P' ? relation : null;
      }
      if(!relation) {
        relation = relationMap.get(`${source.id }${target.id}`);
      }
      return relation;
    }
    return null;
  }

  // 企业状态
  function validateCompany(state, node) {
    // TODO
    // 关系
    if (state.status == 0) {
      // 全部
      return true;
    }

    if (state.status == 1) {
      // 吊销
      return false;
    }

    if (state.status == 2) {
      // 注销
      return false;
    }

    if (state.status == 3) {
      // 存续
      return false;
    }

    return true;
  }

  // 持股比例   关系
  function validateShareholding(state, relation) {
    // 持股
    let relationPercent = (relation.data.properties.relationPercent || 0) * 100;
    return relationPercent > state.shareholding;
  }
}

export function cancelAllHighLight() {
    _isFocus = false;
    activeNode = null;
    store.commit('setCurrentNode', null)
    cancelHighLight();
}

export function allLinkHighLight(include) {
  _isFocus = true;
 // _isFilterConditionChange = true;
  //cy.edges().addClass('edgeActive');
  if(!include) {
    cy.edges().addClass('edgeActive');
  } else {
    cy.edges(function (edge) {
      var data = edge._private.data;
      if (include.has(data.data.targetId) || include.has(data.data.sourceId)) {
        edge.addClass("edgeActive");
      } else {
        edge.removeClass("edgeActive");
        edge.addClass('dull');
      }
    });
  }  
}

/**
 * 聚焦节点
 */
export function focusSelected(id) {

  if(id == 0) {   
    cancelAllHighLight();
    return
  }

  // 非暗淡状态
  _isFocus = true;
  const node = cy.filter('[id = "' + id + '"]')[0];

  highLight([id], cy);
  // 显示节点信息
  var nodeData = node._private.data;
    if (nodeData.type == "E" || nodeData.type == "UE") {
      showDetail(nodeData.keyNo, 'url', 'company', nodeData);
      cy.collection("node").addClass("nodeDull");
    } else {
      showDetail(nodeData.keyNo,  'url', 'person', nodeData);
      cy.collection("node").addClass("nodeDull");
    }

    activeNode = node;
    cy.collection("node").removeClass("nodeActive");
    cy.collection("edge").removeClass("edgeActive");
  //  node.addClass("nodeActive");
    node.neighborhood("edge").removeClass("opacity");
    node.neighborhood("edge").addClass("edgeActive");
    node.neighborhood("edge").connectedNodes().removeClass("opacity");
}

/**
 * 刷新
 * @param {} param0
 */
function refresh({ name = "preset", randomize = false, animate = true } = {}) {
   cy.layout({
    name: name,
    randomize: randomize,
    animate: animate,
    zoom: 1,
    pan: cy._private.pan
  }) .run()
}

let events = {
  nodeClick: null,
  nodeHover: null,
	nodeOut: null,
  egdeClick:  null,
  backgroudClick:null,
  backgroudHover: null,
  backgroudOut: null
}
function register(opts) {
    Object.assign(events, opts);
}



export default {
  init,
  maoScale,
  refresh,
  getData,
  exportImg,
  filter,
  register,
  wordsChange,
  focusSelected,
  allLinkHighLight,
  cancelAllHighLight
};
