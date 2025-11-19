<template>
  <div class="page">
    <h1>页面 1</h1>
    <p>这是页面 1 的内容</p>
    <div class="actions">
      <router-link to="/">返回首页</router-link>
      <router-link to="/page2">跳转到页面2</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
// Page1 页面
</script>

<style scoped>
.page {
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

