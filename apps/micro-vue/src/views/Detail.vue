<template>
  <div class="detail">
    <h1>详情页</h1>
    <p>这是详情页的内容</p>
    <div class="actions">
      <router-link to="/">返回首页</router-link>
      <button @click="$router.back()">返回上一页</button>
    </div>
  </div>
</template>

<script setup lang="ts">
// Detail 页面
</script>

<style scoped>
.detail {
  padding: 2rem;
}

.actions {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
}

.actions a,
.actions button {
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  text-decoration: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.actions a:hover,
.actions button:hover {
  background: #0056b3;
}
</style>

