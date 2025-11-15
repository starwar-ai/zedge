#!/usr/bin/env node

/**
 * 环境变量设置助手脚本
 * 帮助用户快速创建 .env.local 文件
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENV_LOCAL_PATH = path.join(__dirname, '../.env.local');
const ENV_EXAMPLE_PATH = path.join(__dirname, '../.env.local.example');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('🔧 Figma Tokens 环境变量设置助手\n');
  
  // 检查是否已存在 .env.local
  if (fs.existsSync(ENV_LOCAL_PATH)) {
    const overwrite = await question('⚠️  .env.local 文件已存在，是否覆盖？(y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('❌ 已取消');
      rl.close();
      return;
    }
  }
  
  console.log('\n📝 请提供以下信息:\n');
  
  // 获取 Figma File Key
  console.log('1. Figma File Key');
  console.log('   从 Figma 文件 URL 中提取，例如:');
  console.log('   https://www.figma.com/file/s3szBzWOPmpdq0EZg9PwKj/DeskPro');
  console.log('   File Key 就是: s3szBzWOPmpdq0EZg9PwKj\n');
  const fileKey = await question('请输入 Figma File Key: ');
  
  if (!fileKey.trim()) {
    console.log('❌ File Key 不能为空');
    rl.close();
    return;
  }
  
  // 获取 Figma Access Token
  console.log('\n2. Figma Personal Access Token');
  console.log('   获取方式:');
  console.log('   1. 登录 Figma');
  console.log('   2. Settings → Account → Personal Access Tokens');
  console.log('   3. Create new token');
  console.log('   4. ⚠️  重要: 确保勾选权限范围 "file_variables:read"');
  console.log('   5. 复制生成的 Token（只显示一次）\n');
  const accessToken = await question('请输入 Figma Access Token: ');
  
  if (!accessToken.trim()) {
    console.log('❌ Access Token 不能为空');
    rl.close();
    return;
  }
  
  // 创建 .env.local 文件
  const envContent = `# Figma API 配置
# 自动生成于: ${new Date().toISOString()}
# ⚠️ 不要将此文件提交到 Git！

FIGMA_FILE_KEY=${fileKey.trim()}
FIGMA_ACCESS_TOKEN=${accessToken.trim()}
`;
  
  try {
    fs.writeFileSync(ENV_LOCAL_PATH, envContent, 'utf-8');
    console.log('\n✅ .env.local 文件已创建！');
    console.log(`📁 位置: ${ENV_LOCAL_PATH}`);
    console.log('\n🚀 下一步: 运行 npm run sync:tokens 同步 Figma Variables');
  } catch (error) {
    console.error('\n❌ 创建文件失败:', error.message);
    rl.close();
    process.exit(1);
  }
  
  rl.close();
}

main().catch(error => {
  console.error('❌ 发生错误:', error.message);
  rl.close();
  process.exit(1);
});

