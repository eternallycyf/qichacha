<template>
  <!---->
  <div
    class="detail"
    :style="{ top: position.top + 'px', left: position.left + 'px' }"
  >
    <div v-if="data.type !== 'employee'" class="company">
      <div class="top">
        <div class="avatar">{{ data.short_name }}</div>
        <a target="_blank" href="http://www.baidu.com"><div class="name">{{ data.name }}</div></a>
      </div>
      <div class="bottom">
        <div class="label">
          <span v-if="data.status" class="cunxu">{{  data.status }}</span>
          <span class="xiaowei">小微企业</span>
        </div>
        <div>
          执行事务合伙人：<span class="blue">{{ data.oper_name }}</span>
        </div>
        <div>
          注册资本：<span class="black">{{ data.reg_capi }}</span>
        </div>
        <div>
          成立日期：<span class="black">{{ data.start_date }}</span>
        </div>
      </div>
    </div>

    <div v-else class="employee">
      <div class="top">
        <div class="avatar"></div>
        <div class="base">
          <div class="name blue ">{{ data.name }}</div>
          <div>企业：<a target="_blank" href="http://www.baidu.com"><span class="blue ">{{ data.company  }}</span></a></div>
          <div>职位：<span class="black ">{{ data.title || '-' }}</span></div>
        </div>
      </div>
      <div class="bottom">
        <div class="r1">
          <div>担任法人：<span class="black ">-</span></div>
          <div>在外任职：<span class="black ">-</span></div>
        </div>
        <div class="r2">
          <div>对外投资：<span class="black ">-</span></div>
          <div>控股企业：<span class="black ">-</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, onMounted } from "vue";

defineProps(["data", "position"]);

// 调佣接口获取注册资本：其他信息
</script>


<style scoped lang="scss">
.detail {
  position: absolute;
  z-index: 100;
  background: #fff;
  border-radius: 5px;
  box-shadow: rgb(174, 174, 174) 0px 0px 10px;

  .company {
    display: flex;
    flex-flow: column;
    width: 300px;
    height: 135px;

    .top {
      display: flex;
      flex-flow: row;
      padding: 5px;
      width: 100%;
      height: 45px;
      font-size: 12px;

      .avatar {
        width: 35px;
        height: 35px;
        background: #70a7d1;
        border-radius: 3px;
        text-align: center;
        color: #fff;
      }

      .name {
        display: flex;
        align-items: center;
        padding: 0 5px;
        width: 250px;
        vertical-align: middle;
        font-weight: bold;
        color: #2196f3;
      }
    }

    .bottom {
      box-sizing: border-box;
      padding-left: 40px;
      width: 100%;
      color: #8e8e8e;
      font-size: 12px;

      >div {
        height: 22px;
        line-height: 1.2;
      }

      .label {
        width: 100%;

        >span {
          display: inline-block;
          transform: scale(0.7);
          padding: 3px 5px;
          border-radius: 2px;
        }

        .cunxu {
          margin-left: -5px;
          background: #e2faee;
          color: #52b97c;
        }

        .xiaowei {
          margin-left: -10px;
          background: #d5e8f8;
          color: #377dbe;
        }
      }
    }
  }

  .employee {
    display: flex;
    flex-flow: column;
    width: 300px;
    height: 135px;
    font-size: 12px;
    color: #8e8e8e;

    .top {
      display: flex;
      flex-flow: row;
      padding: 10px 10px 5px;
      width: 100%;
      overflow: hidden;

      .avatar {
        width: 35px;
        height: 35px;
        background: #70a7d1;
        border-radius: 5px;
        text-align: center;
        color: #fff;
      }

      .base {
        margin-left: 15px;
        width: 200px;

        >div {
        height: 20px;
        line-height: 1;
        }

        .name {
          font-size: 14px;
        }
      }
    }

    .bottom {
      display: flex;
      border-top: 5px solid #F7F7F7;
      
      >div {
        padding: 10px;
        width: 50%;
        
        >div {
          line-height: 1.5;
        }
      }
    }
  }


  

  .black {
        color: #2c2c2c;
      }

      .blue {
        color: #2196f3;
      }

      .bold {
        font-weight: bold;
      }
}
</style>