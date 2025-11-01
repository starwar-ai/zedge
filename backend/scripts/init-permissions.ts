/**
 * 初始化 RBAC 权限系统
 * 创建权限和角色权限关联
 */

import { PermissionService } from '../src/services/permission/permission.service';
import { prisma } from '../src/utils/prisma.client';

async function main() {
  console.log('Starting RBAC permission initialization...');
  console.log('==============================================\n');

  try {
    // 初始化权限
    await PermissionService.initializePermissions();

    // 统计结果
    const permissionCount = await prisma.permission.count();
    const rolePermissionCount = await prisma.rolePermission.count();

    console.log('\n==============================================');
    console.log('✅ RBAC Permission Initialization Complete!');
    console.log('==============================================');
    console.log(`📊 Statistics:`);
    console.log(`   - Total Permissions: ${permissionCount}`);
    console.log(`   - Total Role Permissions: ${rolePermissionCount}`);
    console.log('\n💡 Next Steps:');
    console.log('   1. Run: npm run create-admin (to create initial admin user)');
    console.log('   2. Run: npm run dev (to start the server)');
    console.log('   3. Login with admin credentials');
    console.log('==============================================\n');
  } catch (error) {
    console.error('❌ Error during permission initialization:', error);
    process.exit(1);
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
