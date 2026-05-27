# Cloudflare Workers + Neon 内测部署指南

按顺序完成即可上线海外内测。预计 **30–60 分钟**（不含域名 DNS 生效等待）。

---

## 架构

```
用户 → Cloudflare Workers (OpenNext)
         ↓
      Neon PostgreSQL (Pooler 连接)
         ↓
      智谱 GLM API (AI 关卡)
```

---

## Step 1 · 创建 Neon 数据库

1. 登录 [Neon Console](https://console.neon.tech) → **New Project**
2. Region 选离用户较近的（如 `AWS US East`）
3. 复制 **Pooled connection** 字符串（主机名含 `-pooler`）

示例格式：

```text
postgresql://USER:PASSWORD@ep-xxxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
```

4. 本地初始化（只需一次）：

```bash
export DATABASE_URL="postgresql://...pooler...?sslmode=require"
npm run db:bootstrap
```

会执行 `prisma migrate deploy` + `db:seed`（管理员 + `BETA2026` 邀请码）。

---

## Step 2 · 创建 Cloudflare Worker

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 记录 **Account ID**（Workers 概览页右侧）
3. **启用 Workers Paid 计划**（$5/月）— 本应用 OpenNext 包约 **3.6 MiB（gzip）**，超过 Free 版 3 MiB 上限；Paid 版上限 10 MiB
4. 创建 API Token：[Profile → API Tokens](https://dash.cloudflare.com/profile/api-tokens)
   - 模板：**Edit Cloudflare Workers**
   - 权限：`Account.Workers Scripts:Edit`、`Account.Account Settings:Read`

---

## Step 3 · 生成 AUTH_SECRET

```bash
openssl rand -base64 32
```

保存输出，后续多处使用。

---

## Step 4 · 选择访问域名

**方案 A · 先用 Workers 默认域名（最快）**

部署后获得：`https://child-ai-tools.<account>.workers.dev`

将 `AUTH_URL` 与 `NEXT_PUBLIC_APP_URL` 都设为该地址。

**方案 B · 自定义域名**

Cloudflare Dashboard → Workers → child-ai-tools → **Custom Domains** → 添加如 `typing.example.com`

`AUTH_URL` / `NEXT_PUBLIC_APP_URL` = `https://typing.example.com`

---

## Step 5 · 配置 GitHub Secrets

仓库 → **Settings → Secrets and variables → Actions → New repository secret**

| Secret | 值 |
|--------|-----|
| `DATABASE_URL` | Neon **Pooled** 连接串 |
| `AUTH_SECRET` | Step 3 生成 |
| `AUTH_URL` | 完整站点 URL（无尾斜杠） |
| `LLM_API_KEY` | 智谱 API Key |
| `CLOUDFLARE_API_TOKEN` | Step 2 Token |
| `CLOUDFLARE_ACCOUNT_ID` | Step 2 Account ID |

可选：`ZHIPU_API_KEY`（若与 LLM_API_KEY 相同可只配一个）

---

## Step 6 · 推送代码触发部署

```bash
git remote add origin git@github.com:YOUR_ORG/child-ai-tools.git
git push -u origin main
```

GitHub Actions 会：

1. 跑测试 + build
2. `opennextjs-cloudflare build`
3. `wrangler deploy`
4. 同步 Worker Secrets（DATABASE_URL、AUTH_SECRET、LLM_API_KEY）

---

## Step 7 · 本地手动部署（可选）

不依赖 GitHub CI 时：

```bash
# 1. 登录
npx wrangler login

# 2. 写入 Secrets（只需一次，或 key 变更时）
npx wrangler secret put DATABASE_URL
npx wrangler secret put AUTH_SECRET
npx wrangler secret put LLM_API_KEY

# 3. 构建并部署
export AUTH_URL="https://child-ai-tools.xxxx.workers.dev"
export NEXT_PUBLIC_APP_URL="$AUTH_URL"
export DATABASE_URL="..."   # build 阶段 Prisma 需要
export AUTH_SECRET="..."
npm run deploy:cf
```

---

## Step 8 · 上线验收

```bash
curl https://你的域名/api/health
# 期望: {"ok":true,"service":"child-ai-tools","db":"connected"}
```

浏览器检查：

- [ ] 注册 / 登录
- [ ] 添加孩子 → 零基础指法 1 关
- [ ] 设置页兑换 `BETA2026` → AI 定制关可进
- [ ] 家长中心报告页正常
- [ ] `/admin` 管理员可生成邀请码

---

## 常见问题

### Worker 体积超限（code 10027）

- Free 计划 gzip 上限 **3 MiB**；本栈（Next.js + Prisma + Auth）约 **3.6 MiB**
- 在 Dashboard → Workers → Plans 升级到 **Paid**
- 部署脚本会在上传前打印 bundle 体积

### OpenNext 构建失败（pg-cloudflare / middleware）

- 使用 `src/middleware.ts` + `export const runtime = "experimental-edge"`（不要用 `proxy.ts`）
- `next.config.ts` 需包含 `outputFileTracingIncludes` 以打包 `pg-cloudflare`（已配置）

### 数据库连接失败

- 确认使用 Neon **Pooled** 连接串（含 `-pooler`）
- URL 带 `?sslmode=require`
- Worker Secret 中 `DATABASE_URL` 无多余空格/换行

### 登录后跳回登录页

- `AUTH_URL` 必须与浏览器地址栏完全一致（https、无尾斜杠）
- `AUTH_SECRET` 在 GitHub Secret 与 Worker Secret 中一致

### AI 关卡一直 loading

- 检查 `LLM_API_KEY` 已写入 Worker Secret
- `wrangler.toml` 中 `LLM_MODEL=glm-4-flash-250414`
- 智谱账户有余额

### Prisma 枚举错误

- 重新跑 `npm run db:bootstrap` 确保迁移最新

---

## 内测运营

1. Admin `/admin` 生成 AI 版邀请码（一码一用）
2. 发给 10–30 个家庭
3. 收集反馈，见 [launch-runbook.md](./launch-runbook.md) Phase 2

---

## wrangler.toml 非敏感变量（已配置）

- `NEXT_PUBLIC_APP_NAME`
- `LLM_API_URL` / `LLM_MODEL`
- `DATABASE_POOL_MAX=1`（Worker 连接池）

敏感变量仅通过 `wrangler secret put` 或 CI 同步。
