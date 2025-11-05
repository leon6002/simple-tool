# 彩票工具实现总结

## 概述

本文档总结了彩票工具的实现细节，包括文件结构、功能特性、技术栈和使用说明。

## 文件结构

```
simple-tool/
├── app/
│   ├── api/
│   │   └── lottery/
│   │       └── ocr/
│   │           └── route.ts          # OCR API 路由
│   └── tools/
│       └── lottery/
│           ├── page.tsx              # 彩票工具主页面
│           ├── README.md             # 功能说明文档
│           └── __tests__/
│               └── lottery.test.ts   # 单元测试
├── lib/
│   └── constants/
│       └── tools.ts                  # 工具定义（已更新）
├── docs/
│   ├── LOTTERY_TOOL_GUIDE.md        # 用户使用指南
│   └── LOTTERY_IMPLEMENTATION_SUMMARY.md  # 实现总结
├── scripts/
│   └── test-lottery-ocr.ts          # OCR 测试脚本
├── .env.example                      # 环境变量示例（已更新）
└── CHANGELOG.md                      # 更新日志

```

## 实现的功能

### 1. 奖金计算器

**功能特性：**
- 支持三种彩票类型：大乐透、双色球、福彩8
- 彩票照片 OCR 识别
- 手动输入中奖号码数量
- 自动计算奖金等级和金额
- 实时显示计算结果

**技术实现：**
- 使用 DeepSeek-OCR API 进行图片识别
- 前端图片转 Base64 编码
- 后端解析 OCR 结果并提取号码
- 根据彩票规则计算奖金等级

### 2. 号码生成器

**功能特性：**
- 随机生成彩票号码
- 支持三种彩票类型
- 号码自动排序
- 一键复制到剪贴板
- 美观的号码显示效果

**技术实现：**
- 使用 Math.random() 生成随机数
- 确保号码不重复
- 自动排序（升序）
- 使用 Clipboard API 复制

## 技术栈

### 前端
- **React 18**: UI 框架
- **TypeScript**: 类型安全
- **Next.js 16**: 全栈框架
- **Framer Motion**: 动画效果
- **Tailwind CSS v4**: 样式设计
- **Radix UI**: 无障碍组件库
- **React Hot Toast**: 消息提示

### 后端
- **Next.js API Routes**: API 服务
- **DeepSeek-OCR API**: 图片文字识别

### 开发工具
- **ESLint**: 代码检查
- **TypeScript**: 类型检查
- **Turbopack**: 快速构建

## API 设计

### OCR API

**端点：** `POST /api/lottery/ocr`

**请求体：**
```json
{
  "imageBase64": "data:image/jpeg;base64,..."
}
```

**响应：**
```json
{
  "success": true,
  "ocrText": "识别的原始文本",
  "parsedResult": {
    "type": "dlt",
    "numbers": [3, 12, 18, 25, 31],
    "specialNumbers": [5, 9]
  }
}
```

**错误响应：**
```json
{
  "error": "错误信息"
}
```

## 数据结构

### 彩票配置

```typescript
interface LotteryConfig {
  name: string;                    // 彩票名称
  mainRange: [number, number];     // 主号码范围
  mainCount: number;               // 主号码数量
  specialRange?: [number, number]; // 特殊号码范围
  specialCount?: number;           // 特殊号码数量
  description: string;             // 规则描述
}
```

### OCR 结果

```typescript
interface OCRResult {
  type: string | null;      // 彩票类型
  numbers: number[];        // 主号码
  specialNumbers: number[]; // 特殊号码
}
```

## 彩票规则实现

### 大乐透 (DLT)

```typescript
// 号码范围
mainRange: [1, 35]    // 前区
mainCount: 5
specialRange: [1, 12] // 后区
specialCount: 2

// 奖金等级（8个等级）
一等奖: 前5+后2 (浮动)
二等奖: 前5+后1 (浮动)
三等奖: 前5+后0 (10,000元)
...
```

### 双色球 (SSQ)

```typescript
// 号码范围
mainRange: [1, 33]    // 红球
mainCount: 6
specialRange: [1, 16] // 蓝球
specialCount: 1

// 奖金等级（6个等级）
一等奖: 红6+蓝1 (浮动)
二等奖: 红6+蓝0 (浮动)
三等奖: 红5+蓝1 (3,000元)
...
```

### 福彩8 (FC8)

```typescript
// 号码范围
mainRange: [1, 80]
mainCount: 8

// 注：暂不支持奖金计算
```

## 环境变量配置

```env
# OCR API 配置
OCR_API_KEY=your-ocr-api-key-here
OCR_BASE_URL=https://api.siliconflow.cn/v1
```

## 使用流程

### 奖金计算流程

```
1. 用户选择彩票类型
   ↓
2. 上传彩票照片（可选）
   ↓
3. 前端转换为 Base64
   ↓
4. 调用 OCR API
   ↓
5. 解析识别结果
   ↓
6. 显示识别的号码
   ↓
7. 用户输入中奖数量
   ↓
8. 计算奖金等级
   ↓
9. 显示结果
```

### 号码生成流程

```
1. 用户选择彩票类型
   ↓
2. 点击生成按钮
   ↓
3. 生成随机号码
   ↓
4. 号码排序
   ↓
5. 显示号码
   ↓
6. 用户复制号码（可选）
```

## 测试

### 单元测试

位置：`app/tools/lottery/__tests__/lottery.test.ts`

测试内容：
- 号码生成功能
- 号码唯一性
- 号码范围验证
- 奖金计算逻辑

### OCR 测试脚本

位置：`scripts/test-lottery-ocr.ts`

使用方法：
```bash
tsx scripts/test-lottery-ocr.ts /path/to/lottery-image.jpg
```

## 性能优化

1. **图片处理**
   - 限制文件大小（最大 10MB）
   - 支持多种图片格式
   - 前端 Base64 转换

2. **API 调用**
   - 错误处理和重试机制
   - 超时控制
   - 结果缓存（可选）

3. **UI 渲染**
   - 使用 React.memo 优化组件
   - useCallback 缓存函数
   - 条件渲染减少 DOM 操作

## 安全考虑

1. **API Key 保护**
   - 使用环境变量存储
   - 不在前端暴露
   - 通过后端 API 调用

2. **文件上传**
   - 限制文件大小
   - 验证文件类型
   - 防止恶意文件上传

3. **输入验证**
   - 验证号码范围
   - 防止 XSS 攻击
   - 参数类型检查

## 已知限制

1. **OCR 识别**
   - 准确率受照片质量影响
   - 需要清晰的照片
   - 可能需要多次尝试

2. **福彩8**
   - 暂不支持奖金计算
   - 仅支持号码生成

3. **浮动奖金**
   - 无法计算具体金额
   - 仅显示"浮动奖金"

## 未来改进

### 短期计划
- [ ] 优化 OCR 识别准确率
- [ ] 添加福彩8奖金计算
- [ ] 支持批量号码生成
- [ ] 添加号码历史记录

### 长期计划
- [ ] 支持更多彩票类型
- [ ] 历史开奖查询
- [ ] 号码走势分析
- [ ] 中奖概率计算
- [ ] 号码过滤功能
- [ ] 投注金额计算

## 维护指南

### 添加新彩票类型

1. 在 `LOTTERY_CONFIGS` 中添加配置
2. 更新 `LotteryType` 类型定义
3. 实现奖金计算逻辑
4. 更新 OCR 解析逻辑
5. 添加测试用例

### 更新奖金规则

1. 修改 `calculatePrize` 函数
2. 更新文档说明
3. 添加测试用例
4. 更新 CHANGELOG

### 调试 OCR 问题

1. 检查 API Key 配置
2. 验证图片格式和大小
3. 查看 API 响应日志
4. 使用测试脚本验证

## 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 项目
2. 创建功能分支
3. 提交代码
4. 编写测试
5. 更新文档
6. 提交 Pull Request

## 许可证

本项目采用 MIT 许可证。

## 联系方式

如有问题或建议，请通过以下方式联系：

- GitHub Issues
- Email: support@simpletool.com

---

**最后更新：** 2025-11-05
**版本：** 1.0.0

