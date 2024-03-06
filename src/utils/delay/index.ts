export default async function delay (durationMs: number) {
  const { setTimeout } = window
  return new Promise (res => setTimeout(res, durationMs))
}
