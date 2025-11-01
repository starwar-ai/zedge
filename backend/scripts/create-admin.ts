/**
 * 创建初始系统管理员用户
 */

import { UserService } from '../src/services/user/user.service';
import { UserRole } from '@prisma/client';
import { prisma } from '../src/utils/prisma.client';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function main() {
  console.log('==============================================');
  console.log('   Create Initial System Administrator');
  console.log('==============================================\n');

  // 检查是否已存在管理员
  const existingAdmin = await prisma.user.findFirst({
    where: { role: UserRole.ADMIN },
  });

  if (existingAdmin) {
    console.log('⚠️  An admin user already exists:');
    console.log(`   Username: ${existingAdmin.username}`);
    console.log(`   Email: ${existingAdmin.email}\n`);

    const confirm = await question('Do you want to create another admin? (y/N): ');
    if (confirm.toLowerCase() !== 'y') {
      console.log('Cancelled.');
      rl.close();
      return;
    }
  }

  console.log('Please enter admin user details:\n');

  // 获取用户输入
  const username = await question('Username (default: admin): ');
  const email = await question('Email (default: admin@zedge.local): ');
  const password = await question('Password (default: Admin@123456): ');

  const adminData = {
    username: username.trim() || 'admin',
    email: email.trim() || 'admin@zedge.local',
    password: password.trim() || 'Admin@123456',
    role: UserRole.ADMIN,
  };

  console.log('\nCreating admin user...');

  try {
    const admin = await UserService.createUser(adminData);

    console.log('\n==============================================');
    console.log('✅ Admin User Created Successfully!');
    console.log('==============================================');
    console.log('📋 User Details:');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log('\n🔐 Login Credentials:');
    console.log(`   Username: ${adminData.username}`);
    console.log(`   Password: ${adminData.password}`);
    console.log('\n⚠️  IMPORTANT: Please change the password after first login!');
    console.log('==============================================\n');

    console.log('💡 Next Steps:');
    console.log('   1. Start the server: npm run dev');
    console.log('   2. Login with the credentials above');
    console.log('   3. Create tenants and other users');
    console.log('==============================================\n');
  } catch (error) {
    console.error('\n❌ Error creating admin user:', error);
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    }
    process.exit(1);
  }

  rl.close();
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
