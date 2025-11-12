# OCR服务说明

本目录包含彩票OCR识别的服务实现，支持多个OCR提供商。

## 支持的OCR提供商

### 1. 百度OCR（推荐，默认）

**优点：**
- 稳定性高
- 识别准确率高
- 专门针对中文优化
- 每天有免费额度

**配置方法：**

1. 访问 [百度智能云](https://cloud.baidu.com/)
2. 开通"文字识别"服务
3. 创建应用，获取 API Key 和 Secret Key
4. 在 `.env.local` 中配置：

```env
# 使用百度OCR（默认）
OCR_PROVIDER=baidu

# 百度OCR配置
BAIDU_OCR_API_KEY=your-baidu-api-key-here
BAIDU_OCR_SECRET_KEY=your-baidu-secret-key-here
```

**API文档：**
- [百度OCR文档](https://ai.baidu.com/ai-doc/OCR/zk3h7xz52)

### 2. DeepSeek OCR（备用）

**优点：**
- 支持多种文档格式
- 可以转换为Markdown格式

**配置方法：**

在 `.env.local` 中配置：

```env
# 使用DeepSeek OCR
OCR_PROVIDER=deepseek

# DeepSeek OCR配置
OCR_API_KEY=your-deepseek-api-key-here
OCR_BASE_URL=https://api.siliconflow.cn/v1
```

## 自动降级机制

系统会自动在主OCR失败时尝试使用备用OCR：

- 如果配置为百度OCR，失败时会尝试DeepSeek OCR
- 如果配置为DeepSeek OCR，失败时会尝试百度OCR

## 使用示例

### 在API路由中使用

```typescript
import { recognizeText, getOCRProvider } from "../services/ocr-service";

export async function POST(request: NextRequest) {
  const { image } = await request.json();
  
  // 获取当前配置的OCR提供商
  const provider = getOCRProvider();
  console.log(`使用 ${provider} OCR`);
  
  // 调用OCR识别
  const ocrText = await recognizeText(image);
  
  return NextResponse.json({
    success: true,
    ocrText,
    provider,
  });
}
```

## 文件说明

- `ocr-service.ts` - OCR服务统一入口，负责选择和调用不同的OCR提供商
- `baidu-ocr.ts` - 百度OCR实现
- `deepseek-ocr.ts` - DeepSeek OCR实现

## 注意事项

1. **Access Token缓存**：百度OCR的access_token会在内存中缓存30天，生产环境建议使用Redis等持久化缓存
2. **图片格式**：
   - 百度OCR：需要纯base64字符串（不包含`data:image`前缀）
   - DeepSeek OCR：需要完整的data URL（包含`data:image`前缀）
3. **错误处理**：两个OCR服务都有完整的错误处理和日志记录
4. **API限制**：
   - 百度OCR：免费版每天有调用次数限制
   - DeepSeek OCR：根据API Key的配额限制

## 环境变量完整配置示例

```env
# OCR Provider: 'baidu' or 'deepseek' (default: baidu)
OCR_PROVIDER=baidu

# Baidu OCR Configuration
BAIDU_OCR_API_KEY=WmRxLL****Yx5hOG
BAIDU_OCR_SECRET_KEY=jfMK2c****Q5cd8d

# DeepSeek OCR Configuration (fallback)
OCR_API_KEY=sk-ojeleuybhlruuuhvbuteobvzlcbttegdwtijjqnixdduqoij
OCR_BASE_URL=https://api.siliconflow.cn/v1
```

## 测试

可以通过以下API端点测试OCR功能：

```bash
# 测试OCR文字识别
curl -X POST http://localhost:3000/api/lottery/ocr-text \
  -H "Content-Type: application/json" \
  -d '{"image": "data:image/jpeg;base64,..."}'

# 测试完整OCR+解析
curl -X POST http://localhost:3000/api/lottery/ocr \
  -H "Content-Type: application/json" \
  -d '{"imageBase64": "data:image/jpeg;base64,..."}'
```

响应会包含 `provider` 字段，显示使用的OCR提供商。

