/**
 * Returns a YYYY-MM-DD string in the device's LOCAL timezone.
 *
 * Using toISOString() returns UTC, which can be a different calendar day
 * for users west of UTC late at night. This function always uses the
 * locally-observed date so "today" matches what the user sees on their clock.
 */
export function localDateStr(d: Date = new Date()): string {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}
