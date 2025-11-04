import { Command, CommandCategory, Template } from "@/types";

export const NGINX_CONFIGS: Template[] = [
  // Configuration Templates
  {
    id: "config-basic",
    category: "Config Template",
    language: "nginx",
    name: "Basic Configuration",
    description: "基础NGINX配置模板",
    content: `server {
    listen 80;
    server_name example.com;
    root /var/www/example.com;
    index index.html index.htm index.php;

    location / {
        try_files $uri $uri/ =404;
    }

    location ~ \\.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
    }

    location ~ /\\.ht {
        deny all;
    }
}`,
  },
  {
    id: "config-ssl",
    category: "Config Template",
    language: "nginx",
    name: "SSL Configuration",
    description: "SSL/HTTPS配置模板",
    content: `server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;

    root /var/www/example.com;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
    }

    server {
        listen 80;
        server_name example.com;
        return 301 https://$server_name$request_uri;
    }`,
  },
  {
    id: "config-reverse-proxy",
    category: "Config Template",
    language: "nginx",
    name: "Reverse Proxy",
    description: "反向代理配置模板",
    content: `server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}`,
  },
  {
    id: "config-load-balancing",
    category: "Config Template",
    language: "nginx",
    name: "Load Balancing",
    description: "负载均衡配置模板",
    content: `upstream backend {
    server backend1.example.com;
    server backend2.example.com;
    server backend3.example.com;
}

server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}`,
  },
  {
    id: "config-static-files",
    category: "Config Template",
    language: "nginx",
    name: "Static Files",
    description: "静态文件服务配置模板",
    content: `server {
    listen 80;
    server_name static.example.com;
    root /var/www/static;

    location / {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri $uri/ =404;
    }

    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}`,
  },
  {
    id: "config-security-headers",
    category: "Config Template",
    language: "nginx",
    name: "Security Headers",
    description: "安全头配置模板",
    content: `server {
    listen 80;
    server_name example.com;
    root /var/www/example.com;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        try_files $uri $uri/ =404;
    }
}`,
  },
  {
    id: "config-gzip",
    category: "Config Template",
    language: "nginx",
    name: "Gzip Compression",
    description: "Gzip压缩配置模板",
    content: `server {
    listen 80;
    server_name example.com;
    root /var/www/example.com;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
    gzip_comp_level 6;

    location / {
        try_files $uri $uri/ =404;
    }
}`,
  },
  {
    id: "config-redirects",
    category: "Config Template",
    language: "nginx",
    name: "Redirects",
    description: "重定向配置模板",
    content: `server {
    listen 80;
    server_name example.com www.example.com;

    # 301重定向到新域名
    return 301 https://newdomain.com$request_uri;
}

server {
    listen 80;
    server_name newdomain.com;

    location / {
        # 重定向特定路径
        location /old-path {
            return 301 /new-path;
        }
        
        root /var/www/newdomain.com;
        try_files $uri $uri/ =404;
    }
}`,
  },

  // Commands
];

export const NGINX_COMMANDS: Command[] = [
  {
    id: "cmd-start",
    category: "management",
    language: "bash",
    name: "Start NGINX",
    description: "启动NGINX服务",
    command: "sudo systemctl start nginx",
    example: "",
  },
  {
    id: "cmd-stop",
    category: "management",
    language: "bash",
    name: "Stop NGINX",
    description: "停止NGINX服务",
    command: "sudo systemctl stop nginx",
    example: "",
  },
  {
    id: "cmd-restart",
    category: "management",
    language: "bash",
    name: "Restart NGINX",
    description: "重启NGINX服务",
    command: "sudo systemctl restart nginx",
    example: "",
  },
  {
    id: "cmd-reload",
    category: "management",
    language: "bash",
    name: "Reload NGINX",
    description: "重新加载NGINX配置",
    command: "sudo systemctl reload nginx",
    example: "",
  },
  {
    id: "cmd-status",
    category: "management",
    language: "bash",
    name: "Check Status",
    description: "检查NGINX服务状态",
    command: "sudo systemctl status nginx",
    example: "",
  },
  {
    id: "cmd-enable",
    category: "management",
    language: "bash",
    name: "Enable at Boot",
    description: "设置NGINX开机自启",
    command: "sudo systemctl enable nginx",
    example: "",
  },
  {
    id: "cmd-disable",
    category: "management",
    language: "bash",
    name: "Disable at Boot",
    description: "取消NGINX开机自启",
    command: "sudo systemctl disable nginx",
    example: "",
  },
  {
    id: "cmd-test",
    category: "test",
    language: "bash",
    name: "Test Configuration",
    description: "测试NGINX配置文件语法",
    command: "sudo nginx -t",
    example: "",
  },
  {
    id: "cmd-test-quiet",
    category: "test",
    language: "bash",
    name: "Test Configuration (Quiet)",
    description: "静默测试NGINX配置文件语法",
    command: "sudo nginx -t -q",
    example: "",
  },
  {
    id: "cmd-config-path",
    category: "test",
    language: "bash",
    name: "Configuration Path",
    description: "查看配置文件路径",
    command: "nginx -t",
    example: "",
  },
  {
    id: "cmd-version",
    category: "information",
    language: "bash",
    name: "Check Version",
    description: "查看NGINX版本",
    command: "nginx -v",
    example: "",
  },
  {
    id: "cmd-version-full",
    category: "information",
    language: "bash",
    name: "Check Version (Detailed)",
    description: "查看NGINX详细版本信息",
    command: "nginx -V",
    example: "",
  },
  {
    id: "cmd-processes",
    category: "information",
    language: "bash",
    name: "List Processes",
    description: "列出NGINX进程",
    command: "ps aux | grep nginx",
    example: "",
  },
  {
    id: "cmd-logs-error",
    category: "logging",
    language: "bash",
    name: "View Error Logs",
    description: "查看错误日志",
    command: "sudo tail -f /var/log/nginx/error.log",
    example: "",
  },
  {
    id: "cmd-logs-access",
    language: "bash",
    category: "logging",
    name: "View Access Logs",
    description: "查看访问日志",
    command: "sudo tail -f /var/log/nginx/access.log",
    example: "",
  },
  {
    id: "cmd-logs-rotate",
    category: "logging",
    language: "bash",
    name: "Rotate Logs",
    description: "轮转日志文件",
    command: "sudo logrotate /etc/logrotate.d/nginx",
    example: "",
  },
];

const NGINX_TEMPLATE_CATEGORIES: CommandCategory[] = Array.from(
  new Set(NGINX_CONFIGS.map((ele) => ele.category)) // 1. 提取所有 category 字符串，并用 Set 去重
).map((categoryName) => ({
  // 2. 将去重后的分类名称映射成 CommandCategory 结构
  id: categoryName,
  name: categoryName,
  type: "command",
  description: "",
}));

const NGINX_COMMAND_CATEGORIES: CommandCategory[] = Array.from(
  new Set(NGINX_COMMANDS.map((ele) => ele.category)) // 1. 提取所有 category 字符串，并用 Set 去重
).map((categoryName) => ({
  // 2. 将去重后的分类名称映射成 CommandCategory 结构
  id: categoryName,
  name: categoryName,
  type: "command",
  description: "",
}));

export const NGINX_CATEGORIES: CommandCategory[] = [
  ...NGINX_TEMPLATE_CATEGORIES,
  ...NGINX_COMMAND_CATEGORIES,
];
