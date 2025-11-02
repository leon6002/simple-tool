# SimpleTool 部署指南

## 重要说明

- **本地开发**：推荐使用 pnpm（`pnpm dev`）
- **Docker 构建**：使用 npm（无需额外安装，更简洁）
- 两种方式互不影响，依赖版本由 `package.json` 控制

## Docker 部署

### 方式一：直接使用 Docker（推荐）

#### 1. 构建镜像

```bash
docker build -t simple-tool:latest .
```

#### 2. 运行容器

```bash
docker run -d \
  --name simple-tool \
  -p 3000:3000 \
  --restart unless-stopped \
  simple-tool:latest
```

```bash
docker run -d \
  --name simple-tool \
  -p 3000:3000 \
  --restart unless-stopped \
  registry.cn-hangzhou.aliyuncs.com/glhub/simple-tool:1.0.3
```

访问 `http://your-server-ip:3000`

---

### 方式二：使用 Docker Compose

#### 1. 启动服务

```bash
docker-compose up -d
```

#### 2. 查看日志

```bash
docker-compose logs -f
```

#### 3. 停止服务

```bash
docker-compose down
```

---

### 方式三：使用 Nginx 反向代理（可选）

如果你想在 Next.js 前面使用 Nginx（用于 SSL、负载均衡等）：

#### 1. 修改 `docker-compose.yml`

取消注释 nginx 服务部分：

```yaml
nginx:
  image: nginx:alpine
  container_name: simple-tool-nginx
  restart: unless-stopped
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./nginx-proxy.conf:/etc/nginx/conf.d/default.conf
  depends_on:
    - simple-tool
```

#### 2. 修改 `nginx-proxy.conf`

将 `server_name localhost;` 改为你的域名：

```nginx
server_name your-domain.com;
```

#### 3. 启动服务

```bash
docker-compose up -d
```

访问 `http://your-domain.com`

---

## 环境变量配置

如果需要环境变量，创建 `.env.production` 文件：

```env
# 示例环境变量
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_SITE_URL=https://example.com
```

然后在 `docker-compose.yml` 中取消注释：

```yaml
env_file:
  - .env.production
```

---

## SSL/HTTPS 配置

### 使用 Let's Encrypt（推荐）

#### 1. 安装 Certbot

```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
```

#### 2. 获取证书

```bash
sudo certbot --nginx -d your-domain.com
```

#### 3. 自动续期

Certbot 会自动设置 cron job 进行证书续期。

### 手动配置 SSL

如果你有自己的证书：

1. 将证书文件放在 `./ssl` 目录：
   - `cert.pem` - 证书文件
   - `key.pem` - 私钥文件

2. 在 `nginx-proxy.conf` 中取消注释 HTTPS 部分

3. 在 `docker-compose.yml` 中取消注释 SSL 卷挂载：

```yaml
volumes:
  - ./ssl:/etc/nginx/ssl
```

---

## 常用命令

### 查看运行状态

```bash
docker ps
# 或
docker-compose ps
```

### 查看日志

```bash
docker logs simple-tool
# 或
docker-compose logs -f simple-tool
```

### 重启服务

```bash
docker restart simple-tool
# 或
docker-compose restart
```

### 更新应用

```bash
# 1. 拉取最新代码
git pull

# 2. 重新构建镜像
docker-compose build

# 3. 重启服务
docker-compose up -d
```

### 清理旧镜像

```bash
docker image prune -a
```

---

## 性能优化建议

### 1. 使用 CDN

将静态资源（图片、字体等）托管到 CDN，提高加载速度。

### 2. 启用 Gzip 压缩

如果使用 Nginx，配置文件中已包含 Gzip 配置。

### 3. 配置缓存

Next.js 自动处理静态资源缓存，Nginx 配置中也包含了缓存策略。

### 4. 监控和日志

考虑使用以下工具：
- **日志管理**：ELK Stack, Loki
- **监控**：Prometheus + Grafana
- **错误追踪**：Sentry

---

## 故障排查

### 容器无法启动

```bash
# 查看详细日志
docker logs simple-tool

# 检查端口占用
sudo netstat -tulpn | grep 3000
```

### 构建失败

```bash
# 清理 Docker 缓存
docker builder prune

# 重新构建（不使用缓存）
docker build --no-cache -t simple-tool:latest .
```

### 内存不足

在 `docker-compose.yml` 中添加资源限制：

```yaml
deploy:
  resources:
    limits:
      memory: 512M
    reservations:
      memory: 256M
```

---

## 安全建议

1. **定期更新依赖**：`pnpm update`
2. **使用非 root 用户**：Dockerfile 中已配置
3. **限制容器权限**：避免使用 `--privileged`
4. **配置防火墙**：只开放必要端口
5. **使用 HTTPS**：生产环境必须启用 SSL
6. **定期备份**：备份重要数据和配置

---

## 云服务器推荐配置

### 最低配置
- **CPU**: 1 核
- **内存**: 1GB
- **存储**: 20GB
- **带宽**: 1Mbps

### 推荐配置
- **CPU**: 2 核
- **内存**: 2GB
- **存储**: 40GB
- **带宽**: 3Mbps

---

## 支持的云平台

- ✅ 阿里云 ECS
- ✅ 腾讯云 CVM
- ✅ AWS EC2
- ✅ DigitalOcean Droplets
- ✅ Vultr
- ✅ Linode

---

## 问题反馈

如有问题，请提交 Issue 或联系维护者。

