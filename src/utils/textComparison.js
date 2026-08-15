/**
 * Normalizes text for comparison by lowercasing, removing punctuation,
 * multiple spaces, and non-alphanumeric punctuation.
 */
export function normalizeBulgarian(text = '') {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'„“«»—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Splits text into normalized word tokens.
 */
export function getWords(text = '') {
  const norm = normalizeBulgarian(text)
  return norm ? norm.split(' ') : []
}

/**
 * Standard Levenshtein distance calculation between two strings.
 */
export function levenshteinDistance(a = '', b = '') {
  const an = a.length
  const bn = b.length
  if (an === 0) return bn
  if (bn === 0) return an

  const matrix = Array.from({ length: bn + 1 }, () => new Array(an + 1).fill(0))

  for (let i = 0; i <= an; i++) matrix[0][i] = i
  for (let j = 0; j <= bn; j++) matrix[j][0] = j

  for (let j = 1; j <= bn; j++) {
    for (let i = 1; i <= an; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + cost // substitution
      )
    }
  }

  return matrix[bn][an]
}

/**
 * Calculate similarity percentage between two phrases (0 - 100).
 */
export function calculateSimilarity(spoken = '', target = '') {
  const normSpoken = normalizeBulgarian(spoken)
  const normTarget = normalizeBulgarian(target)

  if (!normSpoken && !normTarget) return 100
  if (!normSpoken || !normTarget) return 0
  if (normSpoken === normTarget) return 100

  const maxLen = Math.max(normSpoken.length, normTarget.length)
  const distance = levenshteinDistance(normSpoken, normTarget)
  const similarity = Math.max(0, (1 - distance / maxLen) * 100)

  return Math.round(similarity)
}

/**
 * Evaluates spoken phrase against target phrase word-by-word.
 * Returns match status for each target word.
 */
export function evaluateWordMatch(spoken = '', target = '') {
  const spokenWords = getWords(spoken)
  const targetWords = getWords(target)

  return targetWords.map((tWord, index) => {
    // Exact position match
    if (spokenWords[index] === tWord) {
      return { word: tWord, matched: true, type: 'exact' }
    }
    // Partial position or anywhere in spoken words
    const fuzzyMatch = spokenWords.some(sWord => {
      if (sWord === tWord) return true
      const dist = levenshteinDistance(sWord, tWord)
      return dist <= 1 && tWord.length > 3
    })

    return {
      word: tWord,
      matched: fuzzyMatch,
      type: fuzzyMatch ? 'fuzzy' : 'missed'
    }
  })
}
