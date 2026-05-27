# Neon + Vercel 内测部署指南

比 Cloudflare Workers 更轻：**标准 Next.js Node 运行时**，无 3 MiB Worker 体积限制。数据库仍用 Neon。

---

## 架构

```
用户 → Vercel (Next.js Node)
         ↓
      Neon PostgreSQL (Pooler)
         ↓
      智谱 GLM API
```

---

## Step 1 · Neon 数据库（若已完成可跳过）

```bash
export DATABASE_URL="postgresql://...-pooler...?sslmode=require"
npm run db:bootstrap
```

---

## Step 2 · 注册 Vercel

1. 打开 [vercel.com](https://vercel.com) 用 GitHub 登录（推荐）
2. 本地登录 CLI：

```bash
npx vercel login
```

---

## Step 3 · 配置 `.env`

```bash
cp .env.example .env
```

必填：

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` 或 `DATABASE_URL_POOLED` | Neon **Pooled** 连接串 |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `LLM_API_KEY` | 智谱 API Key |

首次部署可暂不填 `AUTH_URL`（见 Step 5）。

---

## Step 4 · 首次部署

```bash
FIRST_DEPLOY=1 npm run deploy:beta
```

脚本会：

1. `vercel link`（若尚未关联项目）
2. 同步环境变量到 Vercel
3. `vercel deploy --prod`

记下输出的 `https://xxx.vercel.app` 地址。

---

## Step 5 · 配置 AUTH_URL 并二次部署

登录依赖 `AUTH_URL` 与浏览器地址一致：

```bash
# 写入 .env
AUTH_URL="https://你的项目.vercel.app"
NEXT_PUBLIC_APP_URL="$AUTH_URL"

npm run deploy:beta
```

---

## Step 6 · 验收

```bash
curl https://你的项目.vercel.app/api/health
# 期望: {"ok":true,"service":"child-ai-tools","db":"connected"}
```

浏览器：注册 / 登录 → 添加孩子 → 兑换 `BETA2026` → AI 关卡。

---

## GitHub CI 自动部署（可选）

在 GitHub Secrets 中配置：

| Secret | 说明 |
|--------|------|
| `VERCEL_TOKEN` | Vercel → Settings → Tokens |
| `VERCEL_ORG_ID` | `npx vercel link` 后见 `.vercel/project.json` 同级的 orgId |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` 中的 projectId |
| `DATABASE_URL` | Neon Pooled |
| `AUTH_SECRET` | 同本地 |
| `AUTH_URL` | 生产 URL |
| `LLM_API_KEY` | 智谱 Key |

推送 `main` 后 CI 自动部署到 Vercel。

也可运行：

```bash
npm run deploy:github-secrets
```

（需先 `gh auth login` 并填好 `.env`）

---

## 常见问题

### 登录后跳回登录页

- `AUTH_URL` 必须与浏览器地址栏完全一致（https、无尾斜杠）
- 改完 `.env` 后重新 `npm run deploy:beta`

### 数据库连接失败

- 使用 Neon **Pooled** 连接串（含 `-pooler`）
- URL 带 `?sslmode=require`

### 仍想用 Cloudflare？

见 [beta-neon-cloudflare.md](./beta-neon-cloudflare.md)（需 Workers Paid，约 3.6 MiB gzip）。

本地命令：`DEPLOY_TARGET=cloudflare npm run deploy:cf`

---

## 区域

`vercel.json` 默认 `sin1`（新加坡），靠近 Neon `ap-southeast-1`。可在 Vercel Dashboard 调整。
