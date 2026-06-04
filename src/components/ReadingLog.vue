<script setup>
import { ref, watch } from 'vue'
import BookSearch from './BookSearch.vue'
import { supabase } from '../supabase'

const props = defineProps({
  log: {
    type: Array,
    default: () => []
  },
  user: {
    type: Object,
    default: null
  },
  profile: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['refreshList', 'removeBook'])

const newBook = ref('')
const newReader = ref('')
const newGenre = ref('Fiction')

const genres = ['Fiction', 'Non-Fiction', 'Sci-Fi', 'Biography', 'Poetry', 'Self-Help', 'History']
const selectedBook = ref(null)

// Pre-fill the reader name with the user's username once profile loads
watch(() => props.profile, (newProfile) => {
  if (newProfile && newProfile.username && !newReader.value) {
    newReader.value = newProfile.username
  }
}, { immediate: true })

const loading = ref(false)
const submitError = ref('')

const handleBookSelect = (book) => {
  selectedBook.value = book
  if (book && book.title) {
    newBook.value = book.title
  }
}

const submit = async () => {
  loading.value = true
  submitError.value = ''
  
  const bookTitle = newBook.value?.trim()
  if (!bookTitle) {
    loading.value = false
    return
  }

  const { error } = await supabase.from('books').insert([
    {
      reader: newReader.value,
      book: bookTitle,
      author: selectedBook.value?.authors?.join(', ') ?? null,
      page_count: selectedBook.value?.pageCount ?? null,
      cover_url: selectedBook.value?.cover ?? null,
      publisher: selectedBook.value?.publisher ?? null,
      genre: newGenre.value
    }
  ])
  
  if (error) {
    submitError.value = error.message || 'Unable to save book entry.'
  } else {
    newBook.value = ''
    newReader.value = props.profile?.username || ''
    newGenre.value = 'Fiction'
    selectedBook.value = null
    emit('refreshList')
  }

  loading.value = false
}
</script>

<template>
  <div class="bg-white p-6 rounded-2xl border border-[#E6E3DE]">
    <div class="flex items-center justify-between mb-5">
      <div>
        <p class="text-[11px] tracking-[0.2em] uppercase font-semibold text-[#A09D97] mb-1">Reading Log</p>
        <h2 class="text-xl font-display text-[#1B1B18]">Today's Books</h2>
      </div>
      <div class="text-[12px] text-[#A09D97] font-medium tabular-nums bg-[#F7F6F3] px-3 py-1.5 rounded-lg border border-[#E6E3DE]/60 font-timer">
        {{ log.length }} {{ log.length === 1 ? 'book' : 'books' }}
      </div>
    </div>
    
    <!-- Form for Logged-In Members -->
    <div v-if="user" class="mb-6 pb-6 border-b border-[#E6E3DE]">
      <form @submit.prevent="submit" class="space-y-3">
        <div>
          <label class="block text-[11px] tracking-[0.15em] uppercase font-semibold text-[#A09D97] mb-1.5">Your Name</label>
          <input 
            v-model="newReader" 
            placeholder="Your name" 
            required
            class="w-full px-3.5 py-2.5 bg-[#F7F6F3] text-[#1B1B18] border border-[#E6E3DE] rounded-xl text-sm focus:outline-none focus:border-[#2B593F] focus:ring-1 focus:ring-[#2B593F]/20 transition-colors placeholder:text-[#C5C2BC]" 
          />
        </div>

        <BookSearch v-model:query="newBook" @select-book="handleBookSelect" />
        
        <div>
          <label class="block text-[11px] tracking-[0.15em] uppercase font-semibold text-[#A09D97] mb-1.5">Genre</label>
          <select v-model="newGenre" class="w-full px-3.5 py-2.5 bg-[#F7F6F3] border border-[#E6E3DE] rounded-xl text-sm text-[#1B1B18] focus:outline-none focus:border-[#2B593F] focus:ring-1 focus:ring-[#2B593F]/20 transition-colors appearance-none">
            <option v-for="genre in genres" :key="genre" :value="genre">
              {{ genre }}
            </option>
          </select>
        </div>

        <button :disabled="loading" class="w-full bg-[#2B593F] text-white hover:bg-[#1D4230] py-3 rounded-xl text-[12px] font-semibold tracking-wide uppercase transition-all duration-200 active:scale-[0.98] disabled:opacity-60 mt-1">
          {{ loading ? 'Saving...' : 'Add Book' }}
        </button>
        <p v-if="submitError" class="text-[12px] text-[#B84233]">{{ submitError }}</p>
      </form>
    </div>
    
    <!-- Guest Fallback -->
    <div v-else class="text-center py-6 mb-6 bg-[#F7F6F3] border border-[#E6E3DE] rounded-xl">
      <svg class="w-5 h-5 text-[#A09D97] mx-auto mb-2" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
      <p class="text-[13px] text-[#6F6C66]">Sign in to add a book</p>
    </div>
    
    <!-- Book List -->
    <div class="space-y-1">
      <div 
        v-for="book in log" 
        :key="book.id" 
        class="flex items-start gap-3 p-3 rounded-xl hover:bg-[#F7F6F3] transition-colors group"
      >
        <!-- Book Cover -->
        <img
          v-if="book.cover_url"
          :src="book.cover_url"
          alt="Book cover"
          class="w-10 h-14 rounded-lg object-cover shadow-sm flex-shrink-0"
        />
        <div v-else class="w-10 h-14 rounded-lg bg-[#E6E3DE] flex items-center justify-center flex-shrink-0">
          <svg class="w-4 h-4 text-[#A09D97]" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
        </div>

        <!-- Book Info -->
        <div class="flex-1 min-w-0">
          <p class="text-[13px] font-semibold text-[#1B1B18] truncate">{{ book.book }}</p>
          <p class="text-[12px] text-[#6F6C66] mt-0.5">
            {{ book.reader }}
            <span v-if="book.author" class="text-[#A09D97]">· {{ book.author }}</span>
          </p>
          <div class="flex items-center gap-2 mt-1">
            <span v-if="book.genre" class="text-[10px] tracking-wider uppercase font-semibold text-[#2B593F] bg-[#EDF3EF] px-1.5 py-0.5 rounded">{{ book.genre }}</span>
            <span v-if="book.page_count" class="text-[10px] text-[#A09D97]">{{ book.page_count }} pages</span>
          </div>
        </div>

        <!-- Delete Button (reveal on hover) -->
        <button 
          v-if="profile?.role === 'admin' || (user && book.user_id === user.id)"
          @click="$emit('removeBook', book.id)" 
          class="opacity-0 group-hover:opacity-100 text-[#A09D97] hover:text-[#B84233] transition-all p-1.5 rounded-lg hover:bg-[#FBF0ED] flex-shrink-0"
          title="Remove Entry"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
        </button>
      </div>
    </div>
    
    <!-- Empty State -->
    <div v-if="log.length === 0" class="text-center py-8">
      <svg class="w-8 h-8 text-[#E6E3DE] mx-auto mb-3" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
      <p class="text-[13px] text-[#A09D97]">No books logged yet for this session.</p>
    </div>
  </div>
</template>