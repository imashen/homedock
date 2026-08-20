# HomeDock · Home Service Dashboard

> 中文版 / Chinese: [README.md](./README.md)

A lightweight single-page service dashboard that brings every device and service in your home to one page — one-click access from anywhere. Edit the site config in `public/config/` to make it your own. Zero backend, pure static.

## Features

- Data-driven: maintain your service list with YAML / JSON / Markdown. No backend, pure static — changes take effect on refresh.
- Three scopes + search: internal / external / both, with live search to locate services fast.
- Port-card mode: show host and ports (SSH / RDP) with one-click copy of connection commands.
- Light/dark theme, responsive layout, live clock.
- GitHub entry in the header for open-source collaboration.

## Preview

![Home view](intro/demo1.png)

![Port card view](intro/demo2.png)

## Quick Start

```bash
pnpm install      # install dependencies
pnpm dev         # local development
pnpm build       # production build
pnpm preview     # preview the build output
```

## Configuration

Service data lives in `public/config/`. The app reads automatically by priority: `sites.yaml` > `sites.json` > `sites.md`. Edit any one of them.

### Field Reference

| Field | Description | Values |
| --- | --- | --- |
| `name` | Service name | required |
| `description` | One-line description | optional |
| `category` | Group name (controls card grouping) | optional |
| `scope` | Network scope | `internal` / `external` / `both` |
| `type` | Card type: link is clickable / info shows ports only | `link` / `info` |
| `url` | Clickable link (required for link type) | — |
| `icon` | emoji icon | optional |
| `host` | Host address (used by info cards) | optional |
| `ports` | Port list, e.g. `["22 / SSH"]` | optional |
| `status` | Status indicator | `online` / `closed` / `unknown` |
| `note` | Extra note | optional |

### Syntax Example

```markdown
## Category
- [Service Name](https://example.com) one-line description @external :🌐: status:online
- Port Card one-line description @internal :🔑: host: 10.0.0.1 ports: 22 / SSH status:online
```

`@scope` controls internal/external filtering, `:icon:` is the emoji, both optional; `status` controls the card status light.

## Deployment

After `pnpm build`, `dist/` is a pure static output that can be hosted anywhere — GitHub Pages, Vercel, Cloudflare Pages, Nginx, etc.

## License

MIT
