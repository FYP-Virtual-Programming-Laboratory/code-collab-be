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

  const firstVersion = await prisma.version.upsert({
    where: {
      fileId_versionNumber: {
        fileId: fileMainJs.id,
        versionNumber: 1,
      },
    },
    update: {},
    create: {
      fileId: fileMainJs.id,
      versionNumber: 1,
      committedById: farayolaj.id,
    },
  });

  const change = await prisma.change.create({
    data: {
      versionId: firstVersion.id,
      content: 'console.log("Hello, World!");',
      lineNumber: 1,
      position: 1,
      operation: 'insert',
      madeById: farayolaj.id,
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
