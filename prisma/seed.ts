import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // デモセラーユーザーを作成
  const user = await prisma.user.upsert({
    where: { email: 'demo-seller@example.com' },
    update: {},
    create: {
      email: 'demo-seller@example.com',
      username: 'デモセラー',
      password: 'demo',
      role: 'seller'
    }
  });

  console.log('Created user:', user);

  // マスタデータをシード（配送業者を更新）
  console.log('配送業者をシード中...');
  const carriers = [
    {
      key: 'fedex',
      name: 'FedEx',
      nameJa: 'FedEx',
      defaultRate: 1200,
      trackingUrl: 'https://www.fedex.com/apps/fedextrack/',
      supportedServices: JSON.stringify(['standard', 'express', 'priority']),
      sortOrder: 1,
    },
    {
      key: 'dhl',
      name: 'DHL',
      nameJa: 'DHL',
      defaultRate: 1800,
      trackingUrl: 'https://www.dhl.com/jp-ja/home/tracking.html',
      supportedServices: JSON.stringify(['standard', 'express']),
      sortOrder: 2,
    },
    {
      key: 'ems',
      name: 'EMS',
      nameJa: 'EMS',
      defaultRate: 1500,
      trackingUrl: 'https://trackings.post.japanpost.jp/services/srv/search/',
      supportedServices: JSON.stringify(['standard', 'express']),
      sortOrder: 3,
    },
    {
      key: 'others',
      name: 'Others',
      nameJa: 'その他（eBay SpeedPAK、クロネコヤマトなど）',
      defaultRate: 1000,
      trackingUrl: '',
      supportedServices: JSON.stringify(['standard']),
      sortOrder: 4,
    },
  ];

  for (const carrier of carriers) {
    await prisma.carrier.upsert({
      where: { key: carrier.key },
      update: carrier,
      create: carrier,
    });
  }

  console.log('配送業者の更新完了:', carriers.length, '件');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });