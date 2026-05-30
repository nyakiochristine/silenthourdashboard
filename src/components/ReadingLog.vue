
<script setup>
import { ref } from 'vue'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
const props = defineProps(['log'])
const emit = defineEmits(['refreshList', 'removeBook'])

const newBook = ref('')
const newReader = ref('')
const newGenre = ref('Fiction') // Default selection

// Your list of available genres for the picker
const genres = ['Fiction', 'Non-Fiction', 'Sci-Fi', 'Biography', 'Poetry', 'Self-Help', 'History']

const loading = ref(false)

const submit = async () => {
  loading.value = true
  const { error } = await supabase.from('books').insert([
    { reader: newReader.value, book: newBook.value, genre: newGenre.value }
  ])
  
  if (!error) {
    newBook.value = ''
    newReader.value = ''
    newGenre.value = 'Fiction' // Reset picker
    emit('refreshList') 
  }
  loading.value = false
}
</script>

<template>
  <div class="bg-white p-6 rounded-2xl shadow-sm border">
    <h2 class="text-xl font-bold mb-4">Today's Books</h2>
    <form @submit.prevent="submit" class="flex flex-col gap-3 mb-4">
      <input v-model="newReader" placeholder="Name" class="border p-2 rounded w-full" required />
      <input v-model="newBook" placeholder="Book Title" class="border p-2 rounded w-full" required />
      
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-slate-500 uppercase">Select Genre</label>
        <select v-model="newGenre" class="border p-2 rounded bg-white w-full border-slate-200">
          <option v-for="genre in genres" :key="genre" :value="genre">
            {{ genre }}
          </option>
        </select>
      </div>

      <button :disabled="loading" class="bg-slate-900 text-white py-2 rounded font-medium mt-2 hover:bg-slate-800 transition">
        {{ loading ? 'Saving...' : 'Add Book' }}
      </button>
    </form>
    
    <ul class="mt-4 divide-y divide-slate-100">
      <li v-for="book in log" :key="book.id" class="flex justify-between py-3 items-center">
        <div>
          <span class="font-semibold text-slate-800 block">{{ book.book }}</span>
          <span class="text-xs text-slate-400">by {{ book.reader }} • <span class="text-indigo-500 font-medium">{{ book.genre }}</span></span>
        </div>
        <button @click="$emit('removeBook', book.id)" class="text-slate-300 hover:text-red-500 transition px-2">✕</button>
      </li>
    </ul>
  </div>
</template>




