<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase'

const props = defineProps({ user: { type: Object, default: null }, profile: { type: Object, default: null } })
const articles = [
  { tag: 'Club notes', title: 'Why silent reading feels better together', excerpt: 'There is a particular kind of ease that comes from a room full of people choosing the same quiet.' },
  { tag: 'Bookish life', title: 'A soft guide to bringing any book', excerpt: 'The unread novel, the half-finished memoir, the textbook—all are welcome at the reading table.' },
  { tag: 'Nairobi spaces', title: 'Making room for a third space', excerpt: 'Meet & Read Nbo is an invitation to pause between the demands of home and work.' }
]
const form = ref({ title: '', category: 'Book review', body: '' })
const message = ref('')
const loading = ref(false)

const submit = async () => {
  if (!props.user) { message.value = 'Sign in to submit an article.'; return }
  loading.value = true; message.value = ''
  const { error } = await supabase.from('blog_submissions').insert([{ author_id: props.user.id, author_name: props.profile?.username || 'Meet & Read member', title: form.value.title.trim(), category: form.value.category, body: form.value.body.trim() }])
  loading.value = false
  if (error) { message.value = error.message; return }
  form.value = { title: '', category: 'Book review', body: '' }
  message.value = 'Thank you—your article has been sent to the club editors.'
}
</script>

<template>
  <div><section class="overflow-hidden rounded-[2rem] bg-[#6B1F36] px-7 py-12 text-white md:px-12"><p class="text-[11px] font-semibold uppercase tracking-[.22em] text-[#F2BDC8]">The reading journal</p><h1 class="mt-3 max-w-2xl font-display text-5xl leading-[.95]">Stories from the quiet room.</h1><p class="mt-5 max-w-xl text-[15px] leading-relaxed text-[#F7DDE2]">Book reviews, reflections, and small observations from the Meet & Read Nbo community.</p></section><section class="mt-8 grid gap-4 md:grid-cols-3"><article v-for="article in articles" :key="article.title" class="rounded-2xl border border-[#E6E3DE] bg-white p-6"><p class="text-[10px] font-semibold uppercase tracking-[.18em] text-[#8A2945]">{{ article.tag }}</p><h2 class="mt-4 font-display text-2xl leading-tight text-[#1B1B18]">{{ article.title }}</h2><p class="mt-3 text-[13px] leading-relaxed text-[#6F6C66]">{{ article.excerpt }}</p><span class="mt-5 inline-block text-[11px] font-semibold uppercase tracking-wide text-[#6B1F36]">Read soon →</span></article></section><section class="mt-10 rounded-2xl border border-[#E6E3DE] bg-white p-7 md:p-9"><p class="text-[11px] font-semibold uppercase tracking-[.2em] text-[#8A2945]">Member submissions</p><h2 class="mt-2 font-display text-3xl">Write for the reading journal.</h2><p class="mt-2 max-w-2xl text-[13px] leading-relaxed text-[#6F6C66]">Share a book review, reflection, or piece of social commentary. Admins review every submission before publishing.</p><form @submit.prevent="submit" class="mt-6 grid gap-4"><input v-model="form.title" required placeholder="Your article title" class="rounded-xl border border-[#E6E3DE] bg-[#FBF0F1] px-4 py-3 text-sm focus:border-[#6B1F36] focus:outline-none" /><select v-model="form.category" class="rounded-xl border border-[#E6E3DE] bg-[#FBF0F1] px-4 py-3 text-sm focus:border-[#6B1F36] focus:outline-none"><option>Book review</option><option>Social commentary</option><option>Club reflection</option><option>Reading list</option></select><textarea v-model="form.body" required rows="6" placeholder="Write your piece here…" class="rounded-xl border border-[#E6E3DE] bg-[#FBF0F1] px-4 py-3 text-sm focus:border-[#6B1F36] focus:outline-none"></textarea><div class="flex flex-wrap items-center justify-between gap-3"><p v-if="message" class="text-[12px] text-[#6F6C66]">{{ message }}</p><span v-else></span><button :disabled="loading" class="rounded-xl bg-[#6B1F36] px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-white disabled:opacity-60">{{ loading ? 'Sending…' : 'Submit for review' }}</button></div></form></section></div>
</template>
