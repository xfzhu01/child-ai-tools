# 阿里云香港 ECS 内测部署（免备案）

与 **Vercel** 并存，通过 `DEPLOY_TARGET` 切换部署目标。

---

## 为什么选香港 ECS

| 项目 | 说明 |
|------|------|
| **免 ICP 备案** | 香港地域服务器无需大陆 ICP 备案（试用实例本身也不支持备案） |
| **免费试用** | 个人 **300 元试用金 / 3 个月**，见 [free.aliyun.com](https://free.aliyun.com/) |
| **数据库** | 继续用现有 **Neon**（`ap-southeast-1`），与香港 ECS 延迟可接受 |

---

## 架构

```
DEPLOY_TARGET=vercel  → Vercel（默认，海外内测）
DEPLOY_TARGET=aliyun  → 阿里云香港 ECS + Docker + Nginx
DEPLOY_TARGET=all     → 两者都部署

数据库（共用）→ Neon PostgreSQL
```

---

## Step 1 · 领取 ECS 免费试用（香港）

1. 登录 [阿里云免费试用](https://free.aliyun.com/)
2. 领取 **云服务器 ECS** 试用（个人 300 元 / 3 个月）
3. 地域选 **中国香港**
4. 规格建议：**2 核 2G** 或 **2 核 4G**（在试用额度内）
5. 镜像：**Alibaba Cloud Linux 3** 或 **Ubuntu 22.04**
6. 安全组放行：**22**（SSH）、**80**（HTTP）

记录 **公网 IP**。

---

## Step 2 · 初始化 ECS（只需一次）

SSH 登录后执行：

```bash
curl -fsSL https://raw.githubusercontent.com/xfzhu01/child-ai-tools/main/scripts/bootstrap-aliyun-ecs.sh | sudo bash
```

或手动上传 `scripts/bootstrap-aliyun-ecs.sh` 后运行。

---

## Step 3 · 本地 `.env` 配置

```bash
DEPLOY_TARGET=aliyun

# 香港 ECS
ALIYUN_SSH_HOST=47.x.x.x
ALIYUN_SSH_USER=root
ALIYUN_SSH_KEY_PATH=~/.ssh/aliyun-hk.pem

# 访问地址（无备案可用 IP 或自有域名解析到香港）
ALIYUN_AUTH_URL=http://47.x.x.x

# 数据库仍用 Neon Pooled
DATABASE_URL_POOLED="postgresql://...-pooler...?sslmode=require"
AUTH_SECRET="..."
LLM_API_KEY="..."
```

---

## Step 4 · 部署

```bash
npm run deploy:aliyun
# 或
DEPLOY_TARGET=aliyun npm run deploy:beta
```

验收：

```bash
curl http://47.x.x.x/api/health
```

---

## Step 5 · 与 Vercel 并存

| 场景 | 配置 |
|------|------|
| 只部署 Vercel（默认） | `DEPLOY_TARGET=vercel` 或不设置 |
| 只部署阿里云 | `DEPLOY_TARGET=aliyun` |
| 两个都部署 | `DEPLOY_TARGET=all` |

---

## GitHub Actions 自动部署

### 1. 仓库 Variable（非 Secret）

**Settings → Secrets and variables → Actions → Variables**

| Name | Value |
|------|--------|
| `DEPLOY_TARGET` | `vercel` / `aliyun` / `all` |

默认不设置 = 仅 Vercel。

### 2. 阿里云 Secrets（`DEPLOY_TARGET=aliyun` 或 `all` 时需要）

| Secret | 说明 |
|--------|------|
| `ALIYUN_SSH_HOST` | ECS 公网 IP |
| `ALIYUN_SSH_USER` | 通常 `root` |
| `ALIYUN_SSH_PRIVATE_KEY` | SSH 私钥全文 |
| `ALIYUN_AUTH_URL` | `http://47.x.x.x` |
| 以及共用 | `DATABASE_URL`, `AUTH_SECRET`, `LLM_API_KEY` |

Vercel 相关 Secret 在 `DEPLOY_TARGET=vercel|all` 时仍需要。

本地一键写入（需 `gh auth login`）：

```bash
DEPLOY_TARGET=all npm run deploy:github-secrets
```

---

## 常见问题

### 连不上 ECS

- 安全组是否放行 22/80
- SSH 密钥是否为创建实例时绑定的密钥对

### 登录后跳回登录页

- `ALIYUN_AUTH_URL` 必须与浏览器地址栏一致

### 试用到期

- 3 个月或 300 元额度用尽后需续费或迁回 Vercel

---

## 与大陆正式版区别

本方案是 **香港免备案内测**。若以后要大陆正式运营，需单独做 ICP 备案 + 国内 RDS，见 [china-migration-checklist.md](./china-migration-checklist.md)。
