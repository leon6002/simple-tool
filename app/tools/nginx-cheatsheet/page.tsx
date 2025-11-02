"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Search, Server } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NginxItem {
  id: string;
  category: string;
  title: string;
  description: string;
  content: string;
  type: "config" | "command";
}

const NGINX_ITEMS: NginxItem[] = [
  // Configuration Templates
  {
    id: "config-basic",
    category: "config",
    title: "Basic Configuration",
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
    type: "config"
  },
  {
    id: "config-ssl",
    category: "config",
    title: "SSL Configuration",
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
    type: "config"
  },
  {
    id: "config-reverse-proxy",
    category: "config",
    title: "Reverse Proxy",
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
    type: "config"
  },
  {
    id: "config-load-balancing",
    category: "config",
    title: "Load Balancing",
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
    type: "config"
  },
  {
    id: "config-static-files",
    category: "config",
    title: "Static Files",
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
    type: "config"
  },
  {
    id: "config-security-headers",
    category: "config",
    title: "Security Headers",
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
    type: "config"
  },
  {
    id: "config-gzip",
    category: "config",
    title: "Gzip Compression",
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
    type: "config"
  },
  {
    id: "config-redirects",
    category: "config",
    title: "Redirects",
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
    type: "config"
  },
  
  // Commands
  {
    id: "cmd-start",
    category: "commands",
    title: "Start NGINX",
    description: "启动NGINX服务",
    content: "sudo systemctl start nginx",
    type: "command"
  },
  {
    id: "cmd-stop",
    category: "commands",
    title: "Stop NGINX",
    description: "停止NGINX服务",
    content: "sudo systemctl stop nginx",
    type: "command"
  },
  {
    id: "cmd-restart",
    category: "commands",
    title: "Restart NGINX",
    description: "重启NGINX服务",
    content: "sudo systemctl restart nginx",
    type: "command"
  },
  {
    id: "cmd-reload",
    category: "commands",
    title: "Reload NGINX",
    description: "重新加载NGINX配置",
    content: "sudo systemctl reload nginx",
    type: "command"
  },
  {
    id: "cmd-status",
    category: "commands",
    title: "Check Status",
    description: "检查NGINX服务状态",
    content: "sudo systemctl status nginx",
    type: "command"
  },
  {
    id: "cmd-enable",
    category: "commands",
    title: "Enable at Boot",
    description: "设置NGINX开机自启",
    content: "sudo systemctl enable nginx",
    type: "command"
  },
  {
    id: "cmd-disable",
    category: "commands",
    title: "Disable at Boot",
    description: "取消NGINX开机自启",
    content: "sudo systemctl disable nginx",
    type: "command"
  },
  {
    id: "cmd-test",
    category: "commands",
    title: "Test Configuration",
    description: "测试NGINX配置文件语法",
    content: "sudo nginx -t",
    type: "command"
  },
  {
    id: "cmd-test-quiet",
    category: "commands",
    title: "Test Configuration (Quiet)",
    description: "静默测试NGINX配置文件语法",
    content: "sudo nginx -t -q",
    type: "command"
  },
  {
    id: "cmd-version",
    category: "commands",
    title: "Check Version",
    description: "查看NGINX版本",
    content: "nginx -v",
    type: "command"
  },
  {
    id: "cmd-version-full",
    category: "commands",
    title: "Check Version (Detailed)",
    description: "查看NGINX详细版本信息",
    content: "nginx -V",
    type: "command"
  },
  {
    id: "cmd-config-path",
    category: "commands",
    title: "Configuration Path",
    description: "查看配置文件路径",
    content: "nginx -t",
    type: "command"
  },
  {
    id: "cmd-processes",
    category: "commands",
    title: "List Processes",
    description: "列出NGINX进程",
    content: "ps aux | grep nginx",
    type: "command"
  },
  {
    id: "cmd-logs-error",
    category: "commands",
    title: "View Error Logs",
    description: "查看错误日志",
    content: "sudo tail -f /var/log/nginx/error.log",
    type: "command"
  },
  {
    id: "cmd-logs-access",
    category: "commands",
    title: "View Access Logs",
    description: "查看访问日志",
    content: "sudo tail -f /var/log/nginx/access.log",
    type: "command"
  },
  {
    id: "cmd-logs-rotate",
    category: "commands",
    title: "Rotate Logs",
    description: "轮转日志文件",
    content: "sudo logrotate /etc/logrotate.d/nginx",
    type: "command"
  }
];

const CATEGORIES = [
  { id: "all", name: "All" },
  { id: "config", name: "Config Templates" },
  { id: "commands", name: "Commands" },
];

export default function NginxCheatsheetPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredItems = NGINX_ITEMS.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="container mx-auto max-w-6xl py-12 md:py-16 lg:py-20 px-4 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-12 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/20"
          >
            <Server className="h-8 w-8 text-purple-600" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            NGINX Cheatsheet
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Quick reference for NGINX configuration templates and commands
          </p>
        </div>

        {/* Search and Filter Section */}
        <Card className="mb-8 border-border/50 shadow-xl shadow-purple-500/5">
          <CardHeader>
            <CardTitle>Search Configurations & Commands</CardTitle>
            <CardDescription>
              Find NGINX configurations or commands by name or description
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search configurations or commands..."
                className="h-12 pl-11 pr-4 rounded-full border-border/50 bg-muted/50 backdrop-blur-sm transition-all focus:bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium mb-3 block">
                Filter by Type
              </label>
              <div className="flex flex-wrap gap-3">
                {CATEGORIES.map((category) => (
                  <Badge
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "secondary"}
                    className={`cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105 ${
                      selectedCategory === category.id
                        ? "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white border-0 shadow-lg shadow-purple-500/30"
                        : "hover:border-purple-500/50 hover:bg-purple-500/5"
                    }`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items List */}
        <div className="grid gap-6">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-purple-500/30 transition-all group">
                  <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Server className="h-5 w-5 text-purple-600" />
                          {item.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {item.description}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {item.type === "config" ? "Configuration" : "Command"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Tabs defaultValue="content" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="content">Content</TabsTrigger>
                        <TabsTrigger value="info">Information</TabsTrigger>
                      </TabsList>
                      <TabsContent value="content" className="mt-4">
                        <div className="p-4 rounded-lg bg-muted/50 font-mono text-sm whitespace-pre-wrap break-all max-h-60 overflow-y-auto">
                          {item.content}
                        </div>
                      </TabsContent>
                      <TabsContent value="info" className="mt-4">
                        <div className="p-4 rounded-lg bg-muted/50">
                          <h4 className="font-semibold mb-2">Usage Information</h4>
                          <p className="text-sm">
                            {item.type === "config" 
                              ? "Copy this configuration template and modify it according to your needs. Place it in your NGINX sites-available directory and create a symlink to sites-enabled."
                              : "Run this command in your terminal to manage NGINX. Make sure you have the necessary permissions (usually requires sudo)."}
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>
                    
                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(item.content, item.id)}
                        className="flex items-center gap-2 transition-all hover:scale-105"
                      >
                        <Copy className="h-4 w-4" />
                        {copiedId === item.id ? "Copied!" : `Copy ${item.type === "config" ? "Config" : "Command"}`}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="py-12 text-center">
                <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No items found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>
    </div>
  );
}