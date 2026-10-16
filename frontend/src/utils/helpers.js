export const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR')
}

export const formatDateTime = (date, time) => {
  if (!date) return '-'
  const d = new Date(date)
  if (time) {
    return d.toLocaleDateString('fr-FR') + ' ' + time
  }
  return d.toLocaleDateString('fr-FR')
}
