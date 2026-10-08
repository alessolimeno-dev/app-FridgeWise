import axios from 'axios'

// Cache in memoria del dizionario traduzioni per evitare chiamate HTTP ripetute
let dizionarioTraduzioni = null

/**
 * Carica il dizionario da /data/TraduzioneAlimenti.json (pubblico)
 */
async function caricaDizionario() {
  if (dizionarioTraduzioni) return dizionarioTraduzioni

  try {
    const response = await axios.get('/data/TraduzioneAlimenti.json')
    dizionarioTraduzioni = response.data || {}
  } catch (error) {
    console.warn('Impossibile caricare /data/TraduzioneAlimenti.json:', error)
    dizionarioTraduzioni = {}
  }
  return dizionarioTraduzioni
}

/**
 * Cerca il nome inglese dell'alimento basandosi esclusivamente su /data/TraduzioneAlimenti.json
 * Supporta corrispondenza esatta e per parole chiave (es. "Spaghetti n.5" -> "Spaghetti").
 * 
 * @param {string} nomeItaliano - Es. "Spaghetti", "Petto di Pollo", "Banane"
 * @returns {Promise<string|null>} Nome dell'ingrediente in inglese o null se non trovato
 */
export async function getNomeIngredienteInglese(nomeItaliano) {
  if (!nomeItaliano || !nomeItaliano.trim()) return null

  const testo = nomeItaliano.toLowerCase().trim()
  const traduzioni = await caricaDizionario()

  // 1. Corrispondenza esatta nel dizionario
  if (traduzioni[testo]) {
    return traduzioni[testo]
  }

  // 2. Corrispondenza per parole chiave (ordinate per lunghezza decrescente)
  const chiaviOrdinate = Object.keys(traduzioni).sort((a, b) => b.length - a.length)
  for (const chiave of chiaviOrdinate) {
    if (testo.includes(chiave)) {
      return traduzioni[chiave]
    }
  }

  return null
}

/**
 * Restituisce l'URL dell'immagine da TheMealDB solo se l'alimento è presente nel dizionario locale
 * @param {string} nomeItaliano - Nome dell'alimento in italiano
 * @param {boolean} small - True per la versione miniatura (-Small.png)
 * @returns {Promise<string>} URL dell'immagine PNG o stringa vuota se non trovato
 */
export async function getFoodImageUrl(nomeItaliano, small = false) {
  const nomeInglese = await getNomeIngredienteInglese(nomeItaliano)
  if (!nomeInglese) return ''

  const formatoNome = encodeURIComponent(nomeInglese)
  const suffisso = small ? '-Small.png' : '.png'
  return `https://www.themealdb.com/images/ingredients/${formatoNome}${suffisso}`
}
