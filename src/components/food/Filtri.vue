<template>
    <div class="filter-bar mb-4">
        <div class="filters-row">
            <!-- luogo di conservazione (su mobile è la prima riga orizzontale; per tablet/pc è tra seleziona e categorie -->
            <div class="filtri-luogo-group">
                <BaseButton 
                    :variant="selectedLuogo === 'tutti' ? 'primary' : 'disabled'" 
                    @click="setLuogo('tutti')"
                >
                    Tutti
                </BaseButton>
                <BaseButton 
                    :variant="selectedLuogo === 'frigo' ? 'primary' : 'disabled'" 
                    @click="setLuogo('frigo')"
                >
                    🧊 Frigo
                </BaseButton>
                <BaseButton 
                    :variant="selectedLuogo === 'dispensa' ? 'primary' : 'disabled'" 
                    @click="setLuogo('dispensa')"
                >
                    🥫 Dispensa
                </BaseButton>
                <BaseButton 
                    :variant="selectedLuogo === 'freezer' ? 'primary' : 'disabled'" 
                    @click="setLuogo('freezer')"
                >
                    ❄️ Freezer
                </BaseButton>
            </div>

            <!-- Riga Seleziona + Categorie (su mobile: seconda riga affiancata; su tablet/pc: elementi inline tramite display: contents) -->
            <div class="seleziona-categoria-row">
                <!-- Tasto Seleziona a sinistra -->
                <div class="btn-seleziona-wrapper">
                    <button 
                        type="button" 
                        class="btn btn-sm rounded-pill px-3 fw-semibold d-flex align-items-center shadow-sm btn-seleziona"
                        :class="isSelectionMode ? 'btn-custom-primary' : 'btn-outline-secondary'"
                        @click="$emit('toggle-seleziona')"
                    >
                        <i class="bi" :class="isSelectionMode ? 'bi-check-square-fill me-1' : 'bi-check2 me-1'"></i>
                        Seleziona
                    </button>
                </div>

                <!-- Select Categorie a destra -->
                <div class="select-categoria-wrapper">
                    <select class="form-select form-select-sm select-categoria" v-model="selectedCategoria" @change="emitFilters">
                        <option value="">Tutte le categorie</option>
                        <option v-for="cat in $categorie" :key="cat" :value="cat">
                            {{ cat }}
                        </option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Barra di Ricerca per tablet/pc -->
        <div class="mt-3 d-none d-md-block">
            <Cerca 
                v-model="searchQuery" 
                placeholder="Cerca un alimento..." 
                @search="emitFilters" 
                @clear="emitFilters"
            />
        </div>
    </div>
</template>

<script>
export default {
    name: 'Filtri',
    //verifica se Selezione multipla è attiva o meno per impostare stile del tasto Seleziona
    props: {
        isSelectionMode: {
            type: Boolean,
            default: false
        },
        //query dell'utente nella barra di ricerca passata come prop di testo
        modelValueSearch: {
            type: String,
            default: ''
        }
    },
    emits: ['filtra', 'toggle-seleziona'], //evento ongi volta che cambia un filtro o si clicca su Seleziona
    data() {
        return {
            searchQuery: this.modelValueSearch || '',
            selectedLuogo: 'tutti',
            selectedCategoria: '' 
        } // memorizza query, luogo e categoria scelti
    },
    watch: {
        modelValueSearch(newVal) {
            this.searchQuery = newVal || ''
        } // sincronizza searchQuery quando cambia la prop modelValueSearch 
    },
    methods: { //al click aggiorna il nuovo valore per applicare il filtro
        setLuogo(luogo) {
            this.selectedLuogo = luogo
            this.emitFilters()
        },
        emitFilters() {
            this.$emit('filtra', {
                searchQuery: this.searchQuery,
                selectedLuogo: this.selectedLuogo,
                selectedCategoria: this.selectedCategoria
            })
        }
    }
}
</script>

<style scoped>
/* Ricerca e icona */
.input-group .form-control,
.input-group-text {
  border-color: #c5cee0;
  background-color: #ffffff;
}

.input-group .form-control:focus {
  border-color: #c5cee0;
  box-shadow: none;
}

.input-group:focus-within {
  box-shadow: 0 0 0 0.2rem rgba(69, 123, 157, 0.2);
  border-radius: 50rem;
}

/* bottoni filtri rimangono dblue anche on-click */
:deep(.base-btn-primary:active) {
  background-color: var(--dblue) !important;
  border-color: var(--dblue) !important;
  transform: none !important;
}

/* Pulsante seleziona */
.btn-outline-secondary {
  color: var(--black);
  border-color: #c5cee0;
  background-color: #ffffff;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-outline-secondary:hover {
  background-color: var(--white);
  color: var(--dblue);
  border-color: var(--mblu);
}

/* Select categorie */
.form-select {
  border-radius: 50rem;
  border-color: #c5cee0;
  background-color: #ffffff;
  font-weight: 500;
  color: var(--black);
  padding-left: 0.85rem;
  padding-right: 2rem;
  font-size: 0.82rem;
}

.form-select:focus {
  border-color: var(--mblu);
  box-shadow: 0 0 0 0.2rem rgba(69, 123, 157, 0.2);
}

/* Layout responsive */
.filters-row {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

/* MOBILE (< 768px) filtri Luogo orizzontali a scorrimento*/
.filtri-luogo-group {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
  align-items: center;
  width: 100%;
}
/* Riga 2: Seleziona a sinistra e Select Categoria a destra sulla stessa riga */
.seleziona-categoria-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 0.5rem;
}

.btn-seleziona-wrapper {
  flex-shrink: 0;
}

.btn-seleziona {
  white-space: nowrap;
}

.select-categoria-wrapper {
  flex-shrink: 0;
  margin-left: auto;
}

.select-categoria {
  width: 175px;
  max-width: 180px;
}

/* Tablet e PC (>= 768px) tutti su una riga */
@media (min-width: 768px) {
  .filters-row {
    flex-direction: row;
    align-items: center;
    flex-wrap: nowrap;
    gap: 0.5rem;
  }

  /* figli di seleziona-categoria-row diventano elementi diretti di filters-row: seleziona, luogo, categorie*/
  .seleziona-categoria-row {
    display: contents;
  }

  .btn-seleziona-wrapper {
    order: 1;
    flex-shrink: 0;
  }

  .filtri-luogo-group {
    order: 2;
    width: auto;
    overflow-x: visible;
    padding-bottom: 0;
    flex-shrink: 0;
    margin: 0 auto;
    justify-content: center;
  }

  .select-categoria-wrapper {
    order: 3;
    margin-left: 0;
    flex-shrink: 0;
  }

  .select-categoria {
    width: 160px;
    max-width: 180px;
  }
}

/* Scrollbar orizzontale nascosta su mobile ma rimane scorrimento */
.filtri-luogo-group::-webkit-scrollbar {
  display: none;
}
.filtri-luogo-group {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>