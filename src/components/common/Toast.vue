<template>
  <!-- integrazione di vue per animazione in e out dal dom -->
  <Transition name="toast-anim">
    <div 
      v-if="visibile" 
      class="toast-notification-custom alert border-0 shadow-lg d-flex align-items-center justify-content-center py-2 px-3 rounded-pill"
      :class="classeVariante"
      role="status"
      aria-live="polite"
    >
      <!-- il messaggio viene visualizzato solo se non è vuoto -->
       <!-- icona con stile bootstrap -->
      <i class="bi me-2 fs-5 flex-shrink-0" :class="iconaCalcolata"></i>

      <!-- Testo del messaggio o slot personalizzato -->
      <span class="small fw-semibold text-dark text-center text-truncate text-wrap">
        <slot>{{ message }}</slot>
      </span>
    </div>
  </Transition>
</template>

<script>
export default {
  name: 'Toast',
  props: {
    // Messaggio da visualizzare
    message: {
      type: String,
      default: ''
    },
    // Variante di stile del messaggio: 'success', 'warning', 'info', 'danger'
    variant: {
      type: String,
      default: 'success',
      validator: (val) => ['success', 'warning', 'info', 'danger'].includes(val)
    },
    // Durata in millisecondi prima della chiusura automatica (0 per disattivare il timer)
    duration: {
      type: Number,
      default: 3000
    },
    // Icona personalizzata opzionale (es. 'bi-cart-check')
    icon: {
      type: String,
      default: ''
    }
  },
  emits: ['close', 'update:message'],
  data() {
    return {
      timer: null
    } //memorizza il stTimeout peer poterlo fermare e resettare
  },
  computed: {
    visibile() {
      return !!this.message && this.message.trim().length > 0
    },
    classeVariante() {
      switch (this.variant) {
        case 'warning':
          return 'toast-warning'
        case 'danger':
          return 'toast-danger'
        case 'info':
          return 'toast-info'
        case 'success':
        default:
          return 'toast-success'
      }
    }, //cerca le varianti di stile del messaggio e le applica
    iconaCalcolata() {
      if (this.icon) return this.icon
      switch (this.variant) {
        case 'warning':
          return 'bi-exclamation-triangle-fill text-warning'
        case 'danger':
          return 'bi-x-circle-fill text-danger'
        case 'info':
          return 'bi-info-circle-fill text-primary'
        case 'success':
        default:
          return 'bi-check-circle-fill text-success'
      }
    }, //cerca le icone di bootstrap in base allo stile del messaggio
  },
  watch: {
    message(nuovoValore) {
      this.resetTimer()
      if (nuovoValore && this.duration > 0) {
        this.avviaTimer()
      }
    }
  },
  mounted() {
    if (this.visibile && this.duration > 0) {
      this.avviaTimer()
    }
  },
  beforeUnmount() {
    this.resetTimer()
  }, //reset del timer quando l'utente cambia pagina
  methods: {
    avviaTimer() {
      this.resetTimer()
      this.timer = setTimeout(() => {
        this.chiudi()
      }, this.duration)
    },
    resetTimer() {
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
    },
    chiudi() {
      this.resetTimer()
      this.$emit('update:message', '')
      this.$emit('close')
    }
  }
}
</script>

<style scoped>

/* Varianti di colore */
.toast-success {
  background-color: #e8f5e9 !important;
  border: 1px solid #c8e6c9 !important;
}

.toast-warning {
  background-color: #fff9db !important;
  border: 1px solid #ffe066 !important;
}

.toast-danger {
  background-color: #fde8e8 !important;
  border: 1px solid #f8b4b4 !important;
}

.toast-info {
  background-color: #e3f2fd !important;
  border: 1px solid #bbdefb !important;
}

/* Animazione di entrata e uscita */
.toast-anim-enter-active {
  animation: slideUpToast 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-anim-leave-active {
  animation: slideDownToast 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

</style>

