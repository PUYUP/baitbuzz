'use client'

import React, { useState } from 'react'
import type { DefaultCellComponentProps } from 'payload'
import { toast } from '@payloadcms/ui'

/**
 * Custom list cell for the `headline` checkbox on Articles — toggles the
 * flag directly from the collection list view via the REST API.
 */
export const HeadlineCell: React.FC<DefaultCellComponentProps> = (props) => {
  const { cellData, collectionSlug, rowData } = props
  const id = rowData?.id
  const [value, setValue] = useState(Boolean(cellData))
  const [saving, setSaving] = useState(false)

  const toggle = async () => {
    if (saving || id == null) return
    const next = !value
    setSaving(true)
    try {
      const res = await fetch(`/api/${collectionSlug}/${id}`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headline: next })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setValue(next)
      toast.success(next ? 'Added to headlines' : 'Removed from headlines')
      window.setTimeout(() => window.location.reload(), 800)
    } catch {
      toast.error('Failed to update headline')
    } finally {
      setSaving(false)
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={saving}
      aria-pressed={value}
      title={value ? 'In homepage headlines — click to remove' : 'Feature in homepage headlines'}
      style={{
        width: 18,
        height: 18,
        borderRadius: 4,
        border: `1.5px solid ${value ? 'var(--theme-success-500, #34c759)' : 'var(--theme-elevation-200, #888)'}`,
        background: value ? 'var(--theme-success-500, #34c759)' : 'transparent',
        cursor: saving ? 'wait' : 'pointer',
        opacity: saving ? 0.5 : 1,
        padding: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {value && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2 6.5 4.5 9 10 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}
