<script setup>
import { ref, computed, onMounted } from 'vue'
import Timer from './components/Timer.vue'
import ReadingLog from './components/ReadingLog.vue'
import MeetupArchive from './components/MeetupArchive.vue'
import Insights from './components/Insights.vue'
import SpeakerPicker from './components/SpeakerPicker.vue'
import AuthModal from './components/AuthModal.vue'
import UserProfile from './components/UserProfile.vue'
import LandingPage from './components/LandingPage.vue'
import PersonalReading from './components/PersonalReading.vue'
import RSVPModal from './components/RSVPModal.vue'
import CalendarLinks from './components/CalendarLinks.vue'
import UpcomingMeetupCard from './components/UpcomingMeetupCard.vue'
import AdminDashboard from './components/AdminDashboard.vue'
import Blog from './components/Blog.vue'
import { supabase } from './supabase'

const readingLog = ref([])
const user = ref(null)
const userProfile = ref(null)
const activeTab = ref('landing')
const showAuthModal = ref(false)
const authModalMode = ref('signin')
const showRSVPModal = ref(false)
const rsvpLoading = ref(false)

const sessions = ref([])

const headlineText = 'Meet and Read Nbo'.split('')

const getLocalTodayString = () => {
  const d = new Date()
  return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0]
}

const activeSession = computed(() => {
  const today = getLocalTodayString()
  // Upcoming sessions or sessions happening today (sort ascending by date to get the earliest upcoming one)
  const upcoming = sessions.value.filter(s => s.session_date >= today && !s.is_archived).sort((a, b) => a.session_date.localeCompare(b.session_date))
  return upcoming.length > 0 ? upcoming[0] : null
})

const pastSessions = computed(() => {
  const today = getLocalTodayString()
  // Past sessions (sort descending by date to show most recent past first)
  return sessions.value.filter(s => s.session_date < today).sort((a, b) => b.session_date.localeCompare(a.session_date))
})

const fetchSessions = async () => {
  const { data, error } = await supabase
    .from('meetup_sessions')
    .select('*, books(*), rsvps(*), session_media(*)')
    
  if (!error && data) {
    sessions.value = data
  }
}

const isRSVPed = computed(() => {
  if (!activeSession.value || !user.value) return false
  return activeSession.value.rsvps?.some(r => r.user_id === user.value.id)
})

const confirmedRSVPCount = computed(() => activeSession.value?.rsvps?.filter(r => (r.status || 'confirmed') === 'confirmed').length || 0)
const isSessionFull = computed(() => Boolean(activeSession.value?.capacity) && confirmedRSVPCount.value >= activeSession.value.capacity)
const myRSVP = computed(() => activeSession.value?.rsvps?.find(r => r.user_id === user.value?.id) || null)

const toggleRSVP = async () => {
  if (!user.value || !activeSession.value) {
    showAuthModal.value = true
    return
  }
  
  let rsvpStatus = ''
  if (isRSVPed.value) {
    await supabase.from('rsvps').delete().match({ session_id: activeSession.value.id, user_id: user.value.id })
  } else {
    rsvpStatus = isSessionFull.value ? 'waitlisted' : 'confirmed'
    await supabase.from('rsvps').insert([{ session_id: activeSession.value.id, user_id: user.value.id, status: rsvpStatus }])
    const { error: emailError } = await supabase.functions.invoke('send-rsvp-confirmation', { body: { sessionId: activeSession.value.id, status: rsvpStatus } })
    if (emailError) console.error('RSVP email could not be sent:', emailError)
  }
  
  await fetchSessions()
}

const openRSVP = () => {
  if (!user.value) { showAuthModal.value = true; return }
  if (activeSession.value) showRSVPModal.value = true
}

const confirmRSVP = async () => {
  rsvpLoading.value = true
  await toggleRSVP()
  rsvpLoading.value = false
  showRSVPModal.value = false
}

const fetchBooks = async () => {
  if (!activeSession.value) {
    readingLog.value = []
    return
  }
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('session_id', activeSession.value.id)
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

const openDashboard = () => {
  activeTab.value = 'dashboard'
}

onMounted(async () => {
  await fetchSessions()
  
  supabase.auth.onAuthStateChange(async (_event, session) => {
    user.value = session?.user ?? null
    if (user.value) {
      await fetchUserProfile(user.value.id)
    } else {
      userProfile.value = null
    }
    fetchBooks()
    if (_event === 'PASSWORD_RECOVERY') {
      authModalMode.value = 'recovery'
      showAuthModal.value = true
    }
  })
})
</script>

<template>
  <div class="min-h-screen bg-[#FBF0F1] text-[#1B1B18] selection:bg-[#6B1F36]/15 font-body">
    
    <!-- Sticky Navigation -->
    <nav class="border-b border-[#E6E3DE] bg-white/90 backdrop-blur-md sticky top-0 z-50">
      <div class="max-w-5xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between">
        <button @click="activeTab = 'landing'" class="flex items-center gap-3 text-left">
          <span class="font-display text-lg text-[#1B1B18]">Meet & Read</span>
          <span class="hidden sm:inline text-[10px] tracking-[0.2em] uppercase text-[#A09D97] font-medium border-l border-[#E6E3DE] pl-3">Nairobi</span>
        </button>
        
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
      <header v-if="activeTab !== 'landing'" class="mb-10">
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
      <div v-if="activeTab !== 'landing'" class="flex items-center gap-1 mb-8 border-b border-[#E6E3DE]">
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
          v-if="user"
          @click="activeTab = 'profile'"
          :class="[
            activeTab === 'profile' 
              ? 'text-[#1B1B18] border-[#1B1B18]' 
              : 'text-[#A09D97] border-transparent hover:text-[#6F6C66]',
            'text-[13px] font-medium pb-3 border-b-2 transition-colors px-1 mr-5'
          ]"
        >
          Profile
        </button>
        <button
          v-if="user"
          @click="activeTab = 'personal-reading'"
          :class="[
            activeTab === 'personal-reading'
              ? 'text-[#1B1B18] border-[#1B1B18]'
              : 'text-[#A09D97] border-transparent hover:text-[#6F6C66]',
            'text-[13px] font-medium pb-3 border-b-2 transition-colors px-1 mr-5'
          ]"
        >
          My Reading
        </button>
        <button @click="activeTab = 'blog'" :class="[activeTab === 'blog' ? 'text-[#1B1B18] border-[#1B1B18]' : 'text-[#A09D97] border-transparent hover:text-[#6F6C66]', 'text-[13px] font-medium pb-3 border-b-2 transition-colors px-1 mr-5']">Journal</button>
        <button
          v-if="userProfile?.role === 'admin'"
          @click="activeTab = 'admin'"
          class="text-[12px] font-medium text-[#2B593F] hover:text-[#1D4230] transition-colors ml-auto pb-3 flex items-center gap-1"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
          Admin
        </button>
      </div>

      <LandingPage v-if="activeTab === 'landing'" :session="activeSession" :past-sessions="pastSessions" :user="user" @explore="openDashboard" @join="showAuthModal = true" @rsvp="openRSVP" />

      <!-- Dashboard View -->
      <div v-else-if="activeTab === 'dashboard'">
        <UpcomingMeetupCard v-if="activeSession" class="mb-6" :session="activeSession" :attending="isRSVPed" :rsvp-status="myRSVP?.status" :confirmed-count="confirmedRSVPCount" :full="isSessionFull" @rsvp="openRSVP" />
        <div v-if="false" class="mb-6 bg-white rounded-2xl border border-[#E6E3DE] overflow-hidden flex flex-col sm:flex-row">
          <!-- Image Section -->
          <div v-if="activeSession.image_url" class="sm:w-1/3 h-48 sm:h-auto border-b sm:border-b-0 sm:border-r border-[#E6E3DE] relative">
             <img :src="activeSession.image_url" alt="Venue" class="w-full h-full object-cover" />
          </div>
          
          <!-- Content Section -->
          <div class="p-6 flex-1 flex flex-col justify-center">
            <template v-if="activeSession.session_date === getLocalTodayString()">
              <!-- TODAY'S SESSION BANNER -->
              <div class="flex items-center gap-2 mb-2">
                <span class="flex h-2 w-2 relative">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2B593F] opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-[#2B593F]"></span>
                </span>
                <p class="text-[11px] tracking-[0.2em] uppercase font-semibold text-[#2B593F]">Happening Today</p>
              </div>
              <h2 class="text-2xl md:text-3xl font-display text-[#1B1B18] mb-2">Welcome to the day's session!</h2>
              <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-[13px] text-[#6F6C66] mb-4">
                <div class="flex items-center gap-1.5">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                  <span>{{ activeSession.location }}</span>
                </div>
                <div v-if="activeSession.time" class="flex items-center gap-1.5">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>{{ activeSession.time }}</span>
                </div>
              </div>
              <p class="text-[14px] text-[#1B1B18] font-medium leading-relaxed">Find a cozy spot, open your book, and enjoy the silent hour. <span v-if="activeSession.activity" class="text-[#6F6C66] font-normal">Today's theme: {{ activeSession.activity }}</span></p>
            </template>
            
            <template v-else>
              <!-- UPCOMING SESSION BANNER -->
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <p class="text-[11px] tracking-[0.2em] uppercase font-semibold text-[#2B593F] mb-1.5">{{ activeSession.session_date }}</p>
                  <h2 class="text-xl md:text-2xl font-display text-[#1B1B18]">{{ activeSession.location }}</h2>
                  <div class="flex items-center gap-2 text-[13px] text-[#6F6C66] mt-1.5">
                    <span v-if="activeSession.time">{{ activeSession.time }}</span>
                    <span v-if="activeSession.time && activeSession.activity" class="text-[#E6E3DE]">|</span>
                    <span v-if="activeSession.activity">{{ activeSession.activity }}</span>
                  </div>
                  <p v-if="activeSession.description" class="text-[13px] text-[#A09D97] mt-3 max-w-md leading-relaxed">{{ activeSession.description }}</p>
                </div>
                
                <!-- RSVP Action -->
                <div class="bg-[#F7F6F3] border border-[#E6E3DE] rounded-xl p-4 min-w-[140px] text-center shrink-0 w-full sm:w-auto">
                  <p class="text-[11px] tracking-[0.1em] uppercase font-semibold text-[#A09D97] mb-2.5">{{ confirmedRSVPCount }}{{ activeSession.capacity ? ` / ${activeSession.capacity}` : '' }} Attending</p>
                  <button 
                    @click="openRSVP"
                    class="w-full text-[12px] font-semibold tracking-wide uppercase px-4 py-2.5 rounded-lg transition-all duration-200 active:scale-[0.98]"
                    :class="isRSVPed ? 'bg-[#EDF3EF] text-[#2B593F] border border-[#2B593F]/20 hover:bg-[#E2ECE6]' : 'bg-[#1B1B18] text-white hover:bg-[#2C2C28]'"
                  >
                    {{ myRSVP?.status === 'waitlisted' ? 'Waitlisted' : (isRSVPed ? 'Attending ✓' : (isSessionFull ? 'Join Waitlist' : 'RSVP Now')) }}
                  </button>
                  <p v-if="isSessionFull && !isRSVPed" class="mt-2 text-[10px] text-[#A09D97]">The session is full—join the waitlist.</p>
                  <CalendarLinks :session="activeSession" class="mt-3 justify-center" />
                </div>
              </div>
            </template>
          </div>
        </div>
        <div v-else class="mb-6 bg-[#F7F6F3] p-8 text-center rounded-2xl border border-[#E6E3DE]">
          <p class="text-[13px] text-[#6F6C66]">No upcoming sessions scheduled.</p>
        </div>

        <div v-if="activeSession" class="grid md:grid-cols-12 gap-5 md:gap-6">
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
                :activeSession="activeSession"
                @refreshList="fetchBooks"
                @removeBook="removeBook"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Archive View -->
      <div v-else-if="activeTab === 'archive'">
        <MeetupArchive 
          :profile="userProfile" 
          :sessions="sessions"
          @refresh-sessions="fetchSessions"
        />
      </div>

      <!-- Profile View -->
      <div v-else-if="activeTab === 'profile' && user">
        <UserProfile :user="user" :profile="userProfile" />
      </div>

      <div v-else-if="activeTab === 'personal-reading' && user">
        <PersonalReading :user="user" />
      </div>
      <div v-else-if="activeTab === 'blog'">
        <Blog :user="user" :profile="userProfile" />
      </div>

      <div v-else-if="activeTab === 'admin' && userProfile?.role === 'admin'">
        <AdminDashboard :sessions="sessions" />
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

    <AuthModal v-if="showAuthModal" :supabase="supabase" :initial-mode="authModalMode" @close="showAuthModal = false; authModalMode = 'signin'" />
    <RSVPModal v-if="showRSVPModal && activeSession" :session="activeSession" :is-attending="isRSVPed" :is-full="isSessionFull" :rsvp-status="myRSVP?.status" :loading="rsvpLoading" @close="showRSVPModal = false" @confirm="confirmRSVP" />
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
