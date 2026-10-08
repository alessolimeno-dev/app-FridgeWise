<template>
  <div class="container py-3">
    <!-- Header superiore con pulsanti Indietro, Titolo Dettaglio e Azioni -->
    <Header 
      titolo="Dettaglio"
      back-to="/" 
      back-label="Indietro" 
      :mostra-menu="true"
      @open-menu="isSidebarOpen = true"
    >
      <template #actions v-if="alimento">
        <BaseButton 
          variant="modifica" 
          icon="bi-pencil-square"
          @click="mostraModalModifica = true"
        >
          Modifica
        </BaseButton>
      </template>
    </Header>

    <!-- Mobile Sidebar (Offcanvas estratto come componente) -->
    <Sidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />

    <!-- Stato di caricamento -->
    <div v-if="store.loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Caricamento in corso...</span>
      </div>
      <p class="text-muted small mt-2">Recupero dettagli alimento...</p>
    </div>

    <!-- Stato alimento non trovato -->
    <div v-else-if="!alimento" class="card bg-card-custom border-0 p-4 text-center shadow-sm">
      <div class="py-4">
        <i class="bi bi-search text-muted fs-1 mb-2 d-block"></i>
        <h2 class="h5 fw-bold mb-2">Alimento non trovato</h2>
        <p class="text-muted small mb-3">L'alimento selezionato non è presente nel frigo o è stato eliminato.</p>
        <BaseButton variant="primary" to="/">
          Torna alla Dispensa
        </BaseButton>
      </div>
    </div>

    <!-- Scheda di dettaglio alimento mobile first -->
    <div v-else class="card bg-card-custom border-0 shadow-sm p-3 p-md-4 mb-4">
      <div class="row g-4 align-items-md-end">
        <!-- fascia superiore: immagine, etichette e titolo -->
        <div class="d-flex align-items-center justify-content-between gap-3 mb-4">
          <!--Immagine su mobile a destra e su pc a sinistra-->
          <img 
              v-if="urlImmagine" 
              :src="urlImmagine" 
              :alt="alimento.nome" 
              class="img-fluid rounded-3 shadow-sm bg-white p-2 border flex-shrink-0 order-2 order-md-1"
              style="width: 90px; height: 90px; object-fit: contain;"
              @error="onImageError"
            />
          <!--Blocco di testo con etichette e titolo su mobile a sinistra e su pc accanto all'immagine a destra-->
          <div class="flex-grow-1 min-w-0 order-1 order-md-2">
            <!-- Badge Alimento -->
            <div class="d-flex align-items-center gap-2 mb-2 flex-wrap">
              <BadgeBase variant="categoria" :value="alimento.categoria" />
              <BadgeBase variant="luogo" :value="alimento.luogo" />
              <BadgeBase v-if="alimento.quantita" variant="quantita">Disponibilità: {{ alimento.quantita }} pz</BadgeBase>
            </div>
              <!-- Titolo Alimento -->
              <h2 class="brand-title food-title h3 mb-0 text-dark">{{ alimento.nome }}</h2>
          </div>
        </div>

        <!--due colonne-->
        <div class="row align-items-start">
          <!-- COLONNA SINISTRA -->
          <div class="col-12 col-md-6">
            <!-- Box Scadenza in Evidenza (se impostata) -->
            <div v-if="alimento.dataScadenza" class="card border-0 mb-4 p-3 rounded-3" :class="statoScadenza.cardClass">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <span class="text-uppercase small fw-bold d-block" :class="statoScadenza.textClass">
                    <i class="bi" :class="statoScadenza.icon"></i> Data di Scadenza
                  </span>
                  <span class="h5 mb-0 fw-bold d-block text-dark mt-1">
                    {{ formattaDataEstesa(alimento.dataScadenza) }}
                  </span>
                </div>
                <div class="text-end">
                  <span class="badge rounded-pill px-3 py-2 fw-bold" :class="statoScadenza.badgeClass">
                    {{ statoScadenza.label }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Griglia informazioni principali -->
            <div class="row row-cols-2 row-cols-lg-4 g-2 g-sm-3 mb-4">
              <div class="col">
                <div class="p-3 bg-white rounded-3 border-0 shadow-sm h-100">
                  <span class="text-muted small d-block mb-1">
                    <i class="bi bi-box-seam me-1 text-primary"></i> Quantità
                  </span>
                  <span class="fw-bold text-dark fs-6">{{ alimento.quantita ? alimento.quantita + ' pz' : '-' }}</span>
                </div>
              </div>

              <div class="col">
                <div class="p-3 bg-white rounded-3 border-0 shadow-sm h-100">
                  <span class="text-muted small d-block mb-1">
                    <i class="bi bi-speedometer2 me-1 text-primary"></i> Grammatura/Peso
                  </span>
                  <span class="fw-bold text-dark fs-6">{{ alimento.peso || '-' }}</span>
                </div>
              </div>

              <div class="col">
                <div class="p-3 bg-white rounded-3 border-0 shadow-sm h-100">
                  <span class="text-muted small d-block mb-1">
                    <i class="bi bi-calendar-check me-1 text-primary"></i> Data Acquisto
                  </span>
                  <span class="fw-bold text-dark fs-6">{{ formattaData(alimento.dataAcquisto) }}</span>
                </div>
              </div>

              <div class="col">
                <div class="p-3 bg-white rounded-3 border-0 shadow-sm h-100">
                  <span class="text-muted small d-block mb-1">
                    <i class="bi bi-calendar-event me-1 text-primary"></i> Data Scadenza
                  </span>
                  <span class="fw-bold text-dark fs-6">{{ formattaData(alimento.dataScadenza) }}</span>
                </div>
              </div>
            </div>

            <!-- Sezione Note (se presenti) -->
            <div v-if="alimento.note" class="p-3 bg-white rounded-3 shadow-sm border-0">
              <span class="text-muted small fw-bold d-block mb-1">
                <i class="bi bi-sticky me-1 text-primary"></i> Note di conservazione
              </span>
              <p class="mb-0 small text-dark">{{ alimento.note }}</p>
            </div>
          </div>
        
          <!-- COLONNA DESTRA -->
        <div class="col-12 col-md-6">
          <TabellaNutrizione 
            :model-value="alimento" 
            :readonly="true" 
            :collapsible="false" 
          />
        </div>
      </div>
    </div>
  </div>

    <!-- Modal Modifica Alimento : per cambio valori nutrizionali e info dell'alimento selezionato -->
    <Modal 
      v-model="mostraModalModifica" 
      variante="formAlimento"
      :alimento-iniziale="alimento"
      @salva-alimento="salvaModificaAlimento" 
    />
  </div>
</template>

<script>
import { useFrigoStore } from '../stores/frigo'
import { calcolaGiorniDiff, formatDataBella, formatDataBreve } from '../utils/dateUtils'
import { getFoodImageUrl } from '../utils/foodImageService'
import Header from '../components/layout/Header.vue'
import Sidebar from '../components/layout/Sidebar.vue'
import TabellaNutrizione from '../components/food/TabellaNutrizione.vue'

export default {
  name: 'FoodDetail',
  components: {
    Header,
    Sidebar,
    TabellaNutrizione
  },
  props: {
    // ID dell'alimento preso dalla rute
    id: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      store: useFrigoStore(),
      isSidebarOpen: false,
      immagineRisolta: '', // URL dell'immagine ricavata via API se non presente nel prodotto
      mostraModalModifica: false // controlla la visibilità del modale di modifica
    }
  },
  computed: {
    alimento() {
      return this.store.getAlimentoById(this.id)
    },
    // Restituisce l'immagine salvata oppure quella ricavata tramite chiamata API esterna
    urlImmagine() {
      return this.alimento?.immagine || this.immagineRisolta
    },
    // Calcolo giorni alla scadenza e stato visivo dell'alimento dinamico rispetto alla data odierna
    statoScadenza() {
      if (!this.alimento || !this.alimento.dataScadenza) {
        return {
          label: 'Data non specificata',
          badgeClass: 'bg-secondary',
          cardClass: 'bg-white',
          textClass: 'text-muted',
          icon: 'bi-calendar-event'
        }
      }

      const diffGiorni = calcolaGiorniDiff(this.alimento.dataScadenza)

      if (diffGiorni < 0) {
        const giorniFa = Math.abs(diffGiorni)
        return {
          label: giorniFa === 1 ? 'Scaduto ieri' : `Scaduto da ${giorniFa} giorni`,
          badgeClass: 'badge-scaduto bg-danger text-white',
          cardClass: 'bg-danger-subtle border border-danger',
          textClass: 'text-danger',
          icon: 'bi-exclamation-octagon-fill'
        }
      } else if (diffGiorni === 0) {
        return {
          label: 'Scade oggi!',
          badgeClass: 'badge-in-scadenza bg-warning text-dark',
          cardClass: 'bg-warning-subtle border border-warning',
          textClass: 'text-dark',
          icon: 'bi-exclamation-triangle-fill'
        }
      } else if (diffGiorni === 1) {
        return {
          label: 'Scade domani',
          badgeClass: 'badge-in-scadenza bg-warning text-dark',
          cardClass: 'bg-warning-subtle border border-warning',
          textClass: 'text-dark',
          icon: 'bi-hourglass-split'
        }
      } else if (diffGiorni <= 3) {
        return {
          label: `Scade tra ${diffGiorni} giorni`,
          badgeClass: 'badge-in-scadenza bg-warning text-dark',
          cardClass: 'bg-warning-subtle border border-warning',
          textClass: 'text-dark',
          icon: 'bi-hourglass-split'
        }
      } else {
        return {
          label: `Tra ${diffGiorni} giorni`,
          badgeClass: 'badge-valido bg-success text-white',
          cardClass: 'bg-white',
          textClass: 'text-success',
          icon: 'bi-shield-check'
        }
      }
    }
  },
  async created() {
    // Inizializza l'immagine del cibo all'avvio del componente
    await this.caricaImmagine()
  },
  watch: {
    alimento() {
      this.caricaImmagine()
    }
  },
  async mounted() {
    // Se la pagina viene ricaricata direttamente su /alimento/:id, assicura il caricamento
    if (!this.store.isLoaded) {
      await this.store.caricaAlimenti()
    }
  },
  methods: {
    async caricaImmagine() {
      if (this.alimento?.immagine) {
        this.immagineRisolta = this.alimento.immagine
      } else if (this.alimento?.nome) {
        this.immagineRisolta = await getFoodImageUrl(this.alimento.nome)
      } else {
        this.immagineRisolta = ''
      }
    },
    // In caso di errore caricamento immagine, resetta il valore per non mostrare anteprima
    onImageError() {
      this.immagineRisolta = ''
    },
    formattaLuogo(luogo) {
      if (!luogo) return ''
      const l = luogo.toLowerCase()
      if (l === 'frigo') return '🧊 Frigo'
      if (l === 'dispensa') return '🥫 Dispensa'
      if (l === 'freezer') return '❄️ Freezer'
      return luogo
    },
    formattaData(dataString) {
      if (!dataString) return '-'
      return formatDataBreve(dataString) || '-'
    },
    formattaDataEstesa(dataString) {
      if (!dataString) return '-'
      return formatDataBella(dataString) || '-'
    },
    // Invia le modifiche apportate all'alimento nello store
    salvaModificaAlimento(datiModificati) {
      this.store.modificaAlimento(datiModificati)
    }
  }
}
</script>

<style scoped>
/* Colori per card stato scadenza */
.bg-danger-subtle {
  background-color: #fde8e8 !important;
}

.bg-warning-subtle {
  background-color: #fff3eb !important;
}
</style>