<template>
  <div class="home">
    <h1>首页</h1>
    <p>这是 Vue 子应用的首页</p>
    <div class="actions">
      <router-link to="/page1">跳转到页面1</router-link>
      <router-link to="/page2">跳转到页面2</router-link>
      <router-link to="/detail">查看详情</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
// Home 页面
</script>

<style scoped>
.home {
  padding: 2rem;
}

.actions {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
}

.actions a {
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background 0.2s;
}

.actions a:hover {
  background: #0056b3;
}
</style>

