<!-- 企业图谱 -->
<template>
  <!-- <Header title="小米科技有限责任公司" :active="2" /> -->
  <div class="tree04">
    <div id="treeRoot"></div>
    <ChartFilter v-model:visiable="isShowTemplate" @stateChange="filterStateChange($event)"/>
    <ToolBox
        v-model:isShowTemplate="isShowTemplate"
        :buttonGroup="buttons"
        @maoScale="zoomClick($event)"
        @refresh="refresh"
        @exportImg="exportImg"/>

        <transition name="v">
          <ChartDetail v-if="isShowDetail" :data="detailData" :position="detailPosition"></ChartDetail>
        </transition>
  </div>
 
</template>
<script>
import Header from '../components/Header/index.vue'
import ToolBox from './components/ToolBox/index.vue'
import ChartFilter from "@/views/components/CompanyChart/ChartFilter.vue";
import ChartDetail from './components/CompanyChart/ChartDetail.vue';
import Buttons from './components/ToolBox/buttons.js'
import companyJson from "@/api/companyJson.json";
import $ from 'jquery'
import * as d3 from "d3";
import D3Mixin from '@/hooks/D3Mixin'

let {downloadImpByChart} = D3Mixin()

let svg;
let dirRight;
let forUpward;
let leng;
let circlewidth1;
let circlewidth2;
let circlewidth3;
let margin1 = {top: 50, right: 20, bottom: -20, left: 100};
let curTransform = {
  x: 0,
  y: 0,
  k: 1
}

let rootNode = { data:{}, r: {}, l: {}}; //左右2块数据源

export default {
  components: {
    Header,
    ToolBox,
    ChartFilter,
    ChartDetail
  },
  data() {
    return {
      buttons: Buttons.TEMPLATE | Buttons.ZOOMIN | Buttons.ZOOMOUT | Buttons.REFRESH | Buttons.FULLSCREEN | Buttons.SAVE,
      isShowTemplate: false,
      container: null, //容器svg>g
      duration: 500, //动画持续时间
      scaleRange: [0.2, 2], //container缩放范围
      direction: ["r", "l"], //分为左右2个方向
      centralPoint: [0, 0], //画布中心点坐标x,y
      root: { data:{}, r: {}, l: {}}, //左右2块数据源
      rootNodeLength: 0, //根节点名称长度
      rootName: [""], //根节点名称
      textSpace: 15, //多行文字间距
      themeColor: "#2196F3", //主色
      nodeSize: [50, 100], //节点间距(高/水平)
      fontSize: 14, //字体大小，也是单字所占宽高
      rectMinWidth: 50, //节点方框默认最小，
      textPadding: 5, //文字与方框间距,注：固定值5
      circleR: 5, //圆圈半径
      dirRight: "",
      treeData: [],
      isShowDetail: false,
      detailPosition: {
        top: 0,
        left: 0
      },
      detailData: {}
    };
  },
  created() {

  },
  mounted() {
    this.getData();
  },
  computed: {
    treeMap() {      
      return d3
          .tree()
          .nodeSize(this.nodeSize)
          .separation((a, b) => {
            let result =
                a.parent === b.parent && !a.children && !b.children ? 1 : 2;
            return result;
          });
    },
  },
  watch: {},
  methods: {
    getData() {
      //companyJson  是调用真实接口的数据
      const data = this.convertToHierarchy(companyJson.data);
      let left = data.l;
      let right = data.r;
      rootNode.data = data.root;
      this.rootName = [data.rootName, ""];
      let mynodes;
      for (let i = 0; i < left.children.length; i++) {
        if (left.children[i].children.length > 5) {
          mynodes = left.children[i].children;
          left.children[i].children = left.children[i].children.slice(0, 5);
          left.children[i].children[5] = {
            name: "展开",
            type: -1,
            val: mynodes.length - 5,
            childrend: mynodes.slice(0, mynodes.length),
          };
        }
      }
      for (let i = 0; i < right.children.length; i++) {
        if (right.children[i].children.length > 5) {
          mynodes = right.children[i].children;
          right.children[i].children = right.children[i].children.slice(0, 5);
          right.children[i].children[5] = {
            name: "展开",
            type: -1,
            val: mynodes.length - 5,
            childrend: mynodes.slice(0, mynodes.length),
          };
        }
      }
      // console.log(data, "初始化");
      this.treeInit(data);
      //     }
      // })
    },
    convertToHierarchy(data) {
      return {
        root: data.info,
        rootName: data.info.name,
        l: {
          name: 'origin',
          children: [
            {
              id: "g_dwtz",
              name: '对外投资',
              nodeType: 0,
              children: data.node_info.investments
            }
          ]
        },
        r: {
          name: 'origin',
          children: [
            {
              id: "g_gd",
              name: '股东',
              nodeType: 0,
              children: data.node_info.partners.map(a => { 
                a.type = 'employee';
                a.company = data.info.name;
                return a
               })
            },
            {
              id: "g_gg",
              name: '高管',
              nodeType: 0,
              children: data.node_info.employees.map(a => { 
                a.type = 'employee';
                a.company = data.info.name;
                return a
               })
            },
            {
              id: "g_lsgd",
              name: '历史股东',
              nodeType: 0,
              children: data.node_info.history_partners.map(a => { 
                a.type = 'employee'
                return a
               })
            }
          ]
        }
      }
    },
    uuid() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
      }

      return (
          s4() +
          s4() +
          "-" +
          s4() +
          "-" +
          s4() +
          "-" +
          s4() +
          "-" +
          s4() +
          s4() +
          s4()
      );
    },
    //初始化
    treeInit(data) {
      const margin = {top: 0, right: 0, bottom: 0, left: 0};
      let treeWidth = d3.select("#treeRoot")._parents[0].clientWidth;
      let treeHeight = d3.select("#treeRoot")._parents[0].clientHeight;
      // const treeWidth = document.body.clientWidth - margin.left - margin.right; //tree容器宽
      // const treeHeight = document.body.clientHeight - margin.top - margin.bottom; //tree容器高
      const centralY = treeWidth / 2 + margin.left;
      const centralX = treeHeight / 2 + margin.top;
      this.centralPoint = [centralX, centralY]; //中心点坐标

      //根节点字符所占宽度
      this.rootNodeLength = this.rootName[0].length * this.fontSize + 50;

      //svg标签
      svg = d3
          .select("#treeRoot")
          .append("svg")
          .attr("id", "svg")
          .attr("class", "tree-svg")
          .attr("xmlns", "http://www.w3.org/2000/svg")
          .attr("width", treeWidth)
          .attr("height", treeHeight)
          .attr("font-size", this.fontSize)
          .attr("fill", "#555");

      //g标签
      this.container = svg
          .append("g")
          .attr("class", "container1")
          .attr("transform-origin", "center")
          .attr(
              "transform",
              "translate(" + (margin1.left + margin1.right) / 2 + "," + margin1.top + ")scale(0.8)"
          );

      //画出根节点
      this.drawRoot();
      //指定缩放范围
      const zoom = d3
          .zoom()
          .scaleExtent(this.scaleRange)
          .on("zoom", this.zoomFn);
      //动画持续时间
      this.container
          .transition()
          .duration(this.duration)
          .call(zoom.transform, d3.zoomIdentity);
      svg.call(zoom);
      //数据处理
      // console.log(data, "数据处理");
      this.dealData(data);
    },
    //数据处理
    dealData(data) {
      this.direction.forEach((item) => {
        rootNode[item] = d3.hierarchy(data[item]);
        rootNode[item]._children = rootNode[item].children;
        rootNode[item].x0 = this.centralPoint[0]; //根节点x坐标
        rootNode[item].y0 = this.centralPoint[1]; //根节点Y坐标
        this.porData(rootNode[item], item);
      });
    },
    //遍历
    porData(obj, item) {
      obj.descendants().forEach((d) => {
        d._children = d.children;
        d.id =  d.data.id ?  d.data.id : (item + this.uuid());        
      });
      this.update(obj, item);
    },
    zoomClick(type) {
      let c1 = curTransform.k;
      let c2 = Number((c1 + 0.2 * type).toFixed(1));
      curTransform.k = c2;
      let that = this;
      return d3
          .transition()
          .duration(350)
          .tween("zoom", function () {
            var i = d3.interpolate(c1, c2);
            return function (t) {
              that.container.attr(
                  "transform",
                  "translate(" +
                  (curTransform.x / 2) +
                  "," +
                  (curTransform.y / 2) +
                  ")scale(" +
                  i(t) * 0.8 +
                  ")"
              )
            };
          });
    },
    zoomFn() {
      curTransform = d3.event.transform;
      return this.container.attr(
          "transform",
          "translate(" +
          (curTransform.x / 2) +
          "," +
          (curTransform.y / 2) +
          ")scale(" +
          curTransform.k * 0.8 +
          ")"
      );
    },
    //数据重组
    DataReor(d, direction, source, appendData) {
      var setDepth = function (node, num, appendLeaf) {
        //重新设置depth
        node.depth = num;
        if (node.children && node.children.length) {
          //遍历children
          node.children.forEach(function (item) {
            setDepth(item, num + 1, appendLeaf);
          });
        } else {
          appendLeaf.push(node);
        }
      };

      var setHeight = function (arr, num) {
        //重新设置height
        var parent = [];
        arr.forEach(function (node) {
          node.height = Math.max(num, node.height);
          if (node.parent && parent.indexOf(node.parent) == -1) {
            parent.push(node.parent);
          }
        });

        if (parent.length) {
          setHeight(parent, num + 1);
        }
      };

      var appendLeaf = []; //增加的叶子节点

      if (appendData.children.length) {
        d.children = [];
        appendData.children.forEach(function (item, index) {
          var newNode = d3.hierarchy(item);
          newNode.parent = d;
          newNode.height = -1;
          setDepth(newNode, d.depth + 1, appendLeaf);
          d.children.push(newNode);
        });
      }

      if (appendLeaf.length) {
        setHeight(appendLeaf, 0);
      }

      if (source.data.name == "展开") {
        source.parent.descendants().forEach((d) => {
          d._children = d.children;
          d.id = direction + this.uuid();
        });
      } else {
        source.descendants().forEach((d) => {
          d._children = d.children;
          d.id = direction + this.uuid();
        });
      }
      this.update(d, direction);
    },
    getNode(d, direction, source, type) {
      if (d.data.name === "展开") {
        let arr;
        if (d.data.val <= 5) {
          arr = d.data.childrend;
        } else {
          arr = d.data.childrend.slice(0, d.parent.children.length + 4);
          arr[d.parent.children.length + 4] = {
            name: arr.length === 10 ? "搜索" : "展开",
            type: -1,
            val: d.data.val - 5,
            childrend: d.data.childrend,
          };
        }

        this.DataReor(d.parent, direction, source, {
          children: arr
        });
      } else if (type == 1) {
        this.DataReor(d, direction, source, {
          children: [],
        });
      } else {
        let mynodes = data;
        if (data.length > 10) {
          data = data.slice(0, 10);
          data[11] = {
            name: "搜索",
            type: -1,
            val: mynodes.length - 10,
            childrend: mynodes.slice(0, mynodes.length),
          };
        }
        this.DataReor(d, direction, source, {
          children: data,
        });
      }
    },
    //画根节点
    drawRoot() {
      let hoverTimer;
      let that = this;
      const title = this.container
          .append("g")
          .attr("id", "rootTitle")
          .attr(
              "transform",
              `translate(${this.centralPoint[1]},${this.centralPoint[0]})`
          );
          d3.select(`#rootTitle`)
          .on('mouseover', function (e) { 
              let dom =  document.getElementById('rootTitle');
              let rect = dom.getBoundingClientRect();
              hoverTimer && clearTimeout(hoverTimer);
              hoverTimer = setTimeout(function () {
                that.isShowDetail = true;
                that.detailPosition = {
                  top: rect.top - 130,
                  left: rect.left < ((window.innerWidth - rect.width) / 2) ? rect.right : (rect.left - 300) 
                }
                that.detailData = rootNode.data;
              }, 500);          
          })
          .on('mouseout', function () {
            hoverTimer && clearTimeout(hoverTimer);
            that.isShowDetail = false;
          });
      title
          .append("svg:rect")
          .attr("class", "rootTitle")
          .attr("y", 0)
          .attr("x", -this.rootNodeLength / 2)
          .attr("width", this.rootNodeLength)
          .attr("height", 0)
          .attr("rx", 5) //圆角
          .style("fill", this.themeColor);
      this.rootName.forEach((name, index) => {
        title
            .append("text")
            .attr("fill", "white")
            .attr("y", function () {
              return 5;
            })
            .attr("text-anchor", "middle")
            .style("font-size", function () {
              if (index == 1) {
                return "10px";
              } else {
                return "15px";
              }
            })
            .text(name);

        let lineHeight = (index + 2) * this.textSpace;
        d3.select("#rootTitle rect")
            .attr("height", lineHeight)
            .attr("y", -lineHeight / 2);
      });
    },
    seat(newArr, dirRight, data) {
      for (var j = 0; j < newArr.length; j++) {
        if (j != 0) {
          for (var i = 0; i < data[j].length; i++) {
            data[j][i].y = data[j - 1][0].y + newArr[j - 1] - 40;
          }
        }
      }
    },
    testLength(data, dirRight) {
      var level = [],
          width1,
          width2;

      for (var i = 0; i < data.length; i++) {
        var newArr = new Array();

        for (var j = 0; j < data[i].length; j++) {
          if (data[i][j].data.attName) {
            svg
                .append("text")
                .style("font-size", this.fontSize)
                .text((d) => "(" + data[i][j].data.attName + ")")
                .attr("class", "test")
                .attr("width", function (d) {
                  return d3.select(this.getComputedTextLength())._groups[0][0];
                  // console.log(width3,"width3");
                });
          }
          if (data[i][j].data.percent) {
            svg
                .append("text")
                .style("font-size", this.fontSize)
                .text(function (d) {
                  const len = data[i][j].data.name.length;
                  if (len > 20) {
                    return data[i][j].data.name.substring(0, 20) + "...";
                  } else {
                    return data[i][j].data.name;
                  }
                })
                .attr("class", "test")
                .attr("width", function (d) {
                  width1 = d3.select(this.getComputedTextLength())._groups[0][0];
                });
            svg
                .append("text")
                .style("font-size", this.fontSize)
                .text((d) => data[i][j].data.percent)
                .attr("class", "test")
                .attr("width", function (d) {
                  width2 = d3.select(this.getComputedTextLength())._groups[0][0];
                });

            $(".test").remove();
            if (data[i][j].data.attName) {
              if (Number(width1) + Number(width3) > Number(width2)) {
                newArr.push(Number(width1) + Number(width3) + 100);
              } else {
                newArr.push(Number(width2) + 100);
              }
            } else {
              if (Number(width1) > Number(width2)) {
                newArr.push(Number(width1) + 100);
              } else {
                newArr.push(Number(width2) + 100);
              }
            }
          } else {
            svg
                .append("text")
                .style("font-size", this.fontSize)
                .text(function (d) {
                  if (data[i][j].data.name) {
                    const len = data[i][j].data.name.length;
                    if (len > 20) {
                      return data[i][j].data.name.substring(0, 20) + "...";
                    } else {
                      return data[i][j].data.name;
                    }
                  }
                })
                .attr("class", "test")
                .attr("width", function (d) {
                  width1 = d3.select(this.getComputedTextLength())._groups[0];

                  newArr.push(Number(width1) + 100);
                  data.width1 = d3.select(
                      this.getComputedTextLength()
                  )._groups[0];
                });
            $(".test").remove();
          }
        }
        level.push(Math.max.apply(null, newArr));
      }

      this.seat(level, dirRight, data);
    },
    //开始绘图
    update(source, direction) {      
      // console.log(source, direction, "update");
      let that = this;
      dirRight = direction === "r" ? 1 : -1; //方向为右/左
      forUpward = direction == "r";
      let className = `${direction}gNode`;      
      let tree = this.treeMap(rootNode[direction]);
      let nodes = tree.descendants();
      let links = tree.links();
      var data = [];
      if (nodes.length > 1) {
        for (var i = 0; i < nodes.length; i++) {
          if (!data[nodes[i].depth]) {
            var arr = [];
            arr.push(nodes[i]);
            data[nodes[i].depth] = arr;
          } else {
            data[nodes[i].depth].push(nodes[i]);
          }
        }
        //检测最大长度
        this.testLength(data, dirRight);
      }
      nodes.forEach((d) => {
        d.y = dirRight * (d.y + this.rootNodeLength / 2) + this.centralPoint[1];
        d.x = d.x + this.centralPoint[0];
      });

      //根据class名称获取左或者右的g节点，达到分块更新
      const node = this.container
          .selectAll(`g.${className}`)
          .data(nodes, (d) => d.id);
      //新增节点，tree会根据数据内的children扩展相关节点
      const nodeEnter = node
          .enter()
          .append("g")
          .attr("id", (d) => `g${d.id}`)
          .attr("class", className)
          .attr("transform", (d) => `translate(${source.y0},${source.x0})`)
          .attr("fill-opacity", 0)
          .attr("stroke-opacity", 0)
          .on("click", function (d) {
            d3.select(this)
                .selectAll(".node-circle .node-circle-vertical")
                .transition()
                .duration(that.duration)
                .attr("stroke-width", function (d) {
                  if (d.children) {
                    return 1;
                  } else {
                    return 0;
                  }
                });
            if (d.data.name == "展开") {
              return that.clickNode(d, direction, source);
            } else if (d.depth !== 0) {
              return that.clickNode(d, direction, source);
            }
          });

      nodeEnter.each((d) => {

        if (d.depth > 0) {
          this.drawText(`g${d.id}`, dirRight);
          if (d.data.attName) {
            this.drawCodeText(`g${d.id}`, dirRight);
          }
          if (d.data.percent) {
            this.drawTsText(`g${d.id}`, dirRight);
          }

          this.drawRect(`g${d.id}`, dirRight);
          this.marker(`g${d.id}`, dirRight);
        }

        if (d.depth > 0) {
          const width = Math.min(d.data.name.length * 14, this.rectMinWidth);
          let right = dirRight > 0;
          // let xDistance = right ? width : -width;
          if(d._children) {
            this.drawCircle(`g${d.id}`, dirRight, source, direction);
          }
          this.drawSign(`g${d.id}`, dirRight); //画标记
        }

        //画节点数量
        // console.log(d, "画节点数量");
        if (d.data && d.data.type == -1) {
          this.drawLength(`g${d.id}`, dirRight);
        }
      });

      // 更新节点：节点enter和exit时都会触发tree更新
      const nodeUpdate = node
          .merge(nodeEnter)
          .transition()
          .duration(this.duration)
          .attr("transform", function (d) {
            if (d.data && d.data.isNextNode) {
              d3.select(this)
                  .selectAll(".node-circle .node-circle-vertical")
                  .transition()
                  .duration(this.duration)
                  .attr("stroke-width", function (d) {
                    if (d.children) {
                      return 0;
                    } else {
                      return 1;
                    }
                  });
            }

            var index = 0;

            return "translate(" + d.y + "," + d.x + ")";
          })
          .attr("fill-opacity", 1)
          .attr("stroke-opacity", 1);

      // 移除节点:tree移除掉数据内不包含的节点(即，children = false)
      const nodeExit = node
          .exit()
          .transition()
          .duration(this.duration)
          .remove()
          .attr("transform", (d) => `translate(${source.y},${source.x})`)
          .attr("fill-opacity", 0)
          .attr("stroke-opacity", 0);

      // Update the links 根据 className来实现分块更新
      const link = this.container
          .selectAll(`path.${className}`)
          .data(links, (d) => d.target.id);

      // Enter any new links at the parent's previous position.
      //insert是在g标签前面插入，防止连接线挡住G节点内容
      const linkEnter = link
          .enter()
          .insert("path", "g")
          .attr("class", className)
          .attr("d", (d) => {
            const o = {x: source.x0, y: source.y0};

            return this.diagonal({source: o, target: o});
          })
          .attr("fill", "none")
          .attr("stroke-width", 0.5)
          .attr("stroke", "#D8D8D8");

      // Transition links to their new position.
      link
          .merge(linkEnter)
          .transition()
          .duration(this.duration)
          .attr("d", this.diagonal);

      // Transition exiting nodes to the parent's new position.
      link
          .exit()
          .transition()
          .duration(this.duration)
          .remove()
          .attr("d", (d) => {
            const o = {x: source.x, y: source.y};

            return this.diagonal({source: o, target: o});
          });

      // Stash the old positions for transition.
      rootNode[direction].eachBefore((d) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    },
    //画连接线
    diagonal({source, target}) {
      let s = source,
          d = target;

      if (forUpward) {
        return (
            "M" +
            s.y +
            "," +
            s.x +
            "L" +
            (s.y + (d.y - s.y) - 20) +
            "," +
            s.x +
            "L" +
            (s.y + (d.y - s.y) - 20) +
            "," +
            d.x +
            "L" +
            d.y +
            "," +
            d.x
        );
      } else {
        return (
            "M" +
            s.y +
            "," +
            s.x +
            "L" +
            (s.y + (d.y - s.y) + 20) +
            "," +
            s.x +
            "L" +
            (s.y + (d.y - s.y) + 20) +
            "," +
            d.x +
            "L" +
            d.y +
            "," +
            d.x
        );
      }
    },
    //画箭头
    marker(id, dirRight) {
      let gMark = d3
          .select(`#${id}`)
          .append("g")
          .attr(
              "transform",
              dirRight > 0 ? "translate(-20,0)" : "translate(12,0)"
          );
      return gMark
          .insert("path", "text")

          .attr("d", function (d) {
            if (d.data.nodeType == 0 && dirRight > 0) {
              return "M0,0L0,3L9,0L0,-3Z";
            } else if (d.data.nodeType == 0 && dirRight < 0) {
              return "M0,0L9,-3L9,3Z";
            }
          })
          .style("fill", (d) => this.getRectStorke(d.data.name));
    },
    //华标记
    drawSign(id, dirRight) {
      return d3
          .select(`#${id}`)
          .insert("circle", "text")
          .attr("cx", dirRight > 0 ? -5 : 5)
          .attr("y", -2.5)
          .attr("r", function (d) {
            if (d.data.nodeType == 0) {
              return 4;
            }
          })
          .style("fill", (d) => this.getRectStorke(d.data.name));
    },
    //画文本
    drawText(id, dirRight) {
      let that = this;
      dirRight = dirRight > 0; //右为1，左为-1
      return d3
          .select(`#${id}`)
          .append("text")
          .attr("y", function (d) {
            if (d.data.percent) {
              return that.textPadding - 8;
            } else {
              return that.textPadding;
            }
          })
          .attr("x", (d) => (dirRight ? that.textPadding : -that.textPadding))
          .attr("text-anchor", dirRight ? "start" : "end")
          .style("font-size", that.fontSize)
          .text(function (d) {
            const len = d.data.name.length;
            if (len > 20) {
              return d.data.name.substring(0, 20) + "...";
            } else {
              return d.data.name;
            }
          })
          .attr("fill", function (d) {
            if (d.data.nodeType == -1) {
              return "rgb(33, 150, 243)";
            } else if (d.data.nodeType == 0 || d.data.attName) {
              return "#000";
            } else {
              return "#333";
            }
          })

          .attr("width", function (d) {
            circlewidth1 = d3.select(this.getComputedTextLength())._groups[0][0];
            return d3.select(this.getComputedTextLength())._groups[0][0];
          });
    },
    //画子文本
    drawTsText(id, dirRight) {

      let that = this;
      return d3
          .select(`#${id} text`)
          .append("tspan")
          .attr("fill", (d) => (d.data.attName ? "#fff" : "#F9B023"))
          .attr("y", function (d) {
            if (d.data.percent) {
              return that.textPadding + 8;
            }
          })
          .attr("x", function (d) {
            if (dirRight > 0) {
              return that.textPadding;
            } else {
              return -5;
            }
          })
          .style("font-size", "11px")
          .style("color", "#F9B023")
          .text(function (d) {
            return d.data.percent;
          })

          .attr("width", function (d) {
            circlewidth2 = d3.select(this.getComputedTextLength())._groups[0][0];
            return d3.select(this.getComputedTextLength())._groups[0][0];
          });
    },
    //画股票代码
    drawCodeText(id, dirRight) {

      return d3
          .select(`#${id} text`)
          .append("tspan")
          .attr("fill", (d) => "#fff")
          .attr("y", function (d) {
            if (d.data.percent) {
              return this.textPadding + 8;
            }
          })
          .style("font-size", "11px")
          .attr("x", function (d) {
            if (dirRight > 0) {
              return this.textPadding;
            } else {
              return -5;
            }
          })
          .text(function (d) {
            return d.data.attName + " ";
          })

          .attr("width", function (d) {
            circlewidth3 = d3.select(this.getComputedTextLength())._groups[0][0];
            return d3.select(this.getComputedTextLength())._groups[0][0];
          });
    },
    //节点数量
    drawLength(id) {

      return d3
          .select(`#${id} text`)
          .append("tspan")
          .attr("fill", (d) => "#999")
          .text(function (d) {
            if (d.data.type == -1) {
              return " (" + d.data.val + ")";
            }
            return " [" + d.data.percent + "]";
          })
          .attr("fill", "rgb(33, 150, 243)")
          .attr("width", function (d) {
            return d3.select(this.getComputedTextLength())._groups[0];
          });
    },
    //画方框阴影
    drawFilter(id) {

      return d3
          .select(`#${id}`)
          .insert("defs", "rect")
          .append("filter")
          .attr("id", `f${id}`)
          .attr("x", 0)
          .attr("y", 0)
          .append("feGaussianBlur")
          .attr("in", "SourceGraphic")
          .attr("stdDeviation", "5");
    },
    //画方框
    drawRect(id, dirRight) {

      let that = this;
      let hoverTimer;

      let realw = document.getElementById(id).getBBox().width + 25 ; //获取g实际宽度后，设置rect宽度
      if (document.getElementById(id).getBBox().width > 400) {
        realw = 400;
      }

      const g = d3.select(`#${id}`).on('mouseover', function (e) {        
            if(e.data.nodeType!=0) {
              let dom =  document.getElementById(id);
              let rect = dom.getBoundingClientRect();  
              hoverTimer = setTimeout(function () {
                that.isShowDetail = true;
                that.detailPosition = {
                  top: rect.top - 130,
                  left: rect.left < ((window.innerWidth - rect.width) / 2) ? rect.right : (rect.left - 300) 
                }
                that.detailData = e.data;
              }, 500);
            }
            
          }).on('mouseout', function () {
            hoverTimer && clearTimeout(hoverTimer);
            that.isShowDetail = false;
          });

      return g
          .insert("rect", "text")
          .attr("x", function (d) {
            if (dirRight < 0) {
              return -realw;
            } else {
              0;
            }
          })
          .attr("y", function (d) {
            if (d.data.percent) {
              return -that.textSpace + that.textPadding - 11;
            } else {
              return -that.textSpace + that.textPadding - 4;
            }
          })
          .attr("width", function (d) {
            // if (d.data.isNextNode) {//判断是否有下级节点
            //     return realw
            // } else {
            //     return realw - 15
            // }
            return realw;
          })
          .attr("height", function (d) {
            if (d.data.percent) {
              return that.textSpace + that.textPadding + 22;
            } else {
              return that.textSpace + that.textPadding + 8;
            }
            return that.textSpace + that.textPadding + 8;
          })
          .attr("stroke-width", (d) =>
              d.data.nodeType == 0 || d.data.type == -1 || d.data.attName ? 0 : 0.5
          )
          .attr("rx", 2) //圆角

          .style("stroke", (d) =>
              d.data.nodeType == -1 ? "" : that.getRectStorke(d.parent.data.name)
          )
          .style("fill", function (d) {
            if (d.data.nodeType == -1) {
              return "rgb(241, 241, 241)";
            } else if (d.data.nodeType == 0) {
              return that.getRectStorke(d.data.name);
            } else if (d.data.attName) {
              return "rgb(33, 150, 243)";
            } else {
              return "#fff";
            }
          });
    },
    //画circle
    drawCircle(id, dirRight, source, direction) {

      let gMark = d3
          .select(`#${id}`)
          .append("g")
          .attr("class", "node-circle")
          .attr("stroke", "rgb(153, 153, 153)")
          .attr("transform", function (d) {
            if (d.data.percent) {
              if (circlewidth1 > circlewidth2) {
                leng = Number(circlewidth1) + 15;
              } else {
                leng = Number(circlewidth2) + 15;
              }

              //leng = Number(circlewidth1) + Number(circlewidth2) + 25;
              if (leng > 390) {
                leng = 390;
              }
              if (dirRight == 1) {
                return "translate(" + leng + ",0)";
              } else {
                return "translate(" + -leng + ",0)";
              }
            } else {
              leng = Number(circlewidth1) + 15;
              if (dirRight == 1) {
                return "translate(" + leng + ",0)";
              } else {
                return "translate(" + -leng + ",0)";
              }
            }
          })
          // .attr('stroke-width', d => d.data.isNextNode ? 1 : 0);   判断是否有下级节点
          .attr("stroke-width", (d) => (d.data.type == "-1" ? 0 : 1));

      gMark
          .append("circle")
          .attr("fill", "none")
          .attr("r", function (d) {
            if (d.data.type == "-1") {
              return 0;
            }
            return 5;
          }) //根节点不设置圆圈
          .attr("fill", "#ffffff");
      let padding = this.circleR - 2;

      gMark.append("path").attr("d", `m -${padding} 0 l ${2 * padding} 0`); //横线

      gMark
          .append("path") //竖线，根据展开/收缩动态控制显示
          .attr("d", `m 0 -${padding} l 0 ${2 * padding}`)
          .attr("stroke-width", function (d) {
            if (d.data.type == "-1") {
              return 0;
            }
            return 1;
          })
          .attr("class", "node-circle-vertical");
      return gMark;
    },
    expand(d, direction, source) {
      this.isShowTemplate = false;
      if (d.data.name == "展开") {
        this.getNode(d, direction, source);
        return;
      }
      if (d._children) {
        d.children = d._children;

        d._children = null;
        this.update(d, direction);
      }
    },
    collapse(d, direction, obj) {      
      this.isShowTemplate = false;
      if (d.children) {
        d._children = d.children;
        d.children = null;
      }
      if (obj == 1) {
        this.update(d, direction);
      }
    },
    //点击某个节点ly
    clickNode(d, direction, source) {
      if (d.children) {
        this.collapse(d, direction, 1);
      } else {
        this.expand(d, direction, source);
      }
    },
    getTsTextColor(name) {
      switch (name) {
        case "股东":
          return "darkgray";
        case "供应商":
          return "#FF9800";
        case "合伙人":
          return "green";
        default:
          return "black";
      }
    },
    //末 节点 边框颜色
    getRectStorke(name) {
      switch (name) {
        case "分支机构":
          return "rgb(255, 234, 218)";
        case "对外投资":
          return "rgb(215, 236, 255)";
        case "股东":
          return "rgb(211, 234, 241)";
        case "高管":
          return "rgb(237, 227, 244)";
        default:
          return "rgb(133, 165, 255)";
      }
    },
    // 筛选
    filterStateChange(e) { 
      // 左     
      this.filterRoot('l', function(a) {
            //   对外投资  
            if(a.id === 'g_dwtz') {
              return e.checkedList2.has(3);
             }   
             return true;
      });
      // 右
      this.filterRoot('r', function(a) {
            // 股东  
            if(a.id === 'g_gd') {
              return e.checkedList2.has(2);
             }   
             // 高管
             if(a.id === 'g_gg') {
              return e.checkedList1.has(3);
             }   
             // 高管
             if(a.id === 'g_lsgd') {
              return e.checkedList2.has(7);
             }   
             return true;
      });
    },
    filterRoot(direction, filter) {
      let d = rootNode[direction];
      if(!d._originChildren) {
        d._originChildren = d.children || d._children ;
      }

      const children = d._originChildren.filter(a => filter(a));
      d._children = children.length > 0 ? children:null;	
      d.children = children.length > 0 ? children:null;	
      this.update(d, direction);
    },
    refresh() {
      d3.select('#treeRoot svg').remove();
      this.getData();
    },
    exportImg() {
      downloadImpByChart('企业构成图', this.rootName[0])
    }
  }
}

</script>

<style scoped lang="scss">
.tree04 {
  position: relative;
  background: #fff;
  touch-action: none;
  padding: 0;
  margin: 0;
  height: 100%;
  max-width: 100%;
  overflow: hidden;
  font-family: "PingFangSC-Regular", "PingFangSC-Light", "PingFang SC",
  sans-serif, "Microsoft YaHei";    
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
