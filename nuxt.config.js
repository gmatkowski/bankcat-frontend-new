import colors from 'vuetify/es5/util/colors'
import { stringToBoolean } from './utils'

const isProxy = stringToBoolean(process.env.API_PROXY)

let proxy = {}

if (isProxy) {
  proxy = {
    proxy: {
      '/api/': { target: process.env.API_BASE_URL, secure: false }
    }
  }
}

export default {
  ssr: false,
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: '%s',
    title: 'Bankcat',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    { src: '~/plugins/veeValidate.js', mode: 'client' },
    { src: '~/plugins/notifier.js', mode: 'client' },
    { src: '~/plugins/apexcharts.js', mode: 'client' },
    { src: '~/plugins/watchDate.js', mode: 'client' },
    { src: '~/plugins/vuetify.js', mode: 'client' },

    { src: '~/filters/formatDate.js', mode: 'client' },
    { src: '~/filters/money.js', mode: 'client' },
    { src: '~/filters/limit.js', mode: 'client' }
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components

  transpile: ['vee-validate'],

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify'
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    '@nuxtjs/auth-next',
    '@nuxtjs/i18n'
  ],

  i18n: {
    strategy: 'no_prefix',
    locales: [
      {
        code: 'pl',
        file: 'pl.js',
        flag: 'pl'
      },
      {
        code: 'en',
        file: 'en.js',
        flag: 'us'
      }
    ],
    defaultLocale: 'pl',
    lazy: true,
    langDir: 'lang/',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'  // recommended
    },
    vueI18n: {
      fallbackLocale: 'en',
      debug: false,
      silentTranslationWarn: true,
      silentFallbackWarn: true
    }
  },

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    proxy: stringToBoolean(process.env.API_PROXY),
    baseURL: process.env.API_BASE_URL
  },

  router: {
    middleware: ['auth']
  },

  auth: {
    redirect: {
      login: '/auth/login',
      logout: '/',
      home: '/dashboard'
    },
    strategies: {
      local: {
        url: '/api',
        user: {
          property: false,
          autoFetch: true
        },
        token: {
          required: true,
          type: 'Bearer',
          property: 'access_token',
          global: true,
          maxAge: 3600 * 24 * 31 * 365
        },
        endpoints: {
          login: { url: '/api/login', method: 'post' },
          logout: { url: '/api/logout', method: 'post' },
          user: { url: '/api/users/me', method: 'get' }
        }
      }
    }
  },

  ...proxy,

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: true,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3
        }
      }
    }
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {}
}
