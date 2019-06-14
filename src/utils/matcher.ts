export function match(params: any, tag: string) {
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      const value = params[key]
      if (value === false && key === tag) { // Activator
        params[key] = true
      }
      if (tag.startsWith(`${key}_`)) {
        const subTag = tag.substr(key.length + 1)
        if (Array.isArray(value)) {
          (params[key] as string[]).push(subTag)
        } else {
          switch (typeof value) {
            case 'string':
              params[key] = subTag
              break

            case 'number':
              params[key] = Number(subTag)
              break

            case 'object':
              params[key] = match(params[key], subTag)
              break

            default:
              throw new Error('Bad type')
          }
        }
      }
    }
  }
  return params
}

/** Unsafe recursive matcher */
export default function matcher<T>(params: T, tags: string[]) {
  for (const tag of tags) {
    params = match(params, tag)
  }
  return params
}