# qichacha

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
pnpm i
```

### Compile and Hot-Reload for Development

```sh
pnpm run dev
```

### Compile and Minify for Production

```sh
pnpm run build
```

#### 接口

##### ---------------------- 1.企业关系图谱 ----------------------------

##### 1.1 页面初始化数据接口

###### 接口地址：https://api.qixin.com/APIService/relation/getRelatedRelation

###### 数据格式：JSON

###### 请求方式：HTTP/HTTPS GET

###### 请求示例：https://api.qixin.com/APIService/relation/getRelatedRelation?name=小米科技有限责任公司

##### 1.2 页面节点点击显示悬浮框数据接口 缺失 （某企业或自然人详细信息）

##### 1.3 页面右侧悬浮功能框，模板界面[状态、持股、分类字段] 缺失 初始化数据接口中没有对应字段

##### ---------------------- 2.企业构成图谱（企业链图） ----------------------------

##### 2.1 页面初始化数据接口

###### 接口地址：https://api.qixin.com/APIService/relation/getChainRelationByName

###### 数据格式：JSON

###### 请求方式：HTTP/HTTPS GET

###### 请求示例：https://api.qixin.com/APIService/relation/getChainRelationByName?keyword=小米科技有限责任公司

###### 接口数据仅返回[股东、高管、对外投资]字段

##### ---------------------- 3.股权穿透图谱 ----------------------------

##### 3.1 页面初始化数据接口

###### 接口地址：https://api.qixin.com/APIService/reportData/getRelationInfoByName

###### 数据格式：JSON

###### 请求方式：HTTP/HTTPS GET

###### 请求示例：https://api.qixin.com/APIService/reportData/getRelationInfoByName?name=小米科技有限责任公司

###### 页面初始化接口存在字段缺失：融资轮次、非大陆公司标签、企业登记状态标签

##### ---------------------- 4.股权结构图谱 ----------------------------

##### 4.1 页面初始化数据接口

##### 4.1.1 股东接口 缺失[认缴金额、大股东、实际受益人]字段

###### 接口地址：https://api.qixin.com/APIService/v2/relation/getReportDataByName

###### 数据格式：JSON

###### 请求方式：HTTP/HTTPS GET

###### 请求示例：https://api.qixin.com/APIService/reportData/getReportDataByName?name=小米科技有限责任公司

##### 4.1.2 对外投资 缺失[是否控股、融资轮次、认缴金额]字段

###### 接口地址：https://api.qixin.com/APIService/v2/relation/getReportDataByName

###### 数据格式：JSON

###### 请求方式：HTTP/HTTPS GET

###### 请求示例：https://api.qixin.com/APIService/reportData/getReportDataByName?name=小米科技有限责任公司

##### 4.1.3 历史股东信息接口缺失

##### ---------------------- 5.企业受益股东图谱 ----------------------------

###### 接口地址：https://api.qixin.com/APIService/benefit/getBeneficiariesByName

###### 数据格式：JSON

###### 请求方式：HTTP/HTTPS GET

###### 请求示例：https://api.qixin.com/APIService/benefit/getBeneficiariesByName?keyword=小米科技有限责任公司

###### 该接口是实际受益人接口，与企查查的企业受益股东图谱的数据不同，例 小米科技有限责任公司：该接口仅返回了雷军，在企查查的企业受益股东页面是有四个股东

##### ---------------------- 6.实际控制人（疑似实控人）图谱 ----------------------------

###### 6.1 实际控制人接口 (暂不确定是否用实际受益人接口)

###### 接口地址：https://api.qixin.com/APIService/entChart/getActualOwnerByName

###### 数据格式：JSON

###### 请求方式：HTTP/HTTPS GET

###### 请求示例：https://api.qixin.com/APIService/entChart/getActualOwnerByName?name=小米科技有限责任公司

###### 6.2 疑似实控人接口

###### 接口地址：https://api.qixin.com/APIService/benefit/getBeneficiariesByName

###### 数据格式：JSON

###### 请求方式：HTTP/HTTPS GET

###### 请求示例：https://api.qixin.com/APIService/benefit/getBeneficiariesByName?keyword=小米科技有限责任公司

##### ---------------------- 7.关联方认定图谱 ----------------------------

###### 接口地址：https://api.qixin.com/APIService/relation/getRelationshipResult

###### 数据格式：JSON

###### 请求方式：HTTP/HTTPS GET

###### 请求示例：http://api.qixin.com/APIService/relation/getRelationshipResult?jobid=get_relationship_res:534472fd-7d53-4958-8132-d6a6242423d8

###### 前端无法直观处理数据，前端所需数据结构 同【股权穿透图谱】

###### 如下数据结构：

###### 上游数据：（下游数据同）

[{
"type": "Company", // 用来判断颜色 公司为蓝色， 人员为红色
"Direction": "OUT", // 箭头的方向
"Title": "母公司/控股股东", // 每块内容的释义即 Title
"Operation": "控制", // 父子节点的关系
"Total": 1, // 子节点数量
"Collection": [ // 包含母公司/控股股东 的明细数据
{
"Id": "p1910534b4ae98fea35ddbeb1d61cd44",
"name": "雷军",
}
],
"children": [ // 母公司/控股股东 下的子节点（第二层数据） 所有子节点字段同上
{
"type": "Company",
"Direction": "OUT",
"Title": "受控企业",
"Operation": "控制",
"Total": 126,
"Collection": [
{
"Id": "93377c2302ec9d88aaed10e5bd570241",
"name": "天津拾肆米企业管理合伙企业（有限合伙）",
},
{
"Id": "3ff2f5c25da6b838ad5b84708e2e72fa",
"name": "泸州数科网维技术有限公司",
}
]
}
]
}]

##### ---------------------- 8.关联关系探查图谱 ----------------------------

###### 接口地址：https://api.qixin.com/APIService/relation/getMultiRelationshipResult

###### 数据格式：JSON

###### 请求方式：HTTP/HTTPS POST

###### 请求示例：https://api.qixin.com/APIService/relation/getMultiRelationshipResult?jobid=d936e500-a4a4-4495-9c59-09ce5fe857eb

###### 前端无法直观处理数据，前端所需数据结构待研究
