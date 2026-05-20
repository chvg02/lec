
import * as bcrypt from 'bcryptjs'; // Importe uma biblioteca de hash de senha (ex: bcryptjs)
import {prisma} from '@/lib/prisma';

async function seed() {
  await prisma.user.create({
        data: {
            id:1,
            email: 'vitor.aa01@gtmail.com',
            name: 'vitor Anjos',
            password: '123',
            role:'admin'
        }
    });
    console.log('Database seeded');
    await prisma.$disconnect();
}

seed().catch(e => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
});