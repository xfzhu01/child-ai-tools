# 小宝打字 · 儿童 AI 打字学习平台

**使命：** 小朋友的 AI 高效打字学习工具

面向 6–12 岁小学生的 AI 高效打字学习 Web 应用：游戏化闯关、按键级数据分析、AI 定制练习与家长周报。

## 技术栈

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS
- **Auth.js** (NextAuth v5) 邮箱登录
- **Prisma 7** + PostgreSQL (Neon / Docker)
- **Vercel**（推荐内测）或 **Cloudflare Workers**（可选，需 Paid）
- **Vitest** + **Playwright**

## 快速开始

### 1. 环境变量

```bash
cp .env.example .env
# 编辑 DATABASE_URL、AUTH_SECRET
# AI 关卡生成（OpenAI 兼容接口，默认智谱 GLM-4-Flash）：LLM_API_KEY 或 ZHIPU_API_KEY
openssl rand -base64 32  # 生成 AUTH_SECRET
```

### 2. 本地数据库

```bash
docker compose up -d
npx prisma migrate deploy
npm run db:seed
```

默认管理员：`admin@example.com` / `admin12345`  
内测邀请码：`BETA2026`

### 3. 开发

```bash
npm run dev
# http://localhost:3000
```

### 4. 测试

```bash
npm run test:unit
npm run test:e2e
npm run lint
npm run build
```

## 内测上线

| 目标 | `DEPLOY_TARGET` | 文档 |
|------|-----------------|------|
| **Vercel**（默认，海外） | `vercel` | [beta-neon-vercel.md](docs/beta-neon-vercel.md) |
| **阿里云香港**（免备案） | `aliyun` | [beta-aliyun-hk.md](docs/beta-aliyun-hk.md) |
| **两者并存** | `all` | 同上 |

```bash
# 默认 Vercel
npm run deploy:beta

# 阿里云香港 ECS
DEPLOY_TARGET=aliyun npm run deploy:beta

# GitHub CI：仓库 Variable DEPLOY_TARGET=vercel|aliyun|all
npm run deploy:github-secrets
```

## Cloudflare Workers（可选）

需 Workers Paid（约 3.6 MiB gzip）。见 [docs/beta-neon-cloudflare.md](docs/beta-neon-cloudflare.md)

```bash
DEPLOY_TARGET=cloudflare npm run deploy:cf
```

## 功能概览

| 模块 | 说明 |
|------|------|
| 首次测评 | 30–60 秒基线测评 |
| 字母大冒险 | 单词闯关 |
| 词语接龙 | 连击挑战 |
| AI 定制关 | AI 智能版 · 8 种小游戏 + AI 填充内容 |
| 家长中心 | 科学指标报告、键位热力图、成就墙 |
| Admin | 手动开通订阅、生成邀请码 |
| 计费 | 免费 3 关/日 · 官方关卡版 ¥19.9 · AI 智能版 ¥49.9 |

## 国内迁移

见 [docs/china-migration-checklist.md](docs/china-migration-checklist.md)

## 项目结构

```
src/
├── app/              # 页面与 API Routes
├── components/       # UI、打字游戏、仪表盘
└── lib/
    ├── typing-engine/  # 纯 TS 打字分析（可单测）
    ├── ai/             # 推荐引擎
    └── billing/        # Entitlement 门控
```
