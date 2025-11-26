// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'
import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
    compatibilityDate: '2024-11-01',
    devtools: { enabled: true },
    srcDir: 'src/web/',

    runtimeConfig: {
        // Private keys (server-side only)
        DATABASE_URL: process.env.DATABASE_URL,
    },

    app: {
        head: {
            link: [
                {
                    rel: 'stylesheet',
                    href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200',
                },
            ],
        },
    },

    vite: {
        plugins: [tailwindcss()],
    },

    css: [
        '@shoelace-style/shoelace/dist/themes/light.css',
        '@shoelace-style/shoelace/dist/themes/dark.css',
        '~/assets/css/tailwind.css',
        '~/assets/css/main.css',
    ],

    vue: {
        compilerOptions: {
            isCustomElement: (tag: string) => tag.startsWith('sl-'),
        },
    },
})
