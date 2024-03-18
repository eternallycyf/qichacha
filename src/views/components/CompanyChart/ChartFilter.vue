<template>
  <div class="container" :class="{ hide: !visiable }">
    <a-tabs >
      <a-tab-pane key="1" tab="企业模板选项" style="height: 200px">
        <div class="group">
          <div class="left">
            <a-checkbox-group v-model:value="checkedList1" @change="stateChange" :options="options1" />       
          </div>
          <div class="right">           
            <a-checkbox-group v-model:value="checkedList2" @change="stateChange" :options="options2" />          
          </div>
        </div>
      </a-tab-pane>
      <a-tab-pane key="2" tab="个人模板选项" force-render>
        <div class="group">
          <div class="left">
            <a-checkbox-group v-model:value="checkedList3" @change="stateChange" :options="options3" />        
          </div>
          <div class="right">
            <a-checkbox-group v-model:value="checkedList4" @change="stateChange" :options="options4" />        
          </div>
        </div>
      </a-tab-pane
      >
    </a-tabs>
  </div>
</template>
<script setup>
import { ref, defineProps , defineEmits} from "vue";
defineProps({  visiable: Boolean });
const emit = defineEmits(['update:visiable', 'stateChange']);
const checkedList1 = ref( [1,2,3,4,5,6,7])
const checkedList2 = ref( [1,2,3,4,5,6,7])
const checkedList3 = ref( [1,2])
const checkedList4 = ref( [1,2])
const options1 = ([
  {
    label: '法定代表人',
    value: 1
  },
  {
    label: '最终受益人',
    value: 2
  },
  {
    label: '高管',
    value: 3
  },
  {
    label: '控股企业',
    value: 4
  },
  {
    label: '分支机构',
    value: 5
  },
  {
    label: '客户',
    value: 6
  },
  {
    label: '历史代表人',
    value: 7
  },  
])
const options2 = ([
  {
    label: '实际控制人',
    value: 1
  },
  {
    label: '股东',
    value: 2
  },
  {
    label: '对外投资',
    value: 3
  },
  {
    label: '对外担保',
    value: 4
  },
  {
    label: '供应商',
    value: 5
  },
  {
    label: '历史对外投资',
    value: 6
  },
  {
    label: '历史股东',
    value: 7
  },  
])
const options3 = ([
  {
    label: '担任法人',
    value: 1
  },
  {
    label: '控股企业',
    value: 2
  }
])
const options4 = ([
  {
    label: '对外投资',
    value: 1
  },
  {
    label: '在外任职',
    value: 2
  }
])

function stateChange() {
  emit('stateChange', {
    checkedList1: new Set(checkedList1.value),
    checkedList2: new Set(checkedList2.value),
    checkedList3: new Set(checkedList3.value),
    checkedList4: new Set(checkedList4.value)
  })
}
</script>

<style lang="scss" scoped>
.container {

  font-family: "Microsoft YaHei", Arial, sans-serif;
  width: 340px;
  height: 240px;
  box-shadow: rgb(0 0 0 / 20%) 0px 2px 4px 0px;
  border-radius: 5px;
  background-color: #fff;
  position: absolute;
  z-index: 20;
  right: 70px;
  bottom: 200px;
  overflow: hidden;
  background-size: 360px 280px;
  line-height: 1.2;

  .group {
    display: flex;
    width: 100%;
    >div {
      display: flex;
      flex-flow: column;  
      box-sizing: border-box;
      padding: 5px 20px;    
      width: 50%;
    }
  }
}

.hide {
    display: none;
  }
:deep {
  .ant-checkbox-wrapper {
  + .ant-checkbox-wrapper {
    margin-left: 0;
  }
}
  .ant-tabs-top > .ant-tabs-nav {
    margin: 0;
  }

  .ant-tabs > .ant-tabs-nav .ant-tabs-nav-wrap {
    justify-content: center;
  }

  .ant-tabs-tab + .ant-tabs-tab {
    margin-left: 10px;
  }
}
</style>