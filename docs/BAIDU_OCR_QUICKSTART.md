# 百度OCR快速开始指南

## 5分钟快速配置

### 第1步：获取百度OCR密钥（2分钟）

1. 访问 https://cloud.baidu.com/
2. 注册/登录账号
3. 进入控制台 → 产品服务 → 人工智能 → 文字识别
4. 点击"创建应用"
5. 填写应用名称（如：SimpleTool）
6. 记录下 **API Key** 和 **Secret Key**

### 第2步：配置环境变量（1分钟）

编辑 `.env.local` 文件，添加以下内容：

```env
# 使用百度OCR（默认）
OCR_PROVIDER=baidu

# 百度OCR配置
BAIDU_OCR_API_KEY=你的API_Key
BAIDU_OCR_SECRET_KEY=你的Secret_Key
```

### 第3步：重启应用（1分钟）

```bash
# 停止当前运行的应用（Ctrl+C）
# 重新启动
pnpm dev
```

### 第4步：测试（1分钟）

1. 访问 http://localhost:3000/tools/lottery
2. 上传一张彩票图片
3. 查看识别结果

## 验证配置

### 方法1：查看日志

上传图片后，在终端查看日志：

```
使用 BAIDU OCR 进行识别
百度OCR识别成功，共识别15行文字
```

### 方法2：查看API响应

API响应中会包含 `provider` 字段：

```json
{
  "success": true,
  "ocrText": "...",
  "provider": "baidu"
}
```

## 常见问题

### Q1: 提示"百度OCR API密钥未配置"

**解决方法：**
- 检查 `.env.local` 文件是否存在
- 确认环境变量名称正确：`BAIDU_OCR_API_KEY` 和 `BAIDU_OCR_SECRET_KEY`
- 重启应用

### Q2: 提示"获取百度OCR token失败"

**解决方法：**
- 检查API Key和Secret Key是否正确
- 确认网络连接正常
- 检查百度云账号是否欠费

### Q3: 识别结果不准确

**解决方法：**
- 确保图片清晰
- 避免反光和阴影
- 正面拍摄，避免倾斜

### Q4: 超出每日调用限制

**解决方法：**
- 百度OCR免费版每天1000次
- 系统会自动切换到DeepSeek OCR作为备用
- 或者升级到付费版

## 切换到DeepSeek OCR

如果想使用DeepSeek OCR，修改 `.env.local`：

```env
# 使用DeepSeek OCR
OCR_PROVIDER=deepseek

# DeepSeek OCR配置
OCR_API_KEY=your-deepseek-api-key
OCR_BASE_URL=https://api.siliconflow.cn/v1
```

## 自动降级

系统会自动在主OCR失败时切换到备用OCR：

- 配置百度OCR → 失败时自动使用DeepSeek OCR
- 配置DeepSeek OCR → 失败时自动使用百度OCR

## 下一步

- 查看 [完整集成文档](./BAIDU_OCR_INTEGRATION.md)
- 查看 [服务实现说明](../app/api/lottery/services/README.md)
- 查看 [彩票工具使用指南](./LOTTERY_TOOL_GUIDE.md)

## 技术支持

如有问题，请查看：
- [百度OCR官方文档](https://ai.baidu.com/ai-doc/OCR/zk3h7xz52)
- [项目Issues](https://github.com/your-repo/issues)

