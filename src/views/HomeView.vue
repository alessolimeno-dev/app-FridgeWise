<template>
  <div class="container py-3">
    <!-- Header Responsive  -->
    <Header 
      tipo="home" 
      :sottotitolo="dataOdiernaFormattata" 
      :mostra-desktop-nav="true"
      @open-menu="isSidebarOpen = true"
      @aggiungi="apriModalNuovoAlimento"
    />

    <!-- Mobile Sidebar -->
    <Sidebar 
      :is-open="isSidebarOpen" 
      :model-value-search="filtriAttivi.searchQuery"
      @update:model-value-search="filtriAttivi.searchQuery = $event"
      @apri-aggiungi="apriModalNuovoAlimento"
      @close="isSidebarOpen = false" 
    />

    <!-- barra dei filtri e selezione-->
    <Filtri 
      :is-selection-mode="isSelectionMode" 
      :model-value-search="filtriAttivi.searchQuery"
      @filtra="aggiornaFiltri" 
      @toggle-seleziona="toggleSelectionMode" 
    />

    <!-- Stato caricamento asincrono GET con Axios -->
    <div v-if="store.loading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Caricamento alimenti in corso...</span>
      </div>
      <p class="text-muted small mt-2">Caricamento dispensa in corso...</p>
    </div>

    <!-- Stato errore -->
    <div v-else-if="store.error" class="alert alert-danger p-3 small text-center rounded-3">
      <i class="bi bi-exclamation-triangle-fill me-1"></i> {{ store.error }}
    </div>

    <!-- Slista alimenti unica ordinata per scadenza -->
    <div v-else class="mt-2" id="lista-alimenti">
      <div class="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
        <p class="text-muted small mb-0">
          Alimenti trovati: <strong>{{ alimentiFiltrati.length }}</strong>
          <span v-if="alimentiFiltrati.length > 4 && !isExpanded" class="text-secondary ms-1">
            (mostrati 4)
          </span>
        </p>
      </div>

      <!-- not found -->
      <div v-if="alimentiFiltrati.length === 0" class="card bg-card-custom border-0 p-4 text-center">
        <p class="text-muted mb-0">Nessun alimento corrisponde ai filtri selezionati.</p>
      </div>

      <!-- Elenco card alimenti con componente FoodCard con toggle per seleziona -->
      <div v-else class="d-flex flex-column gap-3">
        <FoodCard 
          v-for="cibo in alimentiVisualizzati" 
          :key="cibo.id"
          :id="`cibo-${cibo.id}`"
          :alimento="cibo"
          :is-selection-mode="isSelectionMode"
          :is-selected="isSelected(cibo.id)"
          @select="onCardClick(cibo.id)"
          @toggle-select="toggleSelectAlimento(cibo.id)"
          @edit="apriModalModifica(cibo)"
        />
      </div>

      <!-- Controlli Espansione / Chiusura Lista -->
      <div v-if="alimentiFiltrati.length > 4" class="mt-2 d-flex justify-content-center">
        <!-- Pulsante Freccia in giù per espandere -->
        <button 
          v-if="!isExpanded"
          type="button" 
          class="btn btn-toggle-icon shadow-sm d-flex align-items-center justify-content-center"
          @click="isExpanded = true"
          aria-label="Mostra tutti gli alimenti"
          title="Mostra tutti gli alimenti"
        >
          <i class="bi bi-chevron-down"></i>
        </button>

        <!-- Pulsante Freccia in su per comprimere -->
        <button 
          v-else
          type="button" 
          class="btn btn-toggle-icon shadow-sm d-flex align-items-center justify-content-center"
          @click="chiudiLista"
          aria-label="Mostra meno alimenti"
          title="Mostra meno alimenti"
        >
          <i class="bi bi-chevron-up"></i>
        </button>
      </div>
    </div>

    <!-- pasti di oggi - lista scorrevole -->
    <div class="card bg-card-custom border-0 shadow-sm mb-4 p-3 mt-4">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <div class="d-flex align-items-center gap-2">
          <span class="badge bg-primary-subtle text-primary border rounded-pill px-2 py-1">
            {{ pastiOggi.length }}
          </span>
          <h2 class="h6 mb-0 fw-bold">Pasti di Oggi</h2>
        </div>
        <router-link 
          :to="`/planner?date=${oggiISO}`" 
          class="btn btn-sm btn-link text-decoration-none p-0 fw-bold text-primary"
        >
          Gestisci Planner <i class="bi bi-arrow-right"></i>
        </router-link>
      </div>

      <!-- lo scorrimento -->
      <div v-if="pastiOggi.length > 0" class="horizontal-scroll-container d-flex flex-nowrap gap-3 py-2 px-1">
        <PastoCard
          v-for="pasto in pastiOggi" 
          :key="pasto.id"
          :pasto="pasto"
          :editable="false"
          class="meal-horizontal-card flex-shrink-0 cursor-pointer"
          @click="apriPlannerData(oggiISO)"
          role="button"
          tabindex="0"
          @keydown.enter="apriPlannerData(oggiISO)"
        />
      </div>

      <!-- se pasti oggi è vuoto -->
      <div v-else class="bg-white rounded-3 p-3 text-center my-1">
        <p class="text-muted small mb-2">Nessun pasto pianificato per oggi.</p>
        <BaseButton variant="secondary" :to="`/planner?date=${oggiISO}`" icon="bi-plus-circle">
          Pianifica pasti di oggi
        </BaseButton>
      </div>
    </div>

    <!-- Search Bar Flottante Espandibile in basso a destra (visibile solo su mobile, scompare su PC) -->
    <div 
      v-if="!isSidebarOpen && !isSelectionMode"
      class="floating-search-container d-md-none"
    >
      <!-- Stato Chiuso: rosso con X se è presente testo cercato, blu con lente se vuoto -->
      <button 
        v-if="!isSearchExpanded"
        type="button" 
        class="btn btn-floating-circle shadow-lg d-flex align-items-center justify-content-center"
        :class="{ 'btn-floating-danger': filtriAttivi.searchQuery }"
        @click="gestisciClickFloatingButton($event)"
        :aria-label="filtriAttivi.searchQuery ? 'Rimuovi filtro ricerca' : 'Cerca alimenti'"
        :title="filtriAttivi.searchQuery ? 'Elimina testo e rimuovi filtro' : 'Cerca alimento'"
      >
        <i 
          class="bi fs-5 text-white" 
          :class="filtriAttivi.searchQuery ? 'bi-x-lg' : 'bi-search'"
        ></i>
      </button>

      <!-- Stato Espanso: Rettangolo con input text -->
      <div 
        v-else 
        class="floating-search-pill shadow-lg d-flex align-items-center bg-white px-3 py-1 border animate-expand"
      >
        <i class="bi bi-search text-muted me-2"></i>
        <input 
          id="floating-search-input"
          ref="floatingSearchInput"
          type="text" 
          class="form-control form-control-sm border-0 shadow-none p-0 floating-input" 
          placeholder="Cerca alimento..." 
          v-model.trim="filtriAttivi.searchQuery"
          @keydown.enter="chiudiRicercaFlottante"
          @keydown.esc="chiudiRicercaFlottante"
        >
        <!-- Pulsante azzera testo se presente -->
        <button 
          v-if="filtriAttivi.searchQuery" 
          type="button" 
          class="btn btn-link text-muted p-0 ms-1 text-decoration-none"
          @click="filtriAttivi.searchQuery = ''"
          title="Cancella testo"
        >
          <i class="bi bi-x-circle-fill"></i>
        </button>
        <!-- Pulsante chiusura rettangolo di ricerca -->
        <button 
          type="button" 
          class="btn btn-link text-muted p-0 ms-2 text-decoration-none"
          @click="chiudiRicercaFlottante"
          title="Chiudi ricerca"
        >
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
    </div>

    <!-- Barra Azioni Flottante Inferiore per Selezione Multipla -->
    <div 
      v-if="isSelectionMode" 
      class="selection-action-bar-wrapper"
    >
      <div class="card selection-action-bar col-auto bg-white shadow-lg border p-2 rounded-4 d-flex flex-row justify-content-center align-items-center animate-slide-up">
        <div class="d-flex align-items-center gap-1 gap-sm-2">
          <BaseButton
            variant="back"
            size="sm" 
            @click="annullaSelezione"
          >
            <span class="d-none d-md-inline">Annulla</span>
          </BaseButton>
          <BaseButton
            variant="secondary"
            size="sm"
            @click="apriModalAssegnaGiorno"
            :disabled="selectedIds.length === 0"
          >
            <i class="bi bi-calendar-plus me-1"></i>
            <span class="d-none d-md-inline">Assegna a un giorno</span>
            <span class="d-inline d-md-none">Assegna</span>
          </BaseButton>
          <BaseButton 
            class="bg-danger border-danger text-white shadow-sm"
            :disabled="selectedIds.length === 0"
            @click="apriModalConfermaElimina"
          >
            <i class="bi bi-trash me-1"></i> Elimina
        </BaseButton>
        </div>
      </div>
    </div>

    <!-- Modale Conferma Eliminazione Multipla -->
    <div 
      v-if="mostraModalElimina" 
      class="modal-backdrop-custom d-flex align-items-center justify-content-center p-3"
      @click.self="mostraModalElimina = false"
    >
      <div class="card bg-white border-0 shadow-lg p-4 rounded-4 w-100 max-w-modal animate-in">
        <div class="text-center mb-3">
          <div class="delete-icon-badge mx-auto mb-2 d-flex align-items-center justify-content-center">
            <i class="bi bi-trash3-fill text-danger fs-3"></i>
          </div>
          <h3 class="h5 fw-bold text-dark mb-1">Conferma eliminazione</h3>
          <p class="text-muted small mb-0">
            Sei sicuro di voler eliminare definitivamente
            <strong>{{ selectedIds.length }} {{ selectedIds.length === 1 ? 'alimento' : 'alimenti' }}</strong>
            dal frigo/dispensa? L'azione non può essere annullata.
          </p>
        </div>

        <!-- anteprima alimenti da eliminare -->
        <div class="bg-light rounded-3 p-2 mb-3 max-h-preview overflow-auto border">
          <ul class="list-unstyled mb-0 small">
            <li 
              v-for="cibo in alimentiSelezionati" 
              :key="cibo.id"
              class="d-flex justify-content-between align-items-center py-1 px-2 border-bottom"
            >
              <span class="fw-semibold text-dark text-truncate food-title">{{ cibo.nome }}</span>
              <span class="badge bg-white text-muted border ms-2" style="font-size: 0.72rem;">
                {{ cibo.peso || (cibo.quantita + ' pz') }}
              </span>
            </li>
          </ul>
        </div>

        <div class="d-flex justify-content-end gap-2">
          <BaseButton 
            @click="mostraModalElimina = false"
          >
            No, annulla
          </BaseButton>
          <!-- type="button" 
            class="btn btn-light btn-sm px-3 rounded-pill"  -->
          <BaseButton
            @click="confermaEliminaSelezionati"
          >
            Sì, elimina
          </BaseButton>
          <!-- type="button"
            class="btn btn-danger btn-sm px-4 fw-bold rounded-pill shadow-sm" -->
        </div>
      </div>
    </div>

    <!--  Assegna a un giorno: variante del componente ModalePlanner -->
    <ModalePlanner 
      v-model="mostraModalAssegnaGiorno" 
      variante="assegnaGiorno"
      :alimenti-selezionati="alimentiSelezionati"
      :tipi-pasto="store.tipiPastoPredefiniti"
      :data-iniziale="assegnaData"
      :tipo-pasto-iniziale="assegnaTipoPasto"
      @conferma="confermaAssegnaGiorno"
    />

    <!-- Modifica Alimento: in ascolto della variabile e richiamato da @edit sulla food card -->
    <Modal 
      v-model="mostraModalAlimento" 
      variante="formAlimento"
      :alimento-iniziale="alimentoInModifica"
      @salva-alimento="salvaAlimento" 
    />

    <!-- Toast Feedback Notifiche -->
    <Toast 
      :message="messaggioConferma" 
      @close="messaggioConferma = ''" 
    />
  </div>
</template>

<script>
import Header from '../components/layout/Header.vue'
import Filtri from '../components/food/Filtri.vue'
import FoodCard from '../components/food/FoodCard.vue'
import Sidebar from '../components/layout/Sidebar.vue'
import PastoCard from '../components/food/PastoCard.vue'
import { useFrigoStore } from '../stores/frigo.js'
import { getOggiISO, formatDataBella, calcolaGiorniDiff, formatDataBreve } from '../utils/dateUtils.js'

export default {
  name: 'HomeView',
  components: {
    Header,
    Filtri,
    FoodCard,
    Sidebar,
    PastoCard
  },
  data() {
    return {
      store: useFrigoStore(),
      isSidebarOpen: false,
      isExpanded: false,
      isSearchExpanded: false,
      isSelectionMode: false,
      selectedIds: [],
      idUltimoAlimentoAggiunto: null,
      mostraModalElimina: false,
      mostraModalAssegnaGiorno: false,
      mostraModalAlimento: false,
      alimentoInModifica: null,
      assegnaData: getOggiISO(),
      assegnaTipoPasto: 'Pranzo',
      messaggioConferma: '',
      filtriAttivi: {
        searchQuery: '',
        selectedLuogo: 'tutti',
        selectedCategoria: ''
      }
    }
  },
  computed: {
    oggiISO() {
      return getOggiISO()
    },
    dataOdiernaFormattata() {
      return formatDataBella(this.oggiISO)
    },
    pastiOggi() {
      return this.store.pastiOggi
    },
    
    alimentiSelezionati() {
      const idsSet = new Set(this.selectedIds.map((id) => String(id)))
      return this.store.alimenti.filter((item) => idsSet.has(String(item.id)))
    },
    alimentiFiltrati() {
      const query = this.filtriAttivi.searchQuery ? this.filtriAttivi.searchQuery.toLowerCase().trim() : ''
      const luogoFilter = this.filtriAttivi.selectedLuogo ? this.filtriAttivi.selectedLuogo.toLowerCase() : 'tutti'
      const categoriaFilter = this.filtriAttivi.selectedCategoria

      // Filtri combinati: ricerca testuale, luogo e categoria
      const filtrati = this.store.alimenti.filter((item) => {
        const matchTesto = !query || item.nome?.toLowerCase().includes(query)
        const matchLuogo = luogoFilter === 'tutti' || item.luogo?.toLowerCase() === luogoFilter
        const matchCategoria = !categoriaFilter || item.categoria === categoriaFilter
        return matchTesto && matchLuogo && matchCategoria
      })

      // Ordinamento per data di scadenza (da quello scaduto da più tempo fino a quello che scadrà più avanti)
      return filtrati.sort((a, b) => {
        if (!a.dataScadenza && !b.dataScadenza) return (a.nome || '').localeCompare(b.nome || '')
        if (!a.dataScadenza) return 1
        if (!b.dataScadenza) return -1
        const diffA = calcolaGiorniDiff(a.dataScadenza) ?? 999999
        const diffB = calcolaGiorniDiff(b.dataScadenza) ?? 999999
        if (diffA !== diffB) {
          return diffA - diffB
        }
        return (a.nome || '').localeCompare(b.nome || '')
      })
    },
    alimentiVisualizzati() {
      if (this.isExpanded || this.alimentiFiltrati.length <= 4) {
        return this.alimentiFiltrati
      }
      return this.alimentiFiltrati.slice(0, 4)
    }
  },
  watch: {
    '$route.query.aggiungi': {
      immediate: true,
      handler(val) {
        if (val === 'true' || val === '1') {
          this.$nextTick(() => {
            this.apriModalNuovoAlimento()
            this.$router.replace({ path: '/', query: {} })
          })
        }
      }
    }
  },
  async mounted() {
    // Carica gli alimenti e i planner dai file JSON esterni o localStorage
    await Promise.all([
      this.store.caricaAlimenti(),
      this.store.caricaPlanner()
    ])
  },
  updated() {
    // Scorrimento automatico verso la card dell'ultimo alimento aggiunto al DOM
    if (this.idUltimoAlimentoAggiunto) {
      const idTarget = this.idUltimoAlimentoAggiunto
      // Resetta subito per evitare scroll a ogni successivo ri-rendering
      this.idUltimoAlimentoAggiunto = null

      const elementoCard = document.getElementById(`cibo-${idTarget}`)
      if (elementoCard) {
        elementoCard.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  },
  methods: {
    aggiornaFiltri(filtriRicevuti) {
      if (filtriRicevuti.searchQuery !== undefined) {
        this.filtriAttivi.searchQuery = filtriRicevuti.searchQuery
      }
      this.filtriAttivi.selectedLuogo = filtriRicevuti.selectedLuogo
      this.filtriAttivi.selectedCategoria = filtriRicevuti.selectedCategoria
      this.isExpanded = false
    },
    attivaRicercaFlottante() {
      this.isSearchExpanded = true
      this.$nextTick(() => {
        const input = document.getElementById('floating-search-input')
        if (input) {
          input.focus()
        }
      })
    },
    chiudiRicercaFlottante() {
      this.isSearchExpanded = false
    },
    gestisciClickFloatingButton(event) {
      if (this.filtriAttivi.searchQuery) {
        this.filtriAttivi.searchQuery = ''
        if (event && event.currentTarget && event.currentTarget.blur) {
          event.currentTarget.blur()
        }
      } else {
        this.attivaRicercaFlottante()
      }
    },
    // Attiva/disattiva la selezione multipla o ne azzera gli elementi
    toggleSelectionMode() {
      this.isSelectionMode = !this.isSelectionMode
      if (!this.isSelectionMode) {
        this.selectedIds = []
      }
    },
    isSelected(id) {
      return this.selectedIds.includes(id)
    },
    // Gestisce l'aggiunta o rimozione dell'ID dalla lista degli alimenti selezionati
    toggleSelectAlimento(id) {
      const idx = this.selectedIds.indexOf(id)
      if (idx !== -1) {
        this.selectedIds.splice(idx, 1)
      } else {
        this.selectedIds.push(id)
      }
    },
    onCardClick(id) {
      if (this.isSelectionMode) {
        this.toggleSelectAlimento(id)
      } else {
        this.apriDettaglio(id)
      }
    },
    annullaSelezione() {
      this.selectedIds = []
      this.isSelectionMode = false
    },
    apriModalConfermaElimina() {
      if (this.selectedIds.length > 0) {
        this.mostraModalElimina = true
      }
    },
    // Gestisce l'eliminazione multipla in blocco oppure singola scorrendo gli ID selezionati
    confermaEliminaSelezionati() {
      const count = this.selectedIds.length
      if (count > 0) {
        if (typeof this.store.rimuoviAlimenti === 'function') {
          this.store.rimuoviAlimenti(this.selectedIds)
        } else {
          this.selectedIds.forEach((id) => this.store.rimuoviAlimento(id))
        }
        this.messaggioConferma = count === 1 
          ? 'Alimento eliminato con successo!' 
          : `${count} alimenti eliminati con successo!`
        setTimeout(() => {
          this.messaggioConferma = ''
        }, 3500)
      }
      this.selectedIds = []
      this.mostraModalElimina = false
      this.isSelectionMode = false
    },
    apriModalAssegnaGiorno() {
      if (this.selectedIds.length > 0) {
        this.assegnaData = getOggiISO()
        this.assegnaTipoPasto = 'Pranzo'
        this.mostraModalAssegnaGiorno = true
      }
    },
    confermaAssegnaGiorno(payload) {
      const dataAssegnata = payload?.data || this.assegnaData
      const pastoNome = payload?.tipoPasto || this.assegnaTipoPasto
      const cibi = payload?.alimenti || [...this.alimentiSelezionati]

      if (!dataAssegnata || !pastoNome || cibi.length === 0) return

      this.store.assegnaAlimentiAPasto(dataAssegnata, pastoNome, cibi)
      this.selectedIds = []
      this.mostraModalAssegnaGiorno = false
      this.isSelectionMode = false

      // Feedback visivo immediato
      this.messaggioConferma = `Assegnati ${cibi.length} alimenti a ${pastoNome} (${formatDataBreve(dataAssegnata)})`
      setTimeout(() => {
        this.messaggioConferma = ''
      }, 3500)
    },
    chiudiLista() {
      this.isExpanded = false
      this.$nextTick(() => {
        const el = document.getElementById('lista-alimenti')
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      })
    },
    apriDettaglio(id) {
      this.$router.push(`/alimento/${id}`)
    },
    apriPlannerData(dateStr) {
      this.$router.push(`/planner?date=${dateStr}`)
    },
    apriModalNuovoAlimento() {
      this.alimentoInModifica = null
      this.mostraModalAlimento = true
    },
    apriModalModifica(cibo) {
      this.alimentoInModifica = { ...cibo }
      this.mostraModalAlimento = true
    },
    salvaAlimento(alimento) {
      if (alimento.isEditMode) {
        this.store.modificaAlimento(alimento)
        this.messaggioConferma = `Alimento '${alimento.nome}' modificato con successo!`
      } else {
        const nuovo = this.store.aggiungiAlimento(alimento)
        this.idUltimoAlimentoAggiunto = nuovo ? String(nuovo.id) : String(this.store.alimenti[0]?.id)
        // Reset filtri ed espansione lista per garantire che la nuova card sia presente nel DOM
        this.filtriAttivi.searchQuery = ''
        this.filtriAttivi.selectedLuogo = 'tutti'
        this.filtriAttivi.selectedCategoria = ''
        this.isExpanded = true
        this.messaggioConferma = `Alimento '${alimento.nome}' aggiunto con successo alla dispensa!`
      }
      setTimeout(() => {
        this.messaggioConferma = ''
      }, 3500)
    }
  }
}
</script>

<style scoped>

/* Bottoni icona espansione e chiusura lista */
.btn-toggle-icon {
  background-color: #ffffff;
  color: var(--dblue);
  border: 1.5px solid #c5cee0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  padding: 0;
  font-size: 1.1rem;
  transition: all 0.2s ease;
}

.btn-toggle-icon:hover {
  background-color: var(--dblue);
  color: #ffffff;
  border-color: var(--dblue);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(29, 53, 87, 0.15) !important;
}

.btn-toggle-icon:active {
  transform: scale(0.95);
}

/* Scorrimento orizzontale fluido per i pasti */
.horizontal-scroll-container {
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  padding-bottom: 6px;
}

.horizontal-scroll-container::-webkit-scrollbar {
  height: 6px;
}

.horizontal-scroll-container::-webkit-scrollbar-thumb {
  background-color: rgba(29, 53, 87, 0.2);
  border-radius: 4px;
}

.meal-horizontal-card {
  width: 250px;
  min-height: 140px;
  scroll-snap-align: start;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.meal-horizontal-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08) !important;
}

.cursor-pointer {
  cursor: pointer;
}

/* Container per Ricerca Flottante in basso a destra */
.floating-search-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1040;
}

.btn-floating-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: var(--dblue) !important;
  color: #ffffff !important;
  border: 2px solid #ffffff !important;
  box-shadow: 0 6px 16px rgba(29, 53, 87, 0.35) !important;
  transition: transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
}

.btn-floating-circle:hover,
.btn-floating-circle:focus,
.btn-floating-circle:focus-visible {
  transform: translateY(-2px) scale(1.05);
  background-color: var(--dblue) !important;
  color: #ffffff !important;
  border: 2px solid #ffffff !important;
  box-shadow: 0 8px 20px rgba(29, 53, 87, 0.45) !important;
  outline: none !important;
}

.btn-floating-circle:active {
  transform: scale(0.95);
  background-color: var(--dblue) !important;
  border: 2px solid #ffffff !important;
}

/* Stato Rosso con filtro attivo: stesso identico stile con bordo bianco e sfondo rosso */
.btn-floating-circle.btn-floating-danger {
  background-color: var(--red, #e63946) !important;
  color: #ffffff !important;
  border: 2px solid #ffffff !important;
  box-shadow: 0 6px 16px rgba(230, 57, 70, 0.45) !important;
}

.btn-floating-circle.btn-floating-danger:hover,
.btn-floating-circle.btn-floating-danger:focus,
.btn-floating-circle.btn-floating-danger:focus-visible {
  background-color: #d62839 !important;
  color: #ffffff !important;
  border: 2px solid #ffffff !important;
  box-shadow: 0 8px 20px rgba(230, 57, 70, 0.55) !important;
  outline: none !important;
}

/* Rettangolo di Ricerca Espanso */
.floating-search-pill {
  width: min(300px, calc(100vw - 48px));
  height: 48px;
  border-radius: 14px;
  background-color: #ffffff;
  border-color: #c5cee0 !important;
  box-shadow: 0 8px 24px rgba(29, 53, 87, 0.25) !important;
}

.floating-input {
  background: transparent;
  font-size: 0.95rem;
  color: var(--black);
}

.floating-input:focus {
  outline: none;
  box-shadow: none;
}

.animate-expand {
  animation: expandRect 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes expandRect {
  from {
    opacity: 0;
    transform: scale(0.85) translateX(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateX(0);
  }
}

/* Bottom Action Bar Sticky */
.selection-action-bar-wrapper {
  position: fixed;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 1050;
  padding: 0 16px;
  pointer-events: none;
}

.selection-action-bar {
  pointer-events: auto;
  max-width: 600px;
  border-color: #c5cee0 !important;
  box-shadow: 0 10px 30px rgba(14, 24, 40, 0.2) !important;
}

.animate-slide-up {
  animation: slideUpAction 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUpAction {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.max-h-preview {
  max-height: 140px;
}

.delete-icon-badge {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: rgba(230, 57, 70, 0.12);
}

.assign-icon-badge {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: rgba(69, 123, 157, 0.15);
}
</style>