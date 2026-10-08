<template>
  <span 
    class="badge badge-base" 
    :class="`badge-${variant}`"
  >
    <!-- slot principale con contenuto flessibile-->
    <slot>{{ testoFormattato }}</slot>
  </span>
</template>

<script>
export default {
  name: 'BadgeBase',
  props: {
    // Varianti dle badge: luogo , categoria, quantità, scadenza, default
    variant: {
      type: String,
      default: 'default',
      validator: (val) => ['luogo', 'categoria', 'quantita', 'scadenza', 'default'].includes(val)
    },
    // il valore viene passato direttametne da props
    value: {
      type: [String, Number],
      default: ''
    }
  },
  computed: {
    testoFormattato() {
      if (!this.value && this.value !== 0) return ''

      // Funzione per ottimizzare la variante luogo: toglie emoji e maiuscola.
      if (this.variant === 'luogo') {
        const l = String(this.value).toLowerCase()
        if (l === 'frigo') return '🧊 Frigo'
        if (l === 'dispensa') return '🥫 Dispensa'
        if (l === 'freezer') return '❄️ Freezer'
        return this.value
      }

      return this.value
    }
  }
}
</script>

<style scoped>
.badge-base {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  line-height: 1.2;
}

/* Luogo */
.badge-luogo {
  background-color: #ffffff;
  color: var(--dblue, #1D3557);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

/*  Categoria */
.badge-categoria {
  background-color: #ffffff;
  color: var(--dblue, #1D3557);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* Quantità / Pezzi */
.badge-quantita {
  background-color: #ffffff;
  color: var(--dblue, #1D3557);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* Default */
.badge-default {
  background-color: var(--white, #EDF0FA);
  color: var(--black, #0E1828);
}
</style>
