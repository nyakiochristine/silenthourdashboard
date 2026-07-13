<script setup>
import { ref, reactive } from 'vue'
import { supabase } from '../supabase'

const props = defineProps({
  profile: {
    type: Object,
    default: null
  },
  sessions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['refreshSessions'])

const submitLoading = ref(false)
const submitError = ref('')
const showForm = ref(false)

const newSession = reactive({
  session_date: '',
  time: '',
  location: '',
  activity: '',
  description: '',
  image_url: ''
})

const resetNewSession = () => {
  newSession.session_date = ''
  newSession.time = ''
  newSession.location = ''
  newSession.activity = ''
  newSession.description = ''
  newSession.image_url = ''
}

const createSession = async () => {
  submitLoading.value = true
  submitError.value = ''

  if (!newSession.session_date || !newSession.location || !newSession.activity) {
    submitError.value = 'Date, location and activity are required.'
    submitLoading.value = false
    return
  }

  const { error: sessionError } = await supabase
    .from('meetup_sessions')
    .insert([
      {
        host_id: props.profile?.id || null,
        session_date: newSession.session_date,
        time: newSession.time,
        location: newSession.location,
        activity: newSession.activity,
        description: newSession.description,
        image_url: newSession.image_url
      }
    ])

  if (sessionError) {
    submitError.value = sessionError.message || 'Unable to create meetup session.'
    submitLoading.value = false
    return
  }

  resetNewSession()
  showForm.value = false
  emit('refreshSessions')
  submitLoading.value = false
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
      <div>
        <p class="text-[11px] tracking-[0.2em] uppercase font-semibold text-[#A09D97] mb-1">Archive</p>
        <h2 class="text-xl font-display text-[#1B1B18]">Past Gatherings</h2>
        <p class="text-[13px] text-[#6F6C66] mt-1 max-w-lg">Locations, craft activities, and books from every session.</p>
      </div>
      <button 
        v-if="props.profile?.role === 'admin'" 
        @click="showForm = !showForm"
        class="flex items-center gap-1.5 text-[12px] font-semibold transition-colors self-start sm:self-auto"
        :class="showForm ? 'text-[#B84233] hover:text-[#943628]' : 'text-[#2B593F] hover:text-[#1D4230]'"
      >
        <svg v-if="!showForm" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        {{ showForm ? 'Cancel' : 'Schedule New Meetup' }}
      </button>
    </div>

    <!-- Admin Create Form -->
    <div v-if="showForm && props.profile?.role === 'admin'" class="bg-white rounded-2xl border border-[#E6E3DE] p-6 mb-6 animate-fade-in">
      <h3 class="text-[15px] font-semibold text-[#1B1B18] mb-4">New Meetup Session</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div>
          <label class="block text-[11px] tracking-[0.15em] uppercase font-semibold text-[#A09D97] mb-1.5">Date</label>
          <input type="date" v-model="newSession.session_date" class="w-full px-3.5 py-2.5 bg-[#F7F6F3] border border-[#E6E3DE] rounded-xl text-sm text-[#1B1B18] focus:outline-none focus:border-[#2B593F] focus:ring-1 focus:ring-[#2B593F]/20 transition-colors" />
        </div>
        <div>
          <label class="block text-[11px] tracking-[0.15em] uppercase font-semibold text-[#A09D97] mb-1.5">Time</label>
          <input v-model="newSession.time" placeholder="e.g. 10:00 AM - 1:00 PM" class="w-full px-3.5 py-2.5 bg-[#F7F6F3] border border-[#E6E3DE] rounded-xl text-sm text-[#1B1B18] focus:outline-none focus:border-[#2B593F] focus:ring-1 focus:ring-[#2B593F]/20 transition-colors placeholder:text-[#C5C2BC]" />
        </div>
        <div>
          <label class="block text-[11px] tracking-[0.15em] uppercase font-semibold text-[#A09D97] mb-1.5">Location</label>
          <input v-model="newSession.location" placeholder="Cafe or venue" class="w-full px-3.5 py-2.5 bg-[#F7F6F3] border border-[#E6E3DE] rounded-xl text-sm text-[#1B1B18] focus:outline-none focus:border-[#2B593F] focus:ring-1 focus:ring-[#2B593F]/20 transition-colors placeholder:text-[#C5C2BC]" />
        </div>
        <div>
          <label class="block text-[11px] tracking-[0.15em] uppercase font-semibold text-[#A09D97] mb-1.5">Activity</label>
          <input v-model="newSession.activity" placeholder="Craft or theme" class="w-full px-3.5 py-2.5 bg-[#F7F6F3] border border-[#E6E3DE] rounded-xl text-sm text-[#1B1B18] focus:outline-none focus:border-[#2B593F] focus:ring-1 focus:ring-[#2B593F]/20 transition-colors placeholder:text-[#C5C2BC]" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-[11px] tracking-[0.15em] uppercase font-semibold text-[#A09D97] mb-1.5">Cafe Image URL</label>
          <input v-model="newSession.image_url" placeholder="https://... (Optional picture of the venue)" class="w-full px-3.5 py-2.5 bg-[#F7F6F3] border border-[#E6E3DE] rounded-xl text-sm text-[#1B1B18] focus:outline-none focus:border-[#2B593F] focus:ring-1 focus:ring-[#2B593F]/20 transition-colors placeholder:text-[#C5C2BC]" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-[11px] tracking-[0.15em] uppercase font-semibold text-[#A09D97] mb-1.5">Description</label>
          <textarea v-model="newSession.description" rows="1" placeholder="Brief details" class="w-full px-3.5 py-2.5 bg-[#F7F6F3] border border-[#E6E3DE] rounded-xl text-sm text-[#1B1B18] focus:outline-none focus:border-[#2B593F] focus:ring-1 focus:ring-[#2B593F]/20 transition-colors placeholder:text-[#C5C2BC] resize-none"></textarea>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-[#E6E3DE]">
        <p v-if="submitError" class="text-[12px] text-[#B84233]">{{ submitError }}</p>
        <div v-else></div>
        <button type="button" @click="createSession" :disabled="submitLoading" class="bg-[#2B593F] hover:bg-[#1D4230] text-white text-[12px] font-semibold tracking-wide uppercase px-6 py-3 rounded-xl transition-all duration-200 disabled:opacity-60 active:scale-[0.98]">
          {{ submitLoading ? 'Saving...' : 'Save Session' }}
        </button>
      </div>
    </div>

    <!-- Sessions List -->
    <div class="space-y-4">
      <!-- Empty -->
      <div v-if="!sessions || !sessions.length" class="bg-white rounded-2xl border border-[#E6E3DE] p-10 text-center">
        <svg class="w-8 h-8 text-[#E6E3DE] mx-auto mb-3" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
        <p class="text-[13px] text-[#A09D97]">No archived sessions yet.</p>
      </div>

      <!-- Session Cards -->
      <article 
        v-else 
        v-for="session in sessions" 
        :key="session.id" 
        class="bg-white rounded-2xl border border-[#E6E3DE] p-5 hover:border-[#CBC7BF] transition-colors"
      >
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div>
            <p class="text-[11px] tracking-[0.2em] uppercase font-semibold text-[#2B593F] mb-1.5">{{ session.session_date }}</p>
            <h3 class="text-lg font-display text-[#1B1B18]">{{ session.location }}</h3>
            <p class="text-[13px] text-[#6F6C66] mt-0.5">{{ session.activity }}</p>
          </div>
          <span class="text-[11px] text-[#A09D97] font-medium bg-[#F7F6F3] px-3 py-1.5 rounded-lg border border-[#E6E3DE]/60 self-start tabular-nums font-timer">
            {{ session.books?.length || 0 }} {{ session.books?.length === 1 ? 'book' : 'books' }}
          </span>
        </div>
        <p v-if="session.description" class="text-[13px] text-[#6F6C66] mb-4 leading-relaxed">{{ session.description }}</p>

        <!-- Book Grid -->
        <div v-if="session.books?.length" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <div v-for="book in session.books" :key="book.id" class="rounded-xl overflow-hidden border border-[#E6E3DE] bg-[#F7F6F3]">
            <img v-if="book.cover_url" :src="book.cover_url" alt="Book cover" class="w-full h-36 object-cover" />
            <div v-else class="w-full h-36 bg-[#E6E3DE] flex items-center justify-center">
              <svg class="w-6 h-6 text-[#A09D97]" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
            </div>
            <div class="p-2.5">
              <p class="text-[12px] font-semibold text-[#1B1B18] leading-tight">{{ book.book || book.title }}</p>
              <p v-if="book.author" class="text-[10px] text-[#A09D97] mt-0.5">{{ book.author }}</p>
              <p v-if="book.reader" class="text-[10px] text-[#A09D97] mt-1 italic">Read by {{ book.reader }}</p>
            </div>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>
