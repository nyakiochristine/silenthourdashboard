<script setup>
import { computed } from 'vue'
const props = defineProps(['log'])

const stats = computed(() => {
  if (props.log.length === 0) return {}
  return props.log.reduce((acc, book) => {
    acc[book.genre] = (acc[book.genre] || 0) + 1
    return acc
  }, {})
})
</script>

<template>
  <div class="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
    <h3 class="font-bold text-indigo-900 mb-2">Session Insights</h3>
    <div v-for="(count, genre) in stats" :key="genre" class="text-sm">
      {{ genre }}: {{ Math.round((count / log.length) * 100) }}%
    </div>
  </div>
</template>