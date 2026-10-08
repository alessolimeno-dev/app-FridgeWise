<template>
  <div class="tabella-nutrizione mb-4">
    <!-- Pulsante per espandere/comprimere se collassabile-->
    <button 
      v-if="collapsible"
      type="button" 
      class="btn btn-sm btn-outline-secondary w-100 d-flex justify-content-between align-items-center py-2" 
      @click="isOpen = !isOpen"
      :aria-expanded="isOpen"
    >
      <span>
        <i class="bi bi-heart-pulse-fill text-danger me-2"></i>
        Valori nutrizionali (per 100g)
      </span>
      <i class="bi" :class="isOpen ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
    </button>

    <!-- Contenuto tabella nutrizionale -->
    <div v-show="!collapsible || isOpen" :class="{ 'mt-3': collapsible }">
      <div class="card card-body bg-white border-0 shadow-sm p-3">
        
        <!-- Header per modalità sola lettura quando non collassabile -->
        <div v-if="readonly && !collapsible" class="d-flex justify-content-between align-items-center mb-3">
          <h2 class="h6 fw-bold mb-0 text-dark">
            <i class="bi bi-heart-pulse-fill text-danger me-1"></i> Valori Nutrizionali
          </h2>
          <span class="text-muted small">Per 100g / porzione</span>
        </div>

        <div class="table-responsive">
          <!-- modalità modificabile -->
          <table v-if="!readonly" class="table table-bordered table-sm align-middle mb-0 text-center">
            <thead class="table-light">
              <tr>
                <th class="text-start ps-3">Nutriente</th>
                <th style="width: 140px;">Valore stimato</th>
              </tr>
            </thead>
            <tbody>
              <!-- Calorie -->
              <tr>
                <td class="text-start ps-3 fw-semibold">
                  <i class="bi bi-fire text-warning me-1"></i> Calorie
                </td>
                <td>
                  <div class="input-group input-group-sm">
                    <input 
                      type="number" 
                      class="form-control text-center" 
                      placeholder="0" 
                      min="0" 
                      v-model.number="valoreCalorie"
                    >
                    <span class="input-group-text bg-light">kcal</span>
                  </div>
                </td>
              </tr>

              <!-- Proteine -->
              <tr>
                <td class="text-start ps-3 fw-semibold">
                  <i class="bi bi-egg-fried text-primary me-1"></i> Proteine
                </td>
                <td>
                  <div class="input-group input-group-sm">
                    <input 
                      type="number" 
                      class="form-control text-center" 
                      placeholder="0" 
                      min="0" 
                      step="0.1" 
                      v-model.number="valoreProteine"
                    >
                    <span class="input-group-text bg-light">g</span>
                  </div>
                </td>
              </tr>

              <!-- Carboidrati -->
              <tr>
                <td class="text-start ps-3 fw-semibold">
                  <i class="bi bi-pie-chart text-info me-1"></i> Carboidrati
                </td>
                <td>
                  <div class="input-group input-group-sm">
                    <input 
                      type="number" 
                      class="form-control text-center" 
                      placeholder="0" 
                      min="0" 
                      step="0.1" 
                      v-model.number="valoreCarboidrati"
                    >
                    <span class="input-group-text bg-light">g</span>
                  </div>
                </td>
              </tr>

              <!-- Grassi -->
              <tr>
                <td class="text-start ps-3 fw-semibold">
                  <i class="bi bi-droplet-fill text-warning me-1"></i> Grassi
                </td>
                <td>
                  <div class="input-group input-group-sm">
                    <input 
                      type="number" 
                      class="form-control text-center" 
                      placeholder="0" 
                      min="0" 
                      step="0.1" 
                      v-model.number="valoreGrassi"
                    >
                    <span class="input-group-text bg-light">g</span>
                  </div>
                </td>
              </tr>

              <!-- Sale -->
              <tr>
                <td class="text-start ps-3 fw-semibold">
                  <i class="bi bi-capsule text-secondary me-1"></i> Sale
                </td>
                <td>
                  <div class="input-group input-group-sm">
                    <input 
                      type="number" 
                      class="form-control text-center" 
                      placeholder="0" 
                      min="0" 
                      step="0.01" 
                      v-model.number="valoreSale"
                    >
                    <span class="input-group-text bg-light">g</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- modalità read only -->
          <table v-else class="table table-hover table-borderless align-middle mb-0 small">
            <tbody>
              <tr class="border-bottom">
                <td class="fw-bold text-dark">
                  <i class="bi bi-fire text-warning me-2"></i> Calorie (Energia)
                </td>
                <td class="text-end fw-bold text-dark">
                  {{ valoreCalorie || 0 }} <span class="text-muted fw-normal">kcal</span>
                </td>
              </tr>
              <tr class="border-bottom">
                <td class="fw-bold text-dark">
                  <i class="bi bi-egg-fried text-primary me-2"></i> Proteine
                </td>
                <td class="text-end fw-bold text-dark">
                  {{ valoreProteine || 0 }} <span class="text-muted fw-normal">g</span>
                </td>
              </tr>
              <tr class="border-bottom">
                <td class="fw-bold text-dark">
                  <i class="bi bi-pie-chart text-info me-2"></i> Carboidrati
                </td>
                <td class="text-end fw-bold text-dark">
                  {{ valoreCarboidrati || 0 }} <span class="text-muted fw-normal">g</span>
                </td>
              </tr>
              <tr class="border-bottom">
                <td class="fw-bold text-dark">
                  <i class="bi bi-droplet-fill text-warning me-2"></i> Grassi
                </td>
                <td class="text-end fw-bold text-dark">
                  {{ valoreGrassi || 0 }} <span class="text-muted fw-normal">g</span>
                </td>
              </tr>
              <tr>
                <td class="fw-bold text-dark">
                  <i class="bi bi-capsule text-secondary me-2"></i> Sale
                </td>
                <td class="text-end fw-bold text-dark">
                  {{ valoreSale || 0 }} <span class="text-muted fw-normal">g</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TabellaNutrizione',
  props: {
    // Oggetto completo passato con v-model="form"
    modelValue: {
      type: Object,
      default: () => ({})
    },
    // Supporto per props individuali
    calorie: {
      type: [Number, String],
      default: null
    },
    proteine: {
      type: [Number, String],
      default: null
    },
    carboidrati: {
      type: [Number, String],
      default: null
    },
    grassi: {
      type: [Number, String],
      default: null
    },
    sale: {
      type: [Number, String],
      default: null
    },
    readonly: {
      type: Boolean,
      default: false
    },
    // Se mostrare il pulsante per collassare/espandere
    collapsible: {
      type: Boolean,
      default: true
    },
    // Stato iniziale di apertura se collassabile
    defaultExpanded: {
      type: Boolean,
      default: false
    }
  },
  emits: [
    'update:modelValue',
    'update:calorie',
    'update:proteine',
    'update:carboidrati',
    'update:grassi',
    'update:sale'
  ],
  data() {
    return {
      isOpen: this.defaultExpanded
    }
  },
  computed: {
    //valori nutrizionali calcolati in base a props individuali o all'oggetto completo
    valoreCalorie: {
      get() {
        if (this.calorie !== null) return this.calorie
        return this.modelValue?.calorie ?? 0
      },
      set(val) {
        this.emettiAggiornamento('calorie', val)
      }
    },
    valoreProteine: {
      get() {
        if (this.proteine !== null) return this.proteine
        return this.modelValue?.proteine ?? 0
      },
      set(val) {
        this.emettiAggiornamento('proteine', val)
      }
    },
    valoreCarboidrati: {
      get() {
        if (this.carboidrati !== null) return this.carboidrati
        return this.modelValue?.carboidrati ?? 0
      },
      set(val) {
        this.emettiAggiornamento('carboidrati', val)
      }
    },
    valoreGrassi: {
      get() {
        if (this.grassi !== null) return this.grassi
        return this.modelValue?.grassi ?? 0
      },
      set(val) {
        this.emettiAggiornamento('grassi', val)
      }
    },
    valoreSale: {
      get() {
        if (this.sale !== null) return this.sale
        return this.modelValue?.sale ?? 0
      },
      set(val) {
        this.emettiAggiornamento('sale', val)
      }
    }
  },
  methods: {
    emettiAggiornamento(campo, valore) {
      const valorePulito = valore === '' || isNaN(valore) ? 0 : Number(valore)

      // Emette per v-model="form"
      if (this.modelValue && typeof this.modelValue === 'object') {
        this.$emit('update:modelValue', {
          ...this.modelValue,
          [campo]: valorePulito
        })
      }

      // Emette anche per v-model:campo="form.campo" o @update:campo
      this.$emit(`update:${campo}`, valorePulito)
    }
  }
}
</script>

<style scoped>
.form-control,
.input-group-text {
  border-radius: 10px;
  border: 1px solid #c5cee0;
  background-color: #ffffff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-control:focus {
  border-color: var(--mblu, #457B9D);
  box-shadow: 0 0 0 0.2rem rgba(69, 123, 157, 0.2);
}

.btn-outline-secondary {
  border-color: #c5cee0;
  color: var(--black, #0E1828);
  font-weight: 500;
  border-radius: 10px;
  background-color: #ffffff;
  transition: all 0.2s ease;
}

.btn-outline-secondary:hover {
  background-color: var(--white, #EDF0FA);
  color: var(--dblue, #1D3557);
  border-color: var(--mblu, #457B9D);
}
</style>
