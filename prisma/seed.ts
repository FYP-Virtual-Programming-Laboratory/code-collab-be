import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const FARAYOLAJ = 'farayolaj';
  const JOHNDOE = 'johndoe';

  const project = await prisma.project.upsert({
    where: {
      name: 'My Project',
    },
    update: {},
    create: {
      name: 'My Project',
      createdBy: FARAYOLAJ,
      sessionId: '123456',
    },
  });

  await prisma.projectMembership.upsert({
    where: {
      user_projectId: {
        user: FARAYOLAJ,
        projectId: project.id,
      },
    },
    update: {},
    create: {
      user: FARAYOLAJ,
      projectId: project.id,
    },
  });
  await prisma.projectMembership.upsert({
    where: {
      user_projectId: {
        user: JOHNDOE,
        projectId: project.id,
      },
    },
    update: {},
    create: {
      user: JOHNDOE,
      projectId: project.id,
    },
  });

  const srcDir = await prisma.directory.upsert({
    where: {
      path: 'src',
    },
    update: {},
    create: {
      path: 'src',
      projectId: project.id,
    },
  });
  const fileMainJs = await prisma.file.upsert({
    where: {
      path: 'src/main.js',
    },
    update: {},
    create: {
      path: 'src/main.js',
      content: 'console.log("This is main.js");',
      projectId: project.id,
      parentId: srcDir.id,
    },
  });
  await prisma.file.upsert({
    where: {
      path: 'index.js',
    },
    update: {},
    create: {
      path: 'index.js',
      content: 'console.log("This is index.js");',
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
        snapshot: '',
        file: {
          connect: {
            id: fileMainJs.id,
          },
        },
        committedBy: FARAYOLAJ,
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
