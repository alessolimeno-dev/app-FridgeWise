<template>
  <div class="card bg-white border-0 shadow-sm p-2 px-3 rounded-3 d-flex flex-row align-items-center justify-content-between gap-2 voce-spesa-item">
    <!-- Checkbox Spunta Acquisto -->
    <button 
      type="button" 
      class="btn p-0 border-0 bg-transparent text-secondary d-flex align-items-center check-spesa-btn"
      @click="$emit('acquista', { idLista, idElemento: voce.id, nome: voce.nome })"
      title="Segna come acquistato e sposta in dispensa"
      aria-label="Acquista alimento"
    >
      <i class="bi bi-square fs-5 text-muted check-icon"></i>
      <i class="bi bi-check-square-fill fs-5 text-success check-icon-hover"></i>
    </button>

    <!-- Input nome cibo -->
    <div class="flex-grow-1">
      <input 
        type="text" 
        class="form-control form-control-sm border-0 bg-transparent p-1 fw-semibold text-dark input-voce-spesa"
        v-model.trim="testoLocale" 
        placeholder="Es. Latte, Zucchine, Pane..."
        @blur="salvaModifica"
        @keydown.enter="$event.target.blur()"
      >
    </div>

    <!-- Pulsante elimina -->
    <button 
      type="button" 
      class="btn btn-sm text-danger p-1 border-0 bg-transparent btn-delete-voce"
      @click="$emit('elimina', { idLista, idElemento: voce.id })"
      title="Elimina dalla lista della spesa"
      aria-label="Elimina voce spesa"
    >
      <i class="bi bi-trash3"></i>
    </button>
  </div>
</template>

<script>
export default {
  name: 'VoceSpesa',
  props: {
    voce: {
      type: Object,
      required: true
    },
    idLista: {
      type: String,
      required: true
    }
  },
  emits: ['acquista', 'modifica-testo', 'elimina'],
  data() {
    return {
      testoLocale: this.voce.nome || ''
    }
  },
  watch: {
    'voce.nome'(nuovoValore) {
      this.testoLocale = nuovoValore || ''
    }
  },
  methods: {
    salvaModifica() {
      if (this.testoLocale && this.testoLocale !== this.voce.nome) {
        this.$emit('modifica-testo', {
          idLista: this.idLista,
          idElemento: this.voce.id,
          nuovoNome: this.testoLocale
        })
      } else if (!this.testoLocale) {
        // Se l'utente cancella tutto il testo, ripristiniamo il nome precedente
        this.testoLocale = this.voce.nome
      }
    }
  }
}
</script>

<style scoped>
.voce-spesa-item {
  transition: transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
  border-left: 3px solid var(--orange) !important;
}

.voce-spesa-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06) !important;
}

.check-spesa-btn {
  cursor: pointer;
}

.check-spesa-btn .check-icon-hover {
  display: none;
}

.check-spesa-btn:hover .check-icon {
  display: none;
}

.check-spesa-btn:hover .check-icon-hover {
  display: inline-block;
}

.input-voce-spesa {
  font-size: 0.95rem;
}

.input-voce-spesa:focus {
  background-color: #ffffff !important;
  box-shadow: 0 0 0 0.15rem rgba(69, 123, 157, 0.15);
  border-radius: 6px;
}

.btn-delete-voce {
  opacity: 0.6;
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.btn-delete-voce:hover {
  opacity: 1;
  transform: scale(1.1);
}
</style>