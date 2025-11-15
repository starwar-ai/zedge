# Scripts 目录

此目录包含项目相关的自动化脚本。

## sync-figma-tokens.js

从 Figma API 同步 Variables/Tokens 到 Tailwind CSS 配置。

### 使用方法

```bash
# 设置环境变量后运行
npm run sync:tokens
```

### 环境变量

- `FIGMA_FILE_KEY`: Figma 文件 Key（从 URL 中提取）
- `FIGMA_ACCESS_TOKEN`: Figma Personal Access Token

### 输出文件

- `tailwind.config.tokens.js`: ES module 格式的 tokens 配置
- `tailwind.config.tokens.json`: JSON 格式的 tokens 配置（用于同步读取）

详细文档请参考: [../FIGMA_TOKENS_SYNC.md](../FIGMA_TOKENS_SYNC.md)

