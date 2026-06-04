<script setup>
import { computed } from 'vue'

const props = defineProps({
  log: {
    type: Array,
    default: () => []
  }
})

const stats = computed(() => {
  if (!props.log || props.log.length === 0) return []
  const counts = props.log.reduce((acc, book) => {
    const genre = book.genre || 'Other'
    acc[genre] = (acc[genre] || 0) + 1
    return acc
  }, {})
  
  return Object.entries(counts)
    .map(([genre, count]) => ({ genre, count, percent: Math.round((count / props.log.length) * 100) }))
    .sort((a, b) => b.count - a.count)
})
</script>

<template>
  <div class="bg-white p-6 rounded-2xl border border-[#E6E3DE]">
    <p class="text-[11px] tracking-[0.2em] uppercase font-semibold text-[#A09D97] mb-1">Genre Breakdown</p>
    <p class="text-[13px] text-[#6F6C66] mb-4">What the club is reading</p>
    
    <template v-if="stats.length > 0">
      <div v-for="item in stats" :key="item.genre" class="mb-3 last:mb-0">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-[12px] font-medium text-[#1B1B18]">{{ item.genre }}</span>
          <span class="text-[11px] text-[#A09D97] font-medium tabular-nums font-timer">{{ item.percent }}%</span>
        </div>
        <div class="h-1.5 bg-[#F7F6F3] rounded-full overflow-hidden">
          <div 
            class="h-full bg-[#2B593F] rounded-full transition-all duration-700 ease-out"
            :style="{ width: `${item.percent}%` }"
          />
        </div>
      </div>
    </template>
    
    <div v-else class="text-[12px] text-[#A09D97] italic py-2">
      Add books to see genre insights.
    </div>
  </div>
</template>