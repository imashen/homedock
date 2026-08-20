# HomeDock · 家庭服务导航

> 中文说明为主，英文对照附于每段之后 · Chinese-first, with English under each section.

一个轻量的单页服务导航面板，把家里的每一台设备、每一个服务集中到一个页面，一键直达。
A lightweight single-page dashboard to organize and access every device and service in your home lab from one page.

`public/config/` 中的站点配置可直接编辑，替换为你自己的服务即可使用。
The `public/config/` site config is meant to be edited — just replace it with your own services.

## 特性 · Features

- 数据驱动：用 YAML / JSON / Markdown 维护服务清单，零后端、纯静态，改完刷新即生效。
  Data-driven: maintain your service list with YAML / JSON / Markdown. Zero backend, fully static, live-reload on edit.
- 三态筛选 + 搜索：内网 / 外网 / 通用，配合实时搜索快速定位。
  Scope filter (Internal / External / Both) plus instant search to find anything fast.
- 端口卡模式：展示主机与端口（SSH / RDP），一键复制连接命令。
  Port-card mode shows host & ports (SSH / RDP) with one-click copy of access commands.
- 明暗主题、响应式布局、实时时钟。
  Light/dark theme, responsive layout, and a live clock.
- 顶部 GitHub 入口，方便开源协作。
  A top-bar GitHub entry for open-source collaboration.

## 快速开始 · Quick Start

```bash
pnpm install      # 安装依赖 / install dependencies
pnsee dev         # 本地开发 / start dev server
pnpm build        # 生产构建 / production build
pnpm preview      # 预览构建产物 / preview the build
```

## 配置 · Configuration

服务数据位于 `public/config/`，应用按优先级自动读取：`sites.yaml` > `sites.json` > `sites.md`，编辑其中任意一个即可。
Service data lives in `public/config/`. The app auto-loads, in order: `sites.yaml` > `sites.json` > `sites.md`. Edit any one.

### 字段说明 · Fields

| 字段 Field | 说明 Description | 可选值 Options |
| --- | --- | --- |
| `name` | 服务名称 | 必填 required |
| `description` | 一句话说明 | 可选 optional |
| `category` | 分组名（决定卡片分组） | 可选 optional |
| `scope` | 网络范围 | `internal` / `external` / `both` |
| `type` | 卡片类型：link 可点击 / info 仅展示端口 | `link` / `info` |
| `url` | 可点击链接（link 类型必填） | — |
| `icon` | emoji 图标 | 可选 optional |
| `host` | 主机地址（info 卡使用） | 可选 optional |
| `ports` | 端口清单，如 `["22 / SSH"]` | 可选 optional |
| `status` | 状态指示灯 | `online` / `closed` / `unknown` |
| `note` | 备注 | 可选 optional |

### 语法示例 · Syntax

```markdown
## 分类 Category
- [服务名](https://example.com) 一句话说明 @external :🌐: status:online
- 端口卡 一句话说明 @internal :🔑: host: 10.0.0.1 ports: 22 / SSH status:online
```

`@scope` 控制内网/外网筛选，`:icon:` 为 emoji，三者均可省略；`status` 控制卡片状态灯。
`@scope` drives the filter, `:icon:` is an emoji, both optional; `status` drives the status dot.

## 部署 · Deploy

`pnpm build` 后，`dist/` 是纯静态产物，可托管到任意静态空间（GitHub Pages、Vercel、Cloudflare Pages、Nginx 等）。
After `pnpm build`, `dist/` is a static bundle deployable to any static host (GitHub Pages, Vercel, Cloudflare Pages, Nginx, etc.).

## 许可证 · License

MIT
