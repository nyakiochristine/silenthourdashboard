<script setup>
import { ref, computed, onUnmounted } from 'vue'

const TOTAL_DURATION = 5400 // 90 minutes
const totalSeconds = ref(TOTAL_DURATION)
const isRunning = ref(false)
let timerInterval = null

const formattedTime = computed(() => {
  const minutes = Math.floor(totalSeconds.value / 60)
  const seconds = totalSeconds.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const progress = computed(() => totalSeconds.value / TOTAL_DURATION)

const RADIUS = 80
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const strokeDashoffset = computed(() => CIRCUMFERENCE * (1 - progress.value))

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
  totalSeconds.value = TOTAL_DURATION
  isRunning.value = false
}

onUnmounted(() => clearInterval(timerInterval))
</script>

<template>
  <div class="bg-white p-6 md:p-8 rounded-2xl border border-[#E6E3DE] text-center">
    <p class="text-[11px] tracking-[0.2em] uppercase font-semibold text-[#A09D97] mb-6">Reading Timer</p>
    
    <!-- Circular Progress Ring -->
    <div class="relative w-48 h-48 mx-auto mb-6">
      <svg class="w-full h-full -rotate-90" viewBox="0 0 180 180">
        <!-- Background track -->
        <circle cx="90" cy="90" :r="RADIUS" fill="none" stroke="#E6E3DE" stroke-width="4" />
        <!-- Progress arc -->
        <circle 
          cx="90" cy="90" :r="RADIUS" 
          fill="none" 
          stroke="#2B593F" 
          stroke-width="4"
          stroke-linecap="round"
          :stroke-dasharray="CIRCUMFERENCE"
          :stroke-dashoffset="strokeDashoffset"
          class="transition-[stroke-dashoffset] duration-1000 ease-linear"
        />
      </svg>
      <!-- Time display centered -->
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <span class="text-4xl font-timer font-bold text-[#1B1B18] tabular-nums tracking-tight">
          {{ formattedTime }}
        </span>
        <span class="text-[10px] text-[#A09D97] mt-1.5 uppercase tracking-[0.15em] font-medium">
          {{ isRunning ? 'Reading...' : 'Ready' }}
        </span>
      </div>
    </div>
    
    <!-- Controls -->
    <div class="flex gap-2">
      <button 
        @click="toggleTimer" 
        :class="[
          isRunning 
            ? 'border border-[#E6E3DE] text-[#6F6C66] hover:border-[#A09D97] hover:text-[#1B1B18]' 
            : 'bg-[#2B593F] text-white hover:bg-[#1D4230]',
          'flex-1 py-3 rounded-xl text-[12px] font-semibold tracking-wide uppercase transition-all duration-200 active:scale-[0.98]'
        ]"
      >
        {{ isRunning ? 'Pause' : 'Start Session' }}
      </button>
      <button 
        @click="resetTimer" 
        class="px-4 border border-[#E6E3DE] text-[#A09D97] hover:text-[#6F6C66] hover:border-[#A09D97] rounded-xl transition-all duration-200"
        title="Reset Timer"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
      </button>
    </div>
  </div>
</template>