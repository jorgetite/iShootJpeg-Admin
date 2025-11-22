// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
    compatibilityDate: '2024-11-01',
    devtools: { enabled: true },
    srcDir: 'src/web/',
    modules: ['@nuxtjs/tailwindcss'],
    css: ['@shoelace-style/shoelace/dist/themes/light.css', '@shoelace-style/shoelace/dist/themes/dark.css'],
    vue: {
        compilerOptions: {
            isCustomElement: (tag: string) => tag.startsWith('sl-'),
        },
    },
})
