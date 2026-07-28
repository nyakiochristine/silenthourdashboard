<script setup>
const props = defineProps({ session: { type: Object, required: true }, isAttending: { type: Boolean, default: false }, isFull: { type: Boolean, default: false }, rsvpStatus: { type: String, default: '' }, loading: { type: Boolean, default: false } })
const emit = defineEmits(['close', 'confirm'])
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-[#1B1B18]/45 p-4 backdrop-blur-sm" @click.self="emit('close')">
    <div class="w-full max-w-md rounded-2xl border border-[#E6E3DE] bg-white p-7 shadow-xl">
      <p class="text-[11px] font-semibold uppercase tracking-[.2em] text-[#2B593F]">{{ isAttending ? 'Your reservation' : 'Reserve your spot' }}</p>
      <h2 class="mt-2 font-display text-2xl text-[#1B1B18]">{{ session.location }}</h2>
      <p class="mt-1 text-[13px] text-[#6F6C66]">{{ session.session_date }}<span v-if="session.time"> · {{ session.time }}</span></p>
      <p class="mt-5 rounded-xl bg-[#F1F4ED] p-4 text-[13px] leading-relaxed text-[#6F6C66]">{{ rsvpStatus === 'waitlisted' ? 'You are on the waitlist. If a seat opens, the club can contact you.' : (isAttending ? 'Your place is saved. Let us know if your plans change.' : (isFull ? 'This session is full, but you can join the waitlist.' : 'Bring any book and settle in. We will save a place for you at the next silent hour.')) }}</p>
      <div class="mt-6 flex gap-3"><button @click="emit('close')" class="flex-1 rounded-xl border border-[#E6E3DE] px-4 py-3 text-[12px] font-semibold uppercase tracking-wide text-[#6F6C66]">Close</button><button @click="emit('confirm')" :disabled="loading" class="flex-1 rounded-xl px-4 py-3 text-[12px] font-semibold uppercase tracking-wide text-white disabled:opacity-60" :class="isAttending ? 'bg-[#B84233]' : 'bg-[#2B593F]'">{{ loading ? 'Saving...' : (isAttending ? 'Cancel RSVP' : (isFull ? 'Join Waitlist' : 'Confirm RSVP')) }}</button></div>
    </div>
  </div>
</template>
