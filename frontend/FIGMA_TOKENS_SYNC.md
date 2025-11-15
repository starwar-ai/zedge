# Figma Variables/Tokens 同步指南

## 概述

本文档说明如何从 Figma 同步 Variables 和 Design Tokens 到项目的 Tailwind CSS 配置。

## 前置准备

### 1. 获取 Figma API Token

1. 登录 Figma
2. 进入 **Settings** → **Account** → **Personal Access Tokens**
3. 点击 **Create new token**
4. 输入 Token 名称（例如：`zedge-variables-sync`）
5. **重要：选择权限范围（Scopes）**
   - ✅ **必须勾选**: `file_variables:read` - 读取文件变量（必需）
   - ✅ **推荐勾选**: `file_content:read` - 读取文件内容
   - ✅ **推荐勾选**: `file_metadata:read` - 读取文件元数据
6. 复制生成的 Token（**只显示一次，请妥善保存**）

⚠️ **注意**: 如果 Token 缺少 `file_variables:read` 权限，同步会失败并提示 403 错误。

### 2. 获取 Figma File Key

从 Figma 文件 URL 中提取：

```
https://www.figma.com/file/FILE_KEY/FileName
                          ^^^^^^^^
                          这就是 File Key
```

例如：
- URL: `https://www.figma.com/file/s3szBzWOPmpdq0EZg9PwKj/DeskPro`
- File Key: `s3szBzWOPmpdq0EZg9PwKj`

### 3. 设置环境变量

#### 方式一：使用交互式设置脚本（最简单）⭐

运行交互式设置脚本，按提示输入信息：

```bash
npm run setup:env
```

脚本会引导你输入 Figma File Key 和 Access Token，并自动创建 `.env.local` 文件。

#### 方式二：手动创建 `.env.local` 文件

1. 复制示例文件：
   ```bash
   cp .env.local.example .env.local
   ```

2. 编辑 `.env.local`，填入你的实际值：
   ```bash
   FIGMA_FILE_KEY=your-file-key-here
   FIGMA_ACCESS_TOKEN=your-token-here
   ```

**⚠️ 重要**: `.env.local` 已在 `.gitignore` 中，不会提交到 Git！

#### 方式三：直接在命令行设置

```bash
FIGMA_FILE_KEY=xxx FIGMA_ACCESS_TOKEN=yyy npm run sync:tokens
```

#### 方式四：使用 dotenv（如果安装了 dotenv-cli）

```bash
npm install -D dotenv-cli
```

然后在 `package.json` 中：

```json
{
  "scripts": {
    "sync:tokens": "dotenv -e .env.local -- node scripts/sync-figma-tokens.js"
  }
}
```

## 使用方法

### 1. 首次设置（如果还没有配置环境变量）

运行交互式设置脚本：

```bash
npm run setup:env
```

### 2. 同步 Tokens

```bash
npm run sync:tokens
```

### 查看帮助

```bash
node scripts/sync-figma-tokens.js
```

## Figma Variables 命名规范

为了正确映射到 Tailwind，请在 Figma 中使用以下命名规范：

### 快速参考

**颜色变量**: 使用 `category/shade` 格式
```
primary/500    → colors.primary.500
success/500    → colors.success.500
neutral/50     → colors.neutral.50
```

**间距变量**: 名称包含 `spacing` 或 `space`
```
spacing/4      → spacing.spacing-4
spacing/16     → spacing.spacing-16
```

**字体大小**: 名称包含 `font` 或 `text`
```
font-size/sm   → fontSize.font-size-sm
font-size/base → fontSize.font-size-base
```

**圆角**: 名称包含 `radius` 或 `border`
```
radius/sm      → borderRadius.radius-sm
radius/lg      → borderRadius.radius-lg
```

### 详细命名规范

📖 **完整命名规范文档**: 查看 [FIGMA_VARIABLES_NAMING.md](./FIGMA_VARIABLES_NAMING.md)

该文档包含：
- 详细的命名规则和示例
- 转换逻辑说明
- 最佳实践和常见问题
- 完整的 Design System Variables 示例

## 输出文件

同步后的 tokens 会生成到：
- `tailwind.config.tokens.js` - 自动生成的 tokens 配置

### 在 tailwind.config.js 中使用

更新 `tailwind.config.js`，引入生成的 tokens：

```javascript
/** @type {import('tailwindcss').Config} */

// 尝试导入自动生成的 tokens（如果存在）
let figmaTokens = {};
try {
  const tokens = await import('./tailwind.config.tokens.js');
  figmaTokens = tokens.default?.extend || {};
} catch (e) {
  // 如果文件不存在，使用默认配置
  console.log('未找到 Figma tokens，使用默认配置');
}

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 合并 Figma tokens（优先级更高）
      ...figmaTokens,
      
      // 原有的配置（作为后备）
      colors: {
        primary: {
          // ... 现有配置
        },
      },
    },
  },
  plugins: [],
}
```

**注意**: 由于 Tailwind 配置是同步的，上面的 `await import` 可能不工作。更好的方式是：

```javascript
/** @type {import('tailwindcss').Config} */
import figmaTokens from './tailwind.config.tokens.js';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 合并 Figma tokens（如果文件存在）
      ...(figmaTokens?.default?.extend || {}),
      
      // 原有的配置
      colors: {
        primary: {
          50: '#f0f9ff',
          // ... 其他配置
        },
      },
    },
  },
  plugins: [],
}
```

## 工作流程

### 1. 在 Figma 中创建/更新 Variables

1. 打开 Figma 文件
2. 在右侧面板找到 **Variables** 或 **Local Variables**
3. 创建或更新变量
4. 使用推荐的命名规范

### 2. 同步到项目

```bash
npm run sync:tokens
```

### 3. 检查生成的配置

查看 `tailwind.config.tokens.js`，确认 tokens 正确映射。

### 4. 在代码中使用

```tsx
// 使用同步的 tokens
<div className="bg-primary-500 text-white">
  Button
</div>
```

## 故障排除

### 1. API 权限错误

**错误**: `Figma API 错误: 403 Forbidden` 或 `Invalid scope(s)`

**可能原因**:
- Token 缺少必需的权限范围 `file_variables:read`（最常见）
- Token 已过期或无效
- File Key 不正确

**解决方案**:
1. **检查权限范围**（最常见）:
   - 前往 Figma → Settings → Account → Personal Access Tokens
   - 创建新的 Token，确保勾选 `file_variables:read` 权限
   - 更新 `.env.local` 中的 `FIGMA_ACCESS_TOKEN`
   - 重新运行 `npm run sync:tokens`

2. **验证 Token 有效性**:
   - 确认 Token 未过期
   - 确认 Token 有访问该文件的权限

3. **验证 File Key**:
   - 从 Figma 文件 URL 中正确提取 File Key
   - 确认文件存在且可访问

### 2. 变量未找到

**错误**: `成功获取 Figma Variables` 但 tokens 为空

**解决方案**:
- 确认 Figma 文件中已创建 Variables
- 检查 Variables 是否设置为 **Local Variables**（不是 Component Variables）
- 确认变量类型正确（COLOR, FLOAT 等）

### 3. 颜色格式错误

**错误**: 颜色值不正确

**解决方案**:
- 确保 Figma Variables 类型为 **COLOR**
- 检查颜色值是否为有效的 RGBA 格式

### 4. 环境变量未设置

**错误**: `请设置环境变量: FIGMA_FILE_KEY 和 FIGMA_ACCESS_TOKEN`

**解决方案**:
- 创建 `.env.local` 文件
- 或在命令行中设置环境变量
- 确认环境变量名称正确

### 5. 网络错误

**错误**: `fetch failed` 或网络超时

**解决方案**:
- 检查网络连接
- 确认可以访问 `api.figma.com`
- 如果使用代理，配置代理设置

## 最佳实践

### 1. 定期同步

- 在 Figma 更新 Variables 后及时同步
- 建议在每次设计系统更新后运行同步脚本

### 2. 版本控制

- ✅ 将生成的 `tailwind.config.tokens.js` 纳入版本控制
- ❌ **不要**将 `.env.local` 提交到 Git
- ✅ 在 `.gitignore` 中添加 `.env.local`

### 3. 命名一致性

- 保持 Figma 和代码中的命名一致
- 使用统一的命名规范（如 `primary/500`）
- 避免使用特殊字符和空格

### 4. 审查变更

- 同步后检查生成的配置是否正确
- 对比 Figma 中的值和生成的 tokens
- 如有问题，调整命名或映射规则

### 5. 团队协作

- 在团队中共享 Figma Variables 命名规范
- 建立同步流程和检查清单
- 文档化自定义映射规则

## 高级用法

### 自定义映射规则

编辑 `scripts/token-mapping.json` 来自定义映射规则：

```json
{
  "colorMapping": {
    "brand/primary": "primary.500",
    "brand/secondary": "secondary.500"
  }
}
```

### 批量同步多个文件

可以修改脚本支持多个 Figma 文件：

```javascript
const FIGMA_FILES = [
  { key: 'file-key-1', name: 'design-system' },
  { key: 'file-key-2', name: 'components' },
];
```

### CI/CD 集成

在 CI/CD 流程中自动同步：

```yaml
# .github/workflows/sync-tokens.yml
name: Sync Figma Tokens
on:
  schedule:
    - cron: '0 0 * * *'  # 每天同步
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm run sync:tokens
        env:
          FIGMA_FILE_KEY: ${{ secrets.FIGMA_FILE_KEY }}
          FIGMA_ACCESS_TOKEN: ${{ secrets.FIGMA_ACCESS_TOKEN }}
```

## 相关文档

- **[Figma Variables 命名规范](./FIGMA_VARIABLES_NAMING.md)** ⭐ - 详细的命名规则和示例
- [Figma Variables 文档](https://help.figma.com/hc/en-us/articles/15339657135383)
- [Figma API 文档](https://www.figma.com/developers/api)
- [Tailwind CSS 配置文档](https://tailwindcss.com/docs/configuration)
- [项目 Design Tokens 文档](./DESIGN_TOKENS.md)
- [Figma 实现文档](./FIGMA_IMPLEMENTATION.md)

## 支持

如有问题，请：
1. 查看本文档的故障排除部分
2. 检查 Figma API 文档
3. 联系团队或提交 Issue

