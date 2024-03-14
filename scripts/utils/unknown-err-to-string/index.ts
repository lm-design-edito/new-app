export default function unknownErrToString (err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  if (err === null) return 'null'
  if (err === undefined) return 'undefined'
  try { return JSON.stringify(err) }
  catch { return `Unknown error object: ${err}` }
}
