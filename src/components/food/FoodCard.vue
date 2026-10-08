<template>
  <div 
    class="food-card p-3 shadow-sm"
    :class="{ 
      'food-card-scaduto': ciboScaduto,
      'food-card-in-scadenza': ciboInScadenza,
      'card-selected': isSelected
    }"
    @click="vaiAlDettaglio"
    role="button"
    tabindex="0"
    @keydown.enter="vaiAlDettaglio"
  >
    <div class="food-card-layout d-flex align-items-center gap-2">
      <!-- Checkbox visibile in modalità selezione -->
      <div 
        v-if="isSelectionMode" 
        class="form-check m-0 d-flex align-items-center me-2 flex-shrink-0"
        @click.stop="$emit('toggle-select', cibo.id)"
      >
        <input 
          type="checkbox" 
          class="form-check-input food-checkbox m-0" 
          :checked="isSelected"
          :id="`check-${cibo.id}`"
          aria-label="Seleziona alimento"
        >
      </div>

      <!-- grid principale -->
      <div class="food-card-grid flex-grow-1 min-w-0">
        <!-- riga dei BadgeBase -->
        <div class="food-card-badges d-flex align-items-center gap-2 flex-wrap">
          <BadgeBase variant="luogo" :value="cibo.luogo" />
          <BadgeBase v-if="cibo.categoria" variant="categoria" :value="cibo.categoria" />
          <BadgeBase v-if="cibo.quantita" variant="quantita">{{ cibo.quantita }} pz</BadgeBase>
        </div>

        <!-- nome e quantità/peso -->
        <div class="food-card-title-row d-flex justify-content-between align-items-baseline gap-2">
          <h3 class="h6 mb-0 fw-bold food-title text-truncate">
            {{ cibo.nome }}
          </h3>
          <span class="food-weight text-nowrap">
            {{ cibo.peso || '-' }}
          </span>
        </div>

        <!-- data di scadenza (se presente) -->
        <div class="food-card-expiry-row d-flex align-items-center">
          <span 
            v-if="cibo.dataScadenza" 
            class="food-expiry text-nowrap"
          >
            <i class="bi bi-hourglass-split me-1" v-if="!ciboScaduto"></i>
            <i class="bi bi-exclamation-triangle-fill me-1" v-else></i>
            {{ formattaScadenza(cibo.dataScadenza) }}
          </span>
        </div>

        <!-- Modifica (nascosto in modalità selezione) -->
        <BaseButton 
          v-if="!isSelectionMode"
          variant="modifica"
          size="sm"
          icon="bi-pencil"
          class="food-card-edit-btn"
          @click.stop="$emit('edit', cibo)"
          aria-label="Modifica alimento"
        >
          Modifica
        </BaseButton>

        <!-- immagine -->
        <div v-if="urlImmagine" class="food-card-img-container flex-shrink-0">
          <img 
            :src="urlImmagine" 
            :alt="cibo.nome" 
            class="food-card-img"
            @error="onImageError"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { calcolaGiorniDiff, formatDataBreve } from '@/utils/dateUtils'
import { getFoodImageUrl } from '@/utils/foodImageService'

export default {
  name: 'FoodCard',
  props: {
    alimento: {
      type: Object,
      default: () => ({})
    },
    isSelectionMode: {
      type: Boolean,
      default: false
    }, // modalità selezione attiva?
    isSelected: {
      type: Boolean,
      default: false
    } //l'alimento è selezionato?
  },
  emits: ['select', 'edit', 'toggle-select'],
  data() { //memorizza url immagine trovata di img nuove per evitare continue interrogazioni API
    return {
      immagineRisolta: ''
    }
  },
  computed: {
    cibo() {
      return this.alimento || {}
    },
    ciboScaduto() {
      return this.isScaduto(this.cibo.dataScadenza)
    },
    ciboInScadenza() {
      if (!this.cibo.dataScadenza) return false
      const diff = calcolaGiorniDiff(this.cibo.dataScadenza)
      return diff !== null && diff >= 0 && diff <= 3
    },
    urlImmagine() { //url dell'img attuale o , in assenza, quella dell'api
      return this.cibo.immagine || this.immagineRisolta
    }
  },
  async created() {
    // img caricata appena si crea nuova card 
    await this.caricaImmagine()
  },
  watch: {
    'cibo.nome'() {
      this.caricaImmagine()
    }, //sincronizza img a nome
    'cibo.immagine'(nuovaImg) {
      if (nuovaImg) {
        this.immagineRisolta = nuovaImg
      }
    }
  },
  methods: {
    async caricaImmagine() {
      if (this.cibo?.immagine) {
        this.immagineRisolta = this.cibo.immagine
      } else if (this.cibo?.nome) {
        this.immagineRisolta = await getFoodImageUrl(this.cibo.nome)
      } else {
        this.immagineRisolta = ''
      }
    },
    vaiAlDettaglio() { //click su card in base a modalità selezione
      if (this.isSelectionMode) {
        this.$emit('toggle-select', this.cibo.id)
        return
      }
      if (this.cibo.id) {
        this.$emit('select', this.cibo.id)
        this.$router.push(`/alimento/${this.cibo.id}`)
      }
    },
    onImageError() {
      this.immagineRisolta = ''
    },
    isScaduto(dataString) {
      if (!dataString) return false
      const diff = calcolaGiorniDiff(dataString)
      return diff !== null && diff < 0
    },
    formattaScadenza(dataString) {
      if (!dataString) return '-'
      const diff = calcolaGiorniDiff(dataString)
      if (diff < 0) {
        const gg = Math.abs(diff)
        return gg === 1 ? 'Scaduto da 1 giorno' : `Scaduto da ${gg} giorni`
      }
      if (diff === 0) return 'Scade oggi!'
      if (diff === 1) return 'Scade domani'
      if (diff <= 3) return `Scade tra ${diff} giorni`
      return `Scadenza: ${formatDataBreve(dataString)}`
    }
  }
}
</script>

<style scoped>
.food-card {
  background-color: rgba(167, 218, 219, 0.35);
  background: color-mix(in srgb, var(--lblue) 35%, transparent);
  border-bottom: 5px solid var(--mblu);
  border-radius: 14px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  user-select: none;
}

.food-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(14, 24, 40, 0.14);
}

.food-card:active {
  transform: scale(0.99);
}

/* Stato in scadenza (entro 3 giorni */
.food-card-in-scadenza {
  background: color-mix(in srgb, var(--yellow) 20%, transparent) !important;
  border-bottom: 5px solid var(--yellow) !important;
}

/* Stato scaduto*/
.food-card-scaduto {
  background: color-mix(in srgb, var(--orange) 20%, transparent) !important;
  border-bottom: 5px solid var(--red) !important;
}

/* Griglia con contenuto a sinistra + immagine sopra il tasto modifica */
.food-card-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-areas:
    "badges image"
    "title  image"
    "expiry button";
  row-gap: 6px;
  column-gap: 10px;
  align-items: center;
}
.food-card-badges {
  grid-area: badges;
}

.food-card-title-row {
  grid-area: title;
  min-width: 0;
}

.food-card-expiry-row {
  grid-area: expiry;
  min-width: 0;
}

.food-card-edit-btn {
  grid-area: button;
  width: 7rem;
  justify-self: end;
}

/* Dettagli */
.food-weight {
  color: var(--dblue);
  font-weight: 700;
  font-size: 0.95rem;
}

.food-expiry {
  color: var(--dblue);
  font-weight: 600;
  font-size: 0.82rem;
}

/* Scritta scadenza alimenti scaduti: bold e colore #E63946 (var(--red)) */
.food-card-scaduto .food-expiry {
  color: var(--red, #E63946) !important;
  font-weight: 700 !important;
}

/* Scritta scadenza alimenti in scadenza: bold e colore ambra/giallo scuro */
.food-card-in-scadenza .food-expiry {
  color: #9a6500 !important;
  font-weight: 700 !important;
}

/* Contenitore Immagine dedicato  */
.food-card-img-container {
  grid-area: image;
  width: 58px;
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
  justify-self: center;
  align-self: center;
  pointer-events: none;
}

/* Immagine 100% opaca, nitida, senza trasparenze */
.food-card-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.12));
  transition: transform 0.2s ease;
}

.food-card:hover .food-card-img {
  transform: scale(1.08);
}

/* Visualizzazione oltre i 415px: ripristina il layout attuale con tasto modifica e immagine a destra */
@media (min-width: 415px) {
  .food-card-grid {
    grid-template-columns: 1fr auto auto;
    grid-template-areas:
      "badges badges image"
      "title  title  image"
      "expiry button image";
    row-gap: 4px;
    column-gap: 12px;
  }

  .food-card-img-container {
    width: 66px;
    height: 66px;
    justify-self: end;
  }
}

@media (min-width: 576px) {
  .food-card-img-container {
    width: 76px;
    height: 76px;
  }
}

/* Stili per la modalità selezione */
.food-checkbox {
  width: 22px;
  height: 22px;
  cursor: pointer;
  border-radius: 6px;
  border: 2px solid #a0aec0;
  transition: all 0.15s ease;
}

.food-checkbox:checked {
  background-color: var(--dblue);
  border-color: var(--dblue);
}

.card-selected {
  box-shadow: 0 0 0 2.5px var(--mblu), 0 6px 16px rgba(14, 24, 40, 0.18) !important;
  transform: translateY(-2px);
}
</style>