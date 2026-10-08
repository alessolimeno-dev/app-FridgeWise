<template>
  <!-- impostazione dello sfondo: booleana collegata al v-model-->
  <div 
    v-if="modelValue" 
    class="modal-backdrop-custom d-flex align-items-center justify-content-center p-3"
    @click.self="chiudi"
    tabindex="-1"
    @keydown.esc="chiudi" 
  >
  <!-- iil keydown gestisce gli eventi da tastiera -->
   <!-- spazio della card del modale con definizione di grandezza massima e scroll interno -->
    <div 
      :class="['card bg-white border-0 shadow-lg rounded-4 w-100 animate-in modal-card-scrollable', cardMaxWidthClass]"
    >
      <!-- form (nuovo alimento o modifica): mostrato se richiesto formAlimento-->
      <div v-if="isFormAlimento && !$slots.default" class="p-4">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div class="d-flex align-items-center gap-2">
            <img :src="logoApp" alt="Icona FridgeWise" class="modal-title-logo" />
            <h3 class="h5 fw-bold mb-0 text-dark">
              {{ isEditModeProdotto ? 'Modifica Alimento' : 'Nuovo Alimento' }}
            </h3>
          </div>
          <button type="button" class="btn-close" @click="chiudi" aria-label="Chiudi"></button>
        </div>
        <!-- isEditModeProdotto richiamata per gestione del form: nuovo o modifica -->

        <form @submit.prevent="confermaSalvaProdotto">
          <!-- Nome Alimento è obbligatorio: gestito con v-model.trim -->
          <div class="mb-3">
            <label class="form-label fw-bold small text-dark mb-1">
              Nome alimento <span class="text-danger">*</span>
            </label>
            <input 
              type="text" 
              class="form-control" 
              v-model.trim="formProdotto.nome" 
              placeholder="Es. Spaghetti, Latte, Petto di Pollo..." 
              required
            >
          </div>

          <!-- Luogo di conservazione -->
          <div class="mb-3">
            <label class="form-label fw-bold small text-dark d-block mb-1">
              Luogo di conservazione <span class="text-danger">*</span>
            </label>
            <div 
              v-for="opzione in $luoghi" 
              :key="opzione.val" 
              class="form-check form-check-inline"
            >
              <input 
                :id="'modal-' + opzione.val" 
                class="form-check-input" 
                type="radio" 
                :value="opzione.val" 
                v-model="formProdotto.luogo" 
                required
              >
              <label class="form-check-label" :for="'modal-' + opzione.val">
                {{ opzione.label }}
              </label>
            </div>

          </div>

          <!-- Categoria, Quantità e Peso: l'unità di misura cambia tra bevande e alimenti -->
          <div class="row g-2 mb-3">
            <div class="col-12 col-md-6">
              <label class="form-label fw-bold small text-dark mb-1">Categoria <span class="text-danger">*</span></label>
              <select class="form-select" v-model="formProdotto.categoria" required>
                <option v-for="cat in $categorie" :key="cat" :value="cat">
                  {{ cat }}
                </option>
              </select>
            </div>

            <div class="col-6 col-md-3">
              <label class="form-label fw-bold small text-dark mb-1">Quantità (pz)</label>
              <input 
                type="number" 
                class="form-control" 
                v-model.number="formProdotto.quantita" 
                min="1" 
                placeholder="Es. 2" 
                required
              >
            </div>

            <div class="col-6 col-md-3">
              <label class="form-label fw-bold small text-dark mb-1">Grammatura/Peso</label>
              <div class="input-group">
                <input 
                  type="number" 
                  class="form-control" 
                  v-model.number="formProdotto.valorePeso" 
                  min="1" 
                  placeholder="500" 
                >
                <span class="input-group-text bg-light text-muted small fw-bold">{{ unitaMisuraProdotto }}</span>
              </div>
            </div>
          </div>

          <!-- Date Acquisto e Scadenza -->
          <div class="row g-2 mb-3">
            <div class="col-6">
              <label class="form-label fw-bold small text-dark mb-1">Data di acquisto</label>
              <input type="date" class="form-control" v-model="formProdotto.dataAcquisto" required>
            </div>
            <!-- Condizione v-if / v-else: Scadenza obbligatoria o facoltativa gestite da isScadenzaObbligatoria -->
            <div class="col-6">
              <label class="form-label fw-bold small text-dark mb-1">
                Data di scadenza <span v-if="isScadenzaObbligatoria" class="text-danger">*</span>
                <span v-else class="text-muted small fw-normal">(opzionale)</span>
              </label>
              <input type="date" class="form-control" v-model="formProdotto.dataScadenza" :required="isScadenzaObbligatoria">
            </div>

          </div>

          <!-- Note -->
          <div class="mb-3">
            <label class="form-label fw-bold small text-dark mb-1">Note (opzionali)</label>
            <textarea 
              class="form-control" 
              rows="2" 
              v-model.trim="formProdotto.note" 
              placeholder="Es. Da consumare entro 3 giorni dall'apertura..."
            ></textarea>
          </div>

          <!-- tabella nutrizionale collaps -->
          <div class="mb-4">
            <TabellaNutrizione 
              v-model="formProdotto"
              :readonly="false"
              :collapsible="true"
              :defaultExpanded="false"
            />
          </div>

          <!-- Pulsante per chiusura modal -->
          <div class="d-flex justify-content-end gap-2">
            <BaseButton variant="back" type="button" @click="chiudi">
              Annulla
            </BaseButton>
            <!-- Pulsante per salvataggio attivo se il form è valido -->
            <BaseButton 
              variant="primary" 
              type="submit"
              :disabled="!isFormProdottoValido"
            >
              {{ isEditModeProdotto ? 'Salva Modifiche' : 'Aggiungi Alimento' }}
            </BaseButton>
          </div>
        </form>
      </div>

      <!-- slot generico per inserimento di altri modal. -->

      <div v-else>
        <slot>
          <div class="p-4">
            <p class="text-muted mb-0">Nessun contenuto disponibile.</p>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
import TabellaNutrizione from '../food/TabellaNutrizione.vue'
import logoApp from '@/assets/icona-FW.png'
// campi alimento
const getInitialForm = () => ({
  id: null,
  nome: '',
  luogo: 'frigo',
  categoria: 'Altro',
  quantita: 1,
  valorePeso: null,
  peso: '',
  dataAcquisto: new Date().toISOString().split('T')[0],
  dataScadenza: '',
  note: '',
  calorie: null,
  proteine: null,
  carboidrati: null,
  grassi: null,
  sale: null
})

export default {
  name: 'Modal',
  components: {
    TabellaNutrizione
  },
  props: {
    // Controllo visibilità modal
    modelValue: {
      type: Boolean,
      default: false
    },
    // prop default - mostrata per aggiungere alimento
    variante: {
      type: String,
      default: 'formAlimento'
    },
    // crea un alimento quando non fornito un id
    alimentoIniziale: {
      type: Object,
      default: null
    },
    // classe per la dimensione del modal
    customClass: {
      type: String,
      default: ''
    },
    // Ddimensioni responsive
    size: {
      type: String,
      default: ''
    }
  },
  emits: [
    'update:modelValue',
    'chiudi',
    'salva-alimento'
  ],
  data() {
    return {
      logoApp,
      // Stato Form Alimento Dispensa/Frigo
      formProdotto: getInitialForm()
    }
  },

  computed: {
    isFormAlimento() {
      return !this.variante || this.variante === 'formAlimento'
    },
    cardMaxWidthClass() {
      if (this.customClass) return this.customClass
      if (this.size === 'sm') return 'max-w-modal-sm'
      if (this.size === 'md') return 'max-w-modal-md'
      if (this.size === 'lg') return 'max-w-modal-lg'
      return this.isFormAlimento && !this.$slots.default ? 'max-w-modal-lg' : 'max-w-modal-md'
    },
    // se viene mandato un id al form torna true
    isEditModeProdotto() {
      return !!(this.formProdotto && this.formProdotto.id)
    },
    isScadenzaObbligatoria() {
      //  le categorie elencate non hanno bisogno di scadenza: se impostate ==false
      const categorieFacoltative = ['carboidrati', 'verdura', 'frutta', 'bevande', 'altro']
      const cat = (this.formProdotto.categoria || '').toLowerCase()
      return !categorieFacoltative.includes(cat)
    },
    isFormProdottoValido() {
      const nomeValido = this.formProdotto.nome?.trim().length > 0
      const luogoValido = !!this.formProdotto.luogo
      const scadenzaValida = !this.isScadenzaObbligatoria || !!this.formProdotto.dataScadenza
      return nomeValido && luogoValido && scadenzaValida
    }, //controlli di validità del form

    unitaMisuraProdotto() {
      return this.formProdotto.categoria === 'Bevande' ? 'L' : 'g'
    }
  },
  watch: {
    //quando il modal si apre chiama la funzione di reset per pulire il form
    modelValue(val) {
      if (val) {
        this.resetForm()
      }
    },
    // se il componente ricece un alimento da modificare chiama la funzione di popolaForm per inserire
        //le info dell'alimento inserito in modo tale che l'utente possa modificarle.
    alimentoIniziale: {
      handler(nuovo) {
        if (nuovo) {
          this.popolaFormProdotto(nuovo)
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    chiudi() {
      this.$emit('update:modelValue', false)
      this.$emit('chiudi')
    },
    resetForm() {
      if (this.alimentoIniziale) {
        this.popolaFormProdotto(this.alimentoIniziale)
      } else {
        this.formProdotto = getInitialForm()
      }
    },
    popolaFormProdotto(item) {
      this.formProdotto = { ...item }
      if (item.peso) {
        const numeric = parseFloat(item.peso)
        this.formProdotto.valorePeso = !isNaN(numeric) ? numeric : null
      }
    },
    confermaSalvaProdotto() {
      if (!this.isFormProdottoValido) return

      if (this.formProdotto.valorePeso) {
        this.formProdotto.peso = `${this.formProdotto.valorePeso} ${this.unitaMisuraProdotto}`
      } else {
        this.formProdotto.peso = ''
      }

      this.$emit('salva-alimento', {
        ...this.formProdotto,
        isEditMode: this.isEditModeProdotto
      })
      this.chiudi()
    },

  }
}
</script>

<style scoped>

/* Larghezze responsive e fluide: si adattano su mobile e rispettano il max-width su desktop */
.max-w-modal-sm {
  width: 100%;
  max-width: min(380px, 94vw);
}

.max-w-modal-md,
.max-w-modal {
  width: 100%;
  max-width: min(440px, 94vw);
}

.max-w-modal-lg {
  width: 100%;
  max-width: min(560px, 94vw);
}

.modal-card-scrollable {
  max-height: 90vh;
  overflow-y: auto;
}

.modal-title-logo {
  width: 28px;
  height: 28px;
  object-fit: contain;
  display: inline-block;
  flex-shrink: 0;
}

@media (max-width: 576px) {
  .modal-card-scrollable {
    max-height: 93vh;
    border-radius: 1.25rem !important;
  }
}

.max-h-alimenti {
  max-height: 160px;
}

.option-button {
  transition: all 0.15s ease-in-out;
}

.form-control,
.form-select,
.input-group-text {
  border-radius: 10px;
  border: 1px solid #c5cee0;
  background-color: #ffffff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-control:focus,
.form-select:focus {
  border-color: var(--mblu);
  box-shadow: 0 0 0 0.2rem rgba(69, 123, 157, 0.2);
}

.form-check-input:checked {
  background-color: var(--dblue);
  border-color: var(--dblue);
}
</style>
