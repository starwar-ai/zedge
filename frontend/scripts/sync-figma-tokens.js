/**
 * Figma Variables/Tokens 同步脚本
 * 从 Figma API 获取 Variables 并转换为 Tailwind CSS 配置
 * 
 * 使用方法:
 * 1. 设置环境变量: FIGMA_FILE_KEY 和 FIGMA_ACCESS_TOKEN
 * 2. 运行: node scripts/sync-figma-tokens.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置路径
const ENV_LOCAL_PATH = path.join(__dirname, '../.env.local');
const ENV_EXAMPLE_PATH = path.join(__dirname, '../.env.local.example');
const OUTPUT_FILE_JS = path.join(__dirname, '../tailwind.config.tokens.js');
const OUTPUT_FILE_JSON = path.join(__dirname, '../tailwind.config.tokens.json');

/**
 * 加载 .env.local 文件（如果存在）
 */
function loadEnvLocal() {
  if (fs.existsSync(ENV_LOCAL_PATH)) {
    const envContent = fs.readFileSync(ENV_LOCAL_PATH, 'utf-8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const trimmed = line.trim();
      // 跳过注释和空行
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          // 移除引号（如果存在）
          const cleanValue = value.replace(/^["']|["']$/g, '');
          process.env[key.trim()] = cleanValue;
        }
      }
    });
  }
}

// 加载 .env.local
loadEnvLocal();

// 配置
const FIGMA_FILE_KEY = process.env.FIGMA_FILE_KEY || '';
const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN || '';

/**
 * 检查并提示环境变量设置
 */
function checkEnvironmentVariables() {
  const missing = [];
  if (!FIGMA_FILE_KEY) missing.push('FIGMA_FILE_KEY');
  if (!FIGMA_ACCESS_TOKEN) missing.push('FIGMA_ACCESS_TOKEN');

  if (missing.length > 0) {
    console.error('\n❌ 缺少必需的环境变量:');
    missing.forEach(key => console.error(`   - ${key}`));
    
    console.error('\n📝 设置方法:');
    console.error('\n方法 1: 使用交互式设置脚本（最简单）⭐');
    console.error('   npm run setup:env');
    console.error('   脚本会引导你输入信息并自动创建 .env.local 文件');
    
    console.error('\n方法 2: 手动创建 .env.local 文件');
    console.error(`   1. 复制示例文件: cp .env.local.example .env.local`);
    console.error('   2. 编辑 .env.local，填入你的 Figma File Key 和 Access Token');
    console.error('   3. 重新运行: npm run sync:tokens');
    console.error('   （脚本会自动加载 .env.local 文件）');
    
    console.error('\n方法 3: 直接在命令行设置');
    console.error('   FIGMA_FILE_KEY=xxx FIGMA_ACCESS_TOKEN=yyy npm run sync:tokens');
    
    console.error('\n📖 获取 Figma Token 和 File Key:');
    console.error('   - File Key: 从 Figma 文件 URL 中提取（例如: s3szBzWOPmpdq0EZg9PwKj）');
    console.error('   - Access Token: Settings → Account → Personal Access Tokens → Create new token');
    console.error('\n   详细文档: 查看 FIGMA_TOKENS_SYNC.md');
    
    // 检查是否存在示例文件
    if (fs.existsSync(ENV_EXAMPLE_PATH)) {
      console.error(`\n💡 提示: 已找到示例文件 ${ENV_EXAMPLE_PATH}`);
      console.error('   可以复制它作为起点: cp .env.local.example .env.local');
    }
    
    return false;
  }
  
  return true;
}

/**
 * 从 Figma API 获取 Variables
 */
async function fetchFigmaVariables() {
  if (!FIGMA_FILE_KEY || !FIGMA_ACCESS_TOKEN) {
    throw new Error('请设置环境变量: FIGMA_FILE_KEY 和 FIGMA_ACCESS_TOKEN');
  }

  const response = await fetch(
    `https://api.figma.com/v1/files/${FIGMA_FILE_KEY}/variables/local`,
    {
      headers: {
        'X-Figma-Token': FIGMA_ACCESS_TOKEN,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Figma API 错误: ${response.status} ${response.statusText}\n${errorText}`);
  }

  return await response.json();
}

/**
 * RGBA 转 HEX
 */
function rgbaToHex(r, g, b, a = 1) {
  const toHex = (n) => {
    const hex = Math.round(n * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  if (a < 1) {
    return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
  }
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * 将 Figma Variables 转换为 Tailwind 配置格式
 */
function convertToTailwindConfig(figmaData) {
  const colors = {};
  const spacing = {};
  const fontSize = {};
  const borderRadius = {};
  const boxShadow = {};

  // 处理颜色变量
  if (figmaData.meta?.variables) {
    Object.values(figmaData.meta.variables).forEach((variable) => {
      if (variable.type === 'COLOR') {
        const name = variable.name.toLowerCase().replace(/\s+/g, '-');
        const values = variable.valuesByMode || {};
        
        // 提取第一个模式的值（通常是 light mode）
        const firstValue = Object.values(values)[0];
        if (firstValue && typeof firstValue === 'object') {
          const rgba = firstValue.rgba || firstValue;
          const hex = rgbaToHex(rgba.r, rgba.g, rgba.b, rgba.a);
          
          // 解析颜色名称层级 (例如: primary/500)
          const parts = name.split('/');
          if (parts.length === 2) {
            const [category, shade] = parts;
            if (!colors[category]) colors[category] = {};
            colors[category][shade] = hex;
          } else {
            colors[name] = hex;
          }
        }
      } else if (variable.type === 'FLOAT') {
        const name = variable.name.toLowerCase().replace(/\s+/g, '-');
        const value = Object.values(variable.valuesByMode || {})[0];
        
        if (name.includes('spacing') || name.includes('space')) {
          spacing[name] = `${value}px`;
        } else if (name.includes('radius') || name.includes('border')) {
          borderRadius[name] = `${value}px`;
        } else if (name.includes('font') || name.includes('text')) {
          fontSize[name] = [`${value}px`, { lineHeight: '1.5' }];
        }
      }
    });
  }

  return {
    colors,
    spacing,
    fontSize,
    borderRadius,
    boxShadow,
  };
}

/**
 * 生成 Tailwind 配置文件
 */
function generateTailwindConfig(tokens) {
  return `/**
 * 自动生成的 Tailwind Tokens 配置
 * 来源: Figma Variables
 * 生成时间: ${new Date().toISOString()}
 * 
 * ⚠️ 注意: 此文件由脚本自动生成，请勿手动编辑
 * 如需修改，请在 Figma 中更新 Variables，然后重新运行同步脚本
 */

export const figmaTokens = ${JSON.stringify(tokens, null, 2)};

// 合并到主配置
export default {
  extend: {
    colors: figmaTokens.colors,
    spacing: figmaTokens.spacing,
    fontSize: figmaTokens.fontSize,
    borderRadius: figmaTokens.borderRadius,
    boxShadow: figmaTokens.boxShadow,
  },
};
`;
}

/**
 * 更新 tailwind.config.js
 */
function updateTailwindConfig(tokens) {
  // 生成 JS 文件（用于 ES module 导入）
  const configContent = generateTailwindConfig(tokens);
  fs.writeFileSync(OUTPUT_FILE_JS, configContent, 'utf-8');
  console.log(`✅ Tokens JS 已同步到: ${OUTPUT_FILE_JS}`);
  
  // 生成 JSON 文件（用于同步读取）
  fs.writeFileSync(OUTPUT_FILE_JSON, JSON.stringify(tokens, null, 2), 'utf-8');
  console.log(`✅ Tokens JSON 已同步到: ${OUTPUT_FILE_JSON}`);
}

/**
 * 主函数
 */
async function main() {
  try {
    console.log('🔄 开始同步 Figma Variables...\n');
    
    // 检查环境变量
    if (!checkEnvironmentVariables()) {
      process.exit(1);
    }
    
    console.log(`✅ 环境变量检查通过`);
    console.log(`📁 File Key: ${FIGMA_FILE_KEY.length > 10 ? FIGMA_FILE_KEY.substring(0, 10) + '...' : FIGMA_FILE_KEY}`);
    console.log(`🔑 Token: ${FIGMA_ACCESS_TOKEN.length > 10 ? FIGMA_ACCESS_TOKEN.substring(0, 10) + '...' : '已设置'}\n`);
    
    const figmaData = await fetchFigmaVariables();
    console.log('✅ 成功获取 Figma Variables');
    
    const tokens = convertToTailwindConfig(figmaData);
    console.log('✅ 成功转换 Tokens');
    console.log(`   - 颜色: ${Object.keys(tokens.colors).length} 个`);
    console.log(`   - 间距: ${Object.keys(tokens.spacing).length} 个`);
    console.log(`   - 字体: ${Object.keys(tokens.fontSize).length} 个`);
    
    updateTailwindConfig(tokens);
    console.log('✅ 同步完成！');
    console.log(`\n📝 下一步: 在 tailwind.config.js 中引入生成的 tokens`);
    
  } catch (error) {
    console.error('\n❌ 同步失败:', error.message);
    
    // 根据错误类型提供更具体的提示
    if (error.message.includes('环境变量')) {
      // 环境变量错误已在 checkEnvironmentVariables 中处理
      return;
    } else if (error.message.includes('403') || error.message.includes('401')) {
      console.error('\n💡 权限错误提示:');
      console.error('   1. 检查 Figma Access Token 是否正确');
      console.error('   2. 确认 Token 有访问该文件的权限');
      console.error('   3. 确认 File Key 是否正确');
      
      // 检查是否是权限范围问题
      if (error.message.includes('scope') || error.message.includes('file_variables:read')) {
        console.error('\n🔑 权限范围问题:');
        console.error('   你的 Token 缺少必需的权限范围: file_variables:read');
        console.error('\n   解决方案:');
        console.error('   1. 前往 Figma → Settings → Account → Personal Access Tokens');
        console.error('   2. 创建新的 Token，确保勾选 "file_variables:read" 权限');
        console.error('   3. 更新 .env.local 中的 FIGMA_ACCESS_TOKEN');
        console.error('   4. 重新运行: npm run sync:tokens');
        console.error('\n   或者使用交互式设置: npm run setup:env');
      }
    } else if (error.message.includes('404')) {
      console.error('\n💡 文件未找到提示:');
      console.error('   1. 检查 Figma File Key 是否正确');
      console.error('   2. 确认文件 URL 格式: https://www.figma.com/file/FILE_KEY/FileName');
    } else {
      console.error('\n💡 通用故障排除:');
      console.error('   1. 确保已设置环境变量 FIGMA_FILE_KEY 和 FIGMA_ACCESS_TOKEN');
      console.error('   2. 确保 Figma Token 有访问文件的权限');
      console.error('   3. 确保 Figma 文件中已创建 Variables');
      console.error('   4. 检查网络连接');
    }
    
    console.error('\n📖 详细文档: 查看 FIGMA_TOKENS_SYNC.md');
    process.exit(1);
  }
}

// 运行
main();

