<script setup>
import { ref, watch, onMounted } from 'vue'

// --- State Management ---
const timeRemaining = ref(5400) // 90 minutes
const isRunning = ref(false)
let timerInterval = null

const newBook = ref('')
const newReader = ref('')
const newGenre = ref('Fiction')
const readingLog = ref([])
const featuredSpeaker = ref(null)

// --- Timer Logic ---
const toggleTimer = () => {
  if (isRunning.value) {
    clearInterval(timerInterval)
  } else {
    timerInterval = setInterval(() => {
      if (timeRemaining.value > 0) {
        timeRemaining.value--
      } else {
        clearInterval(timerInterval)
        isRunning.value = false
      }
    }, 1000)
  }
  isRunning.value = !isRunning.value
}

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

// --- Reading Log Logic ---
const addBook = () => {
  if (newBook.value.trim() && newReader.value.trim()) {
    readingLog.value.push({
      id: Date.now(),
      reader: newReader.value,
      book: newBook.value,
      genre: newGenre.value
    })
    newBook.value = ''
    newReader.value = ''
  }
}

const removeBook = (id) => {
  readingLog.value = readingLog.value.filter(b => b.id !== id)
  if (featuredSpeaker.value && featuredSpeaker.value.id === id) {
    featuredSpeaker.value = null
  }
}

// --- Icebreaker Logic ---
const pickSpeaker = () => {
  if (readingLog.value.length > 0) {
    const randomIndex = Math.floor(Math.random() * readingLog.value.length)
    featuredSpeaker.value = readingLog.value[randomIndex]
  }
}

// --- Data Persistence ---
watch(readingLog, (newVal) => {
  localStorage.setItem('silentHourLog', JSON.stringify(newVal))
}, { deep: true })

onMounted(() => {
  const saved = localStorage.getItem('silentHourLog')
  if (saved) {
    readingLog.value = JSON.parse(saved)
  }
})

// Helper for UI colors
const getGenreColor = (genre) => {
  const colors = {
    'Fiction': 'bg-blue-100 text-blue-700',
    'Non-Fiction': 'bg-emerald-100 text-emerald-700',
    'Romance': 'bg-pink-100 text-pink-700',
    'Thriller/Horror': 'bg-stone-800 text-stone-100',
    'Sci-Fi/Fantasy': 'bg-purple-100 text-purple-700',
    'Other': 'bg-slate-200 text-slate-700'
  }
  return colors[genre] || colors['Other']
}
</script>

<template>
  <main class="max-w-5xl mx-auto p-4 sm:p-8 font-sans text-slate-800">
    <header class="text-center mb-8 animate-fade-in">
      <h1 class="text-4xl sm:text-5xl font-bold text-indigo-900 mb-2">Meet and Read Nairobi</h1>
      <p class="text-slate-500 font-medium tracking-wide uppercase text-sm">Silent Hour Dashboard</p>
    </header>

    <section class="mb-8 p-6 sm:p-8 rounded-2xl shadow-sm border border-indigo-100 animated-gradient-bg animate-slide-down transform hover:-translate-y-1 hover:shadow-md transition-all duration-300">
      <div class="max-w-3xl mx-auto text-center">
        <h2 class="font-bold text-indigo-900 uppercase tracking-widest text-sm mb-4 flex items-center justify-center gap-2">
          <span>🌿</span> About The Book Club <span>☕️</span>
        </h2>
        <p class="text-indigo-900/80 text-base sm:text-lg mb-6 leading-relaxed">
          Welcome to Nairobi's premier silent book club! We gather in local cafes and botanical gardens for a dedicated 90 minutes of independent reading, followed by interactive craft activities and social connection. Read what you want, in comfortable silence, together.
        </p>
        <a href="https://www.instagram.com/meetandreadnbo/" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-indigo-700 hover:scale-105 transition-all duration-200 shadow-sm">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fill-rule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clip-rule="evenodd" />
          </svg>
          Follow on Instagram
        </a>
      </div>
    </section>

    <div class="grid md:grid-cols-3 gap-6 animate-slide-up">
      
      <div class="md:col-span-1 flex flex-col gap-6">
        
        <section class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center flex flex-col items-center justify-center">
          <h2 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Reading Timer</h2>
          <div class="text-5xl font-mono text-indigo-600 mb-6 tracking-tight font-semibold">
            {{ formatTime(timeRemaining) }}
          </div>
          <button 
            @click="toggleTimer" 
            class="w-full py-3 rounded-xl font-medium transition-colors duration-200"
            :class="isRunning ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'"
          >
            {{ isRunning ? 'Pause Session' : 'Start Timer' }}
          </button>
        </section>

        <section class="bg-amber-50 p-6 rounded-2xl shadow-sm border border-amber-100 text-center">
          <h2 class="text-sm font-bold text-amber-600 uppercase tracking-wider mb-4">Social Hour</h2>
          <button 
            @click="pickSpeaker"
            :disabled="readingLog.length === 0"
            class="w-full py-3 bg-amber-200 text-amber-800 rounded-xl hover:bg-amber-300 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed mb-4 shadow-sm"
          >
            🎲 Pick First Speaker
          </button>
          
          <div v-if="featuredSpeaker" class="p-4 bg-white rounded-xl border border-amber-200 animate-bounce-short shadow-sm">
            <span class="block text-sm text-slate-500 mb-1">Up first:</span>
            <span class="font-bold text-amber-900 text-xl">{{ featuredSpeaker.reader }}!</span>
          </div>
        </section>
      </div>

      <div class="md:col-span-2">
        <section class="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100 h-full">
          <h2 class="text-xl font-semibold mb-4 text-slate-900 flex justify-between items-center">
            Today's Books
            <span class="bg-indigo-100 text-indigo-700 text-sm py-1 px-3 rounded-full font-bold">{{ readingLog.length }} Readers</span>
          </h2>
          
          <form @submit.prevent="addBook" class="flex flex-col gap-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div class="flex flex-col sm:flex-row gap-3">
              <input v-model="newReader" type="text" placeholder="Reader name" class="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
              <select v-model="newGenre" class="px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium">
                <option>Fiction</option>
                <option>Non-Fiction</option>
                <option>Romance</option>
                <option>Thriller/Horror</option>
                <option>Sci-Fi/Fantasy</option>
                <option>Other</option>
              </select>
            </div>
            <div class="flex flex-col sm:flex-row gap-3">
              <input v-model="newBook" type="text" placeholder="Book title" class="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
              <button type="submit" class="px-8 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">Add Book</button>
            </div>
          </form>

          <div v-if="readingLog.length === 0" class="text-center py-12 text-slate-400 italic bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            No books logged yet. Add members as they arrive!
          </div>

          <ul class="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            <li v-for="book in readingLog" :key="book.id" class="flex justify-between items-center p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all duration-200">
              <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div>
                  <span class="font-bold text-slate-800 text-lg">{{ book.reader }}</span> 
                  <span class="text-slate-400 text-sm mx-2">is reading</span> 
                  <span class="italic text-indigo-700 font-semibold">{{ book.book }}</span>
                </div>
                <span :class="getGenreColor(book.genre || 'Other')" class="text-xs px-3 py-1.5 rounded-full font-bold whitespace-nowrap w-max uppercase tracking-wide">
                  {{ book.genre || 'Other' }}
                </span>
              </div>
              <button @click="removeBook(book.id)" class="text-slate-300 hover:text-rose-500 p-2 hover:bg-rose-50 rounded-lg transition-colors" title="Remove entry">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </li>
          </ul>
        </section>
      </div>

    </div>
  </main>
</template>

<style scoped>
/* Custom Animations for a polished feel */
.animate-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}

.animate-slide-down {
  animation: slideDown 0.6s ease-out forwards;
}

.animate-slide-up {
  animation: slideUp 0.6s ease-out forwards;
  opacity: 0;
  animation-delay: 0.2s;
}

.animate-bounce-short {
  animation: bounceShort 0.5s ease-out 1;
}

.animated-gradient-bg {
  background: linear-gradient(-45deg, #eef2ff, #f3e8ff, #f8fafc);
  background-size: 400% 400%;
  animation: gradientBG 10s ease infinite;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes bounceShort {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes gradientBG {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Make the scrollbar look sleek */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
</style>