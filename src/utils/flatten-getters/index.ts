export default function flattenGetters (obj: unknown): Record<string, unknown> {
  try {
    const { entries, getOwnPropertyDescriptors } = Object
    const getters = entries(getOwnPropertyDescriptors(obj))
      .filter(([_, desc]) => (typeof desc.get === 'function'))
      .map(([key]) => key)
    const returned: Record<string, unknown> = {}
    getters.forEach(getter => {
      returned[getter] = (obj as any)[getter]
    })
    return returned
  } catch (err) {
    return {}
  }
}
