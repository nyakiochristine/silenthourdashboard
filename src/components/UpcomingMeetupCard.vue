<script setup>
import { computed } from 'vue'
import CalendarLinks from './CalendarLinks.vue'

const props = defineProps({
  session: { type: Object, required: true },
  attending: { type: Boolean, default: false },
  rsvpStatus: { type: String, default: '' },
  confirmedCount: { type: Number, default: 0 },
  full: { type: Boolean, default: false }
})
const emit = defineEmits(['rsvp'])
const formattedDate = computed(() => new Intl.DateTimeFormat('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${props.session.session_date}T12:00:00`)))
</script>

<template>
  <article class="overflow-hidden rounded-[2rem] border border-[#DCE5DC] bg-white shadow-[0_18px_50px_rgba(43,89,63,0.08)]">
    <div class="grid lg:grid-cols-[.9fr_1.1fr]">
      <div class="relative min-h-[310px] bg-[#2B593F]">
        <img v-if="session.image_url" :src="session.image_url" alt="Meetup poster" class="absolute inset-0 h-full w-full object-cover" />
        <div v-else class="absolute inset-0 flex flex-col justify-end bg-[radial-gradient(circle_at_top,#567d63,transparent_55%),linear-gradient(145deg,#2B593F,#183224)] p-8 text-white"><span class="text-[11px] font-semibold uppercase tracking-[.24em] text-[#C6DDCA]">Meet & Read Nbo</span><span class="mt-3 font-display text-4xl leading-none">Silent<br />Hour</span></div>
        <div class="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/45 to-transparent"></div>
        <span class="absolute bottom-5 left-6 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.16em] text-[#2B593F]">Upcoming meetup</span>
      </div>
      <div class="p-6 md:p-9">
        <p class="text-[11px] font-semibold uppercase tracking-[.2em] text-[#2B593F]">{{ formattedDate }}</p>
        <h2 class="mt-2 font-display text-3xl leading-tight text-[#1B1B18]">{{ session.activity || 'A quiet hour together' }}</h2>
        <p class="mt-2 text-[15px] font-medium text-[#6F6C66]">{{ session.location }}<span v-if="session.time || session.start_time"> · {{ session.time || session.start_time }}</span></p>
        <p v-if="session.description" class="mt-5 max-w-2xl text-[14px] leading-relaxed text-[#6F6C66]">{{ session.description }}</p>
        <div class="mt-6 grid gap-3 sm:grid-cols-2"><div class="rounded-xl bg-[#F1F4ED] p-3.5"><p class="text-[10px] font-semibold uppercase tracking-[.16em] text-[#A09D97]">The ritual</p><p class="mt-1 text-[13px] font-medium text-[#1B1B18]">90 minutes of silent reading</p></div><div class="rounded-xl bg-[#F1F4ED] p-3.5"><p class="text-[10px] font-semibold uppercase tracking-[.16em] text-[#A09D97]">Attendance</p><p class="mt-1 text-[13px] font-medium text-[#1B1B18]">{{ confirmedCount }}{{ session.capacity ? ` of ${session.capacity} seats` : ' readers joining' }}</p></div></div>
        <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center"><button @click="emit('rsvp')" class="rounded-xl px-5 py-3.5 text-[12px] font-semibold uppercase tracking-wide text-white transition hover:opacity-90" :class="attending ? 'bg-[#2B593F]' : 'bg-[#1B1B18]'">{{ rsvpStatus === 'waitlisted' ? 'You are waitlisted' : (attending ? 'Your place is saved' : (full ? 'Join the waitlist' : 'RSVP for this meetup')) }}</button><CalendarLinks :session="session" /><span v-if="full && !attending" class="text-[11px] text-[#A09D97]">This gathering is full.</span></div>
      </div>
    </div>
  </article>
</template>
