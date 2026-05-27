# 小宝打字 · 儿童 AI 打字学习平台

**使命：** 小朋友的 AI 高效打字学习工具

面向 6–12 岁小学生的 AI 高效打字学习 Web 应用：游戏化闯关、按键级数据分析、AI 定制练习与家长周报。

## 技术栈

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS
- **Auth.js** (NextAuth v5) 邮箱登录
- **Prisma 7** + PostgreSQL (Neon / Docker)
- **Cloudflare Workers** via `@opennextjs/cloudflare`
- **Vitest** + **Playwright**

## 快速开始

### 1. 环境变量

```bash
cp .env.example .env
# 编辑 DATABASE_URL、AUTH_SECRET
# AI 关卡生成（OpenAI 兼容接口，默认 DeepSeek）：LLM_API_KEY 或 DEEPSEEK_API_KEY
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

## Cloudflare 部署

```bash
# 配置 wrangler secrets
npx wrangler secret put DATABASE_URL
npx wrangler secret put AUTH_SECRET

npm run deploy:cf
```

在 Cloudflare Dashboard 购买域名并绑定 Custom Domain。

## 功能概览

| 模块 | 说明 |
|------|------|
| 首次测评 | 30–60 秒基线测评 |
| 字母大冒险 | 单词闯关 |
| 词语接龙 | 连击挑战 |
| AI 定制关 | AI 智能版 · 解锁后各模式下一关由 AI/规则引擎按个人数据生成 |
| 家长中心 | 趋势图、键位热力图、AI 周报 |
| Admin | 手动开通订阅、生成邀请码（官方关卡版 / AI 智能版） |
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
