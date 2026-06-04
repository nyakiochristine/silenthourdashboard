<script setup>
import { ref } from 'vue'

const props = defineProps({
  log: {
    type: Array,
    required: true
  }
})

const chosenSpeaker = ref('')
const isDrawing = ref(false)

const pickFirstSpeaker = () => {
  if (!props.log || props.log.length === 0) {
    chosenSpeaker.value = "Log some books first!"
    return
  }
  
  const readers = props.log.map(item => item.reader).filter(Boolean)
  const uniqueReaders = [...new Set(readers)]
  
  if (uniqueReaders.length === 0) {
    chosenSpeaker.value = "No names found!"
    return
  }
  
  // Shuffle animation — rapidly cycle names before landing on one
  isDrawing.value = true
  let shuffleCount = 0
  const shuffleInterval = setInterval(() => {
    chosenSpeaker.value = uniqueReaders[Math.floor(Math.random() * uniqueReaders.length)]
    shuffleCount++
    if (shuffleCount >= 8) {
      clearInterval(shuffleInterval)
      const randomIndex = Math.floor(Math.random() * uniqueReaders.length)
      chosenSpeaker.value = uniqueReaders[randomIndex]
      isDrawing.value = false
    }
  }, 80)
}
</script>

<template>
  <div class="bg-white p-6 rounded-2xl border border-[#E6E3DE]">
    <p class="text-[11px] tracking-[0.2em] uppercase font-semibold text-[#A09D97] mb-1">First Speaker</p>
    <p class="text-[13px] text-[#6F6C66] mb-4">Who shares their book first?</p>
    
    <!-- Result Display -->
    <div class="min-h-[3.5rem] flex items-center justify-center bg-[#F7F6F3] rounded-xl mb-4 px-4 py-3 border border-[#E6E3DE]/60">
      <span v-if="chosenSpeaker && !isDrawing" class="text-lg font-display text-[#1B1B18] animate-fade-in">
        {{ chosenSpeaker }}
      </span>
      <span v-else-if="isDrawing" class="text-lg font-display text-[#A09D97] transition-opacity">
        {{ chosenSpeaker }}
      </span>
      <span v-else class="text-[12px] text-[#C5C2BC] tracking-wide font-medium">
        No one drawn yet
      </span>
    </div>
    
    <!-- Draw Button -->
    <button 
      @click="pickFirstSpeaker"
      :disabled="isDrawing"
      class="w-full bg-[#1B1B18] text-white hover:bg-[#2d2d2a] py-3 rounded-xl text-[12px] font-semibold tracking-wide uppercase transition-all duration-200 active:scale-[0.98] disabled:opacity-60"
    >
      {{ isDrawing ? 'Drawing...' : 'Draw a Name' }}
    </button>
  </div>
</template>