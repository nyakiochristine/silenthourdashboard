<script setup>
import { ref, computed, onUnmounted } from 'vue'

const totalSeconds = ref(5400) // 90 minutes
const isRunning = ref(false)
let timerInterval = null

const formattedTime = computed(() => {
  const minutes = Math.floor(totalSeconds.value / 60)
  const seconds = totalSeconds.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const toggleTimer = () => {
  if (isRunning.value) {
    clearInterval(timerInterval)
  } else {
    timerInterval = setInterval(() => {
      if (totalSeconds.value > 0) {
        totalSeconds.value--
      } else {
        clearInterval(timerInterval)
        isRunning.value = false
      }
    }, 1000)
  }
  isRunning.value = !isRunning.value
}

const resetTimer = () => {
  clearInterval(timerInterval)
  totalSeconds.value = 5400
  isRunning.value = false
}

onUnmounted(() => clearInterval(timerInterval))
</script>

<template>
  <div class="bg-white p-6 rounded-2xl border border-stone-200/60 text-center relative overflow-hidden">
    
    <h2 class="text-sm font-bold tracking-wider text-stone-400 uppercase mb-2">Reading Timer</h2>
    
    <!-- Big Digital Clock Face -->
    <div class="text-6xl font-black text-stone-900 tracking-tight my-4 tabular-nums font-mono">
      {{ formattedTime }}
    </div>
    
    <!-- Button Controls Wrapper -->
    <div class="flex gap-2 mt-4">
      <button 
        @click="toggleTimer" 
        :class="isRunning 
          ? 'border border-stone-300 text-stone-700 hover:bg-stone-50' 
          : 'bg-stone-950 text-stone-50 hover:bg-stone-800'"
        class="flex-1 py-3 rounded-xl font-medium tracking-wide text-xs uppercase transition-all duration-200 active:scale-[0.98]"
      >
        {{ isRunning ? 'Pause' : 'Start Session' }}
      </button>
      
      <button 
        @click="resetTimer" 
        class="px-4 border border-stone-200 text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-xl transition-all duration-200"
        title="Reset Timer"
      >
        ⏳
      </button>
    </div>
  </div>
</template>