# GitHub Actions Secrets 配置

Deploy 任务需要以下 **7 个 Repository secrets**，否则 CI 会在 `Validate deploy secrets` 步骤失败。

配置页面：**https://github.com/xfzhu01/child-ai-tools/settings/secrets/actions** → **New repository secret**

| Secret 名称 | 填什么 |
|-------------|--------|
| `VERCEL_TOKEN` | [Vercel → Account → Tokens](https://vercel.com/account/tokens) 新建 **Classic** Token（Scope: 至少 Full Account） |
| `VERCEL_ORG_ID` | `team_3xEMOZOOmyqTbxOHGHWqypun` |
| `VERCEL_PROJECT_ID` | `prj_HSZqsRW6SSfnljHFgkXckGxrY0a1` |
| `DATABASE_URL` | 本地 `.env` 中 **Pooled** 连接串（`DATABASE_URL_POOLED`，含 `-pooler`） |
| `AUTH_SECRET` | 本地 `.env` 中 `AUTH_SECRET` |
| `AUTH_URL` | `https://child-ai-tools.vercel.app` |
| `LLM_API_KEY` | 本地 `.env` 中智谱 `LLM_API_KEY` |

## 方式 A · 网页手动添加（推荐）

1. 打开上面的 Secrets 页面
2. 逐个 **New repository secret** 添加上表 7 项
3. GitHub → **Actions** → 失败的工作流 → **Re-run all jobs**

## 方式 B · 本地脚本一键写入

```bash
# 1. 在 Vercel 创建 Classic Token，写入 .env：
#    VERCEL_TOKEN="..."

# 2. 登录 GitHub CLI
gh auth login

# 3. 从 .env 写入 GitHub Secrets
npm run deploy:github-secrets
```

## 验证

Secrets 配好后，push 或 Re-run CI，应看到：

1. **test** — 通过  
2. **Deploy to Vercel** — Sync env → Deploy → 成功  

生产站：https://child-ai-tools.vercel.app
