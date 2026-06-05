<template>
  <div class="about-page">
    <h1>关于我们</h1>
    <p>宠物平台是一个致力于为宠物爱好者提供全面服务的平台。</p>
  </div>
</template>

<script>
export default {
  name: 'AboutView'
}
</script>

<style scoped>
.about-page {
  padding: var(--spacing-2xl);
  max-width: 800px;
  margin: 0 auto;
}

.about-page h1 {
  font-size: var(--font-size-3xl);
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
  font-weight: var(--font-weight-bold);
}

.about-page p {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: var(--spacing-base);
}
</style>