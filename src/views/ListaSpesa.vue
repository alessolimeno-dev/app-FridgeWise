<template>
  <div class="container py-3">
    <!-- Header Superiore -->
    <Header 
      titolo="Lista della Spesa" 
      back-to="/"
      :mostra-desktop-nav="true"
      :mostra-menu="true"
      @open-menu="isSidebarOpen = true"
      @aggiungi="focusAggiungiCibo"
    >
      <template #desktop-actions>
        <BaseButton 
          variant="secondary" 
          to="/" 
          icon="bi-house-door"
          aria-label="Home"
          title="Home"
        />
        <BaseButton 
          variant="secondary" 
          to="/planner" 
          icon="bi-calendar-week"
          aria-label="Calendario pasti"
          title="Calendario pasti"
        />
        <BaseButton 
          variant="primary" 
          :to="{ path: '/', query: { aggiungi: 'true' } }"
          icon="bi-plus-lg" 
          aria-label="Aggiungi alimento"
          title="Aggiungi alimento"
        />
      </template>
    </Header>

    <!-- sidebar componente -->
    <Sidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />

    <!-- completamento cibi - toast -->
    <div 
      v-if="mostraWarningDettagli" 
      class="card border-0 shadow-sm rounded-3 p-2 px-3 mb-3 d-flex flex-row align-items-center justify-content-between gap-2 warning-card-sottile animate-fade-in"
      role="alert"
    >
      <div class="d-flex align-items-center gap-2">
        <span class="fs-5 flex-shrink-0">💡</span>
        <div class="small text-dark">
          <strong class="text-dark">Promemoria:</strong> hai aggiunto cibi in dispensa. Ricordati di aggiornare i dettagli (categoria, peso e scadenza).
        </div>
      </div>
      <button 
        type="button" 
        class="btn-close btn-close-sm flex-shrink-0" 
        @click="mostraWarningDettagli = false" 
        aria-label="Chiudi avviso"
      ></button>
    </div>

    <!-- Tab per passare tra le 4 liste della spesa -->
    <div class="card bg-card-custom border-0 shadow-sm p-3 mb-3">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <span class="small fw-bold text-dark text-uppercase">
          <i class="bi bi-collection me-1 text-primary"></i> Le tue 4 Liste:
        </span>
        <span class="badge bg-light text-muted border rounded-pill px-3 py-1 small">
          <i class="bi bi-cart3 text-primary me-1"></i> {{ store.totaleElementiSpesa }} {{ store.totaleElementiSpesa === 1 ? 'alimento' : 'alimenti' }}
        </span>
      </div>

      <div class="d-flex gap-2 overflow-auto py-1 liste-tabs-container">
        <button
          type="button"
          v-for="lista in store.listeSpesa"
          :key="lista.id"
          class="btn btn-sm rounded-pill px-3 py-2 d-flex align-items-center gap-2 tab-lista-btn"
          :class="lista.id === store.idListaAttiva ? 'btn-custom-primary shadow-sm' : 'btn-outline-secondary'"
          @click="selezionaLista(lista.id)"
        >
          <span class="fw-semibold text-truncate max-w-tab-text">{{ lista.nome }}</span>
          <span 
            class="badge rounded-pill"
            :class="lista.id === store.idListaAttiva ? 'bg-white text-dark' : 'bg-secondary text-white'"
            style="font-size: 0.7rem;"
          >
            {{ lista.elementi ? lista.elementi.length : 0 }}
          </span>
        </button>
      </div>
    </div>

    <!-- Contenitore Lista Attiva -->
    <div class="card bg-card-custom border-0 shadow-sm p-3 p-md-4 mb-4">
      <!-- Intestazione Lista Attiva + Rinomina Lista -->
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 pb-2 border-bottom">
        <!-- Visualizzazione Titolo o Input per Rinominare -->
        <div v-if="!inModificaNomeLista" class="d-flex align-items-center gap-2">
          <h2 class="h5 fw-bold mb-0 text-dark">
            🛒 {{ listaAttiva.nome }}
          </h2>
          <button 
            type="button" 
            class="btn btn-sm text-primary p-1 border-0 bg-transparent"
            @click="avviaRinominaLista"
            title="Rinomina questa lista"
            aria-label="Rinomina lista"
          >
            <i class="bi bi-pencil-square"></i>
          </button>
        </div>

        <div v-else class="d-flex align-items-center gap-2 flex-grow-1 max-w-input-nome">
          <input 
            type="text" 
            class="form-control form-control-sm rounded-pill" 
            v-model.trim="nuovoNomeLista"
            placeholder="Nome lista..."
            @keydown.enter="confermaRinominaLista"
            @keydown.esc="inModificaNomeLista = false"
            autofocus
          >
          <button 
            type="button" 
            class="btn btn-sm btn-success rounded-circle p-1 d-flex align-items-center justify-content-center"
            style="width: 28px; height: 28px;"
            @click="confermaRinominaLista"
            title="Salva nome"
          >
            <i class="bi bi-check-lg"></i>
          </button>
          <button 
            type="button" 
            class="btn btn-sm btn-light border rounded-circle p-1 d-flex align-items-center justify-content-center"
            style="width: 28px; height: 28px;"
            @click="inModificaNomeLista = false"
            title="Annulla"
          >
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <span class="badge bg-light text-secondary border small">
          {{ elementiListaAttiva.length }} {{ elementiListaAttiva.length === 1 ? 'elemento' : 'elementi' }}
        </span>
      </div>

      <!-- Barra di Inserimento Rapido Nuovo Cibo -->
      <form @submit.prevent="aggiungiNuovoCibo" class="mb-3">
        <div class="input-group">
          <span class="input-group-text bg-white border-end-0 rounded-start-pill text-muted">
            <i class="bi bi-plus-circle-fill text-primary"></i>
          </span>
          <input 
            ref="inputNuovoCibo"
            type="text" 
            class="form-control py-2 border-start-0" 
            placeholder="Aggiungi articolo (es. Mele, Pasta, Burro...)" 
            v-model.trim="testoNuovoCibo"
          >
          <button 
            class="btn btn-custom-primary rounded-end-pill px-3 fw-bold" 
            type="submit"
            :disabled="!testoNuovoCibo"
          >
            + Aggiungi
          </button>
        </div>
      </form>

      <!-- Elenco delle Voci nella Lista -->
      <div v-if="elementiListaAttiva.length === 0" class="text-center py-4 bg-white rounded-3 p-3">
        <i class="bi bi-cart-x text-muted fs-1 mb-2 d-block"></i>
        <h3 class="h6 fw-bold text-dark mb-1">Lista vuota</h3>
        <p class="text-muted small mb-0">
          Non hai ancora inserito prodotti da comprare in <strong>{{ listaAttiva.nome }}</strong>.
        </p>
      </div>

      <!-- Elenco della spesa con layout a griglia Bootstrap  -->
      <div v-else class="row g-2">
        <div 
          v-for="elemento in elementiListaAttiva" 
          :key="elemento.id"
          class="col-12"
        >
          <VoceSpesa 
            :voce="elemento"
            :id-lista="store.idListaAttiva"
            @acquista="onAcquistaElemento"
            @modifica-testo="onModificaTestoElemento"
            @elimina="onEliminaElemento"
          />
        </div>
      </div>
    </div>

    <!-- Toast Feedback Notifiche -->
    <Toast 
      :message="messaggioToast" 
      @close="messaggioToast = ''" 
    />
  </div>
</template>

<script>
import { useFrigoStore } from '../stores/frigo.js'
import Header from '../components/layout/Header.vue'
import Sidebar from '../components/layout/Sidebar.vue'
import VoceSpesa from '../components/food/VoceSpesa.vue'

export default {
  name: 'ListaSpesa',
  components: {
    Header,
    Sidebar,
    VoceSpesa
  },
  data() {
    return {
      store: useFrigoStore(),
      isSidebarOpen: false,
      testoNuovoCibo: '',
      inModificaNomeLista: false, // attiva l'input per modificare il nome della lista
      nuovoNomeLista: '', // memorizza il nuovo nome temporaneo durante la modifica
      messaggioToast: '',
      mostraWarningDettagli: false
    }
  },
  computed: {
    // Restituisce l'oggetto della lista attualmente selezionata
    listaAttiva() {
      return this.store.listaSpesaAttiva
    },
    elementiListaAttiva() {
      return this.listaAttiva && this.listaAttiva.elementi ? this.listaAttiva.elementi : []
    }
  },
  async mounted() {
    this.store.caricaListeSpesa()
    if (!this.store.isLoaded) {
      await this.store.caricaAlimenti()
    }
  },
  methods: {
    selezionaLista(idLista) {
      this.inModificaNomeLista = false
      this.store.setListaAttiva(idLista)
    },
    // Avvia la modifica del nome aprendo l'input con il testo attuale
    avviaRinominaLista() {
      this.nuovoNomeLista = this.listaAttiva.nome
      this.inModificaNomeLista = true
    },
    confermaRinominaLista() {
      if (this.nuovoNomeLista && this.nuovoNomeLista.trim()) {
        this.store.rinominaListaSpesa(this.store.idListaAttiva, this.nuovoNomeLista)
      }
      this.inModificaNomeLista = false
    },
    aggiungiNuovoCibo() {
      if (!this.testoNuovoCibo) return
      this.store.aggiungiElementoSpesa(this.store.idListaAttiva, this.testoNuovoCibo)
      this.testoNuovoCibo = ''
    },
    // Spunta la voce dalla spesa e la inserisce automaticamente in dispensa
    onAcquistaElemento({ idLista, idElemento, nome }) {
      const nuovoAlimento = this.store.completaEAcquistaElemento(idLista, idElemento)
      if (nuovoAlimento) {
        this.mostraWarningDettagli = true
        this.messaggioToast = `'${nome}' aggiunto alla dispensa`
        setTimeout(() => {
          this.messaggioToast = ''
        }, 3500)
      }
    },
    onModificaTestoElemento({ idLista, idElemento, nuovoNome }) {
      this.store.modificaElementoSpesa(idLista, idElemento, nuovoNome)
    },
    onEliminaElemento({ idLista, idElemento }) {
      this.store.rimuoviElementoSpesa(idLista, idElemento)
    },
    focusAggiungiCibo() {
      this.$nextTick(() => {
        if (this.$refs.inputNuovoCibo) {
          this.$refs.inputNuovoCibo.scrollIntoView({ behavior: 'smooth', block: 'center' })
          this.$refs.inputNuovoCibo.focus()
        }
      })
    }
  }
}
</script>

<style scoped>
/* Tab selezione liste */
.liste-tabs-container {
  scrollbar-width: thin;
}

.tab-lista-btn {
  white-space: nowrap;
  transition: all 0.15s ease;
}

.max-w-tab-text {
  max-width: 140px;
}

.max-w-input-nome {
  max-width: 260px;
}

/* Card promemoria */
.warning-card-sottile {
  background-color: #fff9db !important;
  border-left: 4px solid #fcc419 !important;
  border: 1px solid #ffe066;
}

/* Animazioni */
.animate-fade-in {
  animation: fadeIn 0.25s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slideUpToast 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

</style>