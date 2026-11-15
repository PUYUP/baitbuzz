import { site } from '#lib/site'

export interface Crumb {
  name: string
  href?: string
}

/** Builds schema.org BreadcrumbList JSON-LD from a list of crumbs. */
export function breadcrumbJsonLd(items: Crumb[], base: string = site.url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      ...(item.href ? { item: item.href.startsWith('http') ? item.href : `${base}${item.href}` } : {})
    }))
  }
}
