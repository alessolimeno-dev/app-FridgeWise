<template>
  <component
    :is="isRouterLink ? 'router-link' : 'button'"
    :to="isRouterLink ? to : undefined"
    :type="!isRouterLink ? type : undefined"
    :disabled="!isRouterLink ? disabled : undefined"
    :class="buttonClasses"
    @click="$emit('click', $event)"
  >
    <!-- Icona (se passata via prop o freccia automatica per variante back) -->
    <i v-if="iconaEffettiva" class="bi" :class="iconaEffettiva"></i>

    <!-- contenuto VUE slot x pulsante -->
    <slot></slot>
  </component>
</template>

<script>
export default {
  name: 'BaseButton',
  props: {
    // 5 varianti: 'primary', 'secondary', 'back', 'disabled', 'modifica' (o 'btn-modifica')
    variant: {
      type: String,
      default: 'primary',
      validator: (val) => ['primary', 'secondary', 'back', 'disabled', 'modifica', 'btn-modifica'].includes(val)
    },
    // Se impostato, renderizza come <router-link>, altrimenti <button>
    to: {
      type: [String, Object],
      default: null
    },
    // Tipo bottone HTML (se button)
    type: {
      type: String,
      default: 'button'
    },
    // disabilitato
    disabled: {
      type: Boolean,
      default: false
    },
    // Icona opzionale Bootstrap
    icon: {
      type: String,
      default: ''
    },
    // Dimensione
    size: {
      type: String,
      default: 'sm',
      validator: (val) => ['sm', 'md', 'lg'].includes(val)
    },
    // Modalità solo icona opzionale (attiva automaticamente se non c'è testo)
    iconOnly: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click'],
  computed: {
    isRouterLink() {
      return !!this.to
    },
    iconaEffettiva() {
      if (this.icon) return this.icon
      if (this.variant === 'back') return 'bi-arrow-left'
      return null
    },
    isIconOnly() {
      return this.iconOnly || (!this.$slots.default && !!this.iconaEffettiva)
    },
    buttonClasses() {
      return [
        'base-btn',
        `base-btn-${this.variant}`,
        (this.variant === 'modifica' || this.variant === 'btn-modifica') ? 'btn-modifica' : '',
        `base-btn-${this.size}`,
        { 'base-btn-icon-only': this.isIconOnly },
        { disabled: this.disabled }
      ].filter(Boolean)
    }
  }
}
</script>

<style scoped>
.base-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 50rem; 
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  border: 1.5px solid transparent;
  line-height: 1.4;
  white-space: nowrap;
}

/* classi per dimensione */
.base-btn-sm {
  padding: 6px 16px;
  font-size: 0.85rem;
}

.base-btn-md {
  padding: 9px 22px;
  font-size: 0.95rem;
}

.base-btn-lg {
  padding: 12px 26px;
  font-size: 1.05rem;
}

/* icona circolare, centrata e proporzionata */
.base-btn.base-btn-icon-only {
  width: 40px;
  height: 40px;
  min-width: 40px;
  min-height: 40px;
  padding: 0 !important;
  border-radius: 50rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0;
}

.base-btn.base-btn-icon-only i {
  font-size: 1.15rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* PRIMARY: sfondo --dblue, testo --white, grassetto */
.base-btn-primary {
  font-weight: 700; /* Testo in grassetto */
  background-color: var(--dblue);
  color: var(--white) !important;
  border-color: var(--dblue);
  box-shadow: 0 2px 6px rgba(29, 53, 87, 0.2);
}

/* PRIMARY-HOVER: cambia colore a --mblu */
@media (hover: hover) {
  .base-btn-primary:hover:not(:disabled) {
    background-color: var(--mblu) !important;
    border-color: var(--mblu) !important;
    color: #ffffff !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(29, 53, 87, 0.25);
  }
}

/* PRIMARY-ACTIVE: cambia colore -> feedback di pressione */
.base-btn-primary:active:not(:disabled) {
  background-color: var(--mblu) !important;
  border-color: var(--mblu) !important;
  color: #ffffff !important;
  transform: scale(0.98);
}

/* SECONDARY: senza sfondo, bordo --dblue, testo --dblue, grassetto */
.base-btn-secondary {
  font-weight: 700; /* Testo in grassetto */
  background-color: transparent;
  color: var(--dblue) !important;
  border-color: var(--dblue);
}

.base-btn-secondary:hover:not(:disabled) {
  background-color: var(--dblue);
  color: var(--white) !important;
  border-color: var(--dblue);
  transform: translateY(-1px);
}

.base-btn-secondary:active:not(:disabled) {
  transform: translateY(0);
}

/* INDIETRO: outline --grey, testi --grey / neutro, NON in grassetto */
.base-btn-back {
  font-weight: 400; /* Testo non in grassetto */
  background-color: transparent;
  color: var(--black) !important;
  border-color: var(--grey);
}

.base-btn-back:hover:not(:disabled) {
  background-color: var(--white);
  border-color: var(--mblu);
  color: var(--dblue) !important;
  transform: translateY(-1px);
}

.base-btn-back:active:not(:disabled) {
  transform: translateY(0);
}

/* 4. VARIANTE DISABLED (Filtri non attivi): bordo --grey, testi --dblue, NON in grassetto */
.base-btn-disabled {
  font-weight: 400; /* Testo non in grassetto */
  background-color: #ffffff;
  color: var(--dblue) !important;
  border-color: var(--grey);
}

.base-btn-disabled:hover:not(:disabled) {
  background-color: var(--white);
  border-color: var(--mblu);
  color: var(--dblue) !important;
  transform: translateY(-1px);
}

.base-btn-disabled:active:not(:disabled) {
  transform: translateY(0);
}

/* 5. VARIANTE MODIFICA (.btn-modifica): nessun riempimento, bordo grigio scuro tendente al blu (#4a5d6e) */
.base-btn-modifica,
.base-btn-btn-modifica,
.base-btn.btn-modifica {
  font-weight: 600;
  background-color: transparent !important;
  color: var(--dblue, #1D3557) !important;
  border: 1.5px solid #4a5d6e !important;
  box-shadow: none;
}

.base-btn-modifica i,
.base-btn-btn-modifica i,
.base-btn.btn-modifica i {
  color: var(--dblue, #1D3557) !important;
}

@media (hover: hover) {
  .base-btn-modifica:hover:not(:disabled),
  .base-btn-btn-modifica:hover:not(:disabled),
  .base-btn.btn-modifica:hover:not(:disabled) {
    background-color: rgba(74, 93, 110, 0.08) !important;
    border-color: var(--dblue, #1D3557) !important;
    color: var(--dblue, #1D3557) !important;
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(29, 53, 87, 0.1);
  }
}

.base-btn-modifica:active:not(:disabled),
.base-btn-btn-modifica:active:not(:disabled),
.base-btn.btn-modifica:active:not(:disabled) {
  background-color: rgba(74, 93, 110, 0.15) !important;
  transform: scale(0.98);
}

/* Stato disabilitato */
.base-btn:disabled,
.base-btn.disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
  pointer-events: none;
}
</style>
