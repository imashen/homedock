import yaml from 'js-yaml'
import type { Scope, SiteMeta, Status } from './types'

interface RawSite {
  name?: string
  description?: string
  category?: string
  scope?: Scope
  type?: 'link' | 'info'
  url?: string
  icon?: string
  ports?: string[]
  host?: string
  status?: 'online' | 'closed' | 'unknown'
  note?: string
}

interface RawConfig {
  sites?: RawSite[]
}

/** 把原始条目规整为统一的 SiteMeta，缺失字段给合理默认值 */
function normalize(s: RawSite, i: number): SiteMeta {
  const name = (s.name ?? '').trim() || `未命名服务 ${i + 1}`
  // '#info' / '#port' 是 Markdown 里用来标记「仅展示端口」的哨兵值
  const isInfoSentinel = s.url === '#info' || s.url === '#port'
  const hasUrl = !!s.url && !isInfoSentinel
  const type = s.type ?? (hasUrl ? 'link' : 'info')
  const scope = s.scope ?? (hasUrl ? 'external' : 'internal')
  return {
    id: name,
    name,
    description: (s.description ?? '').trim(),
    category: (s.category ?? '其他').trim() || '其他',
    scope,
    type,
    url: hasUrl ? s.url : undefined,
    icon: s.icon?.trim() || (type === 'link' ? '🔗' : '🔧'),
    ports: s.ports,
    host: s.host?.trim(),
    status: s.status ?? 'online',
    note: s.note?.trim(),
  }
}

async function fetchText(path: string): Promise<string | null> {
  try {
    const res = await fetch(path, { cache: 'no-store' })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

/** 解析一行剩余文本里的 scope / icon / host / ports */
function parseRest(
  name: string,
  rest: string,
  category: string,
  url: string,
): RawSite {
  const isInfo = url === '#info'
  let scope: Scope = isInfo ? 'internal' : 'external'
  const sc = rest.match(/@(internal|external|both)/)
  if (sc) {
    scope = sc[1] as Scope
    rest = rest.replace(sc[0], '')
  }
  let icon = isInfo ? '🔧' : '🔗'
  const ic = rest.match(/:([\p{Extended_Pictographic}]+):/u)
  if (ic) {
    icon = ic[1]
    rest = rest.replace(ic[0], '')
  }
  let host: string | undefined
  const hc = rest.match(/host:\s*(\S+)/)
  if (hc) {
    host = hc[1]
    rest = rest.replace(hc[0], '')
  }
  let ports: string[] | undefined
  const pc = rest.match(/ports:\s*([^|]+)/)
  if (pc) {
    ports = pc[1]
      .split(/[;,]/)
      .map((s) => s.trim())
      .filter(Boolean)
    rest = rest.replace(pc[0], '')
  }
  rest = rest.replace(/^[\s|\-—]+/, '').replace(/\|+$/, '').trim()
  // 解析可选的状态标记：status: online | closed | unknown
  let status: Status | undefined
  const stc = rest.match(/status:\s*(online|closed|unknown)/)
  if (stc) {
    status = stc[1] as Status
    rest = rest.replace(stc[0], '')
  }
  return {
    name,
    url: isInfo ? undefined : url,
    description: rest,
    category,
    scope,
    type: isInfo ? 'info' : 'link',
    icon,
    host,
    ports,
    status,
  }
}

/**
 * 极简 Markdown 解析：
 *   链接卡：## 分类 换行 - [名称](url) 描述 @scope :icon:
 *   端口卡：## 分类 换行 - 名称 描述 @scope :icon: host: 1.2.3.4 ports: 22 / SSH
 */
function parseMd(md: string): RawSite[] {
  const lines = md.split('\n')
  let category = '其他'
  const sites: RawSite[] = []
  for (const line of lines) {
    const h = line.match(/^##\s+(.+)$/)
    if (h) {
      category = h[1].trim()
      continue
    }
    const link = line.match(/^\s*-\s*\[(.+?)\]\((.+?)\)\s*(.*)$/)
    if (link) {
      sites.push(parseRest(link[1].trim(), link[3], category, link[2].trim()))
      continue
    }
    const plain = line.match(/^\s*-\s+(.+)$/)
    if (plain) {
      sites.push(parseRest(plain[1].trim(), '', category, '#info'))
    }
  }
  return sites
}

/**
 * 加载站点配置。优先级：sites.yaml > sites.json > sites.md
 * 三个文件任选其一编辑即可扩充，应用会自动选用存在的第一个。
 */
export async function loadSites(): Promise<SiteMeta[]> {
  const base = import.meta.env.BASE_URL || '/'

  const yamlText = await fetchText(`${base}config/sites.yaml`)
  if (yamlText) {
    try {
      const data = yaml.load(yamlText) as RawConfig
      if (data?.sites?.length) return data.sites.map(normalize)
    } catch {
      /* 解析失败继续尝试下一个格式 */
    }
  }

  const jsonText = await fetchText(`${base}config/sites.json`)
  if (jsonText) {
    try {
      const data = JSON.parse(jsonText) as RawConfig
      if (data?.sites?.length) return data.sites.map(normalize)
    } catch {
      /* 继续 */
    }
  }

  const mdText = await fetchText(`${base}config/sites.md`)
  if (mdText) {
    const sites = parseMd(mdText)
    if (sites.length) return sites.map(normalize)
  }

  return []
}
