<template>
  <div 
    v-if="isOpen" 
    class="sidebar-backdrop" 
    @click="chiudi"
  >
    <div 
      class="sidebar-offcanvas p-3 bg-white shadow-lg d-flex flex-column" 
      @click.stop
    >
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center pb-3 border-bottom mb-3">
        <div class="d-flex align-items-center gap-2">
          <AppLogo></AppLogo>
          <span class="brand-title h5 mb-0 text-dark">FridgeWise</span>
        </div>
        <button 
          type="button" 
          class="btn-close" 
          aria-label="Chiudi menu" 
          @click="chiudi"
        ></button>
      </div>

      <!-- Menu voci Sidebar -->
      <div class="d-flex flex-column gap-2 mb-4">
        <BaseButton 
          variant="primary" 
          icon="bi-plus-circle"
          class="w-100 justify-content-start py-2 px-3 shadow-sm"
          @click="apriAggiungi"
        >
          Aggiungi alimento
        </BaseButton>

        <!-- <BaseButton 
          variant="secondary" 
          to="/" 
          icon="bi-house-door"
          class="w-100 justify-content-start py-2 px-3"
          @click="chiudi"
        >
          Dispensa
        </BaseButton> -->

        <BaseButton 
          variant="secondary" 
          to="/planner" 
          icon="bi-calendar-week"
          class="w-100 justify-content-start py-2 px-3"
          @click="chiudi"
        >
          Calendario pasti
        </BaseButton>

        <BaseButton 
          variant="secondary" 
          to="/spesa" 
          icon="bi-cart3"
          class="w-100 justify-content-start py-2 px-3"
          @click="chiudi"
        >
          Liste della spesa
        </BaseButton>

        <BaseButton 
          variant="disabled"
          icon="bi-journal-text"
          class="w-100 justify-content-start py-2 px-3"
          style="cursor:not-allowed; pointer-events:auto;"
        >
          Scopri ricette
        </BaseButton>

        <BaseButton 
          variant="disabled"
          icon="bi-gear"
          class="w-100 justify-content-start py-2 px-3"
          style="cursor:not-allowed; pointer-events:auto;"
        >
          Impostazioni
        </BaseButton>

      </div>

      <!-- Barra di Ricerca integrata in fondo alla Sidebar (da main) -->
      <div class="mt-auto pt-3 border-top mb-2">
        <label class="form-label small fw-bold text-dark mb-1">
          <i class="bi bi-search text-primary me-1"></i> Cerca alimento
        </label>
        <Cerca 
          v-model="searchQuery" 
          placeholder="Es. Latte, Spaghetti..."
          @search="onSearchInput"
          @clear="azzeraRicerca"
          @enter="chiudiConRicerca"
        />
      </div>

      <!-- Footer -->
      <div class="pt-1">
        <Footer class="sidebar-footer" @close-sidebar="chiudi" />
      </div>
    </div>
  </div>
</template>

<script>
import Footer from './footer.vue'

export default {
  name: 'Sidebar',
  components: {
    Footer
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    modelValueSearch: {
      type: String,
      default: ''
    }
  },
  emits: ['close', 'update:modelValueSearch', 'search', 'apri-aggiungi'],
  data() {
    return {
      searchQuery: this.modelValueSearch || '',
      sidebarSearchTimer: null
    }
  },
  watch: {
    modelValueSearch(newVal) {
      this.searchQuery = newVal || ''
    }
  },
  methods: {
    apriAggiungi() {
      this.chiudi()
      if (this.$route && this.$route.path !== '/') {
        this.$router.push({ path: '/', query: { aggiungi: 'true' } })
      } else {
        this.$emit('apri-aggiungi')
      }
    },
    chiudi() {
      if (this.sidebarSearchTimer) {
        clearTimeout(this.sidebarSearchTimer)
      }
      this.$emit('close')
    },
    azzeraRicerca() {
      this.searchQuery = ''
      this.$emit('update:modelValueSearch', '')
      this.$emit('search', '')
    },
    onSearchInput() {
      this.$emit('update:modelValueSearch', this.searchQuery)
      this.$emit('search', this.searchQuery)
      if (this.sidebarSearchTimer) {
        clearTimeout(this.sidebarSearchTimer)
      }
      // Se l'utente smette di digitare per 850ms, chiudiamo la sidebar per mostrare subito i risultati
      this.sidebarSearchTimer = setTimeout(() => {
        if (this.isOpen && this.searchQuery) {
          this.chiudiConRicerca()
        }
      }, 850)
    },
    chiudiConRicerca() {
      if (this.sidebarSearchTimer) {
        clearTimeout(this.sidebarSearchTimer)
      }
      this.$emit('close')
      if (this.$route && this.$route.path !== '/') {
        this.$router.push('/')
      }
    }
  }
}
</script>
