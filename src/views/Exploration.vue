<template>
  <div v-if="!isShowTable" id="root"></div>
  <ToolBox
    v-if="!isShowTable"
    @maoScale="maoScale"
    @refresh="refresh"
    @exportImg="exportImg"
  />

  <div class="tabs">
    <a-radio-group @change="switchTabs">
      <a-radio-button value="map" :class="!isShowTable ? 'active' : ''"
        >查看图谱</a-radio-button
      >
      <a-radio-button value="table" :class="isShowTable ? 'active' : ''"
        >查看表格</a-radio-button
      >
    </a-radio-group>
  </div>
  <div class="table-container" v-if="isShowTable">
    <svg height="20" width="100" xmlns="http://www.w3.org/2000/svg">
      <g>
        <marker
          id="arrowRight"
          markerUnits="userSpaceOnUse"
          refX="8"
          refY="4"
          markerWidth="8"
          markerHeight="8"
        >
          <path d="M0 0 L0 8 L8 4 Z" fill="#e7e7e7" fill-opacity="1"></path>
        </marker>
        <marker
          id="arrowLeft"
          markerUnits="userSpaceOnUse"
          refX="0"
          refY="4"
          markerWidth="8"
          markerHeight="8"
        >
          <path d="M8 0 L8 8 L0 4 Z" fill="#e7e7e7" fill-opacity="1"></path>
        </marker>
      </g>
    </svg>

    <div class="wrapper">
      <table border="1">
        <tr>
          <th v-for="item in columns" :key="item" :width="item.with">
            {{ item.title }}
          </th>
        </tr>
        <tr v-for="(item, index) in dataSource" :key="item">
          <td>{{ index + 1 }}</td>
          <td><span class="view" @click="focus(item.origin)">查看</span></td>
          <td>
            <div class="template">
              <template v-for="(d, index) in item.display" :key="d">
                <span class="text" v-if="index % 2 === 0">{{ d }}</span>
                <svg
                  v-if="index % 2 === 1"
                  height="20"
                  :width="d[2]"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    v-if="d[1] === 'Right'"
                    stroke-width="1"
                    stroke="#e7e7e7"
                    marker-end="url(#arrowRight)"
                    :d="'M0 16 L' + d[2] + ' 16'"
                    stroke-opacity="1"
                  />
                  <path
                    v-else
                    stroke-width="1"
                    stroke="#e7e7e7"
                    marker-end="url(#arrowLeft)"
                    :d="'M ' + d[2] + ' 16 L0 16'"
                    stroke-opacity="1"
                  />
                  <text
                    :x="d[2] / 2"
                    y="10"
                    style="fill: #208eee; font-size: 10px; text-anchor: middle"
                  >
                    {{ d[0] }}
                  </text>
                </svg>
              </template>

              <!-- <svg height="20" width="100" xmlns="http://www.w3.org/2000/svg">
              <g>
                <marker id="arrowRight" markerUnits="userSpaceOnUse" refX="8" refY="4" markerWidth="8" markerHeight="8" ><path d="M0 0 L0 8 L8 4 Z" fill="#e7e7e7" fill-opacity="1"></path></marker>
                <marker id="arrowLeft" markerUnits="userSpaceOnUse" refX="0" refY="4" markerWidth="8" markerHeight="8" ><path d="M8 0 L8 8 L0 4 Z" fill="#e7e7e7"  fill-opacity="1"></path></marker>
              </g>
              <path stroke-width="1" stroke="#e7e7e7" marker-end="url(#arrowRight)" d="M0 16 L100 16" stroke-opacity="1"></path>
                <text x="50" y="10" style="fill: #208EEE; font-size: 10px; text-anchor: middle;">
                  股东
                </text>
            </svg> 
            2323
            <svg height="20" width="100" xmlns="http://www.w3.org/2000/svg">
              <path stroke-width="1" stroke="#e7e7e7" marker-end="url(#arrowLeft)"  d="M 100 16 L0 16" stroke-opacity="1"></path>
                <text x="50" y="10" style="fill: #208EEE; font-size: 10px; text-anchor: middle;">
                  股东
                </text>
            </svg>  -->
            </div>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, nextTick } from "vue";
import * as d3 from "d3";
import { Graph, GraphEdge, GraphVertex } from "ss-graph";
import ToolBox from "./components/ToolBox/index.vue";
import ExplorationJson from "@/api/ExplorationJson.json";
import D3Mixin from "@/hooks/D3Mixin";

const jsonData = ExplorationJson.data;
const { downloadImpByChart } = D3Mixin();
let topPosition = { x: 0, y: 0 };
const rect = getClientRect();
const isShowTable = ref(false);
let curTransform = {
  x: 0,
  y: 0,
  k: 1,
};
const columns = ref([
  {
    title: "序号",
    with: "10%",
  },
  {
    title: "图谱展示",
    with: "10%",
  },
  {
    title: "关联路径详情",
    with: "80%",
  },
]);
// 列表数据源
const dataSource = ref([]);
// 将节点都保存到Map
const nodeMap = new Map();
jsonData.nodes.forEach((node) => {
  node.text = node.name;
  nodeMap.set(node.id, node);
});
const linkMap = new Map();
jsonData.links.forEach((link) => {
  linkMap.set(link.source + "" + link.target, link);
});
//
const _data = cacPositionAndPath(jsonData, nodeMap);
dataSource.value = convertPahtToTextArray(_data.paths, nodeMap);

const canvas = getCanvas();

/**
 * 计算位置和路径
 * @param {*} json
 */
function cacPositionAndPath(json, nodeMap) {
  // 顶点和底点id
  const topNodeId = jsonData.shortestPathIds[0];
  const bottomNodeId =
    jsonData.shortestPathIds[jsonData.shortestPathIds.length - 1];
  // 查找所有路径
  const paths = findAllPath(
    jsonData.nodes,
    jsonData.links,
    topNodeId,
    bottomNodeId
  );
  // 间距
  const margin = 200;
  // 节点层数
  let layer = Math.max(...paths.map((p) => p.length));
  const layeNodes = new Array(layer).fill().map((_) => new Set());
  // 将顶点和底点添加到层级中
  layeNodes[0].add(topNodeId);
  layeNodes[layer - 1].add(bottomNodeId);
  // 计算顶点和底点位置
  let baseX = rect.center.left;
  let baseY = rect.center.top - ((layer - 1) * margin) / 2;
  // 顶点位置
  topPosition = { x: baseX, y: baseY };
  nodeMap.get(topNodeId).position = topPosition;
  // 底点位置
  let bottomPosition = { x: baseX, y: baseY + margin * (layer - 1) };
  nodeMap.get(bottomNodeId).position = bottomPosition;
  // 将层级节点添加到层级中
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];
    for (let j = 1; j < path.length - 1; j++) {
      layeNodes[j].add(path[j]);
    }
  }

  // 计算其他层级位置
  // 排除第一层和最后一层
  for (let i = 1; i < layeNodes.length - 1; i++) {
    const nodeNum = layeNodes[i].size;
    let x,
      y,
      index = 0;

    layeNodes[i].forEach((nodeId) => {
      x = rect.center.left - (nodeNum / 2 - index - (nodeNum % 2)) * 100;
      y = baseY + margin;
      nodeMap.get(nodeId).position = {
        x,
        y,
      };
      index++;
    });
  }

  return {
    paths,
    mapData: {
      nodes: nodeMap,
      links: json.links,
    },
  };
}

/**
 *
 */
function loadData() {
  if (isShowTable.value) {
  } else {
    canvas.draw(_data.mapData);
  }
}

/**
 *
 * @param {*} paths
 */
function convertPahtToTextArray(paths, nodeMap) {
  return paths.map((path) => {
    const result = [];
    // 头节点放入数组
    result.push(nodeMap.get(path[0]).name);
    for (let i = 1; i < path.length; i++) {
      let link = linkMap.get(path[i - 1] + "" + path[i]);
      // 放入两个节点关系和方向
      if (link) {
        result.push([
          link.label,
          "Right",
          getTextLength(link.label, 10) * 2,
          path,
        ]);
      } else {
        link = linkMap.get(path[i] + "" + path[i - 1]);
        if (link) {
          result.push([
            link.label,
            "Left",
            getTextLength(link.label, 10) * 2,
            path,
          ]);
        }
      }
      result.push(nodeMap.get(path[i]).name);
    }
    return {
      origin: path,
      display: result,
    };
  });
}

/**
 * 获取文字长度
 * @param {} text
 * @param {*} size
 */
function getTextLength(text, size = 14) {
  return text.length * size;
}

/**
 *  查找两个节点间所有路径
 */
function findAllPath(nodes, links, start, end) {
  // graph
  const graph = new Graph();
  const vertexs = new Map();
  nodes.forEach((node) => {
    vertexs.set(node.id, new GraphVertex(node.id));
  });
  links.forEach((link) => {
    graph.addEdge(
      new GraphEdge(vertexs.get(link.source), vertexs.get(link.target))
    );
  });

  const pathIterator = graph.findAllPath(vertexs.get(start), vertexs.get(end));
  // 获取所有路径
  return Array.from(pathIterator).map((item) => item.map((p) => p.value));
}

/**
 * 画图
 * @param data
 */
function getCanvas() {
  let data, zoom;

  function draw(json) {
    data = json;
    zoom = d3.zoom().scaleExtent([0.5, 2]).on("zoom", zoomFn);
    const root = drawRootSvg("#root");
    const svg = drawViewBox(root);

    const node = svg.selectAll("g").data(Array.from(data.nodes.values()));
    const path = svg.selectAll("path").data(data.links);
    // 箭头
    drawArrow(svg).transition().duration(500).attr("fill-opacity", 1);
    // 生成线条
    drawPath(path)
      .transition()
      .duration(500)
      .attr("fill-opacity", 1)
      .attr("stroke-opacity", 1);
    // 生成节点
    drawNodes(node)
      .transition()
      .duration(500)
      .attr("transform", function (d) {
        return "translate(" + d.position.x + "," + d.position.y + ")";
      })
      .attr("fill-opacity", 1)
      .attr("stroke-opacity", 1);
  }

  /**
   * 聚焦
   * @param {} node
   */
  function lightUp(node) {
    nextTick(() => {
      darkAll();
      for (let i = 1; i < node.length; i++) {
        lightUpRecently(node[i - 1], node[i]);
      }
    });

    function darkAll() {
      d3.selectAll("circle").attr("fill-opacity", "0.2");
      d3.selectAll(".path_text").attr("fill-opacity", "0.2");
      d3.selectAll(".upwardLink").attr("fill-opacity", "0.2");
    }

    function lightUpRecently(source, target) {
      let linkId = source + "" + target;
      if (!linkMap.has(linkId)) {
        linkId = target + "" + source;
      }
      d3.select("#g_" + source + " circle").attr("fill-opacity", "1");
      d3.select("#g_" + target + " circle").attr("fill-opacity", "1");
      d3.select("#p_" + linkId)
        .attr("stroke", "#FF6060")
        .attr("stroke-width", 2)
        // .attr('marker-end', 'url(#underLeft)')
        .attr("marker-start", (d) => {
          const source = nodeMap.get(d.source);
          const target = nodeMap.get(d.target);
          return source.position.x - target.position.x > 0
            ? "url(#underLeft)"
            : "";
        })
        .attr("marker-end", (d) => {
          const source = nodeMap.get(d.source);
          const target = nodeMap.get(d.target);
          return source.position.x - target.position.x > 0
            ? ""
            : "url(#underRight)";
        })
        .attr("d", (d) => {
          const source = data.nodes.get(d.source);
          const target = data.nodes.get(d.target);
          if (source.position.x - target.position.x > 0) {
            return calcLinePosition(source.position, target.position, 30);
          } else {
            return calcLinePosition(target.position, source.position, 30);
          }
        });
      d3.select("#p_text_" + linkId).attr("fill-opacity", "1");
    }
  }

  /**
   *
   */
  function getColor(d) {
    if (d.isKey) {
      return "#F86403";
    }
    switch (d.type) {
      case "P":
        return "#FE485E";
      case "E":
      default:
        return "#178BED";
    }
  }

  /**
   *
   * @param {*} el
   */
  function drawRootSvg(el) {
    const g = d3
      .select(el)
      .append("svg")
      .attr("id", "svg")
      .attr("width", "100vw")
      .attr("height", "100vh")
      .attr("viewBox", "0 0 " + rect.with + " " + rect.height)
      .attr("xmlns", "http://www.w3.org/2000/svg")
      // .on('mousedown', disableRightClick)
      .call(zoom)
      .on("dblclick.zoom", null);

    // 辅助计算线段位置
    g.append("path")
      .attr("id", "computed_path")
      .attr("stroke-width", "0")
      .attr("fill", "#fff")
      .attr("fill-opacity", 0)
      .attr("d", "M0,0 L100,100");

    return g;
  }

  /**
   *
   * @param {*} svg
   */
  function drawViewBox(svg) {
    return svg
      .append("g")
      .attr("id", "container")
      .attr("class", "gbox")
      .attr("transform-origin", "center")
      .attr("transform", "translate(0,0)")
      .attr("scale", 1);
  }

  /**
   *
   * @param svg
   */
  function drawNodes(svg) {
    const g = svg
      .enter()
      .append("g")
      .attr("id", (d) => `g_${d.id}`)
      .attr("fill-opacity", 0)
      .attr("stroke-opacity", 0)
      .attr("transform", (d) => `translate(${topPosition.x},${topPosition.y})`);
    drawCircle(g);
    drawText(g);
    return g;
  }

  /**
   *
   * @param svg
   */
  function drawText(svg) {
    svg
      .append("text")
      .style("fill", "#fff")
      .style("font-size", "10px")
      .style("text-anchor", "middle")
      .attr("width", 100)
      .text(function (d) {
        let x = d.text.substr(0, 3);
        const gNode = d3.select("#g_" + d.id);
        if (d.text.length > 6) {
          drawTextWithContent(gNode, x, 0, -13);
          x = d.text.substr(3, 6);
          drawTextWithContent(gNode, x, 0, 2.5);
          x = d.text.substr(9, 3);
          drawTextWithContent(gNode, x + "...", 0, 18);
        } else {
          return d.text;
        }
      });
  }

  function drawTextWithContent(svg, content, x, y) {
    return svg
      .append("text")
      .attr("x", x)
      .attr("y", y)
      .style("fill", "#fff")
      .style("font-size", "10px")
      .style("text-anchor", "middle")
      .text(content);
  }

  /**
   *
   * @param {*} svg
   */
  function drawCircle(svg) {
    svg
      .append("circle")
      .attr("class", "circle")
      .attr("r", 30)
      .style("fill", (d) => getColor(d));
  }

  /**
   * 计算线段位置
   * @param { Position } p1
   * @param { Position } p2
   * @param { Number } minus 减去圆圈胡半径
   * @return { string }
   */
  function calcLinePosition(p1, p2, minus) {
    const comp = document.getElementById("computed_path");
    comp.setAttribute("d", `M${p1.x} ${p1.y} L${p2.x} ${p2.y}`);
    const start = comp.getPointAtLength(comp.getTotalLength() - minus);
    const end = comp.getPointAtLength(minus);
    return `M${start.x} ${start.y} L${end.x} ${end.y}`;
  }

  function drawPath(svg) {
    const enter = svg.enter();
    const path = enter
      .append("path")
      .attr("id", (d) => "p_" + d.source + d.target)
      .attr("class", "path")
      .attr("fill", "none")
      .attr("fill-opacity", "0.5")
      .attr("stroke-width", 1)
      .attr("stroke", "#E7E7E7")
      .attr("marker-start", (d) => {
        const source = data.nodes.get(d.source);
        const target = data.nodes.get(d.target);
        return source.position.x - target.position.x > 0
          ? "url(#arrowLeft)"
          : "";
      })
      .attr("marker-end", (d) => {
        const source = data.nodes.get(d.source);
        const target = data.nodes.get(d.target);
        return source.position.x - target.position.x > 0
          ? ""
          : "url(#arrowRight)";
      })
      .attr("d", (d) => {
        const source = data.nodes.get(d.source);
        const target = data.nodes.get(d.target);
        if (source.position.x - target.position.x > 0) {
          return calcLinePosition(source.position, target.position, 30);
        } else {
          return calcLinePosition(target.position, source.position, 30);
        }
      });

    enter
      .append("text")
      .attr("id", (d) => "p_text_" + d.source + d.target)
      .attr("class", "path_text")
      .style("fill", "#555")
      //.style("alignement-baseline", "middle")
      // .style("text-anchor", "middle")
      .style("font-size", "10px")
      .style("text-anchor", "middle")
      .append("textPath")
      .attr("transform", "translate(110,0)")
      .attr("xlink:href", (d) => "#p_" + d.source + d.target)
      .attr("startOffset", "50%")
      .text((d) => d.label);

    return path;
  }

  function drawArrow(svg) {
    const g = svg.append("g").attr("id", "g_marker");
    const down = g
      .append("marker")
      .attr("id", "arrowRight")
      .attr("markerUnits", "strokeWidth") //设置为strokeWidth箭头会随着线的粗细发生变化
      .attr("markerUnits", "userSpaceOnUse")
      // .attr("viewBox", "0 -5 10 10") //坐标系的区域
      .attr("refX", 8) //箭头坐标
      .attr("refY", 4)
      .attr("markerWidth", 8) //标识的大小
      .attr("markerHeight", 8)
      .attr("orient", "auto") //绘制方向，可设定为：auto（自动确认方向）和 角度值
      //  .attr("stroke-width", 6) //箭头宽度
      .append("path")
      .attr("d", "M0 0 L0 8 L8 4 Z") //箭头的路径
      .attr("fill", "#E7E7E7")
      .attr("fill-opacity", 1); //箭头颜色

    const up = g
      .append("marker")
      .attr("id", "arrowLeft")
      .attr("markerUnits", "strokeWidth") //设置为strokeWidth箭头会随着线的粗细发生变化
      .attr("markerUnits", "userSpaceOnUse")
      // .attr("viewBox", "0 -5 10 10") //坐标系的区域
      .attr("refX", 0) //箭头坐标
      .attr("refY", 4)
      .attr("markerWidth", 8) //标识的大小
      .attr("markerHeight", 8)
      .attr("orient", "auto") //绘制方向，可设定为：auto（自动确认方向）和 角度值
      //  .attr("stroke-width", 6) //箭头宽度
      .append("path")
      .attr("d", "M8 0 L8 8 L0 4 Z") //箭头的路径
      .attr("fill", "#E7E7E7")
      .attr("fill-opacity", 1); //箭头颜色

    g.append("marker")
      .attr("id", "underRight")
      .attr("markerUnits", "strokeWidth") //设置为strokeWidth箭头会随着线的粗细发生变化
      .attr("markerUnits", "userSpaceOnUse")
      // .attr("viewBox", "0 -5 10 10") //坐标系的区域
      .attr("refX", 8) //箭头坐标
      .attr("refY", 4)
      .attr("markerWidth", 8) //标识的大小
      .attr("markerHeight", 8)
      .attr("orient", "auto") //绘制方向，可设定为：auto（自动确认方向）和 角度值
      //  .attr("stroke-width", 6) //箭头宽度
      .append("path")
      .attr("d", "M0 0 L0 8 L8 4 Z") //箭头的路径
      .attr("fill", "#FF6060")
      .attr("fill-opacity", 1); //箭头颜色

    g.append("marker")
      .attr("id", "underLeft")
      .attr("markerUnits", "strokeWidth") //设置为strokeWidth箭头会随着线的粗细发生变化
      .attr("markerUnits", "userSpaceOnUse")
      // .attr("viewBox", "0 -5 10 10") //坐标系的区域
      .attr("refX", 0) //箭头坐标
      .attr("refY", 4)
      .attr("markerWidth", 8) //标识的大小
      .attr("markerHeight", 8)
      .attr("orient", "auto") //绘制方向，可设定为：auto（自动确认方向）和 角度值
      //  .attr("stroke-width", 6) //箭头宽度
      .append("path")
      .attr("d", "M8 0 L8 8 L0 4 Z") //箭头的路径
      .attr("fill", "#FF6060")
      .attr("fill-opacity", 1); //箭头颜色

    return down.merge(up);
  }

  function zoomFn(x, y, k) {
    curTransform = d3.event.transform;
    return d3
      .select("#container")
      .attr(
        "transform",
        "translate(" +
          curTransform.x / 2 +
          "," +
          curTransform.y / 2 +
          ")scale(" +
          curTransform.k +
          ")"
      );
  }

  /**
   * 保存图片
   */
  function saveAsImg() {
    downloadImpByChart("关联关系探查", "小米");
  }
  /**
   * 刷新
   */
  function redraw() {
    d3.select("#root svg").remove();
    draw(data);
  }
  /**
   * 缩放
   * @param type
   * @returns {*}
   */
  function scale(type) {
    let c1 = curTransform.k;
    curTransform.k = Number((c1 + 0.3 * type).toFixed(1));
    d3.select("#container")
      .transition()
      .duration(400)
      .attr(
        "transform",
        "translate(" +
          curTransform.x / 2 +
          "," +
          curTransform.y / 2 +
          ")scale(" +
          curTransform.k +
          ")"
      );
  }

  return {
    draw,
    lightUp,
    scale,
    saveAsImg,
    redraw,
  };
}

function maoScale(e) {
  canvas.scale(e);
}

function refresh() {
  canvas.redraw();
}

function focus(path) {
  isShowTable.value = false;
  nextTick(function () {
    loadData();
    nextTick(() => {
      canvas.lightUp(path);
    });
  });
}

function getClientRect() {
  return {
    with: window.innerWidth,
    height: window.innerHeight,
    center: {
      left: window.innerWidth / 2,
      top: window.innerHeight / 2,
    },
  };
}

function exportImg() {
  canvas.saveAsImg();
}

function switchTabs(e) {
  isShowTable.value = e.target.value === "table";
  nextTick(loadData);
}

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.tabs {
  position: absolute;
  z-index: 200;
  right: 15px;
  top: 70px;
}

.table-container {
  position: relative;
  box-sizing: border-box;
  width: calc(100% - 30px);
  height: calc(100% - 120px);
  margin: 120px 15px 0;
  padding: 15px 0;
  border-top: 1px solid #eee;

  .wrapper {
    width: 100%;
    height: calc(100% - 30px);
    border: 1px solid #eee;
    overflow-y: auto;
  }

  table {
    table-layout: fixed;
    border-collapse: collapse;
    width: 100%;
    border: 1px solid #eee;

    tr {
      width: 100%;
      height: 40px;
      border: 1px solid #eee;

      th {
        height: 50px;
        background: #f2fafc;
        color: #404141;
        text-align: center;

        &:nth-child(1) {
          width: 70px;
        }

        &:nth-child(2) {
          width: 120px;
        }

        &:nth-child(3) {
          padding-left: 20px;
          text-align: left;
          width: calc(100% - 190px);
        }
      }

      td {
        padding-left: 20px;
        background: #fff;
        color: #208eee;

        &:nth-child(1) {
          color: #404141;
        }
      }
    }

    .template {
      .text {
        margin: 0 5px;
      }
    }
    .view {
      display: inline-block;
      cursor: pointer;
    }
  }
}

:deep {
  .ant-radio-button-wrapper {
    &.active {
      background: var(--antd-wave-shadow-color);
      color: #fff;
    }
  }
}
</style>