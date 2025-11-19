<template>
  <div class="app">
    <h1>Vue 子应用</h1>
    <div class="info">
      <p>当前路由: {{ route }}</p>
      <p>应用名称: {{ appName }}</p>
      <p>计数: {{ count }}</p>
    </div>
    <div class="actions">
      <button @click="increment">增加计数</button>
      <button @click="sendMessage">发送事件</button>
      <button @click="sendRequest">发送请求</button>
    </div>
    <div class="features">
      <h2>功能演示</h2>
      <ul>
        <li>生命周期管理：应用已挂载</li>
        <li>路由同步：当前路由 {{ route }}</li>
        <li>通信功能：可以发送事件和请求</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { MicroApp } from '@micro-iframe/sdk'

interface Props {
  microApp: MicroApp
}

const props = defineProps<Props>()

const count = ref(0)
const route = ref('')
const appName = ref('')

onMounted(() => {
  route.value = props.microApp.router.getCurrentRoute()
  const propsData = props.microApp.getCurrentProps()
  appName.value = propsData?.name || 'N/A'

  const unsubscribe = props.microApp.router.onRouteChange((newRoute) => {
    route.value = newRoute
  })

  onUnmounted(() => {
    unsubscribe()
  })
})

const increment = () => {
  count.value++
}

const sendMessage = () => {
  props.microApp.communication.emit('test-event', {
    message: 'Hello from Vue App!',
    count: count.value,
  })
}

const sendRequest = async () => {
  try {
    const result = await props.microApp.communication.request('test-method', {
      param: 'test',
    })
    console.log('请求结果:', result)
    alert(`请求成功: ${JSON.stringify(result)}`)
  } catch (error) {
    console.error('请求失败:', error)
    alert(`请求失败: ${error}`)
  }
}
</script>

<style scoped>
.app {
  padding: 2rem;
  font-family: Arial, sans-serif;
}

.info {
  margin-top: 1rem;
}

.actions {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
}

button {
  padding: 0.5rem 1rem;
  cursor: pointer;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  transition: background 0.2s;
}

button:hover {
  background: #f0f0f0;
}

.features {
  margin-top: 2rem;
}

ul {
  list-style-type: disc;
  padding-left: 2rem;
}
</style>

