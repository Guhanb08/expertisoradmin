<script setup lang="ts">
import { useNuxtApp } from '#app'
import { useSupabaseClient } from '#imports'
import LogoLight from '@images/logo-light.png'
import authV1BottomShape from '@images/svg/auth-v1-bottom-shape.svg?raw'
import authV1TopShape from '@images/svg/auth-v1-top-shape.svg?raw'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import { ref } from 'vue'
import type { VForm } from "vuetify/components/VForm"

definePageMeta({
  layout: 'blank',
  public: true,

})

const formSchema = ref({
  email: 'guhanb08@gmail.com',
  password: 'Guhan123',
  remember: false,
})

const isPasswordVisible = ref(false)

const supabase = useSupabaseClient()
const { $toast } = useNuxtApp()
const loading = ref(false)
const isErrorVisible = ref(false)
const errorMessage = ref('')
const formRef = ref<VForm>()

const login = async () => {
  isErrorVisible.value = false
  const formValidate = await formRef.value?.validate();
  if (!formValidate?.valid) return;

  try {
    loading.value = true
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formSchema.value.email,
      password: formSchema.value.password,
    })
    if (error) {
      throw new Error(error.message)
    }
    if (data && data.user) {
      // $toast.success('Login successful!')
      navigateTo('/')
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'Login failed.'
    isErrorVisible.value = true
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <div class="position-relative my-sm-16">
      <!-- 👉 Top shape -->
      <VNodeRenderer :nodes="h('div', { innerHTML: authV1TopShape })"
        class="text-primary auth-v1-top-shape d-none d-sm-block" />

      <!-- 👉 Bottom shape -->
      <VNodeRenderer :nodes="h('div', { innerHTML: authV1BottomShape })"
        class="text-primary auth-v1-bottom-shape d-none d-sm-block" />

      <!-- 👉 Auth Card -->
      <VCard class="auth-card pa-6" max-width="500">
        <!--   <VCardItem class="justify-center">

          <VCardTitle>
            <NuxtLink to="/">
              <div class="app-logo">
                <VNodeRenderer :nodes="themeConfig.app.logo" />
                <h1 class="app-logo-title">
                  {{ themeConfig.app.title }}
                </h1>
              </div>
            </NuxtLink>
          </VCardTitle>
        </VCardItem> -->
        <VCardItem class="justify-center">
          <VCardTitle>
            <NuxtLink to="/">
              <img :src="LogoLight" class="logo-width" alt="">
            </NuxtLink>
          </VCardTitle>
        </VCardItem>
        <VCardText class="mb-3 text-center">
          <h4 class="text-h4 mb-1">
            Welcome to <span class="text-capitalize">{{ themeConfig.app.title }}</span>! 👋🏻
          </h4>
          <p class="mb-0">
            Please sign-in to your account and explore the platform.
          </p>
        </VCardText>

        <VCardText>
          <VForm @submit.prevent="login" ref="formRef">
            <VRow>
              <VCol cols="12">
                <AppTextField v-model.trim="formSchema.email" autofocus label="Email or Username" type="email"
                  placeholder="Enter your email" autocomplete="email" :rules="[requiredValidator]" />
              </VCol>

              <VCol cols="12">
                <AppTextField v-model.trim="formSchema.password" label="Password" placeholder="Enter your password"
                  :type="isPasswordVisible ? 'text' : 'password'" autocomplete="new-password"
                  :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible" :rules="[requiredValidator]" />
              </VCol>
              <VCol cols="12">
                <div class="d-flex align-center justify-space-between flex-wrap">
                  <VCheckbox :id="useId()" v-model="formSchema.remember" label="Remember me" />
                  <NuxtLink class="text-primary" :to="{ name: 'login' }">
                    Forgot Password?
                  </NuxtLink>
                </div>
              </VCol>

              <VCol cols="12" v-if="isErrorVisible">
                <VAlert variant="tonal" color="error" density="compact" v-model="isErrorVisible">
                  {{ errorMessage }}
                </VAlert>
              </VCol>

              <VCol cols="12">
                <VBtn block type="submit" :loading="loading">
                  Login
                </VBtn>
              </VCol>

              <!-- create account -->
              <VCol cols="12" class="text-body-1 text-center">
                <span class="d-inline-block">
                  New to our platform?
                </span>
                <NuxtLink class="text-primary ms-1 d-inline-block text-body-1" :to="{ name: 'register' }">
                  Create an account
                </NuxtLink>
              </VCol>


            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </div>
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
.logo-width {
  width: 250px;
  max-width: 100%;
}

</style>
