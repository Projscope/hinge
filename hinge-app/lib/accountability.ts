const KEY = 'hinge_accountability_partner'

export interface AccountabilityPartner {
  email: string
  name: string
  addedAt: string
}

export function getPartner(): AccountabilityPartner | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw) as AccountabilityPartner
  } catch {
    return null
  }
}

export function setPartner(email: string, name: string): AccountabilityPartner {
  const partner: AccountabilityPartner = {
    email: email.trim(),
    name: name.trim(),
    addedAt: new Date().toISOString(),
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEY, JSON.stringify(partner))
  }
  return partner
}

export function removePartner(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(KEY)
}
