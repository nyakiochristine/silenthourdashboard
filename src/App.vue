<script setup>
import { ref, onMounted } from 'vue'
import Timer from './components/Timer.vue'
import ReadingLog from './components/ReadingLog.vue'
import MeetupArchive from './components/MeetupArchive.vue'
import Insights from './components/Insights.vue'
import SpeakerPicker from './components/SpeakerPicker.vue'
import AuthModal from './components/AuthModal.vue'
import { supabase } from './supabase'



const readingLog = ref([])
const user = ref(null)
const userProfile = ref(null)
const activeTab = ref('dashboard')
const showAuthModal = ref(false)

const headlineText = 'Meet and Read Nbo'.split('')

const fetchBooks = async () => {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('id', { ascending: false })
  
  if (!error && data) {
    readingLog.value = data
  }
}

const fetchUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (!error && data) {
    userProfile.value = data
  }
}

const removeBook = async (id) => {
  const { error } = await supabase.from('books').delete().eq('id', id)
  if (!error) fetchBooks()
}

const handleLogout = async () => {
  await supabase.auth.signOut()
  userProfile.value = null
  readingLog.value = []
}

onMounted(() => {
  supabase.auth.onAuthStateChange(async (_event, session) => {
    user.value = session?.user ?? null
    if (user.value) {
      await fetchUserProfile(user.value.id)
    } else {
      userProfile.value = null
    }
    fetchBooks()
  })
})
</script>

<template>
  <div class="min-h-screen bg-[#fcfbfa] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] text-stone-800 selection:bg-amber-100 relative overflow-x-hidden pb-12">
    
    <div class="absolute top-0 left-1/4 w-96 h-96 bg-indigo-100/40 rounded-full filter blur-3xl -z-10 pointer-events-none"></div>
    <div class="absolute top-20 right-1/4 w-96 h-96 bg-amber-50/60 rounded-full filter blur-3xl -z-10 pointer-events-none"></div>

    <main class="max-w-5xl mx-auto p-4 md:p-8 grid md:grid-cols-12 gap-6 md:gap-8 font-sans relative">
      
      <!-- 🌟 NEW: Top Right Navigation Bar -->
      <nav class="md:col-span-12 flex justify-end items-center mb-2 z-10">
        
        <!-- Upgraded Login Button -->
        <button 
          v-if="!user"
          @click="showAuthModal = true"
          class="group flex items-center gap-2 bg-white border border-stone-200 hover:border-stone-400 text-stone-700 hover:text-stone-900 text-xs font-bold px-5 py-2.5 rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <span class="text-stone-400 group-hover:text-stone-600 transition-colors">🔒</span>
          Member Login
        </button>
        
        <!-- Upgraded Logged-In State -->
        <div v-else class="flex items-center gap-4 bg-white border border-stone-200 px-5 py-2 rounded-full shadow-sm">
          <span 
            class="text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5"
            :class="userProfile?.role === 'admin' ? 'text-indigo-600' : 'text-emerald-600'"
          >
            👑 {{ userProfile?.role === 'admin' ? 'Club Organizer' : userProfile?.username || 'Member' }}
          </span>
          <div class="w-px h-3 bg-stone-300"></div>
          <button @click="handleLogout" class="text-[10px] text-stone-500 hover:text-stone-900 tracking-wider uppercase font-bold transition-colors">
            Logout
          </button>
        </div>
      </nav>

      <!-- Premium Editorial Header Area -->
      <header class="md:col-span-12 text-center max-w-2xl mx-auto mb-2">
        
        <h1 class="text-4xl md:text-5xl font-black text-stone-900 tracking-tight font-serif mb-2 flex justify-center overflow-hidden py-1">
          <span 
            v-for="(char, index) in headlineText" 
            :key="index"
            class="inline-block token-char"
            :style="{ animationDelay: `${index * 40}ms` }"
            v-html="char === ' ' ? '&nbsp;' : char"
          >
          </span>
        </h1>

        <!-- The Dashboard badge now sits perfectly centered on its own -->
        <div class="flex justify-center mb-6">
          <div class="inline-flex items-center gap-2 bg-stone-900/5 text-stone-600 font-bold tracking-widest uppercase text-[10px] px-3 py-1 rounded-full border border-stone-200/40 backdrop-blur-sm">
            <span>✨</span> Silent Hour Dashboard <span>✨</span>
          </div>
        </div>

        <div class="flex flex-wrap justify-center gap-3 mb-6">
          <button
            @click="activeTab = 'dashboard'"
            :class="activeTab === 'dashboard' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border border-slate-200'
            + ' text-[11px] font-semibold px-4 py-2 rounded-full transition'">
            Dashboard
          </button>
          <button
            @click="activeTab = 'archive'"
            :class="activeTab === 'archive' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border border-slate-200'
            + ' text-[11px] font-semibold px-4 py-2 rounded-full transition'">
            Meetup Archive
          </button>
          <button
            v-if="userProfile?.role === 'admin'"
            @click="activeTab = 'archive'"
            class="text-[11px] font-semibold px-4 py-2 rounded-full border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition"
          >
            + New Meetup
          </button>
        </div>
        
        <div class="bg-white/70 backdrop-blur-md p-5 rounded-2xl text-stone-600 border border-stone-200/60 text-left shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative group hover:border-stone-300 transition-all duration-300">
          <div class="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-amber-200 to-transparent"></div>
          <p class="font-serif font-bold text-stone-900 mb-1 flex items-center gap-1.5 text-base">
            📖 The Silent Hour Experience
          </p>
          <div class="leading-relaxed text-sm text-stone-600/90 space-y-3">
            <p>
              Welcome to Nairobi's premier silent book club! We gather in local cafes and botanical gardens for a dedicated 90 minutes of independent reading, followed by interactive craft activities and social connection.
            </p>
            <p class="italic font-serif text-stone-900 text-center py-0.5">
              “Read what you want, in comfortable silence, together.”
            </p>
          </div>

          <div class="flex justify-center mt-5 pt-2">
            <a href="https://instagram.com/meetandreadnbo" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 bg-[#4f46e5] text-white hover:bg-[#4338ca] font-semibold tracking-wide text-xs px-5 py-2.5 rounded-full transition-all duration-200 shadow-md hover:scale-[1.02] active:scale-[0.98]">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              <span>Follow on Instagram</span>
            </a>
          </div>
        </div>
      </header>

      <hr class="md:col-span-12 border-stone-200/60 my-2" />

      <div class="md:col-span-5 flex flex-col gap-6">
        <div><Timer /></div>
        <div><SpeakerPicker :log="readingLog" /></div>
        <div><Insights :log="readingLog" /></div>
      </div>

      <div class="md:col-span-7">
        <div class="sticky top-6">
          <component
            :is="activeTab === 'archive' ? MeetupArchive : ReadingLog"
            :log="readingLog"
            :user="user"
            :profile="userProfile"
            @refreshList="fetchBooks"
            @removeBook="removeBook"
          />
        </div>
      </div>
    </main>

    <AuthModal v-if="showAuthModal" :supabase="supabase" @close="showAuthModal = false" />
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,800;1,400&display=swap');
.font-serif { font-family: 'Playfair Display', Georgia, serif; }
@keyframes revealLetter {
  0% { opacity: 0; transform: translateY(0.4em) scale(0.96); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
.token-char { opacity: 0; white-space: pre; animation: revealLetter 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
</style>