module.exports = {

  server: {
    port: 322, // default: 3000
    host: '0.0.0.0', // default: localhost
  },

  mode: 'spa',
  /*
   ** Headers of the page
   */
  head: {
    //title: process.env.npm_package_name || '',
    meta: [
      {charset: 'utf-8'},
      {name: 'viewport', content: 'width=device-width, initial-scale=1'},
      {name: 'theme-color', content: '#060606'},
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || ''
      },
      {property: "og:title", content: process.env.npm_package_title},
      {property: "og:image", content: "/img/screen.png"}
    ],

    link: [
      {rel: 'icon', type: 'image/png', href: '/favicon.png'},
      {rel: 'mask-icon', type: 'image/png', href: '/favicon.png'},
    ],
    script: [

      { type: 'text/javascript', src: 'https://comments.app/js/widget.js?3', async: true, body: true, dataCommentsAppWebsite:"lom-GRms", dataLimit:"5"}, // Insert in body
      { type: 'text/javascript', src: 'https://cdnjs.cloudflare.com/ajax/libs/velocity/1.2.3/velocity.min.js', async: true, body: true}, // Insert in body
      { type: 'text/javascript', src: 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.14.1/lodash.min.js', async: true, body: true}, // Insert in body
      ]
  },
  /*ss
   ** Customize the progress-bar color
   */
  loading: {color: '#f34'},
  loadingIndicator: {
    name: 'wandering-cubes',
    color: '#f34',
    background: 'white'
  },

  /*
   ** Global CSS
   */
  css: [
    {src: '~/assets/css/styles.scss', lang: 'sass'},
    {src: '~/assets/css/alphaplay.css', lang: 'css'},
    {src: '~/assets/css/animate.css', lang: 'css'},
  ],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    {src: '~plugins/vue-chartjs.js', ssr: false},
    {src: '~/plugins/i18n.js', ssr: false},
    {src: '~plugins/localStorage.js', ssr: false},
    {src: '~plugins/utils.js', ssr: false}

  ],
  /*
   ** Nuxt.js dev-modules
   */


  buildModules: [
    '@nuxtjs/axios',
    '@nuxtjs/vuetify',
    '@aceforth/nuxt-optimized-images',
  ],
  axios: {
    // proxyHeaders: false
  },
  vuetify: {
    theme: {
      dark:true,
      themes: {
        light: {
          'red': '#DA3832',
          'yellow': '#F3D45F',
          'grey':'#E6E6E6',
          'background':'#ffffff',
          'panels':'#F3D45F',
        },
        dark:{

        },
        options: {
          variations: false,
          themeCache: {
            max: 10,
            maxAge: 1000 * 60 * 60, // 1 hour
          },
        }
      }
    }
  },

  /*
   ** Build configuration
   */
  build: {
    extend(config, ctx) {
    }
  },

  router: {              // customize nuxt.js router (vue-router).
    middleware: 'i18n'   // middleware all pages2 of the application
  },
};
