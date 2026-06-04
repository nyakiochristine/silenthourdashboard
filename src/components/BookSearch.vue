<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  query: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:query', 'select-book'])
const localQuery = ref(props.query)
const suggestions = ref([])
const selectedBook = ref(null)
const loading = ref(false)
const error = ref('')
const showSuggestions = ref(false)
const noResults = computed(() => localQuery.value.length >= 2 && !loading.value && !suggestions.value.length && !error.value && !selectedBook.value)
let debounceTimer = null

watch(
  () => props.query,
  (value) => {
    localQuery.value = value
  }
)

const searchBooks = async (term) => {
  loading.value = true
  error.value = ''
  suggestions.value = []

  if (!term || term.length < 2) {
    loading.value = false
    showSuggestions.value = false
    return
  }

  try {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(term)}&limit=8`
    const response = await fetch(url)
    const data = await response.json()

    suggestions.value = (data.docs || []).map((doc) => {
      return {
        id: doc.key || doc.cover_edition_key || `${doc.title}-${doc.first_publish_year}`,
        title: doc.title || 'Unknown title',
        authors: doc.author_name || ['Unknown author'],
        pageCount: doc.number_of_pages_median || null,
        cover: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : '',
        publisher: Array.isArray(doc.publisher) && doc.publisher.length ? doc.publisher[0] : '',
      }
    })

    showSuggestions.value = suggestions.value.length > 0
  } catch (err) {
    error.value = 'Unable to load suggestions. Please try again.'
  } finally {
    loading.value = false
  }
}

watch(localQuery, (value) => {
  emit('update:query', value)
  selectedBook.value = null
  emit('select-book', null)

  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  if (!value) {
    suggestions.value = []
    showSuggestions.value = false
    return
  }

  debounceTimer = setTimeout(() => searchBooks(value), 300)
})

const selectSuggestion = (book) => {
  localQuery.value = book.title
  selectedBook.value = book
  suggestions.value = []
  showSuggestions.value = false
  emit('update:query', book.title)
  emit('select-book', book)
}

const hideSuggestions = () => {
  setTimeout(() => {
    showSuggestions.value = false
  }, 120)
}
</script>

<template>
  <div class="relative">
    <label class="block text-[11px] tracking-[0.15em] uppercase font-semibold text-[#A09D97] mb-1.5">
      Book Title
    </label>

    <div class="relative">
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A09D97] pointer-events-none" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
      <input
        v-model="localQuery"
        @focus="showSuggestions = suggestions.length > 0"
        @blur="hideSuggestions"
        class="w-full pl-9 pr-3.5 py-2.5 bg-[#F7F6F3] text-[#1B1B18] border border-[#E6E3DE] rounded-xl text-sm focus:outline-none focus:border-[#2B593F] focus:ring-1 focus:ring-[#2B593F]/20 transition-colors placeholder:text-[#C5C2BC]"
        placeholder="Search by title or author..."
        autocomplete="off"
      />
    </div>
    <p class="text-[10px] text-[#C5C2BC] mt-1.5">Powered by Open Library</p>

    <!-- Suggestions Dropdown -->
    <div
      v-if="showSuggestions && suggestions.length"
      class="absolute z-20 mt-1 w-full rounded-xl border border-[#E6E3DE] bg-white shadow-lg overflow-hidden"
    >
      <button
        v-for="book in suggestions"
        :key="book.id"
        type="button"
        @mousedown.prevent
        @click="selectSuggestion(book)"
        class="w-full text-left px-3.5 py-3 hover:bg-[#F7F6F3] transition-colors border-b border-[#E6E3DE]/40 last:border-b-0"
      >
        <p class="text-[13px] font-medium text-[#1B1B18]">{{ book.title }}</p>
        <p class="text-[11px] text-[#A09D97] mt-0.5">{{ book.authors.join(', ') }}</p>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="mt-2 text-[11px] text-[#A09D97] flex items-center gap-1.5">
      <svg class="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      Searching...
    </div>
    <div v-if="noResults" class="mt-2 text-[11px] text-[#A09D97]">No matching books found. Try a different search.</div>
    <div v-if="error" class="mt-2 text-[12px] text-[#B84233]">{{ error }}</div>

    <!-- Selected Book Preview -->
    <div v-if="selectedBook" class="mt-3 rounded-xl border border-[#E6E3DE] bg-[#F7F6F3] p-3.5 flex gap-3 items-start">
      <img
        v-if="selectedBook.cover"
        :src="selectedBook.cover"
        alt="Book cover"
        class="w-14 h-20 rounded-lg object-cover shadow-sm flex-shrink-0"
      />
      <div class="flex-1 min-w-0">
        <h3 class="text-[13px] font-semibold text-[#1B1B18]">{{ selectedBook.title }}</h3>
        <p class="text-[12px] text-[#6F6C66] mt-0.5">{{ selectedBook.authors.join(', ') }}</p>
        <p class="text-[11px] text-[#A09D97] mt-0.5">{{ selectedBook.pageCount ? `${selectedBook.pageCount} pages` : 'Pages unknown' }}</p>
        <p v-if="selectedBook.publisher" class="text-[11px] text-[#A09D97]">{{ selectedBook.publisher }}</p>
        <button
          type="button"
          @click="selectSuggestion({ title: localQuery, authors: ['Unknown author'], pageCount: null, cover: '' })"
          class="text-[11px] text-[#2B593F] hover:text-[#1D4230] font-medium mt-2 transition-colors"
        >
          Use title only →
        </button>
      </div>
    </div>
  </div>
</template>
