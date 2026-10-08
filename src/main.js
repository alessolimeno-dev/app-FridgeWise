import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'

// Stili globali dell'applicazione (caricati dopo Bootstrap per garantire precedenza corretta)
import './assets/main.css'

// Componenti globali UI
import BadgeBase from './components/common/BadgeBase.vue'
import BaseButton from './components/common/BaseButton.vue'
import Cerca from './components/common/Cerca.vue'
import Modal from './components/common/Modal.vue'
import ModalePlanner from './components/food/ModalePlanner.vue'
import Toast from './components/common/Toast.vue'
import AppLogo from './components/common/AppLogo.vue'

const app = createApp(App)

// Registrazione globale dei componenti
app.component('BadgeBase', BadgeBase)
app.component('BaseButton', BaseButton)
app.component('Cerca', Cerca)
app.component('Modal', Modal)
app.component('ModalePlanner', ModalePlanner)
app.component('Toast', Toast)
app.component('AppLogo', AppLogo)

//Array globale categorie alimenti
app.config.globalProperties.$categorie = [
  'Carboidrati',
  'Latticini',
  'Uova',
  'Carne',
  'Pesce',
  'Legumi',
  'Verdura',
  'Frutta',
  'Dolci',
  'Bevande',
  'Altro'
]

//Array Luogo posizione alimento
app.config.globalProperties.$luoghi = [
  { val: 'frigo', label: '🧊 Frigo' },
  { val: 'dispensa', label: '🥫 Dispensa' },
  { val: 'freezer', label: '❄️ Freezer' }
]


app.use(createPinia())
app.use(router)

app.mount('#app')
