import * as d3 from 'd3v4'
import json from "@/api/structureJson.json";
const actualController = json.data.actual_controller
let structureJson = {
	"name": "马云",
	"tap": "节点",
	"isKey": true,
	"children": [
			{
				"amount": "994.04万股",
				"children": [],
				"count": 0,
				"eid": "90fe3383f8333a3190a0fda5f4ecd621",
				"level": "1",
				"name": "邱昆",
				"percent": "19.07%",
				"sh_type": "主要股东(新三板)",
				"short_name": "邱昆",
				"type": "P"
			},
        {
            "name": "中国平安人寿保险股份有限公司-自有资金",
            "percent": "2.27%",
            "children": [
                {
                    "name": "中国证券金融股份有限公司",
                    "percent": "2.27%",
                    "children": [
                        {
                            "name": "中国证券金融股份有限公司",
                            "percent": "2.27%"
                        }
                    ]
                },
                {
                    "name": "中央汇金资产管理有限责任公司",
                    "percent": "2.27%"
                }
            ]
        },
        {
            "name": "中国平安人寿保险股份有限公司-自有资金",
            "percent": "2.27%"
        },
        {
            "name": "中国平安人寿保险股份有限公司-自有资金",
            "percent": "2.27%"
        },
        {
            "name": "中国平安人寿保险股份有限公司-自有资金",
            "percent": "2.27%"
        },
        {
            "name": "中国平安人寿保险股份有限公司-自有资金",
            "percent": "2.27%"
        }
    ]
}
structureJson = json.data.equity_structure
var width,height, zoom, svg

	// 缩放
function zoomClick(type) {
 	type == 1 ? zoom.scaleBy(svg, 1.2) : zoom.scaleBy(svg, 0.8)
}
/**
 * 绘制图形
 * @param {} bool 控制显示全部展开还是全部收起
 */
function drawing(bool = true) { 
	if (d3.select('#svg')) {
		d3.select('#svg').remove();
	}
	// 基础配置
		var i = 0,
			duration = 400,
			root;
		var margin = { top: 100, right: 20, bottom: 30, left: 20 },
			barHeight = 50,
			barSpace = 10,
			barWidth = 500;
			width = document.getElementById('MainCy').scrollWidth
			height = document.getElementById('MainCy').scrollHeight
			
			svg = d3.select('#MainCy').append('svg').attr('width', width < 900 ? 900 : width).attr('height', height).attr('id', 'svg')
          .call(d3.zoom().scaleExtent([0.5, 2]).on('zoom', () => {
						const transform = d3.event.transform
						svg.attr('transform', transform.translate(0,0));
          }))
          .on('dblclick.zoom', null)
					.append('g').attr('id', 'gIn')
				zoom = d3.zoom().scaleExtent([0.5, 2]).on("zoom", function(){ // zoom事件
					svg.attr("transform", d3.zoomTransform(svg.node()));
				})
		var container = svg.append('g')
			.attr('width', barWidth)
			.attr("transform", function (d) {
				if (width < barWidth + 400) {
					return "translate(207.5," + margin.top + ")"
				} else {
					let left = (width - barWidth) / 2
					return "translate(" + left + "," + margin.top + ")"
				}
			})
		// 	.attr('class', 'container');
				// 拷贝树的数据
        let downTree = {}
        Object.keys(structureJson).map(item => {
          if (item === 'children') {
            downTree = JSON.parse(JSON.stringify(structureJson))
            downTree.children = structureJson[item]
          }
        })
	// hierarchy()根据给定的分层数据构造根节点数据 { data: {"根节点"， children: ["子节点"]}, children: ["子节点"]}
		root = d3.hierarchy(downTree);
		root.x0 = 0;
		root.y0 = 0;
		if (bool) {
			// 全部收起，仅展示第一层子节点
			root.children.forEach(collapse)
			update(root);
		} else {
			// 全部展开
			update(root);
		}
	
		function update(source) {
			//Compute the "layout". TODO https://github.com/d3/d3-hierarchy/issues/67
			// 全部展开所有节点 -----------statr-----------
			var index = -1,
				count = 0;
			let curentObj = null
			let curentObjCount = 0
			root.eachBefore(function (n) {
				let space = barSpace
				if (curentObj) {
					space = barSpace + 25
					curentObjCount++
				}
				curentObj = null
				if (n.parent) {
					if (n.data.isKey) {
						if (!n.data.children) {
							curentObj = n.data.children[0]
						} else {
							for (let k = 0; k < n.parent.children.length; k++) {
								if (n.parent.children[k].id === n.id) {
									curentObj = n.parent.children[k].data
								}							
							}
							curentObj = n.data.children
						}
					}
				}
				count += space;
				n.style = "node_" + n.depth;
				n.x = ++index * barHeight + count;
				n.y = n.depth * 20;
			});

			var nodes = root.descendants();

			// 更新节点
			var node = container.selectAll(".node")
				.data(nodes, function (d) { return d.id || (d.id = ++i); });

			var nodeEnter = node.enter().append("g")
				.attr("class", function (d) { return "node node_" + d.depth + " " + getClass(d); })
				.attr("transform", function (d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
				.style("opacity", 0);

			//在父节点的上一位置输入任何新节点。
			// 矩形框样式
			nodeEnter.append("rect")
				// .attr("x", (width / 2 - barHeight / 2))
				.attr("class", "rect")
				.attr("y", -barHeight / 2)
				.attr("height", function (d) {
					return d.data.name === actualController.name && d.depth ? barHeight + 25 : barHeight
				})
				.attr("width", function (d) {
					return barWidth - (d.depth * 20)
				})
				.style('stroke', "#d8d8d8")
				.style('fill', "#fff")
				.style('stroke-width', "0.5px")
				// .on("mouseenter", nodeHover);

			// 红蓝小长条的样式
			nodeEnter.append("rect")
				.attr("y", -barHeight / 2)
				.attr("height", function (d) {
					return d.data.name === actualController.name && d.depth ? barHeight + 25 : barHeight
				})
				.attr("width", 5)
				.style('fill', function (d) {
					return d.data.type === 'P' ? '#FF7777' : '#359CEF'
				})

			// 第一行name  公司名称或自然人股东姓名
			nodeEnter.append("text")
				.attr("dy", function (d) {
					return d.depth >= 1 ? -3.5 : 5
				})
				.attr("dx", 40)
				.style("fill", "#128bed")
				.style("font-size", "14px")
				.style('font-family', 'microsoft yahei')
				.text(function (d) {
					if (d.data.name.length > 24) {
						return d.data.name.substring(0, 25) + '...';
					}
					return d.data.name;
				});
			// 第二行  标签
			const tag = nodeEnter.append('g')
				.attr('class', 'tag')
				.attr('transform', 'translate(40, 2)')

			// 大股东标签
			const tagG1 = tag.append('g')
				.attr('class', 'g')

			tagG1.append("rect")
				.attr("y", 2)
				.attr("height", 20)
					.attr("width", 44)
					.style('fill', function (d) {
						return d.data.name === actualController.name && d.depth ? '#FFECEC': 'rgba(0,0,0,0)'
					})

				tagG1.append("text")
				.attr("dx", 3)
				.attr("dy", 15.5)
				.attr("height", 20)
				.style('fill', "#FF6060")
				.style('font-family', 'microsoft yahei')
				.style("font-size", "12px")
				.text(function (d) {
					return d.data.name === actualController.name && d.depth ? '大股东' : ''
				});

					// 实际控制人标签
				const tagG2 = tag.append('g')
				.attr('class', 'g')
				.attr('transform', 'translate(50, 0)')
					
				tagG2.append("rect")
					.attr("y", 2)
					.attr("height", 20)
					.attr("width", 68)
					.style('fill', function (d) {
						return d.data.name === actualController.name && d.depth ? '#FFEEDB': 'rgba(0,0,0,0)'
					})

				tagG2.append("text")
				.attr("dx", 3)
				.attr("dy", 15.5)
				.attr("height", 20)
				.style('font-family', 'microsoft yahei')
				.style('fill', "#FF8900")
				.style("font-size", "12px")
				.text(function (d) {
					return d.data.name === actualController.name && d.depth ? '实际控制人' : ''
				});

				// 最终受益人标签
				const tagG3 = tag.append('g')
				.attr('class', 'g')
				.attr('transform', 'translate(126, 0)')
					
				tagG3.append("rect")
					.attr("y", 2)
					.attr("height", 20)
					.attr("width", 68)
					.style('fill', function (d) {
						return d.data.name === actualController.name && d.depth ? '#E5F2FD': 'rgba(0,0,0,0)'
					})

				tagG3.append("text")
				.attr("dx", 3)
				.attr("height", 20)
				.style('font-family', 'microsoft yahei')
				.attr("dy", 15.5)
				.style('fill', "#128BED")
				.style("font-size", "12px")
				.text(function (d) {
					return d.data.name === actualController.name && d.depth ? '最终受益人' : ''
				});
				

				// 第三行 持股比例
				const percent = nodeEnter.append('g')
					.attr('class', 'percent')
					.attr('transform', function (d) {
						return d.data.name === actualController.name && d.depth ? 'translate(40, 25)' : 'translate(40, 0)'
					})

				percent.append("text")
				.attr("dy", 15.5)
				.style('fill', "#808080")
				.style('font-family', 'microsoft yahei')
				.style("font-size", "12px")
				.text(function (d) {
					return d.depth ? "持股比例：" : ""
				});

				percent.append("text")
				.attr("dy", 15.5)
				.style('fill', "#FF8900")
				.attr('transform', 'translate(60, 0)')
				.style('font-family', 'microsoft yahei')
				.style("font-size", "12px")
				.text(function (d) {
					return d.data.percent
				});

				// 第三行 认缴金额
				const amount = nodeEnter.append('g')
					.attr('class', 'amount')
					.attr('transform', 'translate(240, 0)')

				amount.append("text")
				.attr("dy", function (d) {
					return d.data.name === actualController.name && d.depth ? 40.5 : 15.5
				})
				.style('fill', "#808080")
				.style('font-family', 'microsoft yahei')
				.style("font-size", "12px")
				.text(function (d) {
					return d.depth ? "认缴金额：" : ""
				});

				amount.append("text")
				.attr("dy", function (d) {
						return d.data.name === actualController.name && d.depth ? 40.5 : 15.5
					})
				.style('fill', "#FF8900")
				.attr('transform', 'translate(60, 0)')
				.style('font-family', 'microsoft yahei')
				.style("font-size", "12px")
				.text(function (d) {
					return d.data.percent
				});

				// 圆圈+ -整体
			var circle = nodeEnter.append("g")
				.attr("class", "circle")
				.on("click", click);

			circle.append("circle")
				.style('fill', "#fff")
				.style("stroke", "#d8d8d8")
				.style('stroke-width', 1)
				.style('cursor', "pointer")
				.attr("r", function (d) {
					if (d.children || d._children) {
						return 8.5;
					} else {
						return;
					}
				})
				// .style('stroke-opacity', 1)
				.attr("transform", function (d) {
					return "translate(20,0)";
				})
			circle.append("text")
				.attr("class", "fa")
				.attr("dy", 4.5)
				.attr("cx", "20px")
				.attr("cy", "30px")
				.attr("font-family", "FontAwesome")
				.attr('text-anchor', 'middle')
				.style('fill', "#d8d8d8")
				.style('cursor', "pointer")
				.attr("transform", function (d) {
					return "translate(20,0)";
				})
				.text(function (d) {
					if (d.children) {
						return '-';
					} else if (d._children) {
						return '+';
					} else {
						return '';
					}
				})
			node.select('.fa')
				.text(function (d) {
					if (d.children) {
						return '-';
					} else if (d._children) {
						return '+';
					} else {
						return '';
					}
				})

			// 将节点转换到其对应位置
			nodeEnter.transition()
				.duration(duration)
				.attr("transform", function (d) { return "translate(" + d.y + "," + d.x + ")"; })
				.style("opacity", 1);

			node.transition()
				.duration(duration)
				.attr("transform", function (d) { return "translate(" + d.y + "," + d.x + ")"; })
				.style("opacity", 1)
				.select("rect")
				.style("stroke", "#d8d8d8")
				.style("fill", color);

			// 将现有节点转换到父节点的位置
			node.exit().transition()
				.duration(duration)
				.attr("transform", function (d) { return "translate(" + source.y + "," + source.x + ")"; })
				.style("opacity", 0)
				.remove();

			//连接线------------start----------------
			var link = container.selectAll(".link")
				.data(root.links(), function (d) { return d.target.id; });
			
			//在父级之前的位置绘制新连接线
			link.enter().insert("path", "g")
				.attr("class", function (d) {
					return "link link_" + d.target.depth + " " + getClass(d.target);
				})
				.attr('fill', 'none')
				.attr('stroke', '#d8d8d8')
				.attr("d", function (d) {
					var o = { x: source.x0, y: source.y0 };
					return elbow({ source: o, target: o });
				})
				.transition()
				.duration(duration)
				.attr("d", elbow);

			//转换到连接线对应位置.
			link.transition()
				.duration(duration)
				.attr("d", elbow);

			//将现有连接线转换到父节点的位置
			link.exit().transition()
				.duration(duration)
				.attr("d", function (d) {
					var o = { x: source.x, y: source.y };
					return elbow({ source: o, target: o });
				})
				.remove();

			//固定位置以进行过渡动画.
			root.each(function (d) {
				d.x0 = d.x;
				d.y0 = d.y;
			});
			//连接线------------end----------------

	}
	
		// Toggle children on click.
		function click(d) {
			if(d.children){
          // 点击减号
          d._children = d.children;
          d.children = null;
        }else {
          // 点击加号
          if(!d._children){
            let res = d.children || d._children
            if(!res.length){
              return
            }
            res.forEach(item =>{
              let newNode = d3.hierarchy(item)
              newNode.depth = d.depth + 1; 
              newNode.height = d.height - 1;
              newNode.parent = d; 
              if(!d.children){
                d.children = [];
                d.data.children = [];
              }
              d.children.push(newNode);
              d.data.children.push(newNode.data);
            })
          }else{
            d.children = d._children;
            d._children = null;
          }
			}
			update(d);
		}
		function collapse (source) {
			if (source.children) {
				source._children = source.children;
				source._children.forEach(collapse);
				source.children = null;
			}
		}
		function getClass(d) {
			if (d.data.class) {
				return d.data.class
			} else {
				return "";
			}
		}
		// 折线
	function elbow(d) {
		return "M" + d.source.y + "," + d.source.x
			+ "H" + (d.source.y + (d.target.y - d.source.y) / 8)
			+ "V" + d.target.x
			+ "H" + d.target.y;
		}
		function color(d) {
			if (d._isSelected) return '#fff';
			return d._children ? "#fff" : d.children ? "#fff" : "#fff";
		}
		function nodeHover(d, i) {
			var links = d3.selectAll(".rect")[0];
				for (let i = 0; i < links.length; i++) {
					let item = links[i];
					if (
						d3.select(item).attr("class").indexOf("bg") != "-1"
					) {
						d3.select(item).attr("class", "bg");
					}
				}
		}
}

export default {
  zoomClick,
  drawing
};