"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Copy, 
  Shell,
  Search,
  BookOpen,
} from "lucide-react";
import { useUserPreferencesStore } from "@/lib/stores/user-preferences-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CommandCategory {
  id: string;
  name: string;
  description: string;
}

interface Command {
  id: string;
  name: string;
  description: string;
  command: string;
  example: string;
  category: string;
}

const CATEGORIES: CommandCategory[] = [
  {
    id: "management",
    name: "Management",
    description: "Container and image management commands"
  },
  {
    id: "images",
    name: "Images",
    description: "Docker image commands"
  },
  {
    id: "networking",
    name: "Networking",
    description: "Network related commands"
  },
  {
    id: "volumes",
    name: "Volumes",
    description: "Volume management commands"
  },
  {
    id: "dockerfile",
    name: "Dockerfile",
    description: "Dockerfile templates and examples"
  },
  {
    id: "compose",
    name: "Docker Compose",
    description: "Docker Compose templates and commands"
  }
];

const COMMANDS: Command[] = [
  // Management Commands
  {
    id: "run",
    name: "docker run",
    description: "Run a command in a new container",
    command: "docker run [OPTIONS] IMAGE [COMMAND] [ARG...]",
    example: "docker run nginx\ndocker run -d -p 8080:80 nginx\ndocker run -it ubuntu bash",
    category: "management"
  },
  {
    id: "ps",
    name: "docker ps",
    description: "List containers",
    command: "docker ps [OPTIONS]",
    example: "docker ps\ndocker ps -a\ndocker ps -l",
    category: "management"
  },
  {
    id: "stop",
    name: "docker stop",
    description: "Stop one or more running containers",
    command: "docker stop [OPTIONS] CONTAINER [CONTAINER...]",
    example: "docker stop container_name\ndocker stop container_id",
    category: "management"
  },
  {
    id: "start",
    name: "docker start",
    description: "Start one or more stopped containers",
    command: "docker start [OPTIONS] CONTAINER [CONTAINER...]",
    example: "docker start container_name\ndocker start container_id",
    category: "management"
  },
  {
    id: "rm",
    name: "docker rm",
    description: "Remove one or more containers",
    command: "docker rm [OPTIONS] CONTAINER [CONTAINER...]",
    example: "docker rm container_name\ndocker rm -f container_name",
    category: "management"
  },
  {
    id: "exec",
    name: "docker exec",
    description: "Run a command in a running container",
    command: "docker exec [OPTIONS] CONTAINER COMMAND [ARG...]",
    example: "docker exec -it container_name bash\ndocker exec container_name ls /app",
    category: "management"
  },
  {
    id: "logs",
    name: "docker logs",
    description: "Fetch the logs of a container",
    command: "docker logs [OPTIONS] CONTAINER",
    example: "docker logs container_name\ndocker logs -f container_name\ndocker logs --tail 50 container_name",
    category: "management"
  },
  
  // Images Commands
  {
    id: "build",
    name: "docker build",
    description: "Build an image from a Dockerfile",
    command: "docker build [OPTIONS] PATH | URL | -",
    example: "docker build .\ndocker build -t myapp .\ndocker build -f Dockerfile.prod .",
    category: "images"
  },
  {
    id: "images",
    name: "docker images",
    description: "List images",
    command: "docker images [OPTIONS] [REPOSITORY[:TAG]]",
    example: "docker images\ndocker images nginx",
    category: "images"
  },
  {
    id: "pull",
    name: "docker pull",
    description: "Pull an image or a repository from a registry",
    command: "docker pull [OPTIONS] NAME[:TAG|@DIGEST]",
    example: "docker pull nginx\ndocker pull nginx:alpine",
    category: "images"
  },
  {
    id: "push",
    name: "docker push",
    description: "Push an image or a repository to a registry",
    command: "docker push [OPTIONS] NAME[:TAG|@DIGEST]",
    example: "docker push myusername/myapp:latest",
    category: "images"
  },
  {
    id: "rmi",
    name: "docker rmi",
    description: "Remove one or more images",
    command: "docker rmi [OPTIONS] IMAGE [IMAGE...]",
    example: "docker rmi image_name\ndocker rmi -f image_name",
    category: "images"
  },
  
  // Networking Commands
  {
    id: "network-ls",
    name: "docker network ls",
    description: "List networks",
    command: "docker network ls [OPTIONS]",
    example: "docker network ls",
    category: "networking"
  },
  {
    id: "network-create",
    name: "docker network create",
    description: "Create a network",
    command: "docker network create [OPTIONS] NETWORK",
    example: "docker network create mynetwork\ndocker network create --driver bridge mynetwork",
    category: "networking"
  },
  {
    id: "network-inspect",
    name: "docker network inspect",
    description: "Display detailed information on one or more networks",
    command: "docker network inspect [OPTIONS] NETWORK [NETWORK...]",
    example: "docker network inspect mynetwork",
    category: "networking"
  },
  
  // Volumes Commands
  {
    id: "volume-ls",
    name: "docker volume ls",
    description: "List volumes",
    command: "docker volume ls [OPTIONS]",
    example: "docker volume ls",
    category: "volumes"
  },
  {
    id: "volume-create",
    name: "docker volume create",
    description: "Create a volume",
    command: "docker volume create [OPTIONS] [VOLUME]",
    example: "docker volume create myvolume",
    category: "volumes"
  },
  {
    id: "volume-inspect",
    name: "docker volume inspect",
    description: "Display detailed information on one or more volumes",
    command: "docker volume inspect [OPTIONS] VOLUME [VOLUME...]",
    example: "docker volume inspect myvolume",
    category: "volumes"
  },
  
  // Dockerfile Templates
  {
    id: "dockerfile-nextjs",
    name: "Next.js Dockerfile",
    description: "Dockerfile template for Next.js applications",
    command: "Dockerfile",
    example: "# Dockerfile for Next.js app\nFROM node:18-alpine AS deps\nRUN apk add --no-cache libc6-compat\nWORKDIR /app\nCOPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./\nRUN \\\n  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \\\n  elif [ -f package-lock.json ]; then npm ci; \\\n  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \\\n  else echo \"Lockfile not found.\" && exit 1; \\\n  fi\n\nFROM node:18-alpine AS builder\nWORKDIR /app\nCOPY --from=deps /app/node_modules ./node_modules\nCOPY . .\nRUN npm run build\n\nFROM node:18-alpine AS runner\nWORKDIR /app\nENV NODE_ENV production\nRUN addgroup --system --gid 1001 nodejs\nRUN adduser --system --uid 1001 nextjs\nCOPY --from=builder /app/public ./public\nCOPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./\nCOPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static\nUSER nextjs\nEXPOSE 3000\nENV PORT 3000\nCMD [\"node\", \"server.js\"]",
    category: "dockerfile"
  },
  {
    id: "dockerfile-react",
    name: "React Dockerfile",
    description: "Dockerfile template for React applications",
    command: "Dockerfile",
    example: "# Dockerfile for React app\nFROM node:18 AS dependencies\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\n\nFROM node:18 AS build\nWORKDIR /app\nCOPY --from=dependencies /app/node_modules ./node_modules\nCOPY . .\nRUN npm run build\n\nFROM nginx:alpine\nCOPY --from=build /app/build /usr/share/nginx/html\nEXPOSE 80\nCMD [\"nginx\", \"-g\", \"daemon off;\"]",
    category: "dockerfile"
  },
  {
    id: "dockerfile-vue",
    name: "Vue.js Dockerfile",
    description: "Dockerfile template for Vue.js applications",
    command: "Dockerfile",
    example: "# Dockerfile for Vue.js app\nFROM node:18 AS build-stage\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM nginx:alpine AS production-stage\nCOPY --from=build-stage /app/dist /usr/share/nginx/html\nEXPOSE 80\nCMD [\"nginx\", \"-g\", \"daemon off;\"]",
    category: "dockerfile"
  },
  {
    id: "dockerfile-python",
    name: "Python Dockerfile",
    description: "Dockerfile template for Python applications",
    command: "Dockerfile",
    example: "# Dockerfile for Python app\nFROM python:3.9-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\nCOPY . .\nEXPOSE 5000\nCMD [\"python\", \"app.py\"]",
    category: "dockerfile"
  },
  {
    id: "dockerfile-java",
    name: "Java Dockerfile",
    description: "Dockerfile template for Java applications",
    command: "Dockerfile",
    example: "# Dockerfile for Java app\nFROM openjdk:11-jre-slim\nWORKDIR /app\nCOPY . .\nRUN ./mvnw clean package\nEXPOSE 8080\nCMD [\"java\", \"-jar\", \"target/app.jar\"]",
    category: "dockerfile"
  },
  
  // Docker Compose Templates
  {
    id: "compose-web",
    name: "Web App Template",
    description: "Docker Compose template for web applications",
    command: "docker-compose.yml",
    example: "# docker-compose.yml for web app\nversion: '3.8'\nservices:\n  web:\n    build: .\n    ports:\n      - \"3000:3000\"\n    volumes:\n      - .:/app\n      - /app/node_modules\n    environment:\n      - NODE_ENV=development\n    depends_on:\n      - db\n  db:\n    image: postgres:13\n    environment:\n      POSTGRES_USER: user\n      POSTGRES_PASSWORD: password\n      POSTGRES_DB: myapp\n    volumes:\n      - postgres_data:/var/lib/postgresql/data\n    ports:\n      - \"5432:5432\"\nvolumes:\n  postgres_data:",
    category: "compose"
  },
  {
    id: "compose-lamp",
    name: "LAMP Stack Template",
    description: "Docker Compose template for LAMP stack",
    command: "docker-compose.yml",
    example: "# docker-compose.yml for LAMP stack\nversion: '3.8'\nservices:\n  web:\n    image: nginx:alpine\n    ports:\n      - \"8000:80\"\n    volumes:\n      - ./src:/var/www/html\n      - ./nginx.conf:/etc/nginx/conf.d/default.conf\n    depends_on:\n      - php\n  php:\n    image: php:8.1-fpm-alpine\n    volumes:\n      - ./src:/var/www/html\n  db:\n    image: mysql:8.0\n    environment:\n      MYSQL_ROOT_PASSWORD: rootpassword\n      MYSQL_DATABASE: myapp\n      MYSQL_USER: user\n      MYSQL_PASSWORD: password\n    volumes:\n      - mysql_data:/var/lib/mysql\n    ports:\n      - \"3306:3306\"\nvolumes:\n  mysql_data:",
    category: "compose"
  },
  {
    id: "compose-commands",
    name: "Docker Compose Commands",
    description: "Common Docker Compose commands",
    command: "docker-compose [COMMAND] [OPTIONS]",
    example: "# Common Docker Compose commands\ndocker-compose up\ndocker-compose up -d\ndocker-compose down\ndocker-compose logs\ndocker-compose ps\ndocker-compose build\ndocker-compose exec service_name command",
    category: "compose"
  }
];

export default function DockerCheatsheetPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});
  const { addRecentlyUsedTool } = useUserPreferencesStore();

  // 记录最近使用的工具
  useEffect(() => {
    addRecentlyUsedTool("docker-cheatsheet");
  }, [addRecentlyUsedTool]);

  // 复制到剪贴板
  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [key]: true });
    setTimeout(() => {
      setCopied({ ...copied, [key]: false });
    }, 2000);
  };

  // 过滤命令
  const filteredCommands = COMMANDS.filter(command => {
    const matchesSearch = command.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         command.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         command.command.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         command.example.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || command.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // 获取分类命令
  const getCategoryCommands = (categoryId: string) => {
    return filteredCommands.filter(cmd => cmd.category === categoryId);
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
            <Shell className="h-8 w-8 text-purple-600" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Docker Cheatsheet
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Quick reference for Docker commands, Dockerfiles, and Docker Compose with practical examples
          </p>
        </div>

        {/* 搜索和过滤 */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search commands, Dockerfiles, or compose files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              className={selectedCategory === "all" ? "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white" : ""}
            >
              All Commands
            </Button>
            
            {CATEGORIES.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className={selectedCategory === category.id ? "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white" : ""}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* 命令列表 */}
        <div className="grid grid-cols-1 gap-6">
          {selectedCategory === "all" ? (
            CATEGORIES.map((category) => {
              const categoryCommands = getCategoryCommands(category.id);
              if (categoryCommands.length === 0) return null;
              
              return (
                <div key={category.id} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold">{category.name}</h2>
                    <Badge variant="secondary">{categoryCommands.length} items</Badge>
                  </div>
                  <p className="text-muted-foreground">{category.description}</p>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {categoryCommands.map((command) => (
                      <Card key={command.id} className="border-border/50 shadow-xl shadow-purple-500/5">
                        <CardHeader>
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                <Shell className="h-5 w-5" />
                                {command.name}
                              </CardTitle>
                              <CardDescription>
                                {command.description}
                              </CardDescription>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(command.example, command.id)}
                              className="flex items-center gap-2"
                            >
                              <Copy className="h-4 w-4" />
                              {copied[command.id] ? "Copied!" : "Copy"}
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Command:</h4>
                            <pre className="p-3 rounded-lg bg-muted/50 font-mono text-sm">
                              {command.command}
                            </pre>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-2">Example:</h4>
                            <pre className="p-3 rounded-lg bg-muted/50 font-mono text-sm whitespace-pre-wrap">
                              {command.example}
                            </pre>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredCommands.map((command) => (
                <Card key={command.id} className="border-border/50 shadow-xl shadow-purple-500/5">
                  <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Shell className="h-5 w-5" />
                          {command.name}
                        </CardTitle>
                        <CardDescription>
                          {command.description}
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(command.example, command.id)}
                        className="flex items-center gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        {copied[command.id] ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Command:</h4>
                      <pre className="p-3 rounded-lg bg-muted/50 font-mono text-sm">
                        {command.command}
                      </pre>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Example:</h4>
                      <pre className="p-3 rounded-lg bg-muted/50 font-mono text-sm whitespace-pre-wrap">
                        {command.example}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {filteredCommands.length === 0 && (
            <Card className="border-border/50 shadow-xl shadow-purple-500/5">
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No commands found</h3>
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