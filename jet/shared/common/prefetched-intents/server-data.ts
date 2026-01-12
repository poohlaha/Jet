import { isPOJO } from '../../../utils/is-pojo'

const SERVER_DATA_ID = 'serialized-server-data'

const replacements = {
  '<': '\\u003C',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029'
}

const pattern = new RegExp(`[${Object.keys(replacements).join('')}]`, 'g')

export function serializeServerData(data: object): string {
  try {
    const sanitizedData = JSON.stringify(data).replace(pattern, match => replacements[match as keyof typeof replacements])
    return `<script type="application/json" id="${SERVER_DATA_ID}">${sanitizedData}</script>`
  } catch (e) {
    return ''
  }
}

export function deserializeServerData(): ReturnType<JSON['parse']> | undefined {
  const script = document.getElementById(SERVER_DATA_ID)
  if (!script) {
    return
  }

  script.parentNode?.removeChild(script)

  try {
    return JSON.parse(script.textContent || '')
  } catch (e) {
    // If the content is malformed, we want to avoid throwing. This
    // situation should be impossible since we control the serialization
    // above.
  }
}

/**
 * JSON stringify a POJO value in a stable manner. Specifically, this means that
 * objects which are structurally equal serialize to the same string.
 *
 * This is useful when comparing objects serialized by a server against objects
 * build in browser. With plain JSON.stringify(), property order matters and is
 * not guaranteed to be the same. In other words these two objects would
 * JSON.stringify() differently:
 *
 *   { a: 1, b: 2 }
 *   { b: 2, a: 1 }
 *
 * But these are structurally equal--they have the same keys and values.
 *
 * The expected use case for this function is generating keys for a Map for
 * objects from a server that will be compared against objects from the browser.
 * This function should be used on objects returned from `deserializeServerData`
 * before they are used in such contexts.
 *
 * See: https://stackoverflow.com/a/43049877
 */
export function stableStringify(data: unknown): string {
  if (Array.isArray(data)) {
    const items = data.map(stableStringify).join(',')
    return `[${items}]`
  }

  // Sort object keys before serializing
  if (isPOJO(data)) {
    const keys = [...Object.keys(data)]
    keys.sort()

    const properties = keys
      // undefined values should not get included in stringification
      .filter(key => typeof data[key] !== 'undefined')
      .map(key => `${JSON.stringify(key)}:${stableStringify(data[key])}`)
      .join(',')

    return `{${properties}}`
  }

  return JSON.stringify(data)
}
