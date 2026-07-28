<script setup>
import { computed, ref, watch } from 'vue'
import BookSearch from './BookSearch.vue'
import Timer from './Timer.vue'

const props = defineProps({
  user: { type: Object, required: true }
})

const storageKey = computed(() => `meet-and-read:personal-library:${props.user.id}`)
const savedBooks = ref([])
const title = ref('')
const progress = ref('')
const selectedBook = ref(null)

const loadBooks = () => {
  try {
    savedBooks.value = JSON.parse(localStorage.getItem(storageKey.value) || '[]')
  } catch {
    savedBooks.value = []
  }
}

const persistBooks = () => localStorage.setItem(storageKey.value, JSON.stringify(savedBooks.value))

watch(storageKey, loadBooks, { immediate: true })
watch(savedBooks, persistBooks, { deep: true })

const addBook = () => {
  const cleanTitle = title.value.trim()
  if (!cleanTitle) return

  savedBooks.value.unshift({
    id: crypto.randomUUID(),
    title: cleanTitle,
    author: selectedBook.value?.authors?.join(', ') || '',
    cover: selectedBook.value?.cover || '',
    progress: progress.value.trim(),
    addedAt: new Date().toISOString()
  })
  title.value = ''
  progress.value = ''
  selectedBook.value = null
}

const removeBook = (id) => {
  savedBooks.value = savedBooks.value.filter(book => book.id !== id)
}

const onBookSelect = (book) => {
  selectedBook.value = book
  if (book?.title) title.value = book.title
}
</script>

<template>
  <div class="grid gap-6 md:grid-cols-12">
    <div class="md:col-span-5">
      <Timer />
      <p class="mt-3 px-1 text-center text-[11px] leading-relaxed text-[#A09D97]">Your own quiet reading time—available whenever you need it.</p>
    </div>

    <div class="md:col-span-7 rounded-2xl border border-[#E6E3DE] bg-white p-6">
      <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#A09D97]">Your bookshelf</p>
      <h2 class="mt-1 font-display text-xl text-[#1B1B18]">Currently Reading</h2>
      <p class="mt-1 text-[13px] text-[#6F6C66]">Keep a small, private list of the books you are working through between meetups.</p>

      <form @submit.prevent="addBook" class="mt-5 space-y-3 border-b border-[#E6E3DE] pb-6">
        <BookSearch v-model:query="title" @select-book="onBookSelect" />
        <div class="flex flex-col gap-3 sm:flex-row">
          <input v-model="progress" placeholder="Current page or progress (optional)" class="min-w-0 flex-1 rounded-xl border border-[#E6E3DE] bg-[#F7F6F3] px-3.5 py-2.5 text-sm text-[#1B1B18] placeholder:text-[#C5C2BC] focus:border-[#2B593F] focus:outline-none focus:ring-1 focus:ring-[#2B593F]/20" />
          <button class="rounded-xl bg-[#2B593F] px-5 py-3 text-[12px] font-semibold uppercase tracking-wide text-white transition hover:bg-[#1D4230]">Add to my list</button>
        </div>
      </form>

      <div v-if="savedBooks.length" class="mt-5 space-y-3">
        <article v-for="book in savedBooks" :key="book.id" class="flex items-start gap-3 rounded-xl border border-[#E6E3DE]/70 bg-[#F7F6F3] p-3">
          <img v-if="book.cover" :src="book.cover" alt="Book cover" class="h-16 w-11 rounded-md object-cover shadow-sm" />
          <div v-else class="flex h-16 w-11 items-center justify-center rounded-md bg-[#E6E3DE] text-[#A09D97]">📖</div>
          <div class="min-w-0 flex-1"><h3 class="truncate text-[14px] font-semibold text-[#1B1B18]">{{ book.title }}</h3><p v-if="book.author" class="mt-0.5 text-[12px] text-[#6F6C66]">{{ book.author }}</p><input v-model="book.progress" placeholder="Add progress" class="mt-2 w-full max-w-xs rounded-md border border-[#E6E3DE] bg-white px-2 py-1 text-[11px] text-[#6F6C66] focus:border-[#2B593F] focus:outline-none" /></div>
          <button @click="removeBook(book.id)" class="p-1 text-[#A09D97] transition hover:text-[#B84233]" title="Remove from my list">×</button>
        </article>
      </div>
      <div v-else class="mt-5 rounded-xl border border-dashed border-[#E6E3DE] p-8 text-center text-[13px] text-[#A09D97]">Your personal reading list is empty.</div>
    </div>
  </div>
</template>
