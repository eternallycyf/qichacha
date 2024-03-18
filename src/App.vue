<script setup>
import {ref, computed } from 'vue'
import { RouterView } from 'vue-router'
import { useStore } from 'vuex' ;
import Header from '@/components/Header/index.vue'

const title = ref('小米科技有限责任公司')
const store = useStore();
const isFullScreen = computed(() => store.state.isFullScreen)

</script>

<template>
  <!-- <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />

      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div>
  </header> -->
  <Header v-if="!isFullScreen" :title="title" />
  <RouterView />
</template>


<style scoped>

</style>
