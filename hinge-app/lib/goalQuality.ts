import type { QualityScore } from './types'

// Action verbs that signal a specific, doable goal
const ACTION_VERBS = [
  'ship', 'finish', 'complete', 'write', 'submit', 'send', 'review',
  'publish', 'deploy', 'launch', 'fix', 'build', 'create', 'record',
  'schedule', 'call', 'email', 'meet', 'close', 'deliver', 'draft',
  'test', 'refactor', 'update', 'migrate', 'release', 'present',
]

// Destination/outcome words that add specificity
const OUTCOME_WORDS = [
  'to', 'into', 'for', 'by', 'with', 'on', 'staging', 'production',
  'review', 'team', 'client', 'deadline', 'done', 'complete', 'ready',
]

// Vague filler words that reduce score
const VAGUE_WORDS = [
  'stuff', 'things', 'work', 'tasks', 'something', 'maybe', 'try',
  'some', 'more', 'better', 'good', 'various',
]

export function scoreGoalQuality(text: string): QualityScore {
  const trimmed = text.trim()

  if (trimmed.length === 0) {
    return { score: 0, label: '', status: 'neutral', feedback: '' }
  }

  const lower = trimmed.toLowerCase()
  const words = lower.split(/\s+/)
  let score = 0

  // Length score (0–25): sweet spot is 5–15 words
  const wordCount = words.length
  if (wordCount >= 3 && wordCount <= 4) score += 10
  else if (wordCount >= 5 && wordCount <= 15) score += 25
  else if (wordCount >= 16 && wordCount <= 25) score += 15
  else if (wordCount > 25) score += 5

  // Action verb (0–30): starts with or contains a strong verb
  const hasVerb = ACTION_VERBS.some((v) => words.includes(v) || words[0] === v)
  if (hasVerb) score += 30

  // Outcome/destination (0–25): contains a specific destination
  const hasOutcome = OUTCOME_WORDS.some((w) => words.includes(w))
  if (hasOutcome) score += 25

  // Specificity: contains a proper noun / number / file / feature name
  const hasNumber = /\d/.test(trimmed)
  const hasProperNoun = /[A-Z][a-z]/.test(trimmed.slice(1))
  if (hasNumber || hasProperNoun) score += 15

  // Penalty: vague words
  const vagueCount = VAGUE_WORDS.filter((w) => words.includes(w)).length
  score = Math.max(0, score - vagueCount * 10)

  // Cap at 100
  score = Math.min(100, score)

  if (score >= 70) {
    return {
      score,
      label: '✓ Specific',
      status: 'ok',
      feedback: 'Specific — clear output and destination',
    }
  } else if (score >= 35) {
    return {
      score,
      label: '~ Getting there',
      status: 'warn',
      feedback: 'Add a verb + where it ends up (e.g. "Ship X to Y")',
    }
  } else {
    return {
      score,
      label: '⚠ Too vague',
      status: 'warn',
      feedback: 'What exactly will be done, and where?',
    }
  }
}

export function checkTaskRelevance(mainGoal: string, task: string): boolean {
  if (!mainGoal.trim() || !task.trim()) return true
  const goalWords = new Set(mainGoal.toLowerCase().split(/\W+/).filter((w) => w.length > 3))
  const taskWords = task.toLowerCase().split(/\W+/).filter((w) => w.length > 3)
  return taskWords.some((w) => goalWords.has(w))
}
