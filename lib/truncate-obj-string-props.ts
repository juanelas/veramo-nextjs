export function truncateObjStringProps<T extends Record<string, string>>(
  input: T,
  l: number
): T {
  const truncated: T = {} as T

  for (const key in input) {
    if (typeof input[key] === 'string' && input[key].length > (l - 3)) { // we remove the three dots '...' from the truncated length
      truncated[key] = input[key].slice(0, l) + '...' as T[Extract<keyof T, string>]
    } else {
      truncated[key] = input[key]
    }
  }

  return truncated
}
