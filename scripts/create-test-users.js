const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUsers() {
  console.log('👥 テストユーザーの作成を開始します...');

  try {
    const hashedPassword = await bcrypt.hash('password', 10);

    // セラーユーザーの作成/確認
    let sellerUser = await prisma.user.findUnique({
      where: { email: 'seller@test.com' }
    });

    if (!sellerUser) {
      sellerUser = await prisma.user.create({
        data: {
          email: 'seller@test.com',
          username: 'test-seller',
          password: hashedPassword,
          role: 'seller',
          fullName: 'テストセラー',
          phoneNumber: '090-1234-5678',
          address: '東京都港区テスト1-2-3'
        }
      });
      console.log('✅ seller@test.com 作成完了');
    } else {
      console.log('✅ seller@test.com 既存確認');
    }

    // スタッフユーザーの作成/確認
    let staffUser = await prisma.user.findUnique({
      where: { email: 'staff@test.com' }
    });

    if (!staffUser) {
      staffUser = await prisma.user.create({
        data: {
          email: 'staff@test.com',
          username: 'test-staff',
          password: hashedPassword,
          role: 'staff',
          fullName: 'テストスタッフ',
          phoneNumber: '090-8765-4321',
          address: '東京都渋谷区テスト4-5-6'
        }
      });
      console.log('✅ staff@test.com 作成完了');
    } else {
      console.log('✅ staff@test.com 既存確認');
    }

    console.log('\n🎉 テストユーザーの準備が完了しました！');
    console.log('📧 seller@test.com / password');
    console.log('📧 staff@test.com / password');

  } catch (error) {
    console.error('❌ テストユーザー作成中にエラーが発生しました:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  createTestUsers()
    .then(() => {
      console.log('🎯 E2Eテストの実行準備が整いました！');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 テストユーザー作成に失敗しました:', error);
      process.exit(1);
    });
}

module.exports = createTestUsers;