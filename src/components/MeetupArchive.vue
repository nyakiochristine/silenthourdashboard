<script setup>
import { ref, onMounted, reactive } from 'vue'
import { supabase } from '../supabase'

const props = defineProps({
  profile: {
    type: Object,
    default: null
  }
})

const sessions = ref([])
const loading = ref(true)
const error = ref('')
const submitLoading = ref(false)
const submitError = ref('')

const newSession = reactive({
  session_date: '',
  location: '',
  activity: '',
  description: '',
  books: [
    { title: '', author: '', cover_url: '' },
    { title: '', author: '', cover_url: '' },
    { title: '', author: '', cover_url: '' }
  ]
})

const fetchSessions = async () => {
  loading.value = true
  error.value = ''

  const { data, error: fetchError } = await supabase
    .from('meetup_sessions')
    .select('*, meetup_session_books(*)')
    .order('session_date', { ascending: false })

  if (fetchError) {
    error.value = fetchError.message || 'Unable to load meetup archive.'
    sessions.value = []
  } else {
    sessions.value = (data || []).map((session) => ({
      ...session,
      books: (session.meetup_session_books || []).map((book) => ({
        title: book.title,
        author: book.author,
        cover: book.cover_url || 'https://via.placeholder.com/150x220?text=No+Cover'
      }))
    }))
  }

  loading.value = false
}

const addBookRow = () => {
  newSession.books.push({ title: '', author: '', cover_url: '' })
}

const removeBookRow = (index) => {
  if (newSession.books.length > 1) {
    newSession.books.splice(index, 1)
  }
}

const resetNewSession = () => {
  newSession.session_date = ''
  newSession.location = ''
  newSession.activity = ''
  newSession.description = ''
  newSession.books = [
    { title: '', author: '', cover_url: '' },
    { title: '', author: '', cover_url: '' },
    { title: '', author: '', cover_url: '' }
  ]
}

const createSession = async () => {
  submitLoading.value = true
  submitError.value = ''

  if (!newSession.session_date || !newSession.location || !newSession.activity) {
    submitError.value = 'Date, location and activity are required.'
    submitLoading.value = false
    return
  }

  const { data: sessionData, error: sessionError } = await supabase
    .from('meetup_sessions')
    .insert([
      {
        host_id: props.profile?.id || null,
        session_date: newSession.session_date,
        location: newSession.location,
        activity: newSession.activity,
        description: newSession.description
      }
    ])
    .select('id')
    .single()

  if (sessionError) {
    submitError.value = sessionError.message || 'Unable to create meetup session.'
    submitLoading.value = false
    return
  }

  const sessionId = sessionData?.id
  const booksToInsert = newSession.books
    .filter((book) => book.title.trim())
    .map((book) => ({
      session_id: sessionId,
      title: book.title.trim(),
      author: book.author.trim() || null,
      cover_url: book.cover_url.trim() || null
    }))

  if (booksToInsert.length) {
    const { error: booksError } = await supabase
      .from('meetup_session_books')
      .insert(booksToInsert)

    if (booksError) {
      submitError.value = booksError.message || 'Unable to save books for this session.'
      submitLoading.value = false
      return
    }
  }

  resetNewSession()
  await fetchSessions()
  submitLoading.value = false
}

onMounted(() => {
  fetchSessions()
})
</script>

<template>
  <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
    <div class="flex flex-col gap-3 mb-6">
      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p class="text-xs uppercase tracking-[0.35em] text-slate-400 font-semibold mb-2">Meetup Archive</p>
          <h2 class="text-2xl font-bold text-slate-900">Past gatherings & session history</h2>
        </div>
        <div class="rounded-full bg-slate-50 px-4 py-2 text-sm text-slate-600 border border-slate-200">
          Remember the location, craft activity and books from every meetup.
        </div>
      </div>
      <p class="text-sm text-slate-600 max-w-2xl">
        Browse community meetups from earlier sessions, view the books members read, and relive the craft activities that made each gathering special.
      </p>
    </div>

    <div class="rounded-[2rem] border border-slate-200 bg-white p-5 mb-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <p class="text-xs uppercase tracking-[0.35em] text-slate-400 font-semibold">Admin meetup creation</p>
          <h3 class="text-lg font-semibold text-slate-900">Add a new archived session</h3>
        </div>
        <div class="text-xs text-slate-500">Admins only</div>
      </div>

      <div v-if="props.profile?.role === 'admin'">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <label class="block text-sm text-slate-600">
            Date
            <input type="date" v-model="newSession.session_date" class="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </label>
          <label class="block text-sm text-slate-600">
            Location
            <input v-model="newSession.location" placeholder="Cafe name or venue" class="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </label>
          <label class="block text-sm text-slate-600 md:col-span-2">
            Activity
            <input v-model="newSession.activity" placeholder="Craft activity or theme" class="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </label>
          <label class="block text-sm text-slate-600 md:col-span-2">
            Description
            <textarea v-model="newSession.description" rows="3" placeholder="Short details about the session" class="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"></textarea>
          </label>
        </div>

        <div class="space-y-4 mb-4">
          <div v-for="(book, index) in newSession.books" :key="index" class="grid grid-cols-12 gap-3 items-end">
            <div class="col-span-12 sm:col-span-4">
              <label class="block text-sm text-slate-600">Book title</label>
              <input v-model="book.title" placeholder="Book title" class="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div class="col-span-12 sm:col-span-4">
              <label class="block text-sm text-slate-600">Author</label>
              <input v-model="book.author" placeholder="Author name" class="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div class="col-span-12 sm:col-span-3">
              <label class="block text-sm text-slate-600">Cover URL</label>
              <input v-model="book.cover_url" placeholder="Image URL" class="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div class="col-span-12 sm:col-span-1 flex items-center justify-end">
              <button type="button" @click="removeBookRow(index)" class="text-xs text-rose-600 hover:underline">Remove</button>
            </div>
          </div>
        </div>

        <button type="button" @click="addBookRow" class="text-sm font-semibold text-indigo-600 hover:text-indigo-800">+ Add another book</button>

        <div class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p v-if="submitError" class="text-xs text-rose-600">{{ submitError }}</p>
          <button type="button" @click="createSession" :disabled="submitLoading" class="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
            {{ submitLoading ? 'Saving session...' : 'Save session' }}
          </button>
        </div>
      </div>

      <div v-else class="rounded-3xl border border-amber-100 bg-amber-50 px-4 py-5 text-sm text-amber-700">
        Only admins can create archive sessions. Please log in with an admin account to add new meetups.
      </div>
    </div>

    <div class="space-y-6">
      <div v-if="loading" class="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
        Loading meetup archive…
      </div>

      <div v-else-if="error" class="rounded-[2rem] border border-rose-200 bg-rose-50 p-8 text-center text-rose-700">
        {{ error }}
      </div>

      <div v-else-if="!sessions.length" class="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
        No archived meetup sessions found yet.
      </div>

      <article v-else v-for="session in sessions" :key="session.id" class="rounded-[2rem] border border-slate-200 bg-slate-50 p-5 shadow-sm">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <p class="text-xs uppercase tracking-[0.35em] text-amber-600 font-semibold mb-1">{{ session.session_date }}</p>
            <h3 class="text-xl font-semibold text-slate-900">{{ session.location }}</h3>
            <p class="text-sm text-slate-500 mt-1">{{ session.activity }}</p>
          </div>
          <div class="rounded-full bg-white border border-slate-200 px-4 py-2 text-sm text-slate-600">
            {{ session.books.length }} books read
          </div>
        </div>
        <p class="text-sm text-slate-500 mb-4">{{ session.description }}</p>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div v-for="book in session.books" :key="book.title" class="rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm">
            <img :src="book.cover" alt="Book cover" class="w-full h-44 object-cover" />
            <div class="p-3">
              <p class="font-semibold text-slate-900 text-sm">{{ book.title }}</p>
              <p class="text-[11px] text-slate-500 mt-1">{{ book.author }}</p>
            </div>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>
