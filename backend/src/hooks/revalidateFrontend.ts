import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

/**
 * Notifies the reader frontend to drop its in-memory API cache after
 * content mutations, so edits appear without waiting for the TTL.
 * Fire-and-forget: never blocks or fails the CMS operation.
 */
const notifyFrontend = async () => {
  const url = process.env.FRONTEND_REVALIDATE_URL
  const secret = process.env.REVALIDATE_SECRET
  if (!url || !secret) return

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'x-revalidate-secret': secret },
      signal: AbortSignal.timeout(5000)
    })
  } catch {
    // Frontend unreachable — stale cache expires via TTL anyway
  }
}

export const revalidateFrontend: CollectionAfterChangeHook = async () => {
  await notifyFrontend()
}

export const revalidateFrontendDelete: CollectionAfterDeleteHook = async () => {
  await notifyFrontend()
}
