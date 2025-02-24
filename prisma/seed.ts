import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const farayolaj = await prisma.user.upsert({
    where: {
      username: 'farayolaj',
    },
    update: {},
    create: {
      username: 'farayolaj',
      email: 'farayolajoshua@gmail.com',
      firstName: 'Joshua',
      lastName: 'Farayola',
    },
  });
  const johndoe = await prisma.user.upsert({
    where: {
      username: 'johndoe',
    },
    update: {},
    create: {
      username: 'johndoe',
      email: 'johndoe@gmail.com',
      firstName: 'John',
      lastName: 'Doe',
    },
  });

  const project = await prisma.project.upsert({
    where: {
      name: 'My Project',
    },
    update: {},
    create: {
      name: 'My Project',
      createdById: farayolaj.id,
      sessionId: '123456',
    },
  });

  await prisma.projectMembership.upsert({
    where: {
      userId_projectId: {
        userId: farayolaj.id,
        projectId: project.id,
      },
    },
    update: {},
    create: {
      userId: farayolaj.id,
      projectId: project.id,
    },
  });
  await prisma.projectMembership.upsert({
    where: {
      userId_projectId: {
        userId: johndoe.id,
        projectId: project.id,
      },
    },
    update: {},
    create: {
      userId: johndoe.id,
      projectId: project.id,
    },
  });

  const fileMainJs = await prisma.file.upsert({
    where: {
      path: 'main.js',
    },
    update: {},
    create: {
      path: 'main.js',
      content: 'console.log("Hello, World!");',
      projectId: project.id,
    },
  });

  let firstVersion = await prisma.version.findFirst({
    where: {
      fileId: fileMainJs.id,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  if (!firstVersion)
    await prisma.version.create({
      data: {
        fileId: fileMainJs.id,
        committedById: farayolaj.id,
      },
    });
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
