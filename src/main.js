/*Set up using Vue 3*/
import { createApp } from 'vue'
import App from './App.vue'

/*import the fontawesome core*/
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'

/*add icons to the library*/
library.add(fas, far, fab)

createApp(App)
    .component('font-awesome-icon', FontAwesomeIcon)
    .mount('#app')