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
    <label class="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 mb-2 block">
      Book title search
    </label>

    <input
      v-model="localQuery"
      @focus="showSuggestions = suggestions.length > 0"
      @blur="hideSuggestions"
      class="border p-2 rounded w-full focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
      placeholder="Start typing a book title..."
      autocomplete="off"
    />
    <p class="text-[11px] text-slate-400 mt-2">Powered by Open Library search.</p>

    <div
      v-if="showSuggestions && suggestions.length"
      class="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden"
    >
      <button
        v-for="book in suggestions"
        :key="book.id"
        type="button"
        @mousedown.prevent
        @click="selectSuggestion(book)"
        class="w-full text-left px-3 py-3 hover:bg-slate-100 transition"
      >
        <div class="font-semibold text-slate-900">{{ book.title }}</div>
        <div class="text-[11px] text-slate-500 mt-1">{{ book.authors.join(', ') }}</div>
      </button>
    </div>

    <div v-if="loading" class="mt-2 text-xs text-slate-500">Searching book suggestions…</div>
    <div v-if="noResults" class="mt-2 text-xs text-slate-500">No matching books found yet. Try a broader title or author name.</div>
    <div v-if="error" class="mt-2 text-xs text-rose-500">{{ error }}</div>

    <div v-if="selectedBook" class="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 flex gap-4 items-start">
      <img
        v-if="selectedBook.cover"
        :src="selectedBook.cover"
        alt="Book cover"
        class="w-20 h-28 rounded-lg object-cover shadow-sm"
      />
      <div class="flex-1">
        <h3 class="font-semibold text-slate-900">{{ selectedBook.title }}</h3>
        <p class="text-sm text-slate-600 mt-1">By {{ selectedBook.authors.join(', ') }}</p>
        <p class="text-sm text-slate-600">Pages: {{ selectedBook.pageCount ?? 'Unknown' }}</p>
        <p v-if="selectedBook.publisher" class="text-[12px] text-slate-500 mt-1">Publisher: {{ selectedBook.publisher }}</p>
        <button
          type="button"
          @click="selectSuggestion({ title: localQuery.value, authors: ['Unknown author'], pageCount: null, cover: '' })"
          class="text-xs text-indigo-600 hover:underline mt-3"
        >
          Keep title only
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
button:focus {
  outline: none;
}
</style>
