# Figma Variables 命名规范指南

本文档详细说明如何在 Figma 中命名 Variables，以便正确导出到 Tailwind CSS。

## 核心原则

1. **使用斜杠 `/` 分隔层级**：例如 `primary/500` 会转换为 `primary.500`
2. **使用小写字母和连字符**：脚本会自动转换为小写，空格会转换为连字符
3. **遵循 Tailwind CSS 的命名约定**：与 Tailwind 的 token 结构保持一致

## 颜色变量 (COLOR)

### 推荐命名格式

使用 `category/shade` 格式，其中：
- `category`: 颜色类别（如 primary, success, error 等）
- `shade`: 色阶（如 50, 100, 500, 600 等）

### 示例

| Figma Variable 名称 | 转换后的 Tailwind Token | 使用方式 |
|-------------------|----------------------|---------|
| `primary/500` | `colors.primary.500` | `bg-primary-500` |
| `primary/600` | `colors.primary.600` | `bg-primary-600` |
| `success/500` | `colors.success.500` | `bg-success-500` |
| `error/500` | `colors.error.500` | `bg-error-500` |
| `warning/500` | `colors.warning.500` | `bg-warning-500` |
| `info/500` | `colors.info.500` | `bg-info-500` |
| `neutral/50` | `colors.neutral.50` | `bg-neutral-50` |
| `neutral/900` | `colors.neutral.900` | `bg-neutral-900` |

### 完整颜色系统示例

```
primary/50
primary/100
primary/200
primary/300
primary/400
primary/500    ← 主色
primary/600
primary/700
primary/800
primary/900

success/500
success/600
success/700

error/500
error/600
error/700

warning/500
warning/600
warning/700

neutral/50
neutral/100
neutral/200
...
neutral/900
neutral/950
```

### 状态颜色（单值）

如果不需要色阶，可以直接使用单一名称：

| Figma Variable 名称 | 转换后的 Tailwind Token | 使用方式 |
|-------------------|----------------------|---------|
| `status-active` | `colors.status-active` | `bg-status-active` |
| `status-error` | `colors.status-error` | `bg-status-error` |

或者使用层级结构：

```
status/active
status/inactive
status/creating
status/error
status/warning
```

## 间距变量 (FLOAT)

### 推荐命名格式

使用包含 `spacing` 或 `space` 关键词的命名：

| Figma Variable 名称 | 转换后的 Tailwind Token | 使用方式 |
|-------------------|----------------------|---------|
| `spacing/4` | `spacing.spacing-4` | `p-4`, `m-4` |
| `spacing/8` | `spacing.spacing-8` | `p-8`, `m-8` |
| `spacing/16` | `spacing.spacing-16` | `p-16`, `m-16` |
| `space/4` | `spacing.space-4` | `p-4`, `m-4` |

### 示例

```
spacing/0
spacing/1
spacing/2
spacing/4
spacing/8
spacing/12
spacing/16
spacing/24
spacing/32
```

**注意**: 间距值会以像素（px）为单位导出。如果需要 rem 单位，需要在 Tailwind 配置中手动转换。

## 字体大小变量 (FLOAT)

### 推荐命名格式

使用包含 `font` 或 `text` 关键词的命名：

| Figma Variable 名称 | 转换后的 Tailwind Token | 使用方式 |
|-------------------|----------------------|---------|
| `font-size/sm` | `fontSize.font-size-sm` | `text-sm` |
| `font-size/base` | `fontSize.font-size-base` | `text-base` |
| `font-size/lg` | `fontSize.font-size-lg` | `text-lg` |
| `text/sm` | `fontSize.text-sm` | `text-sm` |

### 示例

```
font-size/xs
font-size/sm
font-size/base
font-size/lg
font-size/xl
font-size/2xl
font-size/3xl
font-size/4xl
```

## 圆角变量 (FLOAT)

### 推荐命名格式

使用包含 `radius` 或 `border` 关键词的命名：

| Figma Variable 名称 | 转换后的 Tailwind Token | 使用方式 |
|-------------------|----------------------|---------|
| `radius/sm` | `borderRadius.radius-sm` | `rounded-sm` |
| `radius/md` | `borderRadius.radius-md` | `rounded-md` |
| `radius/lg` | `borderRadius.radius-lg` | `rounded-lg` |
| `border-radius/sm` | `borderRadius.border-radius-sm` | `rounded-sm` |

### 示例

```
radius/none
radius/sm
radius/md
radius/lg
radius/xl
radius/2xl
radius/3xl
radius/full
```

## 阴影变量 (COLOR 或复合值)

**注意**: 当前脚本主要处理颜色和数值变量。阴影通常需要手动配置或使用 Tailwind 的默认值。

如果需要自定义阴影，建议直接在 `tailwind.config.js` 中配置。

## 命名规则总结

### ✅ 推荐做法

1. **使用层级命名**：`category/value` 格式
   ```
   primary/500
   spacing/16
   font-size/base
   ```

2. **使用小写字母**：脚本会自动转换
   ```
   Primary/500  → primary/500 ✅
   PRIMARY/500  → primary/500 ✅
   ```

3. **使用连字符代替空格**：脚本会自动转换
   ```
   primary color/500  → primary-color/500 ✅
   ```

4. **保持命名一致性**：
   ```
   primary/50, primary/100, primary/500  ✅
   primary-50, primary-100, primary-500  ❌ (不使用连字符分隔层级)
   ```

### ❌ 避免的做法

1. **不要使用特殊字符**：
   ```
   primary@500     ❌
   primary#500      ❌
   primary.500      ❌ (会作为单层名称)
   ```

2. **不要使用中文**：
   ```
   主色/500        ❌ (可能编码问题)
   ```

3. **不要使用驼峰命名**：
   ```
   primaryColor/500  → primarycolor/500 ✅ (会转换但不够清晰)
   primary/500       ✅ (更清晰)
   ```

## 实际示例

### 完整的 Design System Variables

```
# 颜色系统
primary/50
primary/100
primary/200
primary/300
primary/400
primary/500
primary/600
primary/700
primary/800
primary/900

success/500
success/600
success/700

error/500
error/600
error/700

warning/500
warning/600
warning/700

neutral/50
neutral/100
neutral/200
neutral/300
neutral/400
neutral/500
neutral/600
neutral/700
neutral/800
neutral/900
neutral/950

# 间距系统
spacing/0
spacing/1
spacing/2
spacing/4
spacing/8
spacing/12
spacing/16
spacing/24
spacing/32
spacing/48
spacing/64

# 字体大小
font-size/xs
font-size/sm
font-size/base
font-size/lg
font-size/xl
font-size/2xl
font-size/3xl
font-size/4xl

# 圆角
radius/none
radius/sm
radius/md
radius/lg
radius/xl
radius/2xl
radius/full
```

## 转换逻辑说明

脚本的转换逻辑：

1. **名称处理**：
   ```javascript
   name.toLowerCase().replace(/\s+/g, '-')
   // "Primary Color/500" → "primary-color/500"
   ```

2. **层级解析**：
   ```javascript
   name.split('/')
   // "primary/500" → ["primary", "500"]
   ```

3. **颜色变量**：
   - 如果有 `/` 分隔：`primary/500` → `colors.primary.500`
   - 如果没有 `/`：`status-active` → `colors.status-active`

4. **数值变量**：
   - 包含 `spacing` 或 `space` → `spacing` 对象
   - 包含 `font` 或 `text` → `fontSize` 对象
   - 包含 `radius` 或 `border` → `borderRadius` 对象

## 验证命名

运行同步脚本后，检查生成的 `tailwind.config.tokens.json` 文件，确认变量是否正确转换：

```bash
npm run sync:tokens
cat tailwind.config.tokens.json
```

## 常见问题

### Q: 为什么我的变量没有出现在 tokens 中？

A: 检查以下几点：
1. 变量类型是否正确（COLOR 或 FLOAT）
2. 变量名称是否符合命名规范
3. 变量是否设置为 Local Variables（不是 Component Variables）

### Q: 如何自定义映射规则？

A: 编辑 `scripts/token-mapping.json` 文件，添加自定义映射规则。

### Q: 可以使用中文命名吗？

A: 不推荐。虽然脚本会处理，但可能导致编码问题和可读性问题。

### Q: 如何支持多主题（Light/Dark）？

A: 当前脚本使用第一个模式的值。如需支持多主题，需要修改脚本逻辑或分别同步不同模式。

## 参考资源

- [Figma Variables 文档](https://help.figma.com/hc/en-us/articles/15339657135383)
- [Tailwind CSS 配置文档](https://tailwindcss.com/docs/configuration)
- [项目 Design Tokens 文档](./DESIGN_TOKENS.md)
- [Figma Tokens 同步文档](./FIGMA_TOKENS_SYNC.md)

