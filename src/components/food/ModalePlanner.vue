<template>
  <Modal 
    :model-value="modelValue" 
    @update:model-value="$emit('update:modelValue', $event)"
    @chiudi="chiudi"
    variante="planner"
    size="md"
  >
    <template #default>
      <!--modal con variante nuovoPasto in cui si sceglie tipo pasto per un giorno-->
      <div v-if="varianteNormalizzata === 'nuovopasto'" class="p-4">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div class="d-flex align-items-center gap-2">
            <span class="fs-4">🍽️</span>
            <h3 class="h5 fw-bold mb-0 text-dark">Nuovo Pasto</h3>
          </div>
          <button type="button" class="btn-close" @click="chiudi" aria-label="Chiudi"></button>
        </div>

        <p class="text-muted small mb-3">
          Seleziona il tipo di pasto<span v-if="dataFormattata"> per <strong>{{ dataFormattata }}</strong></span>:
        </p>

        <!-- Selezione esclusiva da lista pasti predefiniti -->
        <div class="d-flex flex-column gap-2 mb-4">
          <button 
            type="button" 
            v-for="tipo in listaTipiPasto" 
            :key="tipo"
            class="btn text-start d-flex align-items-center justify-content-between p-2 rounded-3 option-button"
            :class="pastoSelezionato === tipo ? 'btn-custom-primary' : 'btn-outline-secondary'"
            @click="pastoSelezionato = tipo"
          >
            <span>{{ getIconaPasto(tipo) }} {{ tipo }}</span>
            <i class="bi bi-check-lg" v-if="pastoSelezionato === tipo"></i>
          </button>
        </div>

        <!-- Footer Azioni -->
        <div class="d-flex justify-content-end gap-2">
          <BaseButton variant="back" @click="chiudi">
            Annulla
          </BaseButton>
          <BaseButton variant="primary" @click="confermaNuovoPasto">
            Aggiungi Pasto
          </BaseButton>
        </div>
      </div>

      <!-- modal con variante aggiungiAlimento in cui si inserisce o seleziona da dispensa con dosi-->
      <div v-else-if="varianteNormalizzata === 'aggiungialimento'" class="p-4">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div>
            <div class="d-flex align-items-center gap-2">
              <span class="fs-4">🥗</span>
              <h3 class="h5 fw-bold mb-0 text-dark">Aggiungi Alimento</h3>
            </div>
            <small class="text-muted" v-if="pastoTarget && pastoTarget.nome">
              Aggiunta a: <strong>{{ pastoTarget.nome }}</strong>
            </small>
          </div>
          <button type="button" class="btn-close" @click="chiudi" aria-label="Chiudi"></button>
        </div>

        <!-- Form Inserimento Cibo nuovo o da dispensa -->
        <form @submit.prevent="confermaAggiungiAlimento">
          <div class="mb-3">
            <label class="form-label small fw-bold text-dark mb-1">
              Nome Alimento o Piatto <span class="text-danger">*</span>
            </label>
            <input 
              type="text" 
              class="form-control" 
              v-model.trim="formAlimento.nome" 
              placeholder="Es. Pizza Margherita, Spaghetti, Panino..." 
              required
            >
            <div class="form-text text-muted" style="font-size: 0.75rem;">
              Inserisci qualsiasi cibo (anche mangiato fuori) o selezionalo dalla dispensa qui sotto.
            </div>
          </div>

          <!-- Suggerimenti rapidi da alimenti in Dispensa/Frigo -->
          <div class="mb-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <label class="form-label small fw-semibold text-muted mb-0">
                💡 Suggerimenti dalla Dispensa/Frigo:
              </label>
              <span class="badge bg-light text-secondary border small" v-if="alimentiDisponibili.length > 0">
                {{ alimentiFiltrati.length }} disponibili
              </span>
            </div>

            <!-- Ricerca veloce se molti alimenti -->
            <Cerca 
              v-if="alimentiDisponibili.length > 4"
              v-model="ricercaAlimento" 
              size="sm" 
              rounded="default" 
              placeholder="Cerca nella dispensa..." 
              class="mb-2"
            />

            <div class="list-group list-group-flush border rounded-3 overflow-auto max-h-alimenti">
              <button 
                type="button" 
                v-for="alimento in alimentiFiltrati" 
                :key="alimento.id"
                class="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-2"
                :class="{ 'active': selectedAlimentoId === alimento.id }"
                @click="selezionaAlimento(alimento)"
              >
                <div>
                  <span class="fw-bold small d-block food-title">{{ alimento.nome }}</span>
                  <div class="d-flex gap-1 mt-1">
                    <span class="badge bg-secondary-subtle text-dark" style="font-size: 0.7rem;">
                      {{ alimento.categoria || 'Generale' }}
                    </span>
                    <span class="text-muted" style="font-size: 0.75rem;">
                      {{ formattaLuogo(alimento.luogo) }}
                    </span>
                  </div>
                </div>
                <div class="text-end">
                  <span class="badge bg-light text-muted border small">
                    {{ alimento.peso || (alimento.quantita ? alimento.quantita + ' pz' : 'pz') }}
                  </span>
                </div>
              </button>

              <div v-if="alimentiFiltrati.length === 0" class="p-2 text-center text-muted small">
                {{ alimentiDisponibili.length === 0 ? 'Nessun alimento salvato in dispensa.' : 'Nessun alimento corrisponde alla ricerca.' }}
              </div>
            </div>
          </div>

          <!-- Campi quantità e unità di misura flessibile -->
          <div class="row g-2 mb-4">
            <div class="col-6">
              <label class="form-label small fw-bold text-dark mb-1">Quantità <span class="text-danger">*</span></label>
              <input 
                type="number" 
                step="any" 
                class="form-control" 
                v-model.number="formAlimento.quantita" 
                min="0.1" 
                placeholder="Es. 100, 1, 250"
                required
              >
            </div>
            <div class="col-6">
              <label class="form-label small fw-bold text-dark mb-1">Unità di Misura <span class="text-danger">*</span></label>
              <select class="form-select" v-model="formAlimento.unita" required>
                <option value="pz">Pezzi (pz)</option>
                <option value="g">Grammi (g)</option>
                <option value="kg">Chilogrammi (kg)</option>
                <option value="ml">Millilitri (ml)</option>
                <option value="L">Litri (L)</option>
                <option value="porzioni">Porzioni</option>
                <option value="fette">Fette</option>
                <option value="bicchieri">Bicchieri</option>
              </select>
            </div>
          </div>

          <!-- Footer azioni -->
          <div class="d-flex justify-content-end gap-2">
            <BaseButton variant="back" type="button" @click="chiudi">
              Annulla
            </BaseButton>
            <BaseButton 
              variant="primary" 
              type="submit"
              :disabled="!formAlimento.nome"
            >
              Aggiungi al Pasto
            </BaseButton>
          </div>
        </form>
      </div>

      <!-- modal con variante assegnaGiorno in cui si assegna più cibi a un giorno e pasto -->
      <div v-else-if="varianteNormalizzata === 'assegnagiorno'" class="p-4">
        <!-- Header centrato con badge calendario -->
        <div class="text-center mb-3">
          <div class="assign-icon-badge mx-auto mb-2 d-flex align-items-center justify-content-center">
            <i class="bi bi-calendar-check-fill text-primary fs-3"></i>
          </div>
          <h3 class="h5 fw-bold text-dark mb-1">Assegna alimenti al Planner</h3>
          <p class="text-muted small mb-0">
            Scegli il giorno e il pasto in cui inserire
            <strong>{{ listaAlimentiSelezionati.length }} {{ listaAlimentiSelezionati.length === 1 ? 'alimento' : 'alimenti' }}</strong>.
          </p>
        </div>

        <!-- Form selezione data e pasto -->
        <div class="mb-3">
          <label class="form-label small fw-bold text-dark mb-1">
            <i class="bi bi-calendar3 text-primary me-1"></i> Data del pasto
          </label>
          <input 
            type="date" 
            class="form-control form-control-sm rounded-3 mb-2"
            v-model="dataPasto"
          >

          <label class="form-label small fw-bold text-dark mb-1">
            <i class="bi bi-cup-hot text-primary me-1"></i> Tipo di pasto
          </label>
          <select 
            class="form-select form-select-sm rounded-3" 
            v-model="tipoPasto"
          >
            <option v-for="tipo in listaTipiPasto" :key="tipo" :value="tipo">
              {{ tipo }}
            </option>
          </select>
        </div>

        <!-- Lista compatta anteprima alimenti da assegnare -->
        <div class="bg-light rounded-3 p-2 mb-3 max-h-preview overflow-auto border">
          <p class="text-muted small fw-bold mb-1 px-1" style="font-size: 0.75rem;">Alimenti da inserire:</p>
          <ul class="list-unstyled mb-0 small">
            <li 
              v-for="cibo in listaAlimentiSelezionati" 
              :key="cibo.id"
              class="d-flex justify-content-between align-items-center py-1 px-2 border-bottom"
            >
              <span class="fw-semibold text-dark text-truncate food-title">{{ cibo.nome }}</span>
              <span class="badge bg-white text-muted border ms-2" style="font-size: 0.72rem;">
                {{ cibo.peso || (cibo.quantita ? cibo.quantita + ' pz' : '1 pz') }}
              </span>
            </li>
          </ul>
        </div>

        <!-- Footer azioni -->
        <div class="d-flex justify-content-end gap-2">
          <button 
            type="button" 
            class="btn btn-light btn-sm px-3 rounded-pill" 
            @click="chiudi"
          >
            Annulla
          </button>
          <button 
            type="button" 
            class="btn btn-custom-primary btn-sm px-4 fw-bold rounded-pill shadow-sm"
            :disabled="!dataPasto || !tipoPasto || listaAlimentiSelezionati.length === 0"
            @click="confermaAssegnaGiorno"
          >
            <i class="bi bi-check2 me-1"></i> Conferma e assegna
          </button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script>
import { getOggiISO } from '../../utils/dateUtils'
import Modal from '../common/Modal.vue'

export default {
  name: 'ModalePlanner',
  components: {
    Modal
  },
  props: {
    // Controllo visibilità modale
    modelValue: {
      type: Boolean,
      default: false
    },
    variante: {
      type: String,
      default: 'nuovoPasto'
    },
    tipiPasto: { // lista tipi pasto consentiti
      type: Array,
      default: () => ['Colazione', 'Spuntino Mattina', 'Pranzo', 'Merenda', 'Cena', 'Spuntino Sera']
    },
    // VARIANTE 1: 
    // data formattata per titolo
    dataFormattata: {
      type: String,
      default: ''
    },
    //pasto iniziale selezionato
    pastoIniziale: {
      type: String,
      default: 'Colazione'
    },
    // VARIANTE 2: 
    // pasto a cui aggiungere alimento
    pastoTarget: {
      type: Object,
      default: () => ({})
    },
    //lista cibi disponibili da frigo/dispensa
    alimentiDisponibili: {
      type: Array,
      default: () => []
    },
    //VARIANTE 3: alimenti selezionati da assegnare
    alimentiSelezionati: {
      type: Array,
      default: () => []
    },
    // data iniziale di assegnazione
    dataIniziale: {
      type: String,
      default: ''
    },
    // tipo pasto iniziale di assegnazione
    tipoPastoIniziale: {
      type: String,
      default: 'Pranzo'
    }
  },
  emits: [
    'update:modelValue',
    'chiudi',
    'conferma',
    'conferma-pasto',
    'conferma-alimento',
    'conferma-assegna'
  ],
  data() {
    return {
      // Variante 1
      pastoSelezionato: this.pastoIniziale || 'Colazione',

      // variante 2
      selectedAlimentoId: null,
      ricercaAlimento: '',
      formAlimento: {
        alimentoId: null,
        nome: '',
        quantita: 1,
        unita: 'pz'
      },

      //variante 3
      dataPasto: this.dataIniziale || getOggiISO(),
      tipoPasto: this.tipoPastoIniziale || 'Pranzo'
    }
  },
  computed: {
    // Normalizza la variante per renderla flessibile ignorando spazi trattini e maiuscole
    varianteNormalizzata() {
      const v = (this.variante || '').toLowerCase().replace(/[-_ ]/g, '')
      if (['nuovopasto', 'selezionenuovopasto', 'pasto'].includes(v)) return 'nuovopasto'
      if (['aggiungialimento', 'aggiungialimentopasto', 'nuovoalimentopasto', 'alimento'].includes(v)) return 'aggiungialimento'
      if (['assegnagiorno', 'assegnaplanner', 'assegnaaungiorno', 'assegna'].includes(v)) return 'assegnagiorno'
      return 'nuovopasto'
    },
    listaTipiPasto() {
      return this.tipiPasto && this.tipiPasto.length > 0
        ? this.tipiPasto
        : ['Colazione', 'Spuntino Mattina', 'Pranzo', 'Merenda', 'Cena', 'Spuntino Sera']
    },
    listaAlimentiSelezionati() {
      return Array.isArray(this.alimentiSelezionati) ? this.alimentiSelezionati : []
    },
    alimentiFiltrati() { // Filtra gli alimenti disponibili in base al nome, categoria o luogo
      if (!this.ricercaAlimento) return this.alimentiDisponibili
      const q = this.ricercaAlimento.toLowerCase()
      return this.alimentiDisponibili.filter((alimento) => {
        return (
          alimento.nome?.toLowerCase().includes(q) ||
          alimento.categoria?.toLowerCase().includes(q) ||
          alimento.luogo?.toLowerCase().includes(q)
        )
      })
    }
  },
  watch: {
    //ogni volta che si apre il modale si resetta lo stato interno in modo da evitare dati residui da aperture previous
    modelValue(val) {
      if (val) {
        this.resetStato()
      }
    },
    pastoIniziale(val) {
      if (val) this.pastoSelezionato = val
    },
    dataIniziale(val) {
      if (val) this.dataPasto = val
    },
    tipoPastoIniziale(val) {
      if (val) this.tipoPasto = val
    }
  },
  methods: {
    resetStato() {
      // Variante 1
      this.pastoSelezionato = this.pastoIniziale || this.listaTipiPasto[0] || 'Colazione'

      // Variante 2
      this.selectedAlimentoId = null
      this.ricercaAlimento = ''
      this.formAlimento = {
        alimentoId: null,
        nome: '',
        quantita: 1,
        unita: 'pz'
      }

      // Variante 3
      this.dataPasto = this.dataIniziale || getOggiISO()
      this.tipoPasto = this.tipoPastoIniziale || 'Pranzo'
    },
    chiudi() {
      this.$emit('update:modelValue', false)
      this.$emit('chiudi')
    },
    // Conferma Variante 1: Nuovo Pasto
    confermaNuovoPasto() {
      const nomePasto = this.pastoSelezionato || this.listaTipiPasto[0]
      this.$emit('conferma', nomePasto)
      this.$emit('conferma-pasto', nomePasto)
      this.chiudi()
    },
    // Conferma Variante 2: Aggiungi Alimento
    selezionaAlimento(alimento) {
      this.selectedAlimentoId = alimento.id
      this.formAlimento.alimentoId = alimento.id
      this.formAlimento.nome = alimento.nome
      
      // Rilevamento automatico unità di misura in base alla categoria o al peso
      if (alimento.categoria === 'Bevande' || alimento.peso?.toLowerCase().includes('l')) {
        this.formAlimento.unita = 'ml'
        this.formAlimento.quantita = 250
      } else if (alimento.peso?.toLowerCase().includes('g')) {
        this.formAlimento.unita = 'g'
        this.formAlimento.quantita = 100
      } else {
        this.formAlimento.unita = 'pz'
        this.formAlimento.quantita = 1
      }
    },
    confermaAggiungiAlimento() {
      if (!this.formAlimento.nome) return
      const payload = {
        pastoId: this.pastoTarget?.id || null,
        alimentoId: this.formAlimento.alimentoId,
        nome: this.formAlimento.nome.trim(),
        quantita: Number(this.formAlimento.quantita) || 1,
        unita: this.formAlimento.unita || 'pz'
      }
      //invia evento generico e anche specifico per viste che gestiscono callback
      this.$emit('conferma', payload)
      this.$emit('conferma-alimento', payload)
      this.chiudi()
    },
    // Conferma Variante 3: Assegna a Giorno
    confermaAssegnaGiorno() {
      if (!this.dataPasto || !this.tipoPasto || this.listaAlimentiSelezionati.length === 0) return
      const payload = {
        data: this.dataPasto,
        tipoPasto: this.tipoPasto,
        alimenti: [...this.listaAlimentiSelezionati]
      }
      this.$emit('conferma', payload)
      this.$emit('conferma-assegna', payload)
      this.chiudi()
    },
    // asssegnazione di emoji in base a parole chiave
    getIconaPasto(nome) {
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
  }
}
</script>

<style scoped>
.assign-icon-badge {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background-color: rgba(69, 123, 157, 0.12);
}

.max-h-preview {
  max-height: 130px;
}

.max-h-alimenti {
  max-height: 150px;
}

.option-button {
  transition: all 0.2s ease;
}
</style>
