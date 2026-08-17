<script setup>
import { ref } from 'vue'

const props = defineProps({
  supabase: {
    type: Object,
    required: true
  }
  ,
  initialMode: {
    type: String,
    default: 'signin'
  }
})

const emit = defineEmits(['close'])

const mode = ref(props.initialMode)
const email = ref('')
const password = ref('')
const authError = ref('')
const authLoading = ref(false)

const isSignUp = () => mode.value === 'signup'
const isRecovery = () => mode.value === 'recovery'

const handleAuth = async () => {
  authError.value = ''
  authLoading.value = true
  
  if (isRecovery()) {
    const { error } = await props.supabase.auth.updateUser({ password: password.value })
    if (error) authError.value = error.message
    else { alert('Your password has been updated.'); emit('close') }
  } else if (isSignUp()) {
    const { error } = await props.supabase.auth.signUp({
      email: email.value,
      password: password.value,
    })
    if (error) authError.value = error.message
    else {
      alert('Account created successfully! Check your inbox if email confirmation is enabled.')
      emit('close')
    }
  } else {
    const { error } = await props.supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    if (error) authError.value = error.message
    else emit('close')
  }
  
  authLoading.value = false
}

const requestPasswordReset = async () => {
  authError.value = ''
  authLoading.value = true
  const { error } = await props.supabase.auth.resetPasswordForEmail(email.value, { redirectTo: window.location.origin })
  authLoading.value = false
  if (error) authError.value = error.message
  else authError.value = 'Password reset link sent. Check your inbox.'
}
</script>

<template>
  <div 
    class="fixed inset-0 bg-[#1B1B18]/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" 
    @click.self="emit('close')"
  >
    <div class="bg-white w-full max-w-sm rounded-2xl border border-[#E6E3DE] p-7 shadow-xl relative">
      
      <!-- Close -->
      <button @click="emit('close')" class="absolute top-4 right-4 text-[#A09D97] hover:text-[#1B1B18] transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      <h3 class="font-display text-xl text-[#1B1B18] mb-1">
        {{ isRecovery() ? 'Choose a New Password' : (isSignUp() ? 'Create Account' : 'Welcome Back') }}
      </h3>
      <p class="text-[13px] text-[#6F6C66] mb-6">
        {{ isRecovery() ? 'Set a new secure password for your account.' : (isSignUp() ? 'Join the club to log your reads.' : 'Sign in to sync your reading.') }}
      </p>

      <form @submit.prevent="handleAuth" class="space-y-4">
        <div v-if="!isRecovery()">
          <label class="block text-[11px] tracking-[0.15em] uppercase font-semibold text-[#A09D97] mb-1.5">Email</label>
          <input 
            v-model="email" type="email" required 
            class="w-full px-3.5 py-2.5 bg-[#F7F6F3] text-[#1B1B18] border border-[#E6E3DE] rounded-xl focus:outline-none focus:border-[#2B593F] focus:ring-1 focus:ring-[#2B593F]/20 text-sm transition-colors placeholder:text-[#C5C2BC]" 
            placeholder="name@example.com"
          />
        </div>

        <div>
          <label class="block text-[11px] tracking-[0.15em] uppercase font-semibold text-[#A09D97] mb-1.5">Password</label>
          <input 
            v-model="password" type="password" required 
            class="w-full px-3.5 py-2.5 bg-[#F7F6F3] text-[#1B1B18] border border-[#E6E3DE] rounded-xl focus:outline-none focus:border-[#2B593F] focus:ring-1 focus:ring-[#2B593F]/20 text-sm transition-colors placeholder:text-[#C5C2BC]" 
            placeholder="••••••••"
          />
        </div>

        <p v-if="authError" class="text-[12px] font-medium text-[#B84233] bg-[#FBF0ED] p-3 rounded-lg border border-[#B84233]/10">
          {{ authError }}
        </p>

        <button 
          type="submit" :disabled="authLoading" 
          class="w-full bg-[#2B593F] hover:bg-[#1D4230] text-white font-semibold text-sm py-3 rounded-xl transition-all duration-200 disabled:opacity-60 active:scale-[0.98]"
        >
          {{ authLoading ? 'Processing...' : (isRecovery() ? 'Update Password' : (isSignUp() ? 'Create Account' : 'Sign In')) }}
        </button>
        <button v-if="!isSignUp() && !isRecovery()" type="button" @click="requestPasswordReset" :disabled="authLoading || !email" class="w-full text-center text-[12px] font-medium text-[#6B1F36] hover:text-[#4C1025] disabled:opacity-50">Forgot password?</button>
      </form>

      <div class="mt-5 pt-4 border-t border-[#E6E3DE] text-center">
        <button v-if="!isRecovery()" @click="mode = isSignUp() ? 'signin' : 'signup'" class="text-[12px] text-[#6B1F36] hover:text-[#4C1025] font-medium transition-colors">
          {{ isSignUp() ? 'Already have an account? Sign In' : "Don't have an account? Sign Up" }}
        </button>
      </div>
    </div>
  </div>
</template>
