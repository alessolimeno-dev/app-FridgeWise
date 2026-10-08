 <!-- Componente per la barra di ricerca in alto -->
<template>
  <div class="input-group search-bar-group" :class="{ 'input-group-sm': size === 'sm' }">
    <!-- Icona lente ingrandimento - default desktop a sinistra -->
    <span 
      v-if="iconPosition === 'left'" 
      class="input-group-text bg-white border-end-0 text-muted"
      :class="rounded === 'pill' ? 'rounded-start-pill' : 'rounded-start'"
    >
      <i class="bi bi-search"></i>
    </span>
    <!-- la posizione dipende da iconPosition - così resta riutilizzabile -->

    <!-- spazio per il testodi ricerca -->
    <input 
      type="text" 
      class="form-control py-2 input-cerca" 
      :class="[
        iconPosition === 'left' ? 'border-start-0' : 'border-end-0',
        rounded === 'pill' && iconPosition === 'right' ? 'rounded-start-pill' : '',
        rounded === 'pill' && iconPosition === 'left' && !mostraTastoAzzera ? 'rounded-end-pill' : ''
      ]"
      :placeholder="placeholder" 
      :value="modelValue"
      @input="onInput"
      @keydown.enter="$emit('enter', modelValue)"
    >

    <!-- Pulsante azzera ricerca: per eliminare il filtro di ricerca e vedere di nuovo la lista completa -->
    <button 
      v-if="mostraTastoAzzera" 
      type="button" 
      class="btn btn-white border-start-0 border-end-0 text-muted p-0 px-2 btn-azzera"
      @click="azzera"
      title="Azzera ricerca"
      aria-label="Azzera ricerca"
    >
      <i class="bi bi-x-circle-fill text-secondary"></i>
    </button>

    <!-- opzione icona a destra -->
    <span 
      v-if="iconPosition === 'right'" 
      class="input-group-text bg-white border-start-0 text-muted"
      :class="rounded === 'pill' ? 'rounded-end-pill' : 'rounded-end'"
    >
      <i class="bi bi-search"></i>
    </span>
  </div>
</template>

<script>
export default {
  name: 'Cerca',
  props: {
    // Valore del testo di ricerca (supporta v-model)
    modelValue: {
      type: String,
      default: ''
    },
    // Testo placeholder dell'input
    placeholder: {
      type: String,
      default: 'Cerca un alimento...'
    },
    // Dimensione: 'md' (default) oppure 'sm'
    size: {
      type: String,
      default: 'md',
      validator: (val) => ['sm', 'md'].includes(val)
    },
    // Arrotondamento bordi: 'pill' (default) o 'default'
    rounded: {
      type: String,
      default: 'pill',
      validator: (val) => ['pill', 'default'].includes(val)
    },
    // Posizione icona lente: 'left' (default) o 'right'
    iconPosition: {
      type: String,
      default: 'left',
      validator: (val) => ['left', 'right'].includes(val)
    },
    // Mostra pulsante per azzerare quando c'è testo
    showClear: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:modelValue', 'search', 'clear', 'enter'],
  computed: {
    mostraTastoAzzera() {
      return this.showClear && !!this.modelValue && this.modelValue.length > 0
    }
  },
  methods: {
    onInput(event) {
      const val = event.target.value
      this.$emit('update:modelValue', val)
      this.$emit('search', val)
    },
    azzera() {
      this.$emit('update:modelValue', '')
      this.$emit('search', '')
      this.$emit('clear')
    }
  }
}
</script>

<style scoped>
.search-bar-group .form-control,
.search-bar-group .input-group-text,
.search-bar-group .btn-azzera {
  border-color: #c5cee0;
  background-color: #ffffff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-bar-group .form-control:focus {
  border-color: #c5cee0;
  box-shadow: none;
}

.search-bar-group:focus-within {
  box-shadow: 0 0 0 0.2rem rgba(69, 123, 157, 0.2);
  border-radius: 50rem;
}

.btn-azzera {
  border: 1px solid #c5cee0;
  border-left: none !important;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-azzera:hover i {
  color: var(--dblue, #1D3557) !important;
}
</style>

