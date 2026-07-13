<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import { generateRecommendations } from '../services/aiService'

const props = defineProps({
  user: {
    type: Object,
    required: true
  },
  profile: {
    type: Object,
    default: null
  }
})

const myBooks = ref([])
const loadingBooks = ref(true)

const recommendations = ref([])
const loadingRecommendations = ref(false)
const aiError = ref('')

const fetchMyBooks = async () => {
  loadingBooks.value = true
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('user_id', props.user.id)
    .order('id', { ascending: false })
  
  if (!error && data) {
    myBooks.value = data
  }
  loadingBooks.value = false
}

const getRecommendations = async () => {
  loadingRecommendations.value = true
  aiError.value = ''
  recommendations.value = []
  
  try {
    recommendations.value = await generateRecommendations(myBooks.value)
  } catch (err) {
    aiError.value = err.message
  } finally {
    loadingRecommendations.value = false
  }
}

onMounted(() => {
  fetchMyBooks()
})
</script>

<template>
  <div class="grid md:grid-cols-12 gap-6">
    <!-- Left Column: Stats & Recommendations -->
    <div class="md:col-span-5 flex flex-col gap-6">
      
      <!-- User Info Card -->
      <div class="bg-white p-6 rounded-2xl border border-[#E6E3DE]">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white bg-[#2B593F]">
            {{ (profile?.username || 'U')[0].toUpperCase() }}
          </div>
          <div>
            <h2 class="text-xl font-display text-[#1B1B18]">{{ profile?.username || 'Member' }}</h2>
            <p class="text-[13px] text-[#6F6C66]">{{ user.email }}</p>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4 border-t border-[#E6E3DE] pt-4">
          <div>
            <p class="text-[11px] tracking-[0.2em] uppercase font-semibold text-[#A09D97] mb-1">Books Logged</p>
            <p class="text-2xl font-display text-[#1B1B18]">{{ myBooks.length }}</p>
          </div>
        </div>
      </div>

      <!-- AI Recommendations Card -->
      <div class="bg-white p-6 rounded-2xl border border-[#E6E3DE]">
        <div class="flex items-center justify-between mb-2">
          <p class="text-[11px] tracking-[0.2em] uppercase font-semibold text-[#A09D97]">Next Reads</p>
        </div>
        
        <h3 class="text-lg font-display text-[#1B1B18] mb-4">AI Recommendations</h3>

        <button 
          v-if="!recommendations.length && !loadingRecommendations"
          @click="getRecommendations"
          class="w-full bg-[#EDF3EF] text-[#2B593F] hover:bg-[#E2ECE6] border border-[#2B593F]/20 py-3 rounded-xl text-[12px] font-semibold tracking-wide uppercase transition-all duration-200"
        >
          Generate Recommendations
        </button>

        <div v-if="loadingRecommendations" class="flex items-center gap-2 justify-center py-4 text-[12px] text-[#6F6C66]">
          <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          Analyzing your reading history...
        </div>

        <div v-if="aiError" class="text-[12px] text-[#B84233] bg-[#FBF0ED] p-3 rounded-xl border border-[#B84233]/20 mt-3">
          {{ aiError }}
        </div>

        <div v-if="recommendations.length > 0" class="space-y-4 mt-2">
          <div v-for="(rec, idx) in recommendations" :key="idx" class="p-3 bg-[#F7F6F3] rounded-xl border border-[#E6E3DE]/60 flex gap-4 items-start">
            <img 
              v-if="rec.coverUrl" 
              :src="rec.coverUrl" 
              alt="Cover" 
              class="w-16 h-24 object-cover rounded shadow-sm shrink-0" 
            />
            <div class="flex-1">
              <h4 class="text-[14px] font-semibold text-[#1B1B18]">{{ rec.title }}</h4>
              <p class="text-[12px] text-[#6F6C66] mb-1.5">by {{ rec.author }}</p>
              <p class="text-[12px] text-[#A09D97] italic mb-3">"{{ rec.reason }}"</p>
              <a 
                :href="rec.downloadUrl" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase text-[#2B593F] hover:text-[#1D4230] transition-colors"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                Find on Goodreads
              </a>
            </div>
          </div>
          
          <button @click="getRecommendations" class="w-full text-center text-[11px] text-[#2B593F] hover:text-[#1D4230] font-medium pt-2">
            Refresh Recommendations
          </button>
        </div>
      </div>
    </div>

    <!-- Right Column: Reading History -->
    <div class="md:col-span-7">
      <div class="bg-white p-6 rounded-2xl border border-[#E6E3DE]">
        <div class="flex items-center justify-between mb-5">
          <div>
            <p class="text-[11px] tracking-[0.2em] uppercase font-semibold text-[#A09D97] mb-1">Library</p>
            <h2 class="text-xl font-display text-[#1B1B18]">My Reading History</h2>
          </div>
        </div>

        <div v-if="loadingBooks" class="py-8 text-center text-[#A09D97] text-[13px]">
          Loading history...
        </div>

        <div v-else-if="!myBooks.length" class="text-center py-8 bg-[#F7F6F3] rounded-xl border border-[#E6E3DE]">
          <svg class="w-8 h-8 text-[#E6E3DE] mx-auto mb-3" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
          <p class="text-[13px] text-[#A09D97]">You haven't logged any books yet.</p>
        </div>

        <div v-else class="space-y-3">
          <div v-for="book in myBooks" :key="book.id" class="flex items-start gap-3 p-3 rounded-xl bg-[#F7F6F3] border border-[#E6E3DE]/60">
            <img
              v-if="book.cover_url"
              :src="book.cover_url"
              alt="Book cover"
              class="w-12 h-16 rounded-lg object-cover shadow-sm flex-shrink-0"
            />
            <div v-else class="w-12 h-16 rounded-lg bg-[#E6E3DE] flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-[#A09D97]" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
            </div>

            <div class="flex-1 min-w-0 py-0.5">
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-[14px] font-semibold text-[#1B1B18] truncate">{{ book.book }}</p>
                  <p class="text-[12px] text-[#6F6C66] mt-0.5">by {{ book.author || 'Unknown' }}</p>
                </div>
                <div v-if="book.rating" class="text-[#F59E0B] text-[12px] tracking-widest shrink-0">
                  {{ '★'.repeat(book.rating) }}
                </div>
              </div>
              <div class="flex items-center gap-2 mt-2">
                <span v-if="book.genre" class="text-[10px] tracking-wider uppercase font-semibold text-[#2B593F] bg-[#EDF3EF] px-1.5 py-0.5 rounded">{{ book.genre }}</span>
                <span v-if="book.progress" class="text-[10px] text-[#6F6C66] font-medium bg-white px-1.5 py-0.5 rounded border border-[#E6E3DE]">Pg. {{ book.progress }}</span>
              </div>
              <p v-if="book.review" class="text-[12px] text-[#6F6C66] italic mt-2 p-2.5 bg-white rounded-lg border border-[#E6E3DE]/40">
                "{{ book.review }}"
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
