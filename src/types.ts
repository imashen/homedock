export type Scope = 'internal' | 'external' | 'both'
export type CardType = 'link' | 'info'
export type Status = 'online' | 'closed' | 'unknown'

export interface SiteMeta {
  id: string
  name: string
  description: string
  category: string
  scope: Scope
  type: CardType
  url?: string
  icon: string
  ports?: string[]
  host?: string
  status?: Status
  note?: string
}
