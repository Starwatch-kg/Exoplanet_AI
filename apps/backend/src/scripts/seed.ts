import { getPrisma } from '../common/utils/prisma';
import { hashPassword } from '../common/utils/crypto';

async function main() {
  const prisma = getPrisma();
  const adminEmail = 'admin@example.com';
  const passwordHash = await hashPassword('admin123');
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, role: 'ADMIN' },
    create: { email: adminEmail, passwordHash, role: 'ADMIN' },
  });

  // demo candidates for the admin
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (admin) {
    const existing = await prisma.candidate.count({ where: { userId: admin.id } });
    if (existing === 0) {
      await prisma.candidate.createMany({
        data: [
          { userId: admin.id, target: 'TIC 1000001', status: 'FOUND', periodDays: 3.14, depthPpm: 500, score: 0.92 },
          { userId: admin.id, target: 'TIC 1000002', status: 'PENDING', periodDays: 7.2, depthPpm: 220, score: 0.75 },
        ],
      });
    }
  }
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });


