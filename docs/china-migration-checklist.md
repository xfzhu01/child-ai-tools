# 国内迁移 Checklist（Phase 4）

- [ ] 域名转入腾讯云（注册满 60 天）或 DNS A 记录指向国内 VPS
- [ ] 提交 ICP 备案（主体与支付商户一致）
- [ ] Docker Compose 部署 Next.js + PostgreSQL + Nginx
- [ ] 数据库从 Neon 导出并导入国内 PostgreSQL
- [ ] 微信支付 / 支付宝商户接入与回调域名配置
- [ ] 关闭 Cloudflare 橙云代理（备案验证期间）
- [ ] 更新 `AUTH_URL` 与国内 `NEXT_PUBLIC_APP_URL`
- [ ] 隐私政策更新数据存储位置说明

## Docker 启动（国内 VPS）

```bash
docker compose -f docker-compose.prod.yml up -d --build
# 首次部署需初始化数据库：
# docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
# docker compose -f docker-compose.prod.yml exec app npx prisma db seed
```

见 `docker-compose.prod.yml` 与 `Dockerfile`。
