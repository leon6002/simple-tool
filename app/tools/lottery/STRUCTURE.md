# 彩票工具 - 项目结构说明

## 📁 目录结构

```
lottery/
├── components/                 # 组件目录
│   ├── index.ts               # 组件导出文件
│   ├── OCRProcessor.tsx       # OCR图片识别组件
│   ├── HistoryPanel.tsx       # 历史记录面板组件
│   ├── StatisticsPanel.tsx    # 统计分析面板组件
│   ├── NumberGenerator.tsx    # 智能号码生成器组件
│   └── AlgorithmSelector.tsx   # 算法选择器组件
├── types.ts                   # 类型定义文件
├── constants.ts               # 常量配置文件
├── utils.ts                   # 工具函数文件
├── page.tsx                   # 主页面文件（重构后）
├── page_old.tsx              # 原始页面文件备份
└── STRUCTURE.md               # 本说明文件
```

## 🧩 组件说明

### 1. OCRProcessor (`OCRProcessor.tsx`)
- **功能**: 彩票图片OCR识别和AI解析
- **特性**:
  - 支持图片上传和预览
  - 扫描动画效果
  - 自动识别彩票类型
  - AI解析并计算奖金

### 2. HistoryPanel (`HistoryPanel.tsx`)
- **功能**: 历史记录管理
- **特性**:
  - 显示生成历史
  - 导入/导出功能
  - 一键复制号码
  - 清空记录

### 3. StatisticsPanel (`StatisticsPanel.tsx`)
- **功能**: 统计数据展示
- **特性**:
  - 高频/冷门号码分析
  - 频次排名展示
  - 遗漏数据统计
  - 可视化进度条

### 4. NumberGenerator (`NumberGenerator.tsx`)
- **功能**: 智能号码生成
- **特性**:
  - 多种算法支持
  - 动画效果
  - 一键复制
  - 历史记录保存

### 5. AlgorithmSelector (`AlgorithmSelector.tsx`)
- **功能**: 算法和彩票类型选择
- **特性**:
  - 彩票类型切换
  - 算法选择（随机/高频/冷门/均衡）
  - 统计分析触发
  - 状态反馈

## 📋 类型定义 (`types.ts`)

包含所有相关的TypeScript类型定义：
- `LotteryType`: 彩票类型枚举
- `AlgorithmType`: 算法类型枚举
- `HistoryRecord`: 历史记录接口
- `LotteryStatistics`: 统计数据接口
- 等等...

## ⚙️ 常量配置 (`constants.ts`)

- `LOTTERY_CONFIGS`: 彩票配置信息
- `MAX_FILE_SIZE`: 文件大小限制
- `ACCEPTED_FILE_TYPES`: 支持的文件类型
- `STORAGE_KEY`: 本地存储键名

## 🛠️ 工具函数 (`utils.ts`)

包含所有通用工具函数：
- `analyzeStatistics`: 统计分析
- `getHighFrequencyNumbers`: 获取高频号码
- `getColdNumbers`: 获取冷门号码
- `saveToLocalStorage`: 保存到本地存储
- `loadFromLocalStorage`: 从本地存储加载
- 等等...

## 🎯 优化效果

### 代码结构改进
- **文件数量**: 从1个2000+行的文件拆分为8个模块化文件
- **单一职责**: 每个组件专注于特定功能
- **可维护性**: 代码更易理解和修改
- **可复用性**: 组件可在其他地方复用

### 性能优化
- **按需加载**: 组件按需渲染
- **状态管理**: 优化的状态管理
- **内存优化**: 更好的内存使用

### 开发体验
- **模块化开发**: 团队可并行开发
- **调试友好**: 每个组件可独立测试
- **类型安全**: 完整的TypeScript支持

## 🚀 功能说明

### 1. OCR图片识别
- **位置**: OCRProcessor组件
- **功能**: 上传彩票照片，自动识别号码
- **支持**: 大乐透、双色球
- **特性**: 扫描动画、AI解析、自动奖金计算

### 2. 智能号码生成器
- **位置**: NumberGenerator组件 + AlgorithmSelector组件
- **算法**: 随机、高频、冷门、均衡
- **功能**: 基于历史数据的智能选号
- **特性**: 一键复制、历史记录保存

### 3. 统计分析
- **位置**: StatisticsPanel组件
- **功能**: 详细频次和遗漏分析
- **展示**: 可视化进度条、排名展示
- **特性**: 可展开/收起详细信息

### 4. 历史记录管理
- **位置**: HistoryPanel组件
- **功能**: 生成历史、导入导出
- **特性**: JSON格式、本地存储

### 5. 开奖历史展示
- **位置**: HistoryDisplay组件
- **功能**: 查看大乐透和双色球历史数据
- **展示**: 双列布局、滚动浏览
- **特性**: 实时数据、美观界面

## 🚀 使用说明

1. **开发新功能**: 在对应组件中添加功能
2. **修改样式**: 在相应组件中调整样式
3. **添加新算法**: 在`AlgorithmSelector`和`NumberGenerator`中实现
4. **扩展统计功能**: 在`StatisticsPanel`中添加新的统计维度
5. **自定义历史展示**: 在`HistoryDisplay`中调整展示逻辑

## 📝 注意事项

- 主页面文件(`page.tsx`)现在只负责布局和状态管理
- 所有业务逻辑都已拆分到对应组件中
- 保持了原有的所有功能和用户体验
- 组件间通过props进行通信