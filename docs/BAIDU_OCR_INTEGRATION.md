# 百度OCR集成文档

## 概述

为了提高彩票OCR识别的稳定性和准确率，系统现已集成百度OCR作为主要OCR服务提供商，并保留DeepSeek OCR作为备用方案。

## 主要改进

### 1. 多OCR提供商支持

- ✅ **百度OCR**（默认）：稳定性高，专门针对中文优化
- ✅ **DeepSeek OCR**（备用）：支持多种文档格式
- ✅ **自动降级**：主OCR失败时自动切换到备用OCR

### 2. 统一的服务架构

```
app/api/lottery/services/
├── ocr-service.ts      # 统一入口，负责选择OCR提供商
├── baidu-ocr.ts        # 百度OCR实现
├── deepseek-ocr.ts     # DeepSeek OCR实现
└── README.md           # 服务说明文档
```

### 3. 配置灵活

通过环境变量轻松切换OCR提供商，无需修改代码。

## 配置方法

### 步骤1：获取百度OCR密钥

1. 访问 [百度智能云](https://cloud.baidu.com/)
2. 注册/登录账号
3. 进入"产品服务" → "人工智能" → "文字识别"
4. 创建应用
5. 获取 **API Key** 和 **Secret Key**

### 步骤2：配置环境变量

在 `.env.local` 文件中添加：

```env
# OCR Provider: 'baidu' or 'deepseek' (default: baidu)
OCR_PROVIDER=baidu

# Baidu OCR Configuration
BAIDU_OCR_API_KEY=your-baidu-api-key-here
BAIDU_OCR_SECRET_KEY=your-baidu-secret-key-here

# DeepSeek OCR Configuration (fallback)
OCR_API_KEY=your-deepseek-api-key-here
OCR_BASE_URL=https://api.siliconflow.cn/v1
```

### 步骤3：重启应用

```bash
pnpm dev
```

## 使用示例

### 百度OCR API调用示例

```bash
# 1. 获取access_token（有效期30天）
curl -X POST 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=YOUR_API_KEY&client_secret=YOUR_SECRET_KEY' \
  -H 'Content-Type: application/json'

# 2. 使用access_token调用OCR接口
curl -X POST 'https://aip.baidubce.com/rest/2.0/ocr/v1/general?access_token=ACCESS_TOKEN' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --header 'Accept: application/json' \
  --data-urlencode 'image=BASE64_IMAGE_DATA'
```

### 在代码中使用

```typescript
import { recognizeText, getOCRProvider } from "../services/ocr-service";

// 获取当前配置的OCR提供商
const provider = getOCRProvider(); // 'baidu' or 'deepseek'

// 调用OCR识别
const ocrText = await recognizeText(imageBase64);
```

## 技术实现

### 1. Access Token缓存

百度OCR的access_token有效期为30天，系统会自动缓存token：

```typescript
// 内存缓存（开发环境）
let cachedToken: string | null = null;
let tokenExpireTime: number = 0;

// 生产环境建议使用Redis等持久化缓存
```

### 2. 自动降级机制

```typescript
export async function recognizeText(imageBase64: string): Promise<string> {
  const provider = getOCRProvider();
  
  try {
    if (provider === "baidu") {
      return await recognizeWithBaiduOCR(imageBase64);
    } else {
      return await recognizeWithDeepSeekOCR(imageBase64);
    }
  } catch (error) {
    // 主OCR失败，尝试备用OCR
    if (provider === "baidu") {
      console.log("尝试使用 DeepSeek OCR 作为备用");
      return await recognizeWithDeepSeekOCR(imageBase64);
    } else {
      console.log("尝试使用百度OCR作为备用");
      return await recognizeWithBaiduOCR(imageBase64);
    }
  }
}
```

### 3. 图片格式处理

- **百度OCR**：需要纯base64字符串（自动移除`data:image`前缀）
- **DeepSeek OCR**：需要完整的data URL

系统会自动处理格式转换。

## API响应

OCR API现在会返回使用的提供商信息：

```json
{
  "success": true,
  "ocrText": "识别的文本内容...",
  "lotteryType": "dlt",
  "provider": "baidu"
}
```

## 工作流程

```
用户上传彩票图片
    ↓
前端转换为Base64
    ↓
调用 /api/lottery/ocr-text
    ↓
OCR服务选择提供商（默认：百度）
    ↓
调用百度OCR API
    ↓
[如果失败] 自动切换到DeepSeek OCR
    ↓
返回识别的文本
    ↓
调用 /api/lottery/parse-ai
    ↓
AI解析彩票信息
    ↓
返回结构化数据
```

## 优势对比

| 特性 | 百度OCR | DeepSeek OCR |
|------|---------|--------------|
| 稳定性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 中文识别 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 速度 | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| 免费额度 | 每天1000次 | 根据API Key |
| 文档支持 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

## 注意事项

1. **API限制**
   - 百度OCR免费版：每天1000次调用
   - 超出限制需要付费或等待次日重置

2. **Token缓存**
   - 开发环境：使用内存缓存
   - 生产环境：建议使用Redis等持久化缓存

3. **图片要求**
   - 支持格式：JPG、PNG、BMP等
   - 图片大小：建议不超过4MB
   - Base64编码后不超过10MB

4. **错误处理**
   - 所有错误都会被捕获并记录
   - 自动尝试备用OCR
   - 返回清晰的错误信息

## 测试

### 测试OCR识别

```bash
# 测试百度OCR
curl -X POST http://localhost:3000/api/lottery/ocr-text \
  -H "Content-Type: application/json" \
  -d '{"image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."}'
```

### 查看使用的OCR提供商

响应中的 `provider` 字段会显示实际使用的OCR提供商：

```json
{
  "success": true,
  "ocrText": "...",
  "provider": "baidu"  // 或 "deepseek"
}
```

## 故障排查

### 问题1：百度OCR返回错误

**可能原因：**
- API Key或Secret Key配置错误
- 超出每日调用限制
- 网络连接问题

**解决方法：**
1. 检查环境变量配置
2. 查看百度云控制台的调用统计
3. 系统会自动切换到DeepSeek OCR

### 问题2：两个OCR都失败

**可能原因：**
- 图片格式不支持
- 图片过大
- 网络问题

**解决方法：**
1. 检查图片格式和大小
2. 查看服务器日志
3. 确认网络连接正常

## 未来改进

- [ ] 支持更多OCR提供商（腾讯云、阿里云等）
- [ ] 实现Redis缓存access_token
- [ ] 添加OCR性能监控
- [ ] 支持批量OCR识别
- [ ] 添加OCR结果缓存

## 相关文档

- [百度OCR API文档](https://ai.baidu.com/ai-doc/OCR/zk3h7xz52)
- [DeepSeek OCR文档](https://platform.deepseek.com/docs)
- [服务实现说明](../app/api/lottery/services/README.md)

