<script setup>
import { computed, onMounted, ref } from 'vue'
import { supabase } from '../supabase'

const props = defineProps({ sessions: { type: Array, default: () => [] } })
const subscribers = ref([])
const subscriberError = ref('')
const loadingSubscribers = ref(true)
const today = new Date().toISOString().slice(0, 10)
const upcoming = computed(() => props.sessions.filter(session => session.session_date >= today && !session.is_archived).sort((a, b) => a.session_date.localeCompare(b.session_date)))
const nextMeetup = computed(() => upcoming.value[0] || null)
const confirmed = computed(() => nextMeetup.value?.rsvps?.filter(rsvp => (rsvp.status || 'confirmed') === 'confirmed').length || 0)
const waitlisted = computed(() => nextMeetup.value?.rsvps?.filter(rsvp => rsvp.status === 'waitlisted').length || 0)
const booksLogged = computed(() => props.sessions.reduce((total, session) => total + (session.books?.length || 0), 0))

const fetchSubscribers = async () => {
  loadingSubscribers.value = true
  const { data, error } = await supabase.from('newsletter_subscribers').select('email, created_at').order('created_at', { ascending: false }).limit(8)
  if (error) subscriberError.value = error.message
  else subscribers.value = data || []
  loadingSubscribers.value = false
}

const exportRsvps = () => {
  if (!nextMeetup.value) return
  const rows = [['Status', 'Member ID', 'RSVP date'], ...(nextMeetup.value.rsvps || []).map(rsvp => [rsvp.status || 'confirmed', rsvp.user_id, rsvp.created_at || ''])]
  const csv = rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a'); link.href = url; link.download = 'meet-and-read-rsvps.csv'; link.click(); URL.revokeObjectURL(url)
}

onMounted(fetchSubscribers)
</script>

<template>
  <div>
    <div class="mb-7"><p class="text-[11px] font-semibold uppercase tracking-[.2em] text-[#2B593F]">Admin workspace</p><h1 class="mt-2 font-display text-3xl text-[#1B1B18]">The reading room, at a glance.</h1></div>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><div class="rounded-2xl border border-[#E6E3DE] bg-white p-5"><p class="text-[10px] font-semibold uppercase tracking-[.16em] text-[#A09D97]">Next meetup</p><p class="mt-2 font-display text-xl text-[#1B1B18]">{{ nextMeetup ? nextMeetup.session_date : 'None planned' }}</p><p v-if="nextMeetup" class="mt-1 text-[12px] text-[#6F6C66]">{{ nextMeetup.location }}</p></div><div class="rounded-2xl border border-[#E6E3DE] bg-white p-5"><p class="text-[10px] font-semibold uppercase tracking-[.16em] text-[#A09D97]">Confirmed</p><p class="mt-2 font-display text-3xl text-[#2B593F]">{{ confirmed }}<span v-if="nextMeetup?.capacity" class="text-lg text-[#A09D97]"> / {{ nextMeetup.capacity }}</span></p></div><div class="rounded-2xl border border-[#E6E3DE] bg-white p-5"><p class="text-[10px] font-semibold uppercase tracking-[.16em] text-[#A09D97]">Waitlist</p><p class="mt-2 font-display text-3xl text-[#1B1B18]">{{ waitlisted }}</p></div><div class="rounded-2xl border border-[#E6E3DE] bg-white p-5"><p class="text-[10px] font-semibold uppercase tracking-[.16em] text-[#A09D97]">Books logged</p><p class="mt-2 font-display text-3xl text-[#1B1B18]">{{ booksLogged }}</p></div></div>
    <div class="mt-6 grid gap-6 lg:grid-cols-[1.1fr_.9fr]"><section class="rounded-2xl border border-[#E6E3DE] bg-white p-6"><div class="flex items-start justify-between gap-3"><div><p class="text-[11px] font-semibold uppercase tracking-[.18em] text-[#2B593F]">Meetup attendance</p><h2 class="mt-1 font-display text-2xl">{{ nextMeetup?.location || 'Schedule the next meetup' }}</h2></div><button v-if="nextMeetup" @click="exportRsvps" class="rounded-lg bg-[#EDF3EF] px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-[#2B593F]">Export RSVPs</button></div><p v-if="nextMeetup" class="mt-4 text-[13px] leading-relaxed text-[#6F6C66]">{{ confirmed }} confirmed reader{{ confirmed === 1 ? '' : 's' }} and {{ waitlisted }} on the waitlist. Export the list for welcome notes or check-in.</p><p v-else class="mt-4 text-[13px] text-[#6F6C66]">Create a meetup to start tracking RSVPs.</p></section><section class="rounded-2xl border border-[#E6E3DE] bg-white p-6"><p class="text-[11px] font-semibold uppercase tracking-[.18em] text-[#2B593F]">Newsletter</p><h2 class="mt-1 font-display text-2xl">Recent readers</h2><p v-if="loadingSubscribers" class="mt-4 text-[13px] text-[#A09D97]">Loading subscribers…</p><p v-else-if="subscriberError" class="mt-4 text-[12px] text-[#B84233]">{{ subscriberError }}</p><ul v-else class="mt-4 space-y-3"><li v-for="subscriber in subscribers" :key="subscriber.email" class="border-b border-[#E6E3DE]/70 pb-2 text-[13px] text-[#6F6C66]">{{ subscriber.email }}</li><li v-if="!subscribers.length" class="text-[13px] text-[#A09D97]">No subscribers yet.</li></ul></section></div>
  </div>
</template>
