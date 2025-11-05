# SimpleTool - Modern Online Utilities

A collection of modern, easy-to-use online tools built with Next.js 16, TypeScript, Tailwind CSS, and shadcn/ui.

![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38bdf8)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- 🎨 **Modern Design** - Sleek, minimal interface inspired by shadcn.com
- 🌓 **Dark Mode** - Full dark/light theme support with smooth transitions
- 📱 **Responsive** - Works perfectly on mobile, tablet, and desktop
- ⚡ **Fast** - Optimized with Next.js 16 and Turbopack
- 🎭 **Animated** - Smooth transitions with Framer Motion
- 🔍 **Searchable** - Quick search and category filtering
- ♿ **Accessible** - WCAG compliant components
- 🎯 **Type Safe** - Full TypeScript coverage

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes)
- **Package Manager**: [pnpm](https://pnpm.io/)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd simple-tool

# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Build for Production

```bash
# Create optimized production build
pnpm build

# Start production server
pnpm start
```


# SimpleTool - Feature Overview

## 🏠 Homepage Features

### Hero Section
- Large gradient title: "Modern Online Tools"
- Descriptive subtitle
- Smooth fade-in animation on page load

### Category Filtering
- Interactive badge filters:
  - 📦 All Tools
  - 🔄 Converters
  - 🖼️ Image Tools
  - 📝 Text Tools
  - 🎨 3D Tools
  - 💻 Developer
- Active state highlighting
- Smooth transitions on selection
- Filters tools in real-time

### Tool Cards Grid
- Responsive grid layout (1 col mobile, 2 col tablet, 3 col desktop)
- Each card includes:
  - Large emoji icon
  - Tool name
  - Description
  - "Featured" badge (for highlighted tools)
  - Arrow indicator on hover
- Hover effects:
  - Card lifts up (y: -4px)
  - Slight scale increase (1.02)
  - Border color changes to primary
  - Shadow appears
- Staggered animation on page load
- Click to navigate to tool page

### Search Functionality
- Global search bar in navigation
- Real-time filtering
- Searches tool names and descriptions
- Works in combination with category filters
- Shows "No tools found" message when no matches

## 🧭 Navigation Bar

### Layout
- Sticky header (stays at top when scrolling)
- Backdrop blur effect
- Border at bottom
- Responsive padding

### Components
1. **Logo/Brand**
   - "SimpleTool" text with gradient
   - Hover animation (scale: 1.05)
   - Links to homepage

2. **Search Bar**
   - Centered in navbar
   - Search icon on left
   - Placeholder: "Search tools..."
   - Max width constraint
   - Responsive width

3. **Theme Toggle**
   - Sun/Moon icon
   - Smooth rotation animation
   - Toggles between light/dark mode
   - Persists preference

## 🔢 Hex Calculator Tool

### Input Section
- **Format Selection**
  - Badge buttons for: Hexadecimal, Decimal, Binary, Octal
  - Active state highlighting
  - Click to switch input format

- **Input Field**
  - Dynamic placeholder based on selected format
  - Enter key to convert
  - Error handling for invalid input
  - Clear error messages

- **Convert Button**
  - Primary action button
  - Icon + text
  - Converts on click

### Results Display
- Shows all four formats simultaneously:
  - Hexadecimal (0x prefix)
  - Decimal (base 10)
  - Binary (0b prefix)
  - Octal (0o prefix)
- Each result in a card with:
  - Format label
  - Converted value in monospace font
  - Copy button
- Fade-in animation when results appear

### Information Cards
1. **About Number Systems**
   - Explains each number system
   - Base information
   - Digit ranges

2. **Common Use Cases**
   - Real-world applications
   - Programming contexts
   - Practical examples

## 🎨 Theme System

### Light Mode
- White background
- Dark text
- Subtle gray borders
- Blue-purple gradient accents

### Dark Mode
- Black background
- Light text
- Subtle white borders
- Same gradient accents (adjusted for contrast)

### Transition
- Smooth color transitions
- No flash on theme change
- System preference detection
- Manual override available

## 🎭 Animations

### Page Transitions
- Fade in from opacity 0 to 1
- Slide up from y: 20 to y: 0
- Duration: 0.5s
- Easing: default

### Card Animations
- **Hover**:
  - Translate Y: -4px
  - Scale: 1.02
  - Duration: 0.2s
  
- **Tap**:
  - Scale: 0.98
  - Instant feedback

### Staggered Children
- Container animates children sequentially
- Delay between each: 0.1s
- Creates wave effect

### Button Animations
- Hover: subtle scale
- Tap: scale down
- Icon rotations (theme toggle)

## 📱 Responsive Design

### Breakpoints
- **Mobile** (< 640px):
  - Single column layout
  - Stacked navigation
  - Full-width cards
  - Reduced padding

- **Tablet** (640px - 1024px):
  - 2 column grid
  - Compact navigation
  - Medium padding

- **Desktop** (> 1024px):
  - 3 column grid
  - Full navigation
  - Maximum padding
  - Optimal spacing

### Mobile Optimizations
- Touch-friendly tap targets
- Readable font sizes
- Proper spacing
- No horizontal scroll
- Fast tap response

## 🔍 Search & Filter

### Search Behavior
- Case-insensitive matching
- Searches in:
  - Tool name
  - Tool description
- Real-time results
- No submit required

### Filter Behavior
- Category-based filtering
- "All" shows everything
- Specific categories show only matching tools
- Combines with search query
- Visual feedback on active filter

### Empty State
- Shows when no tools match
- Clear message
- Suggests trying different search/filter

## ♿ Accessibility

### Keyboard Navigation
- Tab through interactive elements
- Enter to activate buttons
- Escape to close modals (future)
- Focus indicators visible

### Screen Readers
- Semantic HTML
- ARIA labels where needed
- Alt text for images
- Descriptive link text

### Color Contrast
- WCAG AA compliant
- Readable in both themes
- Clear focus states
- Sufficient contrast ratios

## 🚀 Performance

### Optimizations
- Static page generation
- Optimized images (future)
- Code splitting
- Tree shaking
- Minimal bundle size

### Loading
- Fast initial load
- Smooth animations (60fps)
- No layout shift
- Progressive enhancement

## 🎯 User Experience

### Intuitive Design
- Clear visual hierarchy
- Obvious interactive elements
- Consistent patterns
- Familiar UI components

### Feedback
- Hover states on all interactive elements
- Loading states (future)
- Error messages
- Success confirmations

### Navigation
- Clear breadcrumbs (future)
- Back to home link
- Logical page structure
- Deep linking support

## 🔮 Future Enhancements

### Planned Features
- [ ] User accounts and favorites
- [ ] Tool usage history
- [ ] Keyboard shortcuts
- [ ] PWA support
- [ ] Offline mode
- [ ] Share tool results
- [ ] Export functionality
- [ ] More tools!

### Potential Tools
- QR Code generator
- Color picker
- JSON formatter
- Markdown preview
- Code beautifier
- Password generator
- Unit converter
- And many more...



## 📦 Available Tools

### ✅ Implemented
- **Hex Calculator** - Convert between hexadecimal, decimal, binary, and octal

### 🚧 Coming Soon
- **Image Converter** - Convert between JPG, PNG, WebP formats
- **OCR Tool** - Extract text from images
- **3D Model Viewer** - View and interact with 3D models
- **Text Utilities** - Base64, hash generation, and more

## 📁 Project Structure

```
simple-tool/
├── app/                    # Next.js App Router
│   ├── tools/             # Tool pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/
│   ├── layout/            # Layout components
│   ├── tools/             # Tool components
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── constants/         # App constants
│   ├── stores/            # Zustand stores
│   └── utils.ts           # Utilities
└── types/                 # TypeScript types
```

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed documentation.

## 🎯 Adding a New Tool

1. Create a new page in `app/tools/[tool-name]/page.tsx`
2. Add tool definition to `lib/constants/tools.ts`
3. Implement the tool functionality
4. Add to navigation automatically via the tools array

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed guidelines.

## how to add icon
for cheatsheet icons, they are from "lib/utils/IconMap.ts", you can add your icon to this file. Currently, we introduce two types of icons: LucideIcon and SimpleIcon. First add them in the IconMap, then go to "data/commands-data.ts", type the icon name in the icon field.

## 🎨 Design System

- **Colors**: Blue to Purple gradient for primary actions
- **Typography**: Geist Sans for UI, Geist Mono for code
- **Components**: Based on shadcn/ui with custom styling
- **Animations**: Consistent motion design with Framer Motion

## 📝 Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Vercel](https://vercel.com/) - Deployment platform

## 📚 Documentation

- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - Detailed implementation notes
- [Project Structure](./PROJECT_STRUCTURE.md) - Architecture and guidelines

---

Built with ❤️ using Next.js 16





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

