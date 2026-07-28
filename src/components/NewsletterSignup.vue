<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase'

const email = ref('')
const loading = ref(false)
const message = ref('')
const isError = ref(false)

const subscribe = async () => {
  loading.value = true
  message.value = ''
  isError.value = false
  const { error } = await supabase.from('newsletter_subscribers').insert([{ email: email.value.trim().toLowerCase() }])
  loading.value = false
  if (error) {
    if (error.code === '23505') {
      message.value = 'You are already on the reading list — thank you!'
      return
    }
    isError.value = true
    message.value = error.message || 'We could not save your subscription. Please try again.'
    return
  }
  email.value = ''
  message.value = 'You are on the list. See you at the next gathering.'
}
</script>

<template>
  <section class="mt-10 overflow-hidden rounded-[2rem] bg-[#2B593F] px-6 py-10 text-white md:px-10 md:py-12">
    <div class="grid items-center gap-6 md:grid-cols-[1fr_auto]">
      <div><p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C6DDCA]">The reading list</p><h2 class="mt-3 font-display text-3xl leading-tight">Meetups, crafts, and gentle reminders to read.</h2><p class="mt-3 max-w-xl text-[14px] leading-relaxed text-[#DDEBDF]">Get the next gathering in your inbox—plus the occasional bookish note from Meet & Read Nbo.</p></div>
      <form @submit.prevent="subscribe" class="w-full max-w-md"><div class="flex flex-col gap-2 sm:flex-row"><input v-model="email" type="email" required placeholder="you@example.com" class="min-w-0 flex-1 rounded-xl border border-white/20 bg-white px-4 py-3 text-sm text-[#1B1B18] placeholder:text-[#A09D97] focus:outline-none focus:ring-2 focus:ring-[#C6DDCA]" /><button :disabled="loading" class="rounded-xl bg-[#1B1B18] px-5 py-3 text-[12px] font-semibold uppercase tracking-wide transition hover:bg-[#11110f] disabled:opacity-60">{{ loading ? 'Joining...' : 'Subscribe' }}</button></div><p v-if="message" class="mt-3 text-[12px]" :class="isError ? 'text-[#FFD0C8]' : 'text-[#DDEBDF]'">{{ message }}</p><p class="mt-3 text-[10px] text-[#C6DDCA]">No spam. Unsubscribe anytime.</p></form>
    </div>
  </section>
</template>
