<template>
  <div class="card bg-white border-0 shadow-sm p-3 p-md-4 rounded-3 pasto-card position-relative d-flex flex-column">
    <!-- Elimina pasto in alto a destra se in modalità modificabile -->
    <button 
      v-if="editable"
      type="button" 
      class="btn btn-sm btn-outline-danger border-0 p-1 position-absolute top-0 end-0 m-3"
      @click.stop="$emit('rimuovi-pasto', pasto.id)"
      title="Rimuovi pasto intero"
      aria-label="Rimuovi pasto"
    >
      <i class="bi bi-trash fs-5"></i>
    </button>

    <!-- Header -->
    <div class="text-center mb-3">
      <div class="pasto-emoji mb-1" aria-hidden="true">
        {{ iconaPasto }}
      </div>
      <h3 class="pasto-title h5 fw-bold mb-1">
        {{ pasto.nome }}
      </h3>
      <span class="badge bg-light text-muted border small">
        {{ pasto.alimenti.length }} {{ pasto.alimenti.length === 1 ? 'alimento' : 'alimenti' }}
      </span>
    </div>

    <!-- Lista alimenti nel pasto -->
    <div v-if="pasto.alimenti.length === 0" class="py-3 text-center text-muted small bg-light rounded-2 flex-grow-1 d-flex align-items-center justify-content-center" :class="{ 'mb-3': editable }">
      Nessun alimento in questo pasto.
    </div>

    <div v-else class="d-flex flex-column gap-2 flex-grow-1" :class="{ 'mb-3': editable }">
      <div 
        v-for="item in pasto.alimenti" 
        :key="item.id"
        class="d-flex justify-content-between align-items-center p-2 rounded-2 bg-light border"
      >
        <span class="fw-bold text-dark d-block small text-truncate me-2 food-title">{{ item.nome }}</span>

        <div class="d-flex align-items-center gap-2 flex-shrink-0">
          <!-- Badge Quantità e Unità -->
          <span class="badge bg-white text-dark border px-2 py-1 fw-bold">
            {{ item.quantita }} {{ item.unita || 'pz' }}
          </span>

          <!-- Elimina alimento dal pasto visibile solo in modalità modificabile -->
          <button 
            v-if="editable"
            type="button" 
            class="btn btn-sm text-danger p-0 ms-1"
            @click.stop="$emit('rimuovi-alimento', item.id)"
            title="Rimuovi alimento"
            aria-label="Rimuovi alimento"
          >
            <i class="bi bi-x-circle-fill"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Aggiungi Alimento in basso visibile solo in modalità modificabile -->
    <div v-if="editable" class="d-flex justify-content-center mt-auto pt-2">
      <BaseButton 
        variant="secondary"
        @click.stop="$emit('aggiungi-alimento', pasto.id)"
        icon="bi-plus-lg"
      >
        Aggiungi alimento
      </BaseButton>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PastoCard',
  props: {
    pasto: {
      type: Object,
      required: true
    },
    editable: {
      type: Boolean,
      default: true
    }
  },
  emits: ['rimuovi-pasto', 'rimuovi-alimento', 'aggiungi-alimento'],
  computed: {
    // asssegnazione di emoji in base a parole chiave
    iconaPasto() {
      if (!this.pasto || !this.pasto.nome) return '🍽️'
      const n = this.pasto.nome.toLowerCase()
      if (n.includes('colazione')) return '🥐'
      if (n.includes('mattina') || n.includes('spuntino')) return '🍎'
      if (n.includes('pranzo')) return '🥗'
      if (n.includes('merenda')) return '🥪'
      if (n.includes('cena')) return '🍲'
      if (n.includes('sera')) return '🍵'
      return '🍽️'
    }
  }
}
</script>

<style scoped>
.pasto-card {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.pasto-emoji {
  font-size: 2.5rem;
  line-height: 1.1;
}

.pasto-title {
  color: var(--dblue) !important;
}
</style>
