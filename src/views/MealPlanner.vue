<template>
  <div class="container py-3">
    <!-- Header superiore -->
    <Header 
      titolo="Meal Planner" 
      back-to="/"
      :mostra-desktop-nav="true"
      :mostra-menu="true"
      @open-menu="isSidebarOpen = true"
      @aggiungi="mostraModalNuovoPasto = true"
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
          to="/spesa" 
          icon="bi-cart3"
          aria-label="Lista della spesa"
          title="Lista della spesa"
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


    <!-- navigazione settimana -->
    <div class="card bg-card-custom border-0 shadow-sm p-3 mb-3">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <BaseButton 
          variant="back" 
          icon="bi-chevron-left" 
          @click="cambiaSettimana(-1)"
          aria-label="Settimana precedente"
        />

        <div class="text-center">
          <span class="badge bg-secondary mb-1">Settimana</span>
          <h2 class="h6 fw-bold mb-0 text-dark">{{ settimanaCorrente.titoloSettimana }}</h2>
        </div>

        <BaseButton 
          variant="back" 
          icon="bi-chevron-right" 
          @click="cambiaSettimana(1)"
          aria-label="Settimana successiva"
        />
      </div>

      <!-- Calendario settimanale con autolayout a 7 colonne Bootstrap (Lunedì - Domenica) -->
      <div class="row g-1 g-sm-2 py-2 px-1 week-days-container flex-nowrap mx-0">
        <div
          v-for="giorno in settimanaCorrente.giorni"
          :key="giorno.dateStr"
          class="col px-1"
        >
          <button
            type="button"
            class="btn day-pill w-100 d-flex flex-column align-items-center justify-content-center py-2 px-0 border-0"
            :class="{
              'day-selected': giorno.dateStr === dataSelezionata,
              'day-today': giorno.isToday && giorno.dateStr !== dataSelezionata,
              'day-default': giorno.dateStr !== dataSelezionata && !giorno.isToday
            }"
            @click="selezionaGiorno(giorno.dateStr)"
          >
            <span class="small fw-semibold day-name text-uppercase">{{ giorno.dayNameShort }}</span>
            <span class="fs-5 fw-bold day-num">{{ giorno.dayNumber }}</span>
            
            <!-- Punto/pallino che segnala che ci sono pasti pianificati nel giorno -->
            <div class="mt-1">
              <span 
                v-if="store.haPastiInData(giorno.dateStr)" 
                class="meal-dot"
                :class="giorno.dateStr === dataSelezionata ? 'bg-white' : 'bg-orange'"
                title="Pasti pianificati"
              ></span>
              <span v-else class="meal-dot-placeholder"></span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Dettaglio data selezionata e gestione pasti -->
    <div class="card bg-card-custom border-0 shadow-sm p-3 p-md-4 mb-4">
      <!-- Intestazione giorno selezionato -->
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 pb-2 border-bottom">
        <div>
          <h2 class="h5 fw-bold mb-0 text-dark">{{ dataFormattataBella }}</h2>
        </div>

        <BaseButton 
          variant="primary"
          @click="mostraModalNuovoPasto = true"
          icon="bi-plus-circle"
        >
          Aggiungi Pasto
        </BaseButton>
      </div>

      <!-- testo placeholder -->
      <div v-if="pastiDelGiorno.length === 0" class="text-center py-4 bg-white rounded-3 p-3">
        <i class="bi bi-calendar-plus text-muted fs-1 mb-2 d-block"></i>
        <h3 class="h6 fw-bold text-dark mb-1">Nessun pasto pianificato</h3>
        <p class="text-muted small mb-3">
          Non hai ancora programmato pasti per {{ dataFormattataBreve }}.
        </p>

        <div class="d-flex justify-content-center gap-2 flex-wrap">
          <BaseButton 
            v-for="tipo in store.tipiPastoPredefiniti.slice(0, 3)" 
            :key="tipo"
            variant="secondary"
            @click="creaPastoRapido(tipo)"
          >
            + {{ tipo }}
          </BaseButton>
        </div>
      </div>

      <!-- Elenco dei pasti del giorno: 1 colonna su mobile, 3 colonne su tablet e desktop (Mobile First) -->
      <div v-else class="row g-3">
        <div 
          v-for="pasto in pastiDelGiorno" 
          :key="pasto.id"
          class="col-12 col-md-4"
        >
          <PastoCard
            :pasto="pasto"
            class="h-100"
            @rimuovi-pasto="rimuoviPasto"
            @rimuovi-alimento="(itemId) => rimuoviAlimento(pasto.id, itemId)"
            @aggiungi-alimento="apriSelettoreAlimenti"
          />
        </div>
      </div>
    </div>
    <!-- Modale Selezione Nuovo Pasto (variante del componente ModalePlanner) -->
    <ModalePlanner 
      v-model="mostraModalNuovoPasto" 
      variante="nuovoPasto"
      :data-formattata="dataFormattataBreve"
      :tipi-pasto="store.tipiPastoPredefiniti"
      :pasto-iniziale="nuovoPastoSelezionato"
      @conferma="confermaAggiungiPasto"
    />

    <!-- Modale Aggiungi Alimento a Pasto (variante del componente ModalePlanner) -->
    <ModalePlanner 
      v-model="mostraModalAlimento" 
      variante="aggiungiAlimento"
      :pasto-target="pastoTarget"
      :alimenti-disponibili="alimentiDisponibiliFiltrati"
      @conferma="confermaAggiungiAlimento"
    />
  </div>
</template>

<script>
import { useFrigoStore } from '../stores/frigo'
// Navigatore settimanale gestito con la libreria esterna dayjs
import dayjs, { getSettimana, getOggiISO, formatDataBella, formatGiornoMese } from '../utils/dateUtils'
import Header from '../components/layout/Header.vue'
import Sidebar from '../components/layout/Sidebar.vue'
import PastoCard from '../components/food/PastoCard.vue'

export default {
  name: 'MealPlanner',
  components: {
    Header,
    Sidebar,
    PastoCard
  },
  data() {
    return {
      store: useFrigoStore(),
      isSidebarOpen: false,
      dataRiferimentoSettimana: dayjs(),
      dataSelezionata: getOggiISO(),
      mostraModalNuovoPasto: false,
      nuovoPastoSelezionato: 'Colazione',
      mostraModalAlimento: false,
      targetPastoId: null,
      selectedAlimentoId: null,
      // Stato del form per l'aggiunta di un alimento al pasto
      formAlimento: {
        alimentoId: null,
        nome: '',
        quantita: 1,
        unita: 'pz'
      }
    }
  },
  computed: {
    // compiti per il setting della visualizzazione della data e settimana
    settimanaCorrente() {
      return getSettimana(this.dataRiferimentoSettimana)
    }, //prende data odierna e calcola il periodo per il titolo
    /*isSelectedDateOggi() {
      return this.dataSelezionata === getOggiISO()
    }, */ // booleana per verificare la data selezionata - è oggi?
    dataFormattataBella() {
      return formatDataBella(this.dataSelezionata)
    }, // formatta testo della data
    dataFormattataBreve() {
      return formatGiornoMese(this.dataSelezionata)
    },
    plannerCorrente() {
      return this.store.getPlannerByDate(this.dataSelezionata)
    }, //mostra solo cosa c'è in quel giorno
    // Ordina i pasti della data in base ai tipi predefiniti nello store
    pastiDelGiorno() {
      if (!this.plannerCorrente || !this.plannerCorrente.pasti) return []
      const ordine = this.store.tipiPastoPredefiniti
      return [...this.plannerCorrente.pasti].sort((a, b) => {
        const indexA = ordine.indexOf(a.nome)
        const indexB = ordine.indexOf(b.nome)
        const posA = indexA === -1 ? 999 : indexA
        const posB = indexB === -1 ? 999 : indexB
        return posA - posB
      })
    },
    // Individua il pasto a cui associare il nuovo alimento tramite targetPastoId
    pastoTarget() {
      if (!this.targetPastoId) return null
      return this.pastiDelGiorno.find((p) => p.id === this.targetPastoId)
    },
    alimentiDisponibiliFiltrati() {
      return this.store.alimenti
    }
  },
  async mounted() {
    await Promise.all([
      this.store.caricaAlimenti(),
      this.store.caricaPlanner()
    ])

    // Imposta la data se passata tramite parametro URL (?date=)
    if (this.$route.query.date) {
      this.dataSelezionata = this.$route.query.date
      this.dataRiferimentoSettimana = dayjs(this.$route.query.date)
      this.store.setSelectedDate(this.$route.query.date)
    } else if (this.store.selectedDate) {
      this.dataSelezionata = this.store.selectedDate
      this.dataRiferimentoSettimana = dayjs(this.store.selectedDate)
    }
  },
  methods: {
    selezionaGiorno(dateStr) {
      this.dataSelezionata = dateStr
      this.store.setSelectedDate(dateStr)
    },
    cambiaSettimana(delta) {
      this.dataRiferimentoSettimana = this.dataRiferimentoSettimana.add(delta, 'week')
    },
    // Crea rapidamente un pasto predefinito per la data selezionata
    creaPastoRapido(nomeTipo) {
      this.store.aggiungiPasto(this.dataSelezionata, nomeTipo)
    },
    confermaAggiungiPasto(nome) {
      const nomePasto = (typeof nome === 'string' && nome) || this.nuovoPastoSelezionato || this.store.tipiPastoPredefiniti[0]
      this.store.aggiungiPasto(this.dataSelezionata, nomePasto)
      this.mostraModalNuovoPasto = false
      this.nuovoPastoSelezionato = 'Colazione'
    },
    rimuoviPasto(pastoId) {
      this.store.rimuoviPasto(this.dataSelezionata, pastoId)
    },
    apriSelettoreAlimenti(pastoId) {
      this.targetPastoId = pastoId
      this.selectedAlimentoId = null
      this.formAlimento = {
        alimentoId: null,
        nome: '',
        quantita: 1,
        unita: 'pz'
      }
      this.mostraModalAlimento = true
    },
    chiudiModalAlimento() {
      this.mostraModalAlimento = false
      this.targetPastoId = null
    },
    /*selezionaAlimentoDaLista(alimento) {
      this.selectedAlimentoId = alimento.id
      this.formAlimento.alimentoId = alimento.id
      this.formAlimento.nome = alimento.nome
      
      // Rilevamento automatico unità se disponibile
      if (alimento.categoria === 'Bevande' || alimento.peso?.toLowerCase().includes('l')) {
        this.formAlimento.unita = 'ml'
        this.formAlimento.quantita = 250
      } else if (alimento.peso?.toLowerCase().includes('g')) {
        this.formAlimento.unita = 'g'
        this.formAlimento.quantita = 100
      } else {
        this.formAlimento.unita = 'pz'
        this.formAlimento.quantita = 1
      }*/
    },
    confermaAggiungiAlimento(payload) {
      const pastoId = payload?.pastoId || this.targetPastoId
      const nome = payload?.nome || this.formAlimento.nome
      if (!pastoId || !nome) return

      this.store.aggiungiAlimentoAPasto(this.dataSelezionata, pastoId, {
        alimentoId: payload?.alimentoId !== undefined ? payload.alimentoId : this.formAlimento.alimentoId,
        nome: nome,
        quantita: payload?.quantita || this.formAlimento.quantita || 1,
        unita: payload?.unita || this.formAlimento.unita || 'pz'
      })
      this.chiudiModalAlimento()
    },
    rimuoviAlimento(pastoId, itemId) {
      this.store.rimuoviAlimentoDaPasto(this.dataSelezionata, pastoId, itemId)
    },
    /*getIconaPasto(nome) {
      if (!nome) return '🍽️'
      const n = nome.toLowerCase()
      if (n.includes('colazione')) return '🥐'
      if (n.includes('mattina') || n.includes('spuntino')) return '🍎'
      if (n.includes('pranzo')) return '🥗'
      if (n.includes('merenda')) return '🥪'
      if (n.includes('cena')) return '🍲'
      if (n.includes('sera')) return '🍵'
      return '🍽️'
    },
    formattaLuogo(luogo) {
      if (!luogo) return ''
      const l = luogo.toLowerCase()
      if (l === 'frigo') return '🧊 Frigo'
      if (l === 'dispensa') return '🥫 Dispensa'
      if (l === 'freezer') return '❄️ Freezer'
      return luogo
    }
  }*/
}
</script>

<style scoped>
/* Navigazione settimanale */
.week-nav-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.week-nav-btn:hover {
  background-color: var(--dblue);
  color: #ffffff;
}

.week-days-container {
  overflow-x: hidden;
}

/* Selettore giorni del calendario */
.day-pill {
  width: 100%;
  min-width: 0;
  border-radius: 12px;
  transition: all 0.2s ease;
  user-select: none;
  cursor: pointer;
}

.day-name {
  font-size: 0.72rem;
  letter-spacing: 0.5px;
}

.day-num {
  line-height: 1.2;
}

.day-selected {
  background-color: var(--dblue) !important;
  color: #ffffff !important;
  box-shadow: 0 4px 10px rgba(29, 53, 87, 0.35);
  transform: translateY(-2px);
}

.day-today {
  background-color: #ffffff;
  color: var(--dblue);
  border: 2px solid var(--orange) !important;
}

.day-default {
  background-color: #ffffff;
  color: #4a5568;
}

.day-default:hover {
  background-color: #e9eef8;
  color: var(--dblue);
}

/* Indicatori presenza pasti */
.meal-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.bg-orange {
  background-color: var(--orange) !important;
}

.meal-dot-placeholder {
  width: 6px;
  height: 6px;
  display: inline-block;
}

/* Box pasti e lista alimenti */
.meal-box {
  border-left: 4px solid var(--mblu) !important;
}

.max-h-alimenti {
  max-height: 160px;
}

</style>