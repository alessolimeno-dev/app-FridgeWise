import dayjs from 'dayjs'
import 'dayjs/locale/it.js'
import isoWeek from 'dayjs/plugin/isoWeek.js'

// Configurazione plugin e lingua italiana
dayjs.extend(isoWeek)
dayjs.locale('it')

/**
 * Restituisce la data odierna in formato ISO 'YYYY-MM-DD'
 */
export function getOggiISO() {
  return dayjs().format('YYYY-MM-DD')
}

/**
 * Restituisce l'istanza dayjs per la data di oggi a mezzanotte
 */
export function getOggiDayjs() {
  return dayjs().startOf('day')
}

/**
 * Formatta una data nel formato esteso es: "Domenica 23 Agosto 2026"
 */
export function formatDataBella(dateInput) {
  if (!dateInput) return ''
  const d = dayjs(dateInput)
  const testo = d.format('dddd D MMMM YYYY')
  return testo.charAt(0).toUpperCase() + testo.slice(1)
}

/**
 * Formatta una data nel formato breve es: "23 Ago"
 */
export function formatGiornoMese(dateInput) {
  if (!dateInput) return ''
  const d = dayjs(dateInput)
  return d.format('D MMM')
}

/**
 * Formatta una data es: "23/08/2026"
 */
export function formatDataBreve(dateInput) {
  if (!dateInput) return ''
  return dayjs(dateInput).format('DD/MM/YYYY')
}

/**
 * Restituisce i 7 giorni della settimana (da Lunedì a Domenica)
 * per la settimana che include la data di riferimento `refDate`.
 */
export function getSettimana(refDate = dayjs()) {
  const dataRif = dayjs(refDate)
  const lunedi = dataRif.startOf('isoWeek')
  const oggiStr = getOggiISO()

  const giorni = []
  for (let i = 0; i < 7; i++) {
    const giornoCurr = lunedi.add(i, 'day')
    const dateStr = giornoCurr.format('YYYY-MM-DD')
    
    // Capitalizza la prima lettera del giorno
    const shortRaw = giornoCurr.format('ddd')
    const longRaw = giornoCurr.format('dddd')

    giorni.push({
      dateStr,
      dayNameShort: shortRaw.charAt(0).toUpperCase() + shortRaw.slice(1).replace('.', ''),
      dayNameLong: longRaw.charAt(0).toUpperCase() + longRaw.slice(1),
      dayNumber: giornoCurr.format('D'),
      monthName: giornoCurr.format('MMM'),
      isToday: dateStr === oggiStr,
      fullDate: giornoCurr
    })
  }

  return {
    lunediISO: lunedi.format('YYYY-MM-DD'),
    domenicaISO: lunedi.add(6, 'day').format('YYYY-MM-DD'),
    titoloSettimana: `${lunedi.format('D MMM')} - ${lunedi.add(6, 'day').format('D MMM YYYY')}`,
    giorni
  }
}

/**
 * Calcola i giorni di differenza tra una data di scadenza e oggi
 * > 0: giorni mancanti
 * = 0: scade oggi
 * < 0: scaduto da X giorni
 */
export function calcolaGiorniDiff(dataScadenza) {
  if (!dataScadenza) return null
  const scadenza = dayjs(dataScadenza).startOf('day')
  const oggi = dayjs().startOf('day')
  return scadenza.diff(oggi, 'day')
}

export default dayjs
