import { PrismaClient } from '../src/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Create devices
  const iphone = await prisma.device.create({
    data: {
      nombre: 'iPhone 13 Pro',
      configuracionSlots: 'ONE_PHYS_ONE_ESIM',
    },
  });

  const samsung = await prisma.device.create({
    data: {
      nombre: 'Samsung Galaxy S24',
      configuracionSlots: 'TWO_ESIM',
    },
  });

  const xiaomi = await prisma.device.create({
    data: {
      nombre: 'Xiaomi Redmi Note 12',
      configuracionSlots: 'TWO_PHYSICAL',
    },
  });

  // Create SIMs
  const sim1 = await prisma.sim.create({
    data: {
      tipo: 'FISICA',
      numero: '55 1234 5678',
      compania: 'Telcel',
      registroGubernamental: true,
      ssidIccid: '8952140061234567890',
      pin: '1234',
      puk: '12345678',
      fechaUltimaRecarga: new Date('2026-03-15'),
      dispositivoId: iphone.id,
    },
  });

  const sim2 = await prisma.sim.create({
    data: {
      tipo: 'ESIM',
      numero: '55 9876 5432',
      compania: 'AT&T',
      registroGubernamental: false,
      fechaUltimaRecarga: new Date('2026-04-01'),
      dispositivoId: iphone.id,
    },
  });

  const sim3 = await prisma.sim.create({
    data: {
      tipo: 'ESIM',
      numero: '55 5555 1234',
      compania: 'Movistar',
      registroGubernamental: true,
      ssidIccid: '8952140099876543210',
      pin: '0000',
      puk: '99887766',
      fechaUltimaRecarga: new Date('2026-01-20'), // This one should trigger alert!
      dispositivoId: samsung.id,
    },
  });

  const sim4 = await prisma.sim.create({
    data: {
      tipo: 'FISICA',
      numero: '55 4321 8765',
      compania: 'Bait',
      registroGubernamental: false,
      fechaUltimaRecarga: new Date('2026-02-10'),
      // No device - in the "Cajón"
    },
  });

  const sim5 = await prisma.sim.create({
    data: {
      tipo: 'FISICA',
      numero: '55 1111 2222',
      compania: 'Telcel',
      registroGubernamental: false,
      // No device - in the "Cajón"
    },
  });

  // Create accounts
  await prisma.account.createMany({
    data: [
      { dispositivoId: iphone.id, plataforma: 'WhatsApp', usuarioEmail: 'usuario@gmail.com' },
      { dispositivoId: iphone.id, plataforma: 'Amazon', usuarioEmail: 'compras@hotmail.com', notas: 'Cuenta Prime activa' },
      { dispositivoId: iphone.id, plataforma: 'TikTok', usuarioEmail: '@miusuario' },
      { dispositivoId: samsung.id, plataforma: 'Instagram', usuarioEmail: 'foto_user@gmail.com' },
      { dispositivoId: samsung.id, plataforma: 'Facebook', usuarioEmail: 'social@outlook.com' },
      { dispositivoId: samsung.id, plataforma: 'Shein', usuarioEmail: 'moda@gmail.com', notas: 'Descuento activo' },
      { dispositivoId: xiaomi.id, plataforma: 'Telegram', usuarioEmail: '@telgrupo' },
      { dispositivoId: xiaomi.id, plataforma: 'Spotify', usuarioEmail: 'musica@gmail.com' },
    ],
  });

  console.log('✅ Seed completed!');
  console.log(`   📱 ${3} Devices`);
  console.log(`   💳 ${5} SIMs (${2} in Cajón)`);
  console.log(`   👤 ${8} Accounts`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
