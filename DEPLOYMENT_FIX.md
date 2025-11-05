# 部署问题修复指南

## 问题：UntrustedHost 错误

如果你在部署后遇到以下错误：

```
[auth][error] UntrustedHost: Host must be trusted. URL was: http://yourdomain.com/api/auth/session
```

这是因为 NextAuth 需要信任你的域名。

## 快速修复

### 方法 1：设置环境变量（推荐）

在启动 Docker 容器前，设置以下环境变量：

```bash
# 设置信任主机
export AUTH_TRUST_HOST=true

# 设置你的域名（可选但推荐）
export NEXTAUTH_URL=https://yourdomain.com

# 启动容器
docker-compose up -d
```

### 方法 2：修改 docker-compose.yml

确保你的 `docker-compose.yml` 包含以下环境变量：

```yaml
services:
  simple-tool:
    environment:
      - AUTH_SECRET=${AUTH_SECRET:-change-this-to-a-random-secret-in-production}
      - AUTH_TRUST_HOST=${AUTH_TRUST_HOST:-true}
      - NEXTAUTH_URL=${NEXTAUTH_URL:-http://localhost:3000}
      - ADMIN_USERNAME=${ADMIN_USERNAME:-admin}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD:-changeme}
```

### 方法 3：使用 .env 文件

创建 `.env.production` 文件：

```env
AUTH_SECRET=your-secret-key-here
AUTH_TRUST_HOST=true
NEXTAUTH_URL=https://yourdomain.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
```

然后在 `docker-compose.yml` 中引用：

```yaml
services:
  simple-tool:
    env_file:
      - .env.production
```

## 完整部署步骤

### 1. 生成安全密钥

```bash
openssl rand -base64 32
```

### 2. 设置环境变量

```bash
export AUTH_SECRET="your-generated-secret-key"
export AUTH_TRUST_HOST=true
export NEXTAUTH_URL=https://yourdomain.com
export ADMIN_USERNAME=admin
export ADMIN_PASSWORD=your-secure-password
```

### 3. 启动容器

```bash
docker-compose up -d
```

### 4. 查看日志

```bash
docker logs -f simple-tool
```

## 使用 Nginx 反向代理

如果你使用 Nginx 作为反向代理，确保正确转发 Host 头：

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 验证配置

1. 访问你的网站
2. 点击右上角 "Admin" 按钮
3. 使用配置的用户名和密码登录
4. 如果能成功登录，说明配置正确！

## 常见问题

### Q: 为什么需要 AUTH_TRUST_HOST？

A: NextAuth v5 默认不信任任何主机，这是一个安全特性。在生产环境中，你需要明确告诉 NextAuth 信任你的域名。

### Q: NEXTAUTH_URL 是必需的吗？

A: 不是必需的，但强烈推荐。设置正确的 URL 可以避免很多重定向问题。

### Q: 可以使用 IP 地址吗？

A: 可以，但不推荐。建议使用域名，并配置 HTTPS。

```bash
export NEXTAUTH_URL=http://your-ip:3000
```

### Q: 如何更改管理员密码？

A: 修改环境变量后重启容器：

```bash
export ADMIN_PASSWORD=new-password
docker-compose restart
```

## 安全建议

1. ✅ 使用强密码（至少 12 位）
2. ✅ 使用 HTTPS（配置 SSL 证书）
3. ✅ 定期更换 AUTH_SECRET
4. ✅ 不要将密钥提交到 Git
5. ✅ 使用环境变量管理敏感信息

## 需要帮助？

如果问题仍然存在：

1. 检查 Docker 日志：`docker logs simple-tool`
2. 检查环境变量：`docker exec simple-tool env | grep AUTH`
3. 确认端口没有被占用：`netstat -tuln | grep 3000`

