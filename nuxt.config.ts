import { defineNuxtConfig } from 'nuxt'
// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
    css: [
        '~/assets/main.css',
        'bootstrap/dist/css/bootstrap.css'
    ],
    modules: ['bootstrap-vue-3/nuxt'],
    ssr: false,
    port: 8080,
})
