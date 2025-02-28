import { Test, TestingModule } from '@nestjs/testing';
import { DirectoryService } from '../directory/directory.service';
import { PrismaService } from '../prisma/prisma.service';
import { FileService } from './file.service';

describe('FileService', () => {
  let service: FileService;
  let dirService: DirectoryService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileService,
        DirectoryService,
        {
          provide: PrismaService,
          useValue: {
            file: {},
            version: {},
          },
        },
      ],
    }).compile();

    service = module.get<FileService>(FileService);
    prisma = module.get<PrismaService>(PrismaService);
    dirService = module.get<DirectoryService>(DirectoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a file', async () => {
    const parentDirectory = {
      id: 1,
      path: 'test',
      content: '',
      isDir: true,
      projectId: 1,
    };
    const fileData = { id: 2, path: 'test/path', content: '', projectId: 1 };
    prisma.file.findUnique = jest.fn().mockResolvedValueOnce(null); // File does not exist
    prisma.file.create = jest.fn().mockResolvedValue(fileData as any);
    dirService.getOrCreateDirectory = jest
      .fn()
      .mockResolvedValue(parentDirectory as any);

    const result = await service.getOrCreateFile(1, 'test/path', null);
    expect(result).toEqual(fileData);
    expect(prisma.file.create).toHaveBeenCalledWith({
      data: {
        path: 'test/path',
        content: '',
        project: {
          connect: {
            id: 1,
          },
        },
        parent: {
          connect: {
            id: 1,
          },
        },
      },
    });
  });

  it('should return existing file if it exists', async () => {
    const existingFile = { id: 1, path: 'test/path', content: '' };
    prisma.file.findUnique = jest.fn().mockResolvedValue(existingFile);
    prisma.file.create = jest.fn();
    const result = await service.getOrCreateFile(1, 'test/path', null);
    expect(result).toEqual(existingFile);
    expect(prisma.file.findUnique).toHaveBeenCalledWith({
      where: {
        path: 'test/path',
        projectId: 1,
      },
    });
  });

  it('should create a file without parent directory', async () => {
    const fileData = { id: 1, path: 'path', content: '', projectId: 1 };
    prisma.file.findUnique = jest.fn().mockResolvedValue(null);
    prisma.file.create = jest.fn().mockResolvedValue(fileData as any);

    const result = await service.getOrCreateFile(1, 'path', null);
    expect(result).toEqual(fileData);
    expect(prisma.file.create).toHaveBeenCalledWith({
      data: {
        path: 'path',
        content: '',
        project: {
          connect: {
            id: 1,
          },
        },
      },
    });
  });

  it('should update a file', async () => {
    const fileData = { id: 1, path: 'test/path', content: 'new content' };
    prisma.file.update = jest.fn().mockResolvedValue(fileData as any);
    prisma.version.create = jest.fn().mockResolvedValue({});

    const result = await service.updateFile({
      fileId: 1,
      newContent: 'new content',
      snapshot: 'snapshot',
      user: 'user',
    });
    expect(result).toEqual(fileData);
    expect(prisma.version.create).toHaveBeenCalledWith({
      data: {
        snapshot: 'snapshot',
        committedBy: 'user',
        file: {
          connect: {
            id: 1,
          },
        },
      },
    });
    expect(prisma.file.update).toHaveBeenCalledWith({
      where: {
        id: 1,
      },
      data: {
        content: 'new content',
      },
    });
  });

  it('should list files', async () => {
    const files = [{ id: 1, path: 'test/path', content: '', projectId: 1 }];
    prisma.file.findMany = jest.fn().mockResolvedValue(files);

    const result = await service.listFiles(1);
    expect(result).toEqual(files);
    expect(prisma.file.findMany).toHaveBeenCalledWith({
      where: {
        projectId: 1,
      },
    });
  });

  it('should get file history', async () => {
    const versions = [
      { id: 1, snapshot: 'snapshot', committedBy: 'user', fileId: 1 },
    ];
    prisma.version.findMany = jest.fn().mockResolvedValue(versions);

    const result = await service.getFileHistory(1);
    expect(result).toEqual(versions);
    expect(prisma.version.findMany).toHaveBeenCalledWith({
      where: {
        fileId: 1,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  });

  it('should get a file', async () => {
    const file = { id: 1, path: 'test/path', content: '' };
    prisma.file.findUnique = jest.fn().mockResolvedValue(file);

    const result = await service.getFile(1);
    expect(result).toEqual(file);
    expect(prisma.file.findUnique).toHaveBeenCalledWith({
      where: {
        id: 1,
      },
    });
  });

  it('should return null if file not found', async () => {
    prisma.file.findUnique = jest.fn().mockResolvedValue(null);

    const result = await service.getFile(1);
    expect(result).toBeNull();
    expect(prisma.file.findUnique).toHaveBeenCalledWith({
      where: {
        id: 1,
      },
    });
  });
});
