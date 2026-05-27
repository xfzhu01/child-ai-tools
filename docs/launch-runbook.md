# 小宝打字 · 上线 Runbook

分阶段推进：**内测上线 → 稳定化 → 付费接入 → 国内备案**。当前代码已通过 `npm run test:unit`、`npm run lint`、`npm run build`。

---

## Phase 1 · 内测上线（海外节点，1–3 天）

目标：小范围邀请真实家庭使用，验证登录、练习、进度、AI 关卡、家长报告。

### 1.1 基础设施

| 项 | 推荐 | 说明 |
|----|------|------|
| 应用 | Cloudflare Workers（OpenNext） | 已有 CI `deploy-preview` |
| 数据库 | [Neon](https://neon.tech) PostgreSQL | 与 Prisma 迁移兼容 |
| 域名 | Cloudflare 购买/接入 | 绑定 Worker Custom Domain |
| AI | 智谱 GLM-4-Flash | `LLM_MODEL=glm-4-flash-250414` |

### 1.2 环境变量（生产）

**GitHub Actions Secrets**（CI 部署用）：

- `DATABASE_URL` — Neon 连接串
- `AUTH_SECRET` — `openssl rand -base64 32`
- `AUTH_URL` — `https://你的域名`
- `CLOUDFLARE_API_TOKEN` — Workers 部署权限

**Wrangler Secrets**（Worker 运行时）：

```bash
npx wrangler secret put DATABASE_URL
npx wrangler secret put AUTH_SECRET
npx wrangler secret put LLM_API_KEY      # 或 ZHIPU_API_KEY
# 可选
npx wrangler secret put ADMIN_EMAIL
npx wrangler secret put ADMIN_PASSWORD   # 首次 seed 用
```

**Wrangler Vars**（`wrangler.toml` 或 Dashboard）：

- `NEXT_PUBLIC_APP_URL=https://你的域名`
- `NEXT_PUBLIC_APP_NAME=小宝打字`
- `LLM_API_URL=https://open.bigmodel.cn/api/paas/v4/chat/completions`
- `LLM_MODEL=glm-4-flash-250414`

### 1.3 数据库初始化

```bash
export DATABASE_URL="postgresql://..."
npx prisma migrate deploy
npx prisma db seed
```

Seed 会创建：

- 管理员 `admin@example.com` / `admin12345`（可通过 `ADMIN_EMAIL` / `ADMIN_PASSWORD` 覆盖）
- 内测邀请码 `BETA2026`（AI 智能版）

### 1.4 部署

**方式 A · CI 自动（推荐）**

推送到 `main` 分支，GitHub Actions 在测试通过后执行 `wrangler deploy`。

**方式 B · 本地**

```bash
npm run verify:release
npm run deploy:cf
```

### 1.5 上线验收清单

- [ ] `GET /api/health` 返回 `{ ok: true, db: "connected" }`
- [ ] 注册 → 登录 → 添加孩子档案
- [ ] 零基础指法 / 大冒险 各完成 1 关，进度可保存
- [ ] AI 定制关可生成并进入（需 AI 权限或邀请码）
- [ ] 家长中心报告页指标与成就墙正常
- [ ] 设置页兑换邀请码 `BETA2026` 成功
- [ ] Admin `/admin` 可生成新邀请码

### 1.6 内测运营

- 发放 10–30 个邀请码（Admin 生成，一码一用）
- 收集：加载慢、按键无响应、进度丢失、AI 失败
- 监控 Neon 连接数、智谱 API 额度

---

## Phase 2 · 稳定化（1–2 周）

- [ ] 修复内测反馈 P0/P1
- [ ] AI 关卡同关缓存 / 预加载下一关（降低等待）
- [ ] 错误监控（Sentry 或 Cloudflare Logs）
- [ ] 备份策略：Neon 自动备份 + 每周导出
- [ ] 更新帮助页 / 隐私政策中的内测说明

---

## Phase 3 · 付费接入（邀请码退场前）

- [ ] 微信支付 / 支付宝商户（需企业主体）
- [ ] 订阅 webhook 与 `Entitlement` 表打通
- [ ] 定价页 CTA 从「内测兑换」改为「立即订阅」
- [ ] 退款流程与 `/legal/refund` 对齐

---

## Phase 4 · 国内备案与迁移

见 [china-migration-checklist.md](./china-migration-checklist.md)

- Docker Compose + 国内 PostgreSQL
- ICP 备案完成后切换 `AUTH_URL` / `NEXT_PUBLIC_APP_URL`
- 数据从 Neon 导出导入

---

## 国内 VPS 快速部署（备案后）

```bash
cp .env.example .env
# 填写 AUTH_SECRET、AUTH_URL、DATABASE_URL、LLM_* 

docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
docker compose -f docker-compose.prod.yml exec app npx prisma db seed
curl http://localhost/api/health
```

---

## 常用命令

```bash
npm run verify:release   # 单元测试 + lint + build
npm run preview:cf       # 本地 Cloudflare 预览
npm run db:studio        # 查看数据库
```
