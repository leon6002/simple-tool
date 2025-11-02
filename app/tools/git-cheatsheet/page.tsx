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
import { Copy, Search, GitBranch } from "lucide-react";

interface GitCommand {
  id: string;
  category: string;
  title: string;
  command: string;
  description: string;
  example: string;
}

const GIT_COMMANDS: GitCommand[] = [
  {
    id: "config-name",
    category: "config",
    title: "设置用户名",
    command: "git config --global user.name \"Your Name\"",
    description: "设置提交时使用的用户名",
    example: "git config --global user.name \"John Doe\""
  },
  {
    id: "config-email",
    category: "config",
    title: "设置邮箱",
    command: "git config --global user.email \"you@example.com\"",
    description: "设置提交时使用的邮箱地址",
    example: "git config --global user.email \"john@example.com\""
  },
  {
    id: "config-list",
    category: "config",
    title: "查看配置",
    command: "git config --list",
    description: "列出所有Git配置",
    example: "git config --list"
  },
  {
    id: "init",
    category: "setup",
    title: "初始化仓库",
    command: "git init",
    description: "在当前目录创建新的Git仓库",
    example: "git init"
  },
  {
    id: "clone",
    category: "setup",
    title: "克隆仓库",
    command: "git clone [url]",
    description: "克隆远程仓库到本地",
    example: "git clone https://github.com/user/repo.git"
  },
  {
    id: "status",
    category: "basic",
    title: "查看状态",
    command: "git status",
    description: "查看工作区和暂存区的状态",
    example: "git status"
  },
  {
    id: "add",
    category: "basic",
    title: "添加文件到暂存区",
    command: "git add [file]",
    description: "将文件添加到暂存区",
    example: "git add README.md"
  },
  {
    id: "add-all",
    category: "basic",
    title: "添加所有文件到暂存区",
    command: "git add .",
    description: "将所有修改过的文件添加到暂存区",
    example: "git add ."
  },
  {
    id: "commit",
    category: "basic",
    title: "提交更改",
    command: "git commit -m \"commit message\"",
    description: "将暂存区的更改提交到本地仓库",
    example: "git commit -m \"Add new feature\""
  },
  {
    id: "commit-amend",
    category: "basic",
    title: "修改最后一次提交",
    command: "git commit --amend",
    description: "修改最后一次提交的内容或信息",
    example: "git commit --amend -m \"Updated commit message\""
  },
  {
    id: "log",
    category: "history",
    title: "查看提交历史",
    command: "git log",
    description: "查看提交历史记录",
    example: "git log"
  },
  {
    id: "log-oneline",
    category: "history",
    title: "简洁查看提交历史",
    command: "git log --oneline",
    description: "以简洁格式查看提交历史",
    example: "git log --oneline"
  },
  {
    id: "log-graph",
    category: "history",
    title: "图形化查看提交历史",
    command: "git log --graph --oneline --all",
    description: "以图形化方式查看提交历史",
    example: "git log --graph --oneline --all"
  },
  {
    id: "diff",
    category: "history",
    title: "查看文件差异",
    command: "git diff",
    description: "查看工作区与暂存区的差异",
    example: "git diff"
  },
  {
    id: "diff-staged",
    category: "history",
    title: "查看暂存区差异",
    command: "git diff --staged",
    description: "查看暂存区与最后一次提交的差异",
    example: "git diff --staged"
  },
  {
    id: "branch",
    category: "branch",
    title: "查看分支",
    command: "git branch",
    description: "列出所有本地分支",
    example: "git branch"
  },
  {
    id: "branch-all",
    category: "branch",
    title: "查看所有分支",
    command: "git branch -a",
    description: "列出所有本地和远程分支",
    example: "git branch -a"
  },
  {
    id: "branch-create",
    category: "branch",
    title: "创建分支",
    command: "git branch [branch-name]",
    description: "创建新分支但不切换",
    example: "git branch feature/new-feature"
  },
  {
    id: "checkout",
    category: "branch",
    title: "切换分支",
    command: "git checkout [branch-name]",
    description: "切换到指定分支",
    example: "git checkout feature/new-feature"
  },
  {
    id: "checkout-create",
    category: "branch",
    title: "创建并切换分支",
    command: "git checkout -b [branch-name]",
    description: "创建并切换到新分支",
    example: "git checkout -b feature/new-feature"
  },
  {
    id: "switch",
    category: "branch",
    title: "切换分支（新方式）",
    command: "git switch [branch-name]",
    description: "切换到指定分支（Git 2.23+）",
    example: "git switch feature/new-feature"
  },
  {
    id: "switch-create",
    category: "branch",
    title: "创建并切换分支（新方式）",
    command: "git switch -c [branch-name]",
    description: "创建并切换到新分支（Git 2.23+）",
    example: "git switch -c feature/new-feature"
  },
  {
    id: "merge",
    category: "branch",
    title: "合并分支",
    command: "git merge [branch-name]",
    description: "将指定分支合并到当前分支",
    example: "git merge feature/new-feature"
  },
  {
    id: "merge-no-ff",
    category: "branch",
    title: "非快进合并",
    command: "git merge --no-ff [branch-name]",
    description: "强制创建合并提交",
    example: "git merge --no-ff feature/new-feature"
  },
  {
    id: "branch-delete",
    category: "branch",
    title: "删除分支",
    command: "git branch -d [branch-name]",
    description: "删除指定分支",
    example: "git branch -d feature/new-feature"
  },
  {
    id: "branch-delete-force",
    category: "branch",
    title: "强制删除分支",
    command: "git branch -D [branch-name]",
    description: "强制删除未合并的分支",
    example: "git branch -D feature/new-feature"
  },
  {
    id: "remote",
    category: "remote",
    title: "查看远程仓库",
    command: "git remote -v",
    description: "查看远程仓库地址",
    example: "git remote -v"
  },
  {
    id: "remote-add",
    category: "remote",
    title: "添加远程仓库",
    command: "git remote add [name] [url]",
    description: "添加新的远程仓库",
    example: "git remote add origin https://github.com/user/repo.git"
  },
  {
    id: "fetch",
    category: "remote",
    title: "获取远程更新",
    command: "git fetch [remote]",
    description: "从远程仓库获取最新数据",
    example: "git fetch origin"
  },
  {
    id: "pull",
    category: "remote",
    title: "拉取远程更改",
    command: "git pull [remote] [branch]",
    description: "从远程仓库拉取并合并更改",
    example: "git pull origin main"
  },
  {
    id: "push",
    category: "remote",
    title: "推送本地更改",
    command: "git push [remote] [branch]",
    description: "将本地更改推送到远程仓库",
    example: "git push origin main"
  },
  {
    id: "push-set-upstream",
    category: "remote",
    title: "设置上游分支",
    command: "git push -u [remote] [branch]",
    description: "推送并设置上游分支",
    example: "git push -u origin feature/new-feature"
  },
  {
    id: "push-tags",
    category: "remote",
    title: "推送标签",
    command: "git push --tags",
    description: "推送所有标签到远程仓库",
    example: "git push --tags"
  },
  {
    id: "stash",
    category: "stash",
    title: "暂存更改",
    command: "git stash",
    description: "暂存当前未提交的更改",
    example: "git stash"
  },
  {
    id: "stash-save",
    category: "stash",
    title: "暂存更改并添加描述",
    command: "git stash save \"message\"",
    description: "暂存更改并添加描述信息",
    example: "git stash save \"Work in progress\""
  },
  {
    id: "stash-list",
    category: "stash",
    title: "查看暂存列表",
    command: "git stash list",
    description: "查看所有暂存的更改",
    example: "git stash list"
  },
  {
    id: "stash-pop",
    category: "stash",
    title: "恢复暂存更改",
    command: "git stash pop",
    description: "恢复最近一次暂存的更改",
    example: "git stash pop"
  },
  {
    id: "stash-apply",
    category: "stash",
    title: "应用暂存更改",
    command: "git stash apply",
    description: "应用暂存的更改但不删除",
    example: "git stash apply"
  },
  {
    id: "tag",
    category: "tag",
    title: "查看标签",
    command: "git tag",
    description: "列出所有标签",
    example: "git tag"
  },
  {
    id: "tag-create",
    category: "tag",
    title: "创建标签",
    command: "git tag [tag-name]",
    description: "创建轻量标签",
    example: "git tag v1.0.0"
  },
  {
    id: "tag-annotated",
    category: "tag",
    title: "创建注释标签",
    command: "git tag -a [tag-name] -m \"message\"",
    description: "创建带有注释的标签",
    example: "git tag -a v1.0.0 -m \"Release version 1.0.0\""
  },
  {
    id: "tag-delete",
    category: "tag",
    title: "删除标签",
    command: "git tag -d [tag-name]",
    description: "删除本地标签",
    example: "git tag -d v1.0.0"
  },
  {
    id: "rebase",
    category: "advanced",
    title: "变基",
    command: "git rebase [branch-name]",
    description: "将当前分支变基到指定分支",
    example: "git rebase main"
  },
  {
    id: "rebase-interactive",
    category: "advanced",
    title: "交互式变基",
    command: "git rebase -i HEAD~n",
    description: "交互式变基最近n次提交",
    example: "git rebase -i HEAD~3"
  },
  {
    id: "reset",
    category: "advanced",
    title: "重置提交",
    command: "git reset --soft HEAD~1",
    description: "软重置到上一次提交（保留更改）",
    example: "git reset --soft HEAD~1"
  },
  {
    id: "reset-hard",
    category: "advanced",
    title: "硬重置提交",
    command: "git reset --hard HEAD~1",
    description: "硬重置到上一次提交（丢弃更改）",
    example: "git reset --hard HEAD~1"
  },
  {
    id: "revert",
    category: "advanced",
    title: "撤销提交",
    command: "git revert [commit]",
    description: "创建新提交来撤销指定提交",
    example: "git revert abc123"
  },
  {
    id: "cherry-pick",
    category: "advanced",
    title: "选择性合并",
    command: "git cherry-pick [commit]",
    description: "将指定提交应用到当前分支",
    example: "git cherry-pick abc123"
  },
  {
    id: "reflog",
    category: "advanced",
    title: "查看引用日志",
    command: "git reflog",
    description: "查看分支和HEAD的移动历史",
    example: "git reflog"
  }
];

const CATEGORIES = [
  { id: "all", name: "All Commands" },
  { id: "config", name: "Configuration" },
  { id: "setup", name: "Setup" },
  { id: "basic", name: "Basic Commands" },
  { id: "history", name: "History & Diff" },
  { id: "branch", name: "Branching" },
  { id: "remote", name: "Remote Repositories" },
  { id: "stash", name: "Stashing" },
  { id: "tag", name: "Tagging" },
  { id: "advanced", name: "Advanced" },
];

export default function GitCheatsheetPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredCommands = GIT_COMMANDS.filter(command => {
    const matchesSearch = command.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          command.command.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          command.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || command.category === selectedCategory;
    
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
            <GitBranch className="h-8 w-8 text-purple-600" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Git Cheatsheet
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Quick reference for Git commands. Never forget how to use Git again!
          </p>
        </div>

        {/* Search and Filter Section */}
        <Card className="mb-8 border-border/50 shadow-xl shadow-purple-500/5">
          <CardHeader>
            <CardTitle>Search Commands</CardTitle>
            <CardDescription>
              Find Git commands by name, description or category
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search commands..."
                className="h-12 pl-11 pr-4 rounded-full border-border/50 bg-muted/50 backdrop-blur-sm transition-all focus:bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium mb-3 block">
                Filter by Category
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

        {/* Commands List */}
        <div className="grid gap-6">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((command, index) => (
              <motion.div
                key={command.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-purple-500/30 transition-all group">
                  <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <GitBranch className="h-5 w-5 text-purple-600" />
                          {command.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {command.description}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {CATEGORIES.find(c => c.id === command.category)?.name}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50 font-mono text-sm break-all">
                      {command.command}
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(command.command, command.id)}
                        className="flex items-center gap-2 transition-all hover:scale-105"
                      >
                        <Copy className="h-4 w-4" />
                        {copiedId === command.id ? "Copied!" : "Copy Command"}
                      </Button>
                    </div>
                    
                    {command.example && (
                      <div className="pt-2 border-t border-border/50">
                        <p className="text-sm text-muted-foreground mb-2">Example:</p>
                        <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 font-mono text-sm">
                          {command.example}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="py-12 text-center">
                <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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