export interface Topic {
  id: number | string
  name: string
  slug: string
  description?: string | null
}

export interface Media {
  id: number | string
  url?: string
  alt?: string
  width?: number
  height?: number
}

export type SourcePlatform = 'x' | 'threads' | 'facebook' | 'linkedin' | 'other'

export interface RawPost {
  id: number | string
  platform?: SourcePlatform | null
  externalId?: string | null
  authorHandle?: string | null
  authorName?: string | null
  text: string
  sourceUrl?: string | null
  postedAt: string
  isReply?: boolean
}

export interface Article {
  id: number | string
  title: string
  slug: string
  excerpt?: string | null
  body: string
  status: 'draft' | 'published'
  publishedAt?: string | null
  metaTitle?: string | null
  metaDescription?: string | null
  heroImage?: Media | string | null
  topics?: Topic[] | string | null
  sources?: RawPost[] | string | null
}

export interface Page {
  id: number | string
  title: string
  slug: string
  excerpt?: string | null
  body: string
  status: 'draft' | 'published'
  publishedAt?: string | null
  metaTitle?: string | null
  metaDescription?: string | null
}

export interface PayloadList<T> {
  docs: T[]
  totalDocs: number
  page: number
  totalPages: number
}
