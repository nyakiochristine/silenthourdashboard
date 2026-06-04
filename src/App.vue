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
  <div class="min-h-screen bg-[#F7F6F3] text-[#1B1B18] selection:bg-[#2B593F]/10 font-body">
    
    <!-- Sticky Navigation -->
    <nav class="border-b border-[#E6E3DE] bg-white/90 backdrop-blur-md sticky top-0 z-50">
      <div class="max-w-5xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="font-display text-lg text-[#1B1B18]">Meet & Read</span>
          <span class="hidden sm:inline text-[10px] tracking-[0.2em] uppercase text-[#A09D97] font-medium border-l border-[#E6E3DE] pl-3">Nairobi</span>
        </div>
        
        <!-- Guest: Sign In -->
        <button 
          v-if="!user"
          @click="showAuthModal = true"
          class="flex items-center gap-2 text-[12px] font-medium text-[#6F6C66] hover:text-[#1B1B18] transition-colors"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          Sign in
        </button>
        
        <!-- Authenticated User -->
        <div v-else class="flex items-center gap-3">
          <div class="flex items-center gap-1.5">
            <div 
              class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
              :class="userProfile?.role === 'admin' ? 'bg-[#2B593F]' : 'bg-[#6F6C66]'"
            >
              {{ (userProfile?.username || 'U')[0].toUpperCase() }}
            </div>
            <span class="text-[12px] font-medium text-[#1B1B18] hidden sm:inline">{{ userProfile?.username || 'Member' }}</span>
            <span v-if="userProfile?.role === 'admin'" class="text-[9px] tracking-wider uppercase font-bold text-[#2B593F] bg-[#EDF3EF] px-1.5 py-0.5 rounded">Admin</span>
          </div>
          <button @click="handleLogout" class="text-[11px] text-[#A09D97] hover:text-[#1B1B18] transition-colors font-medium">
            Sign out
          </button>
        </div>
      </div>
    </nav>

    <main class="max-w-5xl mx-auto px-5 md:px-8 py-10 md:py-14">
      
      <!-- Hero Header -->
      <header class="mb-10">
        <p class="text-[11px] tracking-[0.2em] uppercase font-semibold text-[#A09D97] mb-4">Silent Hour Dashboard</p>
        <h1 class="text-4xl md:text-[3.5rem] font-display text-[#1B1B18] tracking-tight leading-[1.1] mb-4 flex flex-wrap overflow-hidden py-1">
          <span 
            v-for="(char, index) in headlineText" 
            :key="index"
            class="inline-block token-char"
            :style="{ animationDelay: `${index * 40}ms` }"
            v-html="char === ' ' ? '&nbsp;' : char"
          />
        </h1>
        <p class="text-[#6F6C66] text-base md:text-lg leading-relaxed max-w-lg font-display italic">
          "Read what you want, in comfortable silence, together."
        </p>
      </header>

      <!-- Tab Navigation -->
      <div class="flex items-center gap-1 mb-8 border-b border-[#E6E3DE]">
        <button
          @click="activeTab = 'dashboard'"
          :class="[
            activeTab === 'dashboard' 
              ? 'text-[#1B1B18] border-[#1B1B18]' 
              : 'text-[#A09D97] border-transparent hover:text-[#6F6C66]',
            'text-[13px] font-medium pb-3 border-b-2 transition-colors px-1 mr-5'
          ]"
        >
          Session
        </button>
        <button
          @click="activeTab = 'archive'"
          :class="[
            activeTab === 'archive' 
              ? 'text-[#1B1B18] border-[#1B1B18]' 
              : 'text-[#A09D97] border-transparent hover:text-[#6F6C66]',
            'text-[13px] font-medium pb-3 border-b-2 transition-colors px-1 mr-5'
          ]"
        >
          Archive
        </button>
        <button
          v-if="userProfile?.role === 'admin'"
          @click="activeTab = 'archive'"
          class="text-[12px] font-medium text-[#2B593F] hover:text-[#1D4230] transition-colors ml-auto pb-3 flex items-center gap-1"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
          New Meetup
        </button>
      </div>

      <!-- Dashboard View -->
      <div v-if="activeTab === 'dashboard'">
        <div class="grid md:grid-cols-12 gap-5 md:gap-6">
          <div class="md:col-span-5 flex flex-col gap-5">
            <Timer />
            <SpeakerPicker :log="readingLog" />
            <Insights :log="readingLog" />
          </div>
          <div class="md:col-span-7">
            <div class="sticky top-20">
              <ReadingLog
                :log="readingLog"
                :user="user"
                :profile="userProfile"
                @refreshList="fetchBooks"
                @removeBook="removeBook"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Archive View -->
      <div v-else>
        <MeetupArchive :profile="userProfile" />
      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t border-[#E6E3DE] mt-8">
      <div class="max-w-5xl mx-auto px-5 md:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span class="text-[12px] text-[#A09D97]">© 2026 Meet and Read Nbo</span>
        <a 
          href="https://instagram.com/meetandreadnbo" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="flex items-center gap-1.5 text-[12px] text-[#A09D97] hover:text-[#1B1B18] transition-colors"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          @meetandreadnbo
        </a>
      </div>
    </footer>

    <AuthModal v-if="showAuthModal" :supabase="supabase" @close="showAuthModal = false" />
  </div>
</template>

<style>
/* Custom font utilities */
.font-display { font-family: 'DM Serif Display', Georgia, serif; }
.font-body { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
.font-timer { font-family: 'JetBrains Mono', 'Courier New', monospace; }

/* Title character reveal animation */
@keyframes revealLetter {
  0% { opacity: 0; transform: translateY(0.5em); }
  100% { opacity: 1; transform: translateY(0); }
}
.token-char {
  opacity: 0;
  display: inline-block;
  white-space: pre;
  animation: revealLetter 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Fade in utility */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.35s ease-out forwards;
}
</style>