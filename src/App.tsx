import { useEffect, useMemo, useState } from 'react'
import { loadSites } from './config'
import type { Scope, SiteMeta, Status } from './types'

type Mode = 'all' | 'internal' | 'external'

// 项目仓库地址 / GitHub repository
const REPO_URL = 'https://github.com/imashen/homedock'

const SCOPE_LABEL: Record<Scope, string> = {
  internal: '内网',
  external: '外网',
  both: '通用',
}

function hostOf(url?: string): string {
  if (!url) return ''
  try {
    return new URL(url).host
  } catch {
    return url
  }
}

/* ---------- 状态指示灯 ---------- */
function StatusDot({ status }: { status?: Status }) {
  const s: Status = status ?? 'online'
  const label = s === 'online' ? '在线' : s === 'closed' ? '已关闭' : '状态未知'
  return <span className={`dot dot-${s}`} title={label} aria-label={label} />
}

/* ---------- 品牌标记：直接显示配置里的 emoji ---------- */
function BrandMark({ site }: { site: SiteMeta }) {
  return (
    <span className="mono-icon">
      <span className="emoji">{site.icon}</span>
    </span>
  )
}

/* ---------- 复制访问命令 ---------- */
function accessCommand(site: SiteMeta): string | null {
  const host = site.host || hostOf(site.url)
  if (!host) return null
  const ports = site.ports ?? []
  if (ports.some((p) => p.includes('3389'))) return `mstsc /v:${host}:3389`
  if (ports.some((p) => p.includes('22'))) return `ssh root@${host}`
  return null
}

/* ---------- 卡片 ---------- */
function Card({ site, index }: { site: SiteMeta; index: number }) {
  const [copied, setCopied] = useState(false)
  const isLink = site.type === 'link' && !!site.url
  const host = hostOf(site.url)
  const cmd = accessCommand(site)

  const delay = Math.min(index * 32, 520)
  const style = { animationDelay: `${delay}ms` } as const

  const doCopy = (text: string) => {
    navigator.clipboard?.writeText(text).then(
      () => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1400)
      },
      () => {},
    )
  }

  if (isLink) {
    return (
      <a
        className="card card-link"
        href={site.url}
        target="_blank"
        rel="noopener noreferrer"
        style={style}
      >
        <div className="card-top">
          <BrandMark site={site} />
          <StatusDot status={site.status} />
        </div>
        <h3 className="card-name">{site.name}</h3>
        <p className="card-desc">{site.description}</p>
        <div className="card-foot">
          <code className="host">{host || site.url}</code>
          <span className={`scope-tag scope-${site.scope}`}>{SCOPE_LABEL[site.scope]}</span>
        </div>
      </a>
    )
  }

  return (
    <div className="card card-info" style={style}>
      <div className="card-top">
        <BrandMark site={site} />
        <span className="scope-tag scope-port">端口</span>
      </div>
      <h3 className="card-name">{site.name}</h3>
      <p className="card-desc">{site.description}</p>
      <div className="ports">
        {(site.ports ?? []).map((p) => (
          <span className="port-badge" key={p}>
            {p}
          </span>
        ))}
      </div>
      <div className="card-foot">
        <code className="host">{site.host || host}</code>
        {cmd && (
          <button
            className={`copy-btn${copied ? ' ok' : ''}`}
            onClick={() => doCopy(cmd)}
            title={cmd}
          >
            {copied ? '已复制' : '复制'}
          </button>
        )}
      </div>
    </div>
  )
}

/* ---------- 网络分段控件 ---------- */
function Segmented({ mode, setMode }: { mode: Mode; setMode: (m: Mode) => void }) {
  const items: { key: Mode; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'internal', label: '内网' },
    { key: 'external', label: '外网' },
  ]
  return (
    <div className="segmented" role="tablist" aria-label="网络范围">
      {items.map((it) => (
        <button
          key={it.key}
          role="tab"
          aria-selected={mode === it.key}
          className={`seg${mode === it.key ? ' active' : ''}`}
          onClick={() => setMode(it.key)}
        >
          {it.label}
        </button>
      ))}
    </div>
  )
}

/* ---------- 应用 ---------- */
export default function App() {
  const [sites, setSites] = useState<SiteMeta[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<Mode>('all')
  const [query, setQuery] = useState('')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('hd-theme')
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('hd-theme', theme)
  }, [theme])

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    let alive = true
    loadSites()
      .then((data) => {
        if (!alive) return
        setSites(data)
        setError(data.length ? null : '未读取到任何服务，请检查 config/sites.yaml')
      })
      .catch((e) => {
        if (!alive) return
        setError(String(e?.message ?? e))
      })
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  const reload = () => {
    setLoading(true)
    setError(null)
    loadSites()
      .then((data) => {
        setSites(data)
        setError(data.length ? null : '未读取到任何服务')
      })
      .catch((e) => setError(String(e?.message ?? e)))
      .finally(() => setLoading(false))
  }

  const counts = useMemo(() => {
    const internal = sites.filter((s) => s.scope === 'internal').length
    const external = sites.filter((s) => s.scope === 'external').length
    return { total: sites.length, internal, external }
  }, [sites])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return sites.filter((s) => {
      if (mode !== 'all' && s.scope !== mode) return false
      if (!q) return true
      return [s.name, s.description, s.category, s.url, s.host, (s.ports ?? []).join(' ')]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [sites, mode, query])

  const groups = useMemo(() => {
    const map = new Map<string, SiteMeta[]>()
    for (const s of filtered) {
      if (!map.has(s.category)) map.set(s.category, [])
      map.get(s.category)!.push(s)
    }
    return Array.from(map.entries())
  }, [filtered])

  const time = now.toLocaleTimeString('zh-CN', { hour12: false })
  const date = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">⬡</span>
          <div className="brand-text">
            <h1 className="brand-title">服务导航</h1>
            <p className="brand-sub">Hub · 演示用占位数据 · 可自由改写</p>
          </div>
        </div>
        <div className="controls">
          <Segmented mode={mode} setMode={setMode} />
          <label className="search">
            <span className="search-ico">⌕</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索服务 / 主机 / 端口…"
              spellCheck={false}
            />
          </label>
          <a
            className="gh-btn"
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub 仓库"
            aria-label="GitHub 仓库"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
              <path d="M12 .5C5.37.5 0 5.78 0 12. 29c0 5.21 3.44 9.61 8.21 11.17.6.11.82-.26.82-.57 0-.28-.01-1.02-.02-2-3.34.72-4.04-1.61-4.04-1.61-.55-1.38-1.34-1.75-1.34-1.75-1.1-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.6-2.8 5.62-5.47 5.92.43.37.81 1.1.81 2.22 0 1.6-.01 2.88-.01 3.27 0 .31.21.69.82.57A12 12 0 0 0 24 12.29C24 5.78 18.63.5 12 .5z" />
            </svg>
          </a>
          <button
            className="theme-btn"
            onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
            title="切换主题"
            aria-label="切换主题"
          >
            {theme === 'light' ? '☾' : '☀'}
          </button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-left">
          <p className="eyebrow">本地枢纽 · 已接入 {counts.total} 个端点</p>
          <h2 className="hero-title">
            你的每一台设备，
            <br />
            都从这一页出发。
          </h2>
          <p className="hero-sub">
            内网 {counts.internal} · 外网 {counts.external} · 编辑 config 即可自定义
          </p>
        </div>
        <div className="clock" aria-hidden="true">
          <span className="clock-time">{time}</span>
          <span className="clock-date">{date}</span>
        </div>
      </section>

      <main className="content">
        {loading && <div className="state">正在加载配置…</div>}
        {!loading && error && (
          <div className="state state-err">
            <p>配置加载失败：{error}</p>
            <button className="reload" onClick={reload}>
              重新加载
            </button>
          </div>
        )}
        {!loading && !error && groups.length === 0 && (
          <div className="state">没有匹配的服务。</div>
        )}

        {groups.map(([cat, list]) => (
          <section className="cat" key={cat}>
            <div className="cat-head">
              <span className="cat-tag">{cat}</span>
              <span className="cat-rule" />
              <span className="cat-count">{list.length}</span>
            </div>
            <div className="grid">
              {list.map((s, i) => (
                <Card key={s.id + i} site={s} index={i} />
              ))}
            </div>
          </section>
        ))}
      </main>

      <footer className="footer">
        <div className="footer-meta">
          {import.meta.env.DEV && (
            <span className="footer-dev-note">
              数据来自 <code>config/sites.yaml</code> · 修改为任意服务后刷新即可生效
            </span>
          )}
          <button className="reload" onClick={reload}>
            重新加载配置
          </button>
        </div>
        <a
          className="footer-icp"
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
        >
          示例备案号 · 请替换为你的备案信息
        </a>
      </footer>
    </div>
  )
}
