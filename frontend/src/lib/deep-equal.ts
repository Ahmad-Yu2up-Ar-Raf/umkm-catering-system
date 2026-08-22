/**
 * Deep equality check for form state diffing.
 * Handles File, Date, undefined/null mismatches, and object key ordering.
 * ponytail: uses lodash/isEqual semantics without dependency
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true

  if (a == null || b == null) return false

  if (typeof a !== "object" || typeof b !== "object") return false

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((item, idx) => deepEqual(item, b[idx]))
  }

  if (Array.isArray(a) || Array.isArray(b)) return false

  if (a instanceof File && b instanceof File) {
    return a.name === b.name && a.type === b.type && a.size === b.size
  }

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime()
  }

  if (a instanceof File || b instanceof File) return false

  const keysA = Object.keys(a).sort()
  const keysB = Object.keys(b).sort()

  if (keysA.length !== keysB.length) return false

  return keysA.every((key, idx) => {
    if (keysA[idx] !== keysB[idx]) return false
    return deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])
  })
}
