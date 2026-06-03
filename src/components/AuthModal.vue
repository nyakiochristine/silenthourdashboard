<script setup>
import { ref } from 'vue'

const props = defineProps({
  supabase: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

// Auth UI state variables encapsulated here
const isSignUp = ref(false)
const email = ref('')
const password = ref('')
const authError = ref('')
const authLoading = ref(false)

const handleAuth = async () => {
  authError.value = ''
  authLoading.value = true
  
  if (isSignUp.value) {
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
</script>

<template>
  <div class="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
    <div class="bg-[#fcfbfa] w-full max-w-sm rounded-2xl border border-stone-200 p-6 shadow-2xl relative">
      
      <!-- Close Button -->
      <button @click="emit('close')" class="absolute top-4 right-4 text-stone-400 hover:text-stone-600 text-lg font-bold">
        &times;
      </button>

      <h3 class="font-serif font-bold text-xl text-stone-900 mb-1 text-center">
        {{ isSignUp ? 'Create Club Account' : 'Welcome Back' }}
      </h3>
      <p class="text-xs text-stone-500 text-center mb-6">
        {{ isSignUp ? 'Join us to personalize your reading sessions.' : 'Sign in to sync your current read.' }}
      </p>

      <form @submit.prevent="handleAuth" class="space-y-4">
        <div>
          <label class="block text-[10px] uppercase tracking-wider font-bold text-stone-500 mb-1">Email Address</label>
          <input v-model="email" type="email" required class="w-full px-3 py-2 bg-white text-stone-800 border border-stone-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm" placeholder="name@example.com"/>
        </div>

        <div>
          <label class="block text-[10px] uppercase tracking-wider font-bold text-stone-500 mb-1">Password</label>
          <input v-model="password" type="password" required class="w-full px-3 py-2 bg-white text-stone-800 border border-stone-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm" placeholder="••••••••"/>
        </div>

        <p v-if="authError" class="text-xs font-medium text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
          ⚠️ {{ authError }}
        </p>

        <button type="submit" :disabled="authLoading" class="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white font-semibold text-sm py-2.5 rounded-xl shadow transition-all duration-200">
          {{ authLoading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In') }}
        </button>
      </form>

      <div class="mt-5 pt-3 border-t border-stone-200/60 text-center">
        <button @click="isSignUp = !isSignUp" class="text-xs text-indigo-600 hover:text-indigo-800 underline font-medium">
          {{ isSignUp ? 'Already have an account? Sign In' : "Don't have an account yet? Sign Up" }}
        </button>
      </div>
    </div>
  </div>
</template>