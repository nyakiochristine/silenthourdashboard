<script setup>
import { ref } from 'vue'

const props = defineProps({
  log: {
    type: Array,
    required: true
  }
})

const chosenSpeaker = ref('')

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
  
  const randomIndex = Math.floor(Math.random() * uniqueReaders.length)
  chosenSpeaker.value = uniqueReaders[randomIndex]
}
</script>

<template>
  <div class="bg-white p-6 rounded-2xl border border-stone-200/60 text-center relative overflow-hidden group">
    <!-- Top accent border line -->
    <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

    <h2 class="text-sm font-bold tracking-wider text-stone-400 uppercase mb-1">Intro Order</h2>
    <p class="text-xs italic text-stone-500 font-serif mb-4">Who will share their insights first?</p>
    
    <!-- Display Box -->
    <div class="min-h-[4.5rem] flex items-center justify-center bg-stone-50 rounded-xl mb-4 p-3 border border-stone-100 transition-all duration-300">
      <span v-if="chosenSpeaker" class="text-lg font-serif font-bold text-stone-900 animate-fade-in">
        ✨ <span class="underline decoration-amber-300 decoration-2 underline-offset-4">{{ chosenSpeaker }}</span> goes first!
      </span>
      <span v-else class="text-xs text-stone-400 tracking-wide uppercase font-medium">
        Waiting to draw...
      </span>
    </div>
    
    <!-- Editorial Button -->
    <button 
      @click="pickFirstSpeaker" 
      class="w-full bg-stone-950 text-stone-50 hover:bg-stone-800 py-3 rounded-xl font-medium tracking-wide text-xs uppercase shadow-sm transition-all duration-200 active:scale-[0.98]"
    >
      Draw a Name 🎲
    </button>
  </div>
</template>