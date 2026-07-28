<script setup>
import { computed } from 'vue'

const props = defineProps({ session: { type: Object, required: true } })

const eventTimes = computed(() => {
  const start = new Date(`${props.session.session_date}T${props.session.start_time || '10:00'}:00`)
  const end = new Date(start.getTime() + 90 * 60 * 1000)
  const stamp = (date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  return { start, end, google: `${stamp(start)}/${stamp(end)}` }
})

const googleCalendarUrl = computed(() => {
  const params = new URLSearchParams({ action: 'TEMPLATE', text: 'Meet & Read Nbo — Silent Hour', dates: eventTimes.value.google, location: props.session.location || 'Nairobi', details: props.session.activity ? `Silent reading session · ${props.session.activity}` : 'Silent reading session' })
  return `https://calendar.google.com/calendar/render?${params}`
})

const downloadIcs = () => {
  const stamp = (date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const content = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT', `DTSTART:${stamp(eventTimes.value.start)}`, `DTEND:${stamp(eventTimes.value.end)}`, 'SUMMARY:Meet & Read Nbo — Silent Hour', `LOCATION:${props.session.location || 'Nairobi'}`, `DESCRIPTION:Silent reading session${props.session.activity ? ` — ${props.session.activity}` : ''}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n')
  const url = URL.createObjectURL(new Blob([content], { type: 'text/calendar;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'meet-and-read-nbo.ics'
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <a :href="googleCalendarUrl" target="_blank" rel="noopener noreferrer" class="rounded-lg border border-[#E6E3DE] bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-[#2B593F] transition hover:border-[#2B593F]">Google Calendar</a>
    <button @click="downloadIcs" class="rounded-lg border border-[#E6E3DE] bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-[#2B593F] transition hover:border-[#2B593F]">Apple / Outlook</button>
  </div>
</template>
