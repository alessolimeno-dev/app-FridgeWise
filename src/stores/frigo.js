import { defineStore } from 'pinia'
import axios from 'axios'
import dayjs, { getOggiISO, calcolaGiorniDiff } from '../utils/dateUtils' //libreria esterna per date

// ordinamento pasti in base a definito da tipoPastoPredefiniti
function ordinaPasti(pasti, ordinePredefinito) {
    if (!pasti || !Array.isArray(pasti)) return []
    return [...pasti].sort((a, b) => {
        const indexA = ordinePredefinito.indexOf(a.nome) //guarda l'indice definito nel pasto
        const indexB = ordinePredefinito.indexOf(b.nome)
        const posA = indexA === -1 ? 999 : indexA
        const posB = indexB === -1 ? 999 : indexB
        return posA - posB
    })
}

export const useFrigoStore = defineStore('frigo', {
    state: () => ({
        // Lista reattiva degli alimenti caricati
        alimenti: [],
        isLoaded: false,
        loading: false,
        error: null,

        // Tipi di pasti predefiniti consentiti in ordine cronologico
        tipiPastoPredefiniti: [
            'Colazione',
            'Spuntino Mattina',
            'Pranzo',
            'Merenda',
            'Cena',
            'Spuntino Sera'
        ],

        // data di oggi
        selectedDate: getOggiISO(),

        planners: [],

        //liste della spesa - nome variabile, id fisso.
        listeSpesa: [
            { id: 'lista_1', nome: 'Supermercato', elementi: [] },
            { id: 'lista_2', nome: 'Ortofrutta', elementi: [] },
            { id: 'lista_3', nome: 'Macelleria', elementi: [] },
            { id: 'lista_4', nome: 'Varie', elementi: [] }
        ],
        idListaAttiva: 'lista_1'
    }),

    getters: {
        // se non c'è usa funzione per creare ID
        getAlimentoById: (state) => {
            return (id) => state.alimenti.find((alimento) => String(alimento.id) === String(id))
        },

        // calcola la scadenza e poi ordina in ordine decrescente
        //cambia stato solo se la data di scadenza è tre o più
        cibiInScadenza: (state) => {
            return state.alimenti
                .filter((alimento) => {
                    if (!alimento.dataScadenza) return false
                    const diff = calcolaGiorniDiff(alimento.dataScadenza)
                    return diff !== null && diff <= 3
                })
                .sort((a, b) => {
                    const diffA = calcolaGiorniDiff(a.dataScadenza) ?? 0
                    const diffB = calcolaGiorniDiff(b.dataScadenza) ?? 0
                    return diffA - diffB
                })
        },

        // cambia stato solo se la data di scadenza è negativa
        cibiScaduti: (state) => {
            return state.alimenti.filter((alimento) => {
                if (!alimento.dataScadenza) return false
                const diff = calcolaGiorniDiff(alimento.dataScadenza)
                return diff !== null && diff < 0
            })
        },

        // Filtri per luogo di conservazione - richiamati da bottoni home
        cibiFrigo: (state) => state.alimenti.filter((alimento) => alimento.luogo?.toLowerCase() === 'frigo'),
        cibiDispensa: (state) => state.alimenti.filter((alimento) => alimento.luogo?.toLowerCase() === 'dispensa'),
        cibiFreezer: (state) => state.alimenti.filter((alimento) => alimento.luogo?.toLowerCase() === 'freezer'),

        // counter elementi
        totaleAlimenti: (state) => state.alimenti.length,

        // richiamo del planner
        getPlannerByDate: (state) => {
            return (dateStr) => {
                const trovato = state.planners.find((p) => p.data === dateStr)
                if (trovato) {
                    return {
                        ...trovato,
                        pasti: ordinaPasti(trovato.pasti, state.tipiPastoPredefiniti)
                    }
                }
                return {
                    id: `planner_${dateStr}`,
                    data: dateStr,
                    pasti: []
                }
            }
        },

        pastiOggi: (state) => {
            const oggiISO = getOggiISO()
            const plannerOggi = state.planners.find((p) => p.data === oggiISO)
            return plannerOggi ? ordinaPasti(plannerOggi.pasti, state.tipiPastoPredefiniti) : []
        },

        // booleano che indica se la data di oggi ha almeno un pasto assegnato
        haPastiInData: (state) => {
            return (dateStr) => {
                const p = state.planners.find((item) => item.data === dateStr)
                return !!(p && p.pasti && p.pasti.length > 0)
            }
        },
        listaSpesaAttiva: (state) => {
            return state.listeSpesa.find((l) => l.id === state.idListaAttiva) || state.listeSpesa[0]
        },

        // Conteggio totale elementi in tutte le liste
        totaleElementiSpesa: (state) => {
            return state.listeSpesa.reduce((acc, curr) => acc + (curr.elementi ? curr.elementi.length : 0), 0)
        }
    },

    actions: {
        // chiama i dati in local storage, se vuoto GET su alimenti e salvataggio memoria
        async caricaAlimenti() {
            if (this.isLoaded && this.alimenti.length > 0) return

            this.loading = true
            this.error = null

            try {
                // Controllo se ci sono dati precedentemente salvati in localStorage
                const datiSalvati = localStorage.getItem('app_frigo_alimenti')
                if (datiSalvati) {
                    this.alimenti = JSON.parse(datiSalvati)
                    this.isLoaded = true
                } else {
                    const response = await axios.get('/data/alimenti.json')
                    this.alimenti = response.data
                    this.isLoaded = true
                    this.salvaSuStorage()
                }
            } catch (err) {
                console.error('Errore nel caricamento degli alimenti:', err)
                this.error = 'Impossibile caricare i prodotti alimentari.'
            } finally {
                this.loading = false
            }
        },

        // Visualizza dati dei planner in localStroage e converte le date
        async caricaPlanner() {
            try {
                const salvati = localStorage.getItem('app_frigo_planners')
                if (salvati) {
                    this.planners = JSON.parse(salvati)
                } else {
                    // Caricamento asincrono iniziale da file JSON esterno (/data/planner.json)
                    const response = await axios.get('/data/planner.json')
                    const rawData = response.data || []

                    const oggi = dayjs().startOf('day')
                    this.planners = rawData.map((item) => {
                        const dateStr = item.data 
                            ? item.data 
                            : (item.offsetGiorni !== undefined 
                                ? oggi.add(item.offsetGiorni, 'day').format('YYYY-MM-DD') 
                                : getOggiISO())
                        return {
                            ...item,
                            id: `planner_${dateStr}`,
                            data: dateStr
                        }
                    })
                    this.salvaPlannerSuStorage()
                }
            } catch (e) {
                console.warn('Errore nel caricamento del planner da JSON:', e)
                this.planners = []
            }
        },

        // sincronizzazione con localStorage
        salvaSuStorage() {
            try {
                localStorage.setItem('app_frigo_alimenti', JSON.stringify(this.alimenti))
            } catch (e) {
                console.warn('Impossibile salvare alimenti in localStorage:', e)
            }
        },

        salvaPlannerSuStorage() {
            try {
                localStorage.setItem('app_frigo_planners', JSON.stringify(this.planners))
            } catch (e) {
                console.warn('Impossibile salvare planner in localStorage:', e)
            }
        },

        // selezione della data dall'utente
        setSelectedDate(dateStr) {
            this.selectedDate = dateStr
        },

        // Ottiene o crea il planner per una specifica data
        _getOrCreatePlanner(dateStr) {
            let planner = this.planners.find((p) => p.data === dateStr)
            if (!planner) {
                planner = {
                    id: `planner_${dateStr}`,
                    data: dateStr,
                    pasti: []
                }
                this.planners.push(planner)
            }
            return planner
        },

        // nuovo pasto con data e nome con validazione del nome
        aggiungiPasto(dateStr, nomePasto) {
            const planner = this._getOrCreatePlanner(dateStr)
            
            const nomeValido = this.tipiPastoPredefiniti.includes(nomePasto) 
                ? nomePasto 
                : this.tipiPastoPredefiniti[0]

            const nuovoPasto = {
                id: `pasto_${Date.now()}`,
                nome: nomeValido,
                alimenti: []
            }
            planner.pasti.push(nuovoPasto)
            planner.pasti = ordinaPasti(planner.pasti, this.tipiPastoPredefiniti)
            this.salvaPlannerSuStorage()
            return nuovoPasto
        },

        // eliminazione pasto - solo nella data specifica
        rimuoviPasto(dateStr, pastoId) {
            const planner = this.planners.find((p) => p.data === dateStr)
            if (planner) {
                planner.pasti = planner.pasti.filter((p) => p.id !== pastoId)
                this.salvaPlannerSuStorage()
            }
        },

        // aggiunge sincoli cibi al pasto con quantità variabile
        aggiungiAlimentoAPasto(dateStr, pastoId, itemData) {
            const planner = this._getOrCreatePlanner(dateStr)
            const pasto = planner.pasti.find((p) => p.id === pastoId)
            if (pasto) {
                const nuovoAlimento = {
                    id: `item_${Date.now()}`,
                    alimentoId: itemData.alimentoId || null,
                    nome: itemData.nome ? itemData.nome.trim() : 'Alimento',
                    quantita: itemData.quantita !== undefined && itemData.quantita !== null ? itemData.quantita : 1,
                    unita: itemData.unita || 'pz'
                }
                pasto.alimenti.push(nuovoAlimento)
                this.salvaPlannerSuStorage()
            }
        },

        // assegnazione dal selezione del pasto al giorno indicato nel modal
        assegnaAlimentiAPasto(dateStr, nomePasto, alimentiDaAggiungere) {
            let planner = this.planners.find((p) => p.data === dateStr)
            if (!planner) {
                planner = {
                    id: `planner_${dateStr}`,
                    data: dateStr,
                    pasti: []
                }
                this.planners.push(planner)
            }
            
            // Trova se il pasto con quel nome esiste già in quella data, altrimenti crealo
            let pasto = planner.pasti.find((p) => p.nome === nomePasto)
            if (!pasto) {
                const nomeValido = this.tipiPastoPredefiniti.includes(nomePasto) 
                    ? nomePasto 
                    : this.tipiPastoPredefiniti[0]
                pasto = {
                    id: `pasto_${Date.now()}`,
                    nome: nomeValido,
                    alimenti: []
                }
                planner.pasti.push(pasto)
            }

            // Replica per ogni alimento selezionato
            alimentiDaAggiungere.forEach((item, index) => {
                const quantitaNum = Number(item.quantita) || 1
                const unitaVal = item.unita || (item.peso ? item.peso : 'pz')
                const nuovoAlimento = {
                    id: `item_${Date.now()}_${index}`,
                    alimentoId: item.id || null,
                    nome: item.nome ? item.nome.trim() : 'Alimento',
                    quantita: quantitaNum,
                    unita: unitaVal
                }
                pasto.alimenti.push(nuovoAlimento)
            })

            // Trigger reattività esplicito per aggiornare i getter e componenti (es. pastiOggi)
            this.planners = [...this.planners]
            this.salvaPlannerSuStorage()
            return pasto
        },

        // Rimuove un alimento da un pasto
        rimuoviAlimentoDaPasto(dateStr, pastoId, itemId) {
            const planner = this.planners.find((p) => p.data === dateStr)
            if (planner) {
                const pasto = planner.pasti.find((p) => p.id === pastoId)
                if (pasto) {
                    pasto.alimenti = pasto.alimenti.filter((a) => a.id !== itemId)
                    this.salvaPlannerSuStorage()
                }
            }
        },

        modificaQuantitaAlimento(dateStr, pastoId, itemId, nuovaQuantita, nuovaUnita = null) {
            const planner = this.planners.find((p) => p.data === dateStr)
            if (planner) {
                const pasto = planner.pasti.find((p) => p.id === pastoId)
                if (pasto) {
                    const alimento = pasto.alimenti.find((a) => a.id === itemId)
                    if (alimento) {
                        if (nuovaQuantita !== undefined && nuovaQuantita !== null) {
                            alimento.quantita = nuovaQuantita
                        }
                        if (nuovaUnita) {
                            alimento.unita = nuovaUnita
                        }
                        this.salvaPlannerSuStorage()
                    }
                }
            }
        },

        // aggiunta di un alimento in dispensa da parte dell'utente
        aggiungiAlimento(item) {
            const nuovo = {
                ...item,
                id: Date.now().toString(),
                calorie: Number(item.calorie) || 0,
                proteine: Number(item.proteine) || 0,
                carboidrati: Number(item.carboidrati) || 0,
                grassi: Number(item.grassi) || 0,
                sale: Number(item.sale) || 0,
                quantita: Number(item.quantita) || 1
            }
            this.alimenti.unshift(nuovo)
            this.salvaSuStorage()
            return nuovo
        },

        // modifica di un alimento in dispensa
        modificaAlimento(updatedItem) {
            const idToFind = updatedItem.id
            const index = this.alimenti.findIndex((alimento) => String(alimento.id) === String(idToFind))
            if (index !== -1) {
                this.alimenti[index] = {
                    ...this.alimenti[index],
                    ...updatedItem,
                    calorie: Number(updatedItem.calorie) || 0,
                    proteine: Number(updatedItem.proteine) || 0,
                    carboidrati: Number(updatedItem.carboidrati) || 0,
                    grassi: Number(updatedItem.grassi) || 0,
                    sale: Number(updatedItem.sale) || 0,
                    quantita: Number(updatedItem.quantita) || 1
                }
                this.salvaSuStorage()
            }
        },

        // eliminazione alimento dalla dispensa
        rimuoviAlimento(id) {
            this.alimenti = this.alimenti.filter((alimento) => String(alimento.id) !== String(id))
            this.salvaSuStorage()
        },

        // 
        rimuoviAlimenti(ids) {
            if (!Array.isArray(ids) || ids.length === 0) return
            const idSet = new Set(ids.map(String))
            this.alimenti = this.alimenti.filter((alimento) => !idSet.has(String(alimento.id)))
            this.salvaSuStorage()
        },

        // Caricamento liste della spesa da localStorage
        caricaListeSpesa() {
            try {
                const salvate = localStorage.getItem('app_frigo_liste_spesa')
                if (salvate) {
                    const parsed = JSON.parse(salvate)
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        this.listeSpesa = parsed
                    }
                }
                const activeId = localStorage.getItem('app_frigo_id_lista_attiva')
                if (activeId && this.listeSpesa.some((l) => l.id === activeId)) {
                    this.idListaAttiva = activeId
                }
            } catch (e) {
                console.warn('Errore nel caricamento liste spesa:', e)
            }
        },

        // Persistenza locale liste della spesa
        salvaListeSpesaSuStorage() {
            try {
                localStorage.setItem('app_frigo_liste_spesa', JSON.stringify(this.listeSpesa))
                localStorage.setItem('app_frigo_id_lista_attiva', this.idListaAttiva)
            } catch (e) {
                console.warn('Impossibile salvare liste spesa:', e)
            }
        },

        // Imposta la lista della spesa attiva
        setListaAttiva(idLista) {
            if (this.listeSpesa.some((l) => l.id === idLista)) {
                this.idListaAttiva = idLista
                this.salvaListeSpesaSuStorage()
            }
        },

        // Rinomina una delle 4 liste della spesa
        rinominaListaSpesa(idLista, nuovoNome) {
            const lista = this.listeSpesa.find((l) => l.id === idLista)
            if (lista && nuovoNome && nuovoNome.trim()) {
                lista.nome = nuovoNome.trim()
                this.salvaListeSpesaSuStorage()
            }
        },

        // Aggiunge una voce alla lista della spesa
        aggiungiElementoSpesa(idLista, nomeCibo) {
            const lista = this.listeSpesa.find((l) => l.id === idLista)
            if (lista && nomeCibo && nomeCibo.trim()) {
                const nuovo = {
                    id: `spesa_${Date.now()}`,
                    nome: nomeCibo.trim(),
                    completato: false,
                    dataAggiunta: getOggiISO()
                }
                if (!lista.elementi) lista.elementi = []
                lista.elementi.push(nuovo)
                this.salvaListeSpesaSuStorage()
                return nuovo
            }
        },

        // Modifica il testo di una voce della spesa
        modificaElementoSpesa(idLista, idElemento, nuovoNome) {
            const lista = this.listeSpesa.find((l) => l.id === idLista)
            if (lista && lista.elementi) {
                const elemento = lista.elementi.find((el) => el.id === idElemento)
                if (elemento && nuovoNome && nuovoNome.trim()) {
                    elemento.nome = nuovoNome.trim()
                    this.salvaListeSpesaSuStorage()
                }
            }
        },

        // Rimuove una voce dalla lista della spesa
        rimuoviElementoSpesa(idLista, idElemento) {
            const lista = this.listeSpesa.find((l) => l.id === idLista)
            if (lista && lista.elementi) {
                lista.elementi = lista.elementi.filter((el) => el.id !== idElemento)
                this.salvaListeSpesaSuStorage()
            }
        },

        // Spunta una voce dalla spesa, la rimuove dalla lista e la inserisce automaticamente in dispensa con data acquisto = oggi
        completaEAcquistaElemento(idLista, idElemento) {
            const lista = this.listeSpesa.find((l) => l.id === idLista)
            if (!lista || !lista.elementi) return null

            const elemento = lista.elementi.find((el) => el.id === idElemento)
            if (!elemento) return null

            // 1. Rimuovi dalla lista della spesa
            lista.elementi = lista.elementi.filter((el) => el.id !== idElemento)
            this.salvaListeSpesaSuStorage()

            // 2. Inserisci automaticamente nella dispensa con data acquisto odierna
            const nuovoAlimento = {
                id: Date.now().toString(),
                nome: elemento.nome,
                luogo: 'dispensa',
                categoria: 'Altro',
                quantita: 1,
                peso: '',
                dataAcquisto: getOggiISO(),
                dataScadenza: dayjs().add(7, 'day').format('YYYY-MM-DD'),
                dataScadenza: '',
                note: 'Aggiunto automaticamente dalla lista della spesa',
                calorie: 0,
                proteine: 0,
                carboidrati: 0,
                grassi: 0,
                sale: 0
            }

            this.alimenti.unshift(nuovoAlimento)
            this.salvaSuStorage()
            return nuovoAlimento
        }
    }
})
