<script setup>
import heroImage from '../assets/silent-reading-hero.png'
import craftImage from '../assets/craft-table.png'
import NewsletterSignup from './NewsletterSignup.vue'

const props = defineProps({
  session: { type: Object, default: null },
  user: { type: Object, default: null },
  pastSessions: { type: Array, default: () => [] }
})

const emit = defineEmits(['explore', 'join', 'rsvp'])

const readableDate = (date) => {
  if (!date) return ''
  return new Intl.DateTimeFormat('en-KE', { weekday: 'long', day: 'numeric', month: 'long' })
    .format(new Date(`${date}T12:00:00`))
}
</script>

<template>
  <section class="relative overflow-hidden rounded-[2rem] border border-[#E6E3DE] bg-white">
    <span class="landing-orb landing-orb-coral"></span>
    <span class="landing-orb landing-orb-gold"></span>
    <span class="landing-orb landing-orb-blue"></span>
    <img :src="heroImage" alt="Members reading quietly together at a Meet and Read Nbo gathering" class="hero-image absolute inset-0 h-full w-full object-cover object-right" />
    <div class="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/15"></div>
    <div class="relative grid min-h-[620px] items-center px-6 py-10 md:px-12 md:py-16 lg:grid-cols-[1.15fr_0.85fr]">
      <div class="hero-copy">
        <p class="eyebrow-reveal mb-5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8A2945]">Nairobi's first silent book club</p>
        <h1 class="max-w-2xl font-display text-5xl leading-[0.95] tracking-tight text-[#1B1B18] md:text-7xl">
          Your quiet third space is waiting.
        </h1>
        <p class="mt-6 max-w-xl text-base leading-relaxed text-[#6F6C66] md:text-lg">
          Meet & Read Nbo is a rising third space for Nairobi readers: a soft place between home and work to read in comfortable silence, make something with your hands, and find your people.
        </p>
        <div class="mt-8 flex flex-col gap-3 sm:flex-row">
          <button @click="emit('explore')" class="rounded-xl bg-[#6B1F36] px-6 py-3.5 text-[12px] font-semibold uppercase tracking-wide text-white transition hover:bg-[#4C1025] active:scale-[0.98]">
            {{ session ? 'See the next meetup' : 'Explore the club' }}
          </button>
          <button v-if="session" @click="emit('rsvp')" class="rounded-xl border border-[#D7D3CB] bg-white/80 px-6 py-3.5 text-[12px] font-semibold uppercase tracking-wide text-[#1B1B18] transition hover:border-[#2B593F]">RSVP for this meetup</button>
          <button v-if="!user" @click="emit('join')" class="rounded-xl border border-[#D7D3CB] bg-white/70 px-6 py-3.5 text-[12px] font-semibold uppercase tracking-wide text-[#1B1B18] transition hover:border-[#2B593F]">
            Join the reading room
          </button>
        </div>
        <div class="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-[12px] text-[#6F6C66]">
          <span class="flex items-center gap-2"><span class="h-2 w-2 rounded-full bg-[#2B593F]"></span>Bring any book</span>
          <span>90 minutes of quiet reading</span>
          <span>Nairobi, Kenya</span>
        </div>
      </div>

      <aside class="session-card relative self-end rounded-2xl border border-white/15 bg-[#1B1B18]/95 p-6 text-[#F7F6F3] shadow-2xl shadow-[#1B1B18]/20 md:p-8">
        <div class="absolute right-5 top-5 font-display text-6xl italic text-[#DDEBDF]/20">“</div>
        <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B8CEBC]">{{ session ? 'Next gathering' : 'Our reading ritual' }}</p>
        <template v-if="session">
          <p class="mt-6 font-display text-3xl leading-tight">{{ session.location }}</p>
          <p class="mt-2 text-sm text-[#D9D6D0]">{{ readableDate(session.session_date) }}<span v-if="session.time"> · {{ session.time }}</span></p>
          <p v-if="session.activity" class="mt-6 border-t border-white/10 pt-5 text-sm leading-relaxed text-[#D9D6D0]">{{ session.activity }}</p>
        </template>
        <template v-else>
          <p class="mt-6 font-display text-3xl leading-tight">Read what you want, in comfortable silence, together.</p>
          <p class="mt-6 border-t border-white/10 pt-5 text-sm leading-relaxed text-[#D9D6D0]">New sessions are announced here. Create an account now so you are ready to RSVP when the next one opens.</p>
        </template>
      </aside>
    </div>
  </section>

  <section class="mt-10">
    <div class="mb-5 max-w-xl"><p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2B593F]">How it feels</p><h2 class="mt-2 font-display text-3xl text-[#1B1B18]">A gathering with room to breathe.</h2></div>
    <div class="grid gap-4 md:grid-cols-3">
      <article class="story-card rounded-2xl border border-[#E6E3DE] bg-white p-6"><p class="font-display text-3xl text-[#2B593F]">01</p><h3 class="mt-5 font-display text-xl">Arrive as you are</h3><p class="mt-2 text-[13px] leading-relaxed text-[#6F6C66]">Bring any book, order something warm, and settle into a cozy corner.</p></article>
      <article class="story-card rounded-2xl border border-[#E6E3DE] bg-white p-6"><p class="font-display text-3xl text-[#2B593F]">02</p><h3 class="mt-5 font-display text-xl">Read in company</h3><p class="mt-2 text-[13px] leading-relaxed text-[#6F6C66]">Ninety minutes of shared silence. No assigned reading. No pressure. Just your book.</p></article>
      <article class="story-card rounded-2xl border border-[#E6E3DE] bg-white p-6"><p class="font-display text-3xl text-[#2B593F]">03</p><h3 class="mt-5 font-display text-xl">Share the spark</h3><p class="mt-2 text-[13px] leading-relaxed text-[#6F6C66]">Make something small, swap recommendations, and leave feeling a little more connected.</p></article>
    </div>
  </section>

  <section class="mt-10 grid items-center gap-6 overflow-hidden rounded-[2rem] border border-[#E6E3DE] bg-white md:grid-cols-2">
    <img :src="craftImage" alt="Handmade bookmarks and collages at a Meet and Read Nbo craft table" class="h-full min-h-[300px] w-full object-cover" />
    <div class="p-7 md:p-10"><p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2B593F]">More than a book club</p><h2 class="mt-3 font-display text-3xl leading-tight text-[#1B1B18]">A little craft, a little conversation, a lot of good energy.</h2><p class="mt-4 text-[14px] leading-relaxed text-[#6F6C66]">After the quiet hour, we make gentle, low-pressure things together—collages, bookmarks, journaling, letter writing, and whatever fits the season. It is a simple way to rest your mind and meet people naturally.</p><p class="mt-6 font-display text-xl italic text-[#2B593F]">Not home. Not work. A place to belong.</p></div>
  </section>

  <section v-if="pastSessions.length" class="mt-10">
    <div class="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2B593F]">Community memories</p><h2 class="mt-2 font-display text-3xl text-[#1B1B18]">From our last gatherings.</h2></div><p class="max-w-sm text-[13px] leading-relaxed text-[#6F6C66]">A glimpse of the quiet reading, little crafts, and good company waiting for you.</p></div>
    <div class="grid gap-4 md:grid-cols-3">
      <article v-for="session in pastSessions.slice(0, 3)" :key="session.id" class="story-card overflow-hidden rounded-2xl border border-[#E6E3DE] bg-white">
        <div class="h-48 bg-[#EDF3EF]"><img v-if="session.session_media?.[0]?.image_url || session.image_url" :src="session.session_media?.[0]?.image_url || session.image_url" :alt="`Meet & Read gathering at ${session.location}`" class="h-full w-full object-cover" /><div v-else class="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,#C6DDCA,transparent_55%),#EDF3EF]"><span class="font-display text-4xl text-[#2B593F]">M&R</span></div></div>
        <div class="p-5"><p class="text-[10px] font-semibold uppercase tracking-[.18em] text-[#2B593F]">{{ readableDate(session.session_date) }}</p><h3 class="mt-2 font-display text-xl text-[#1B1B18]">{{ session.location }}</h3><p class="mt-1 text-[12px] text-[#6F6C66]">{{ session.activity || 'Silent reading together' }}</p><p class="mt-4 text-[11px] font-medium text-[#A09D97]">{{ session.books?.length || 0 }} {{ session.books?.length === 1 ? 'book logged' : 'books logged' }}</p></div>
      </article>
    </div>
  </section>
  <NewsletterSignup />
</template>

<style scoped>
.hero-image { animation: slowZoom 18s ease-in-out infinite alternate; }
.landing-orb { position: absolute; z-index: 1; display: block; pointer-events: none; border-radius: 999px; mix-blend-mode: multiply; opacity: .74; filter: blur(1px); }
.landing-orb-coral { width: 210px; height: 210px; top: -92px; right: 28%; background: #B84E6A; animation: orbitOne 16s ease-in-out infinite alternate; }
.landing-orb-gold { width: 96px; height: 96px; right: 4%; bottom: 44px; background: #F2BE58; animation: orbitTwo 12s ease-in-out infinite alternate; }
.landing-orb-blue { width: 70px; height: 70px; top: 18%; right: 9%; border-radius: 24px; background: #8C3E58; transform: rotate(18deg); animation: twirl 17s linear infinite; }
.hero-copy { animation: riseIn .8s cubic-bezier(.16, 1, .3, 1) both; }
.eyebrow-reveal { animation: fadeIn .8s .12s both; }
.session-card { animation: riseIn .85s .18s cubic-bezier(.16, 1, .3, 1) both; }
.story-card { transition: transform .3s ease, box-shadow .3s ease, border-color .3s ease; animation: riseIn .65s cubic-bezier(.16, 1, .3, 1) both; }
.story-card:nth-child(2) { animation-delay: .1s; }
.story-card:nth-child(3) { animation-delay: .2s; }
.story-card:hover { transform: translateY(-5px); box-shadow: 0 16px 30px rgba(27, 27, 24, .07); border-color: #C7D8C9; }
@keyframes slowZoom { from { transform: scale(1); } to { transform: scale(1.045); } }
@keyframes riseIn { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes orbitOne { from { transform: translate3d(0, 0, 0) rotate(0deg); } to { transform: translate3d(-36px, 34px, 0) rotate(25deg); } }
@keyframes orbitTwo { from { transform: translate3d(0, 0, 0) scale(1); } to { transform: translate3d(-14px, -26px, 0) scale(1.12); } }
@keyframes twirl { from { transform: rotate(18deg); } to { transform: rotate(378deg); } }
@media (prefers-reduced-motion: reduce) { .hero-image, .hero-copy, .eyebrow-reveal, .session-card, .story-card, .landing-orb { animation: none; } .story-card:hover { transform: none; } }
</style>
