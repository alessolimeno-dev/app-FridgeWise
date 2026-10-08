<template>
  <header class="app-header sticky-top bg-white border-bottom py-2 mb-3">
    <!-- Variante 1: Header Principale Home -->
    <nav v-if="tipo === 'home'" class="navbar navbar-expand-md bg-transparent p-0">
      <div class="container-fluid p-0 d-flex justify-content-between align-items-center">
        <!-- Logo e Titolo FridgeWise con data odierna / sottotitolo -->
        <div class="d-flex align-items-center gap-2">
          <slot name="logo">
            <AppLogo />
          </slot>
          <div>
            <slot name="title">
              <h1 class="brand-title fs-4 fs-md-3 mb-0 text-dark fw-bold">{{ titolo || 'FridgeWise' }}</h1>
            </slot>
            <slot name="subtitle">
              <span v-if="sottotitolo" class="text-muted small fw-semibold d-block">
                <i class="bi bi-calendar3 text-primary me-1"></i> {{ sottotitolo }}
              </span>
            </slot>
          </div>
        </div>

        <div class="d-flex align-items-center gap-2 ms-auto">
          <!-- Desktop Navigation: Bottoni visibili da desktop (>= 900px) -->
          <div v-if="mostraDesktopNav" class="header-desktop-actions align-items-center gap-2">
            <slot name="desktop-actions">
              <BaseButton variant="secondary" to="/planner" icon="bi-calendar-week">
                Calendario pasti
              </BaseButton>
              <BaseButton variant="secondary" to="/spesa" icon="bi-cart3">
                Lista spesa
              </BaseButton>
              <BaseButton variant="primary" icon="bi-plus-lg" @click="$emit('aggiungi')">
                Aggiungi
              </BaseButton>
            </slot>
          </div>

          <!-- Mobile Hamburger Button visibile solo su mobile e tablet -->
          <slot name="menu-button">
            <button 
              type="button" 
              class="btn btn-light border p-2 rounded-3 hamburger-btn shadow-sm"
              @click="$emit('open-menu')"
              aria-label="Apri menu di navigazione"
            >
              <i class="bi bi-list fs-4 text-dark"></i>
            </button>
          </slot>
        </div>
      </div>
    </nav>

    <!-- Variante 2: Header Sottopagina con tasto Indietro e Titolo -->
    <div v-else class="d-flex justify-content-between align-items-center">
      <div class="d-flex align-items-center gap-2">
        <slot name="left">
          <BaseButton 
            v-if="backTo" 
            variant="back" 
            :to="backTo"
          >
           <span class="d-none d-md-inline">{{ backLabel }}</span> 
          </BaseButton>
        </slot>
      </div>

      <slot name="title">
        <h1 v-if="titolo" class="brand-title h4 mb-0 text-center flex-grow-1 px-2">
          {{ titolo }}
        </h1>
      </slot>

      <!-- Azioni a Destra: menu hamburger e badge -->
      <div class="d-flex align-items-center gap-2">
        <!-- Desktop Navigation: Bottoni visibili da desktop (>= 900px) -->
        <div v-if="mostraDesktopNav" class="header-desktop-actions align-items-center gap-2">
          <slot name="desktop-actions"></slot>
        </div>

        <slot name="actions"></slot>

        <!-- Mobile Hamburger Button visibile su telefono e tablet -->
        <button 
          v-if="mostraMenu" 
          type="button" 
          class="btn btn-light border p-2 rounded-3 hamburger-btn shadow-sm"
          @click="$emit('open-menu')"
          aria-label="Apri menu di navigazione"
        >
          <i class="bi bi-list fs-4 text-dark"></i>
        </button>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'Header',
  props: {
    // Tipo header: home oppure sottopagina / standard
    tipo: {
      type: String,
      default: 'sottopagina',
      validator: (val) => ['home', 'sottopagina', 'standard'].includes(val)
    },
    // Titolo principale
    titolo: {
      type: String,
      default: ''
    },
    // Sottotitolo = data odierna in home oppure testo libero in sottopagina
    sottotitolo: {
      type: String,
      default: ''
    },
    // Emoji logo per la variante home
    // emojiLogo: {
    //   type: String,
    //   default: '🧊'
    // },
    // Mostra la barra di navigazione desktop completa (Home)
    mostraDesktopNav: {
      type: Boolean,
      default: false
    },
    // Destinazione per il pulsante indietro (es. '/')
    backTo: {
      type: [String, Object],
      default: ''
    },
    // Etichetta del pulsante indietro
    backLabel: {
      type: String,
      default: 'Indietro'
    },
    // Mostra pulsante indietro (anche se non c'è backTo, emetterà @back)
    // mostraBack: {
    //   type: Boolean,
    //   default: false
    // },
    // Mostra pulsante menu/hamburger rapido a destra
    mostraMenu: {
      type: Boolean,
      default: false
    }
  },
  emits: ['open-menu', 'aggiungi']
}
</script>

<style scoped>
.app-header {
  margin-top: -1rem;
  margin-left: -0.75rem;
  margin-right: -0.75rem;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

</style>

