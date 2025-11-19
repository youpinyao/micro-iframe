<template>
  <div class="settings">
    <h1>设置页</h1>
    <p>这是设置页的内容</p>
    <div class="actions">
      <router-link to="/">返回首页</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
// Settings 页面
</script>

<style scoped>
.settings {
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

