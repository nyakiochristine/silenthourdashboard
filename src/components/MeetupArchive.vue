<script setup>
import { ref, reactive, computed } from 'vue'
import { supabase } from '../supabase'
import BookSearch from './BookSearch.vue'

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
const editingId = ref(null)
const posterFile = ref(null)
const galleryFiles = ref([])
const bookSessionId = ref(null)
const archiveBook = reactive({ title: '', reader: '', genre: 'Fiction', progress: '' })
const archiveSelectedBook = ref(null)
const bookLoading = ref(false)
const bookError = ref('')
const today = () => new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]
const upcomingSessions = computed(() => props.sessions.filter(session => session.session_date >= today() && !session.is_archived).sort((a, b) => a.session_date.localeCompare(b.session_date)))
const archivedSessions = computed(() => props.sessions.filter(session => session.session_date < today() || session.is_archived).sort((a, b) => b.session_date.localeCompare(a.session_date)))

const newSession = reactive({
  session_date: '',
  time: '',
  start_time: '',
  capacity: '',
  location: '',
  activity: '',
  description: '',
  image_url: ''
})

const resetNewSession = () => {
  editingId.value = null
  posterFile.value = null
  galleryFiles.value = []
  newSession.session_date = ''
  newSession.time = ''
  newSession.start_time = ''
  newSession.capacity = ''
  newSession.location = ''
  newSession.activity = ''
  newSession.description = ''
  newSession.image_url = ''
}

const openCreateForm = () => { resetNewSession(); showForm.value = true }

const editSession = (session) => {
  editingId.value = session.id
  Object.assign(newSession, {
    session_date: session.session_date || '', time: session.time || '', start_time: session.start_time || '', capacity: session.capacity || '',
    location: session.location || '', activity: session.activity || '', description: session.description || '', image_url: session.image_url || ''
  })
  posterFile.value = null
  galleryFiles.value = []
  showForm.value = true
}

const handlePoster = (event) => { posterFile.value = event.target.files?.[0] || null }
const handleGallery = (event) => { galleryFiles.value = Array.from(event.target.files || []) }

const openBookForm = (session) => {
  bookSessionId.value = bookSessionId.value === session.id ? null : session.id
  bookError.value = ''
  archiveBook.title = ''
  archiveBook.reader = ''
  archiveBook.genre = 'Fiction'
  archiveBook.progress = ''
  archiveSelectedBook.value = null
}

const selectArchiveBook = (book) => {
  archiveSelectedBook.value = book
  archiveBook.title = book?.title || archiveBook.title
}

const addArchivedBook = async () => {
  if (!bookSessionId.value || !archiveBook.title.trim() || !archiveBook.reader.trim()) {
    bookError.value = 'Book title and reader name are required.'
    return
  }
  bookLoading.value = true
  bookError.value = ''
  const { error } = await supabase.from('books').insert([{
    session_id: bookSessionId.value,
    book: archiveBook.title.trim(),
    reader: archiveBook.reader.trim(),
    author: archiveSelectedBook.value?.authors?.join(', ') || null,
    page_count: archiveSelectedBook.value?.pageCount || null,
    cover_url: archiveSelectedBook.value?.cover || null,
    publisher: archiveSelectedBook.value?.publisher || null,
    genre: archiveBook.genre,
    progress: archiveBook.progress.trim() || null
  }])
  bookLoading.value = false
  if (error) {
    bookError.value = [error.message, error.details, error.hint].filter(Boolean).join(' — ')
    return
  }
  bookSessionId.value = null
  emit('refreshSessions')
}

const uploadFile = async (file, folder) => {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
  const path = `${folder}/${Date.now()}-${safeName}`
  if (!file.type.startsWith('image/')) throw new Error('Please select an image file.')
  if (file.size > 6 * 1024 * 1024) throw new Error(`${file.name} is larger than 6 MB. Please choose a smaller image.`)
  const { error } = await supabase.storage.from('meetup-media').upload(path, file, { contentType: file.type, upsert: false })
  if (error) throw error
  return supabase.storage.from('meetup-media').getPublicUrl(path).data.publicUrl
}

const saveSession = async () => {
  submitLoading.value = true
  submitError.value = ''

  if (!newSession.session_date || !newSession.location || !newSession.activity) {
    submitError.value = 'Date, location and activity are required.'
    submitLoading.value = false
    return
  }

  const payload = { host_id: props.profile?.id || null, session_date: newSession.session_date, time: newSession.time, start_time: newSession.start_time || null, capacity: newSession.capacity ? Number(newSession.capacity) : null, location: newSession.location, activity: newSession.activity, description: newSession.description, image_url: newSession.image_url || null }
  const request = editingId.value
    ? supabase.from('meetup_sessions').update(payload).eq('id', editingId.value).select().single()
    : supabase.from('meetup_sessions').insert([payload]).select().single()
  const { data: savedSession, error: sessionError } = await request

  if (sessionError) {
    const diagnostic = [sessionError.message, sessionError.details, sessionError.hint, sessionError.code]
      .filter(Boolean)
      .join(' — ')
    submitError.value = diagnostic || 'Unable to create meetup session.'
    console.error('Meetup session save failed:', sessionError)
    submitLoading.value = false
    return
  }

  try {
    if (posterFile.value) {
      const posterUrl = await uploadFile(posterFile.value, `posters/${savedSession.id}`)
      const { error } = await supabase.from('meetup_sessions').update({ image_url: posterUrl }).eq('id', savedSession.id)
      if (error) throw error
    }
    if (galleryFiles.value.length) {
      const media = await Promise.all(galleryFiles.value.map(async file => ({ session_id: savedSession.id, image_url: await uploadFile(file, `gallery/${savedSession.id}`) })))
      const { error } = await supabase.from('session_media').insert(media)
      if (error) throw error
    }
  } catch (uploadError) {
    submitError.value = `Session saved, but the image upload failed: ${uploadError.message || 'Check that the meetup-media Storage bucket and its admin upload policy were created.'}`
    submitLoading.value = false
    return
  }
  resetNewSession()
  showForm.value = false
  emit('refreshSessions')
  submitLoading.value = false
}

const toggleArchive = async (session) => {
  const { error } = await supabase.from('meetup_sessions').update({ is_archived: !session.is_archived }).eq('id', session.id)
  if (error) { submitError.value = error.message; return }
  emit('refreshSessions')
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
      <div>
        <p class="text-[11px] tracking-[0.2em] uppercase font-semibold text-[#A09D97] mb-1">Archive</p>
        <h2 class="text-xl font-display text-[#1B1B18]">Meetups</h2>
        <p class="text-[13px] text-[#6F6C66] mt-1 max-w-lg">Upcoming plans and a record of every gathering.</p>
      </div>
      <button 
        v-if="props.profile?.role === 'admin'" 
        @click="showForm ? (showForm = false) : openCreateForm()"
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
      <h3 class="text-[15px] font-semibold text-[#1B1B18] mb-4">{{ editingId ? 'Edit Meetup Session' : 'New Meetup Session' }}</h3>
      
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
          <label class="block text-[11px] tracking-[0.15em] uppercase font-semibold text-[#A09D97] mb-1.5">Start Time</label>
          <input type="time" v-model="newSession.start_time" class="w-full px-3.5 py-2.5 bg-[#F7F6F3] border border-[#E6E3DE] rounded-xl text-sm text-[#1B1B18] focus:outline-none focus:border-[#2B593F] focus:ring-1 focus:ring-[#2B593F]/20 transition-colors" />
          <p class="mt-1 text-[10px] text-[#A09D97]">Used for calendar reminders.</p>
        </div>
        <div>
          <label class="block text-[11px] tracking-[0.15em] uppercase font-semibold text-[#A09D97] mb-1.5">Location</label>
          <input v-model="newSession.location" placeholder="Cafe or venue" class="w-full px-3.5 py-2.5 bg-[#F7F6F3] border border-[#E6E3DE] rounded-xl text-sm text-[#1B1B18] focus:outline-none focus:border-[#2B593F] focus:ring-1 focus:ring-[#2B593F]/20 transition-colors placeholder:text-[#C5C2BC]" />
        </div>
        <div>
          <label class="block text-[11px] tracking-[0.15em] uppercase font-semibold text-[#A09D97] mb-1.5">Activity</label>
          <input v-model="newSession.activity" placeholder="Craft or theme" class="w-full px-3.5 py-2.5 bg-[#F7F6F3] border border-[#E6E3DE] rounded-xl text-sm text-[#1B1B18] focus:outline-none focus:border-[#2B593F] focus:ring-1 focus:ring-[#2B593F]/20 transition-colors placeholder:text-[#C5C2BC]" />
        </div>
        <div>
          <label class="block text-[11px] tracking-[0.15em] uppercase font-semibold text-[#A09D97] mb-1.5">Capacity</label>
          <input type="number" min="1" v-model="newSession.capacity" placeholder="e.g. 25 (Optional)" class="w-full px-3.5 py-2.5 bg-[#F7F6F3] border border-[#E6E3DE] rounded-xl text-sm text-[#1B1B18] focus:outline-none focus:border-[#2B593F] focus:ring-1 focus:ring-[#2B593F]/20 transition-colors placeholder:text-[#C5C2BC]" />
        </div>
        <div>
          <label class="block text-[11px] tracking-[0.15em] uppercase font-semibold text-[#A09D97] mb-1.5">Meetup Poster</label>
          <input type="file" accept="image/*" @change="handlePoster" class="block w-full text-[12px] text-[#6F6C66] file:mr-3 file:rounded-lg file:border-0 file:bg-[#EDF3EF] file:px-3 file:py-2 file:text-[11px] file:font-semibold file:text-[#2B593F]" />
          <p class="mt-1 text-[10px] text-[#A09D97]">Upload a poster or venue image.</p>
        </div>
        <div>
          <label class="block text-[11px] tracking-[0.15em] uppercase font-semibold text-[#A09D97] mb-1.5">Poster URL (optional)</label>
          <input v-model="newSession.image_url" placeholder="https://..." class="w-full px-3.5 py-2.5 bg-[#F7F6F3] border border-[#E6E3DE] rounded-xl text-sm text-[#1B1B18] focus:outline-none focus:border-[#2B593F] focus:ring-1 focus:ring-[#2B593F]/20 transition-colors placeholder:text-[#C5C2BC]" />
        </div>
        <div v-if="editingId" class="md:col-span-2">
          <label class="block text-[11px] tracking-[0.15em] uppercase font-semibold text-[#A09D97] mb-1.5">Archive Photos</label>
          <input type="file" accept="image/*" multiple @change="handleGallery" class="block w-full text-[12px] text-[#6F6C66] file:mr-3 file:rounded-lg file:border-0 file:bg-[#EDF3EF] file:px-3 file:py-2 file:text-[11px] file:font-semibold file:text-[#2B593F]" />
          <p class="mt-1 text-[10px] text-[#A09D97]">Add photos after the meetup has happened.</p>
        </div>
        <div class="md:col-span-2">
          <label class="block text-[11px] tracking-[0.15em] uppercase font-semibold text-[#A09D97] mb-1.5">Description</label>
          <textarea v-model="newSession.description" rows="1" placeholder="Brief details" class="w-full px-3.5 py-2.5 bg-[#F7F6F3] border border-[#E6E3DE] rounded-xl text-sm text-[#1B1B18] focus:outline-none focus:border-[#2B593F] focus:ring-1 focus:ring-[#2B593F]/20 transition-colors placeholder:text-[#C5C2BC] resize-none"></textarea>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-[#E6E3DE]">
        <p v-if="submitError" class="text-[12px] text-[#B84233]">{{ submitError }}</p>
        <div v-else></div>
        <button type="button" @click="saveSession" :disabled="submitLoading" class="bg-[#2B593F] hover:bg-[#1D4230] text-white text-[12px] font-semibold tracking-wide uppercase px-6 py-3 rounded-xl transition-all duration-200 disabled:opacity-60 active:scale-[0.98]">
          {{ submitLoading ? 'Saving...' : (editingId ? 'Save Changes' : 'Save Session') }}
        </button>
      </div>
    </div>

    <section v-if="upcomingSessions.length" class="mb-9">
      <p class="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2B593F]">Upcoming</p>
      <div class="space-y-3">
        <article v-for="session in upcomingSessions" :key="session.id" class="rounded-2xl border border-[#BFD4C3] bg-[#EDF3EF] p-5">
          <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2B593F]">{{ session.session_date }}<span v-if="session.time"> · {{ session.time }}</span></p>
          <h3 class="mt-2 font-display text-xl text-[#1B1B18]">{{ session.location }}</h3>
          <p class="mt-1 text-[13px] text-[#6F6C66]">{{ session.activity }}</p>
          <p v-if="session.description" class="mt-3 text-[13px] leading-relaxed text-[#6F6C66]">{{ session.description }}</p>
          <div v-if="props.profile?.role === 'admin'" class="mt-4 flex flex-wrap gap-2"><button @click="editSession(session)" class="rounded-lg border border-[#2B593F]/20 bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-[#2B593F]">Edit</button><button @click="toggleArchive(session)" class="rounded-lg border border-[#2B593F]/20 bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-[#2B593F]">Archive meetup</button></div>
        </article>
      </div>
    </section>

    <!-- Sessions List -->
    <div class="space-y-4">
      <!-- Empty -->
      <p v-if="archivedSessions.length" class="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#A09D97]">Past gatherings</p>
      <div v-if="!sessions || !sessions.length" class="bg-white rounded-2xl border border-[#E6E3DE] p-10 text-center">
        <svg class="w-8 h-8 text-[#E6E3DE] mx-auto mb-3" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
        <p class="text-[13px] text-[#A09D97]">No archived sessions yet.</p>
      </div>

      <!-- Session Cards -->
      <article 
        v-else 
        v-for="session in archivedSessions"
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
        <div v-if="session.session_media?.length" class="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3"><img v-for="media in session.session_media" :key="media.id" :src="media.image_url" alt="Meetup memory" class="h-32 w-full rounded-xl object-cover" /></div>

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
        <div v-if="props.profile?.role === 'admin'" class="mt-5 flex flex-wrap gap-2"><button @click="editSession(session)" class="rounded-lg border border-[#E6E3DE] px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-[#2B593F]">Edit & add photos</button><button @click="openBookForm(session)" class="rounded-lg border border-[#E6E3DE] px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-[#2B593F]">{{ bookSessionId === session.id ? 'Close book form' : 'Add a missing book' }}</button><button @click="toggleArchive(session)" class="rounded-lg border border-[#E6E3DE] px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-[#6F6C66]">{{ session.is_archived ? 'Restore meetup' : 'Archive meetup' }}</button></div>
        <form v-if="bookSessionId === session.id" @submit.prevent="addArchivedBook" class="mt-4 rounded-xl border border-[#DCE5DC] bg-[#F1F4ED] p-4">
          <p class="text-[11px] font-semibold uppercase tracking-[.18em] text-[#2B593F]">Add a book from this meetup</p>
          <div class="mt-3 grid gap-3 md:grid-cols-2"><BookSearch v-model:query="archiveBook.title" @select-book="selectArchiveBook" /><div><label class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[.15em] text-[#A09D97]">Reader name</label><input v-model="archiveBook.reader" required placeholder="Who read it?" class="w-full rounded-xl border border-[#E6E3DE] bg-white px-3.5 py-2.5 text-sm focus:border-[#2B593F] focus:outline-none" /></div><div><label class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[.15em] text-[#A09D97]">Genre</label><select v-model="archiveBook.genre" class="w-full rounded-xl border border-[#E6E3DE] bg-white px-3.5 py-2.5 text-sm focus:border-[#2B593F] focus:outline-none"><option>Fiction</option><option>Non-Fiction</option><option>Sci-Fi</option><option>Biography</option><option>Poetry</option><option>Self-Help</option><option>History</option></select></div><div><label class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[.15em] text-[#A09D97]">Page / progress</label><input v-model="archiveBook.progress" placeholder="Optional" class="w-full rounded-xl border border-[#E6E3DE] bg-white px-3.5 py-2.5 text-sm focus:border-[#2B593F] focus:outline-none" /></div></div>
          <div class="mt-4 flex items-center justify-between gap-3"><p v-if="bookError" class="text-[12px] text-[#B84233]">{{ bookError }}</p><span v-else></span><button :disabled="bookLoading" class="rounded-xl bg-[#2B593F] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-white disabled:opacity-60">{{ bookLoading ? 'Saving...' : 'Save book' }}</button></div>
        </form>
      </article>
    </div>
  </div>
</template>
