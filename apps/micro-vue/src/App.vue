<template>
  <div class="app">
    <nav class="navbar">
      <h1>Vue 子应用</h1>
      <div class="nav-links">
        <router-link to="/home">首页</router-link>
        <router-link to="/page1">页面1</router-link>
        <router-link to="/page2">页面2</router-link>
        <router-link to="/detail">详情</router-link>
        <router-link to="/settings">设置</router-link>
      </div>
    </nav>
    <div class="content">
      <div class="info">
        <p>当前路由: {{ $route.fullPath }}</p>
        <p>应用名称: {{ appName }}</p>
        <p>计数: {{ count }}</p>
      </div>
      <div class="actions">
        <button @click="increment">增加计数</button>
      </div>
      <router-view />
      <div class="features">
        <h2>功能演示</h2>
        <ul>
          <li>生命周期管理：应用已挂载</li>
          <li>Vue Router 集成：使用 vue-router 进行路由管理</li>
          <li>路由同步：路由变化自动同步到主应用</li>
          <li>通信功能：可以发送事件和请求</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const count = ref(0)
const appName = ref('')

onMounted(() => {
})

const increment = () => {
  count.value++
}
</script>

<style scoped>
.app {
  font-family: Arial, sans-serif;
}

.navbar {
  background: #f8f9fa;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #dee2e6;
}

.navbar h1 {
  margin: 0;
  font-size: 1.5rem;
}

.nav-links {
  display: flex;
  gap: 1rem;
}

.nav-links a {
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: #007bff;
  border-radius: 4px;
  transition: background 0.2s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  background: #e9ecef;
  color: #0056b3;
}

.content {
  padding: 2rem;
}

.info {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.actions {
  margin-bottom: 2rem;
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
  padding-top: 2rem;
  border-top: 1px solid #dee2e6;
}

ul {
  list-style-type: disc;
  padding-left: 2rem;
}
</style>

