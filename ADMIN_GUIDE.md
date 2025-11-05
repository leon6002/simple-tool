# Admin Guide - Cheatsheet Management

本指南介绍如何使用管理员功能来编辑 cheatsheet 内容。

## 功能概述

管理员登录后可以：
- 在 cheatsheet 页面直接编辑每个 command 或 template 卡片
- 添加新的 command 或 template（新内容会显示在最前面）
- 修改名称、描述、分类、命令内容等
- 实时保存更改到 JSON 文件

## 环境配置

### 本地开发

1. 复制 `.env.example` 到 `.env.local`：
```bash
cp .env.example .env.local
```

2. 编辑 `.env.local` 设置管理员账号：
```env
# NextAuth Configuration
AUTH_SECRET=your-secret-key-here

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-password
```

3. 生成安全的 AUTH_SECRET：
```bash
openssl rand -base64 32
```

### Docker 部署

在 `docker-compose.yml` 中配置环境变量：

```yaml
services:
  simple-tool:
    environment:
      # NextAuth Configuration
      - AUTH_SECRET=${AUTH_SECRET:-change-this-to-a-random-secret-in-production}
      # Admin Credentials
      - ADMIN_USERNAME=${ADMIN_USERNAME:-admin}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD:-changeme}
```

或者创建 `.env.production` 文件：
```env
AUTH_SECRET=your-production-secret-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
```

然后在 docker-compose.yml 中启用：
```yaml
services:
  simple-tool:
    env_file:
      - .env.production
```

## 使用方法

### 1. 登录管理员账号

1. 点击导航栏右上角的 "Admin" 按钮
2. 输入配置的管理员用户名和密码
3. 登录成功后会跳转回首页

### 2. 添加新的 Command 或 Template

1. 访问任意 cheatsheet 页面（如 `/cheatsheets/git`）
2. 登录后会在页面顶部看到 "Admin Mode" 提示和两个按钮：
   - **Add Command** - 添加新的命令
   - **Add Template** - 添加新的模板
3. 点击相应按钮打开创建对话框
4. 填写所有必要字段
5. 点击 "Create" 按钮
6. 新内容会添加到列表最前面，页面自动刷新

### 3. 编辑现有内容

1. 访问任意 cheatsheet 页面
2. 每个卡片右下角会显示 "Edit" 按钮（仅管理员可见）
3. 点击 "Edit" 按钮打开编辑对话框
4. 修改内容后点击 "Save Changes"
5. 页面会自动刷新显示更新后的内容

### 4. 可编辑的字段

**Command 类型：**
- Name（名称）
- Description（描述）
- Category（分类）
- Command（命令内容）
- Example（示例）
- Language（语言，可选）

**Template 类型：**
- Name（名称）
- Description（描述）
- Category（分类）
- Content（模板内容）
- Language（语言）

### 5. 退出登录

点击导航栏右上角的 "Sign Out" 按钮即可退出管理员模式。

## 安全建议

1. **生产环境必须修改默认密码**
   - 使用强密码（至少 12 位，包含大小写字母、数字和特殊字符）
   - 定期更换密码

2. **保护 AUTH_SECRET**
   - 使用随机生成的密钥
   - 不要将密钥提交到版本控制系统
   - 每个环境使用不同的密钥

3. **使用环境变量**
   - 不要在代码中硬编码密码
   - 使用 Docker secrets 或环境变量管理敏感信息

4. **HTTPS**
   - 生产环境务必使用 HTTPS
   - 可以使用 Nginx 反向代理配置 SSL

## 数据持久化

编辑的内容会保存到 `public/data/` 目录下的 JSON 文件中：
- `public/data/git-commands.json`
- `public/data/docker-commands.json`
- `public/data/linux-commands.json`
- 等等...

**注意：** 如果使用 Docker 部署，建议将 `public/data/` 目录挂载为 volume 以持久化数据：

```yaml
services:
  simple-tool:
    volumes:
      - ./data:/app/public/data
```

## 故障排查

### 无法登录
- 检查环境变量是否正确设置
- 确认 AUTH_SECRET 已配置
- 查看浏览器控制台和服务器日志

### 编辑后内容未更新
- 刷新页面
- 检查文件权限（Docker 容器需要写入权限）
- 查看 API 响应错误信息

### Docker 部署问题
- 确保容器有写入 `public/data/` 的权限
- 检查环境变量是否正确传递到容器
- 查看容器日志：`docker logs simple-tool`

## 技术实现

- **认证框架：** NextAuth.js v5
- **认证方式：** Credentials Provider
- **会话管理：** JWT
- **密码加密：** bcryptjs（支持明文密码用于开发环境）
- **API 保护：** Middleware + Session 验证

## 未来改进

可能的功能增强：
- [x] 添加新的 command/template ✅
- [ ] 删除 command/template
- [ ] 批量编辑
- [ ] 拖拽排序
- [ ] 版本历史和回滚
- [ ] 多用户支持
- [ ] 权限分级

